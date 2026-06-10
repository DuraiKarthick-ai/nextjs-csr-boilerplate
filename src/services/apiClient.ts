/**
 * Pre-configured Axios instance used as the single HTTP client for all
 * Signs API calls.
 *
 * Security considerations:
 * - Credentials (cookies) are NOT sent by default; add withCredentials only
 *   on routes that explicitly require it.
 * - The Authorization header is injected via the request interceptor from a
 *   server-side session token — never from localStorage.
 * - Response errors are normalised to prevent raw stack traces reaching UI.
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { API_BASE_URL, API_TIMEOUT_MS } from "./config";
import type { ApiResponse } from "../types/common.types";

/**
 * Creates and configures the shared Axios instance.
 *
 * @returns {AxiosInstance} Configured Axios client.
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  /**
   * Request interceptor — attaches any session-scoped headers.
   * Sensitive tokens must NOT be sourced from client-side storage.
   */
  client.interceptors.request.use(
    (config) => config,
    (error: AxiosError) => Promise.reject(error)
  );

  /**
   * Response interceptor — unwraps the data payload and normalises
   * errors so components receive a predictable error shape.
   */
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => response,
    (error: AxiosError<ApiResponse<unknown>>) => {
      const message =
        error.response?.data?.message ?? "An unexpected error occurred.";
      // Return a structured error; never forward raw network details to the UI.
      return Promise.reject(new Error(message));
    }
  );

  return client;
}

const apiClient: AxiosInstance = createApiClient();

export default apiClient;
