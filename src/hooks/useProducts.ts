import { useCallback, useEffect, useState } from "react";
import type { SignItem } from "@/types";
import { fetchProducts } from "@/utils/productsApi";

interface UseProductsReturn {
  products: SignItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export type UseProductsOptions = {
  /**
   * SSR/SSG hydration: render initial data immediately, then allow client refetch.
   */
  initialProducts?: SignItem[];
};

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { initialProducts } = options;

  const [products, setProducts] = useState<SignItem[]>(() => initialProducts ?? []);
  const [isLoading, setIsLoading] = useState(() => !(initialProducts && initialProducts.length > 0));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load products";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // If SSR already provided data, avoid an immediate duplicate request.
    if (initialProducts && initialProducts.length > 0) return;
    void load();
  }, [load, initialProducts]);

  return { products, isLoading, error, refetch: load };
}
