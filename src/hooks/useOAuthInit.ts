/**
 * useOAuthInit hook — triggers the server-side OAuth token warmup on
 * initial application mount.
 *
 * Calls POST /api/signs/init-auth which fetches and caches the Bearer token
 * server-side. Subsequent ECS batch API calls reuse the cached token without
 * an additional OAuth round-trip.
 *
 * This hook should be used in the application root (_app.tsx) so it runs
 * once per browser session on the very first page load.
 *
 * @returns {UseOAuthInitResult} Loading flag and initialisation status.
 */

import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";
import type { ApiResponse } from "../types/common.types";
import { BATCH_API_PATHS } from "../lib/constants";

/** Shape of the init-auth API response data. */
interface InitAuthData {
  initialised: boolean;
}

/** Shape returned by the useOAuthInit hook. */
export interface UseOAuthInitResult {
  /** Whether the OAuth warmup request is in flight. */
  isInitialising: boolean;
  /** Whether the OAuth token was successfully cached server-side. */
  isAuthenticated: boolean;
  /** Error message if the warmup failed, otherwise null. */
  error: string | null;
}

/**
 * Fires a single POST request to the init-auth endpoint on mount to
 * ensure the server-side OAuth token cache is populated before any
 * ECS batch API calls are made.
 *
 * @returns {UseOAuthInitResult}
 */
function useOAuthInit(): UseOAuthInitResult {
  const [isInitialising, setIsInitialising] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    /**
     * Calls the init-auth endpoint to warm up the server-side OAuth token.
     *
     * @returns {Promise<void>}
     */
    async function initAuth(): Promise<void> {
      setIsInitialising(true);
      setError(null);

      try {
        const response = await apiClient.post<ApiResponse<InitAuthData>>(
          BATCH_API_PATHS.INIT_AUTH
        );

        if (!cancelled) {
          setIsAuthenticated(response.data.data.initialised);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to initialise authentication."
          );
        }
      } finally {
        if (!cancelled) setIsInitialising(false);
      }
    }

    void initAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isInitialising, isAuthenticated, error };
}

export default useOAuthInit;
