import apiClient from "@/utils/apiClient";
import type { SignItem } from "@/types";

/**
 * Client-side fetcher — calls the Signs app proxy route which fetches the real Items API server-side.
 *
 * GET /api/items  →  proxy  →  http://34.149.59.244/api/v1/signs/items
 */
export async function fetchProducts(): Promise<SignItem[]> {
  const response = await apiClient.get<SignItem[]>("/api/items");
  return response.data;
}
