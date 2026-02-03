// src/lib/api/client.ts
/**
 * Axios API Client with Interceptors
 * Handles authentication, token refresh, and error handling
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import { refreshTokens } from '@/lib/auth/oauth';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/config/constants';
import type { ApiResponse, ApiError } from '@/types/api.types';
import toast from 'react-hot-toast';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor
 * Adds authentication token to requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles token refresh on 401 errors
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        // No refresh token, redirect to login
        processQueue(new Error('No refresh token'), null);
        isRefreshing = false;
        
        // Clear tokens and redirect
        tokenStorage.clearTokens();
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh token
        const tokens = await refreshTokens(refreshToken);
        tokenStorage.setTokens(tokens);

        const newAccessToken = tokens.access_token;

        // Process queued requests
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError, null);
        isRefreshing = false;
        
        tokenStorage.clearTokens();
        toast.error(ERROR_MESSAGES.UNAUTHORIZED);
        window.location.href = '/auth/login';
        
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

/**
 * Helper function to handle API errors
 */
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    
    if (axiosError.response?.data) {
      return axiosError.response.data;
    }
    
    if (axiosError.code === 'ECONNABORTED') {
      return {
        code: 'TIMEOUT',
        message: 'Request timeout',
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
    
    if (!axiosError.response) {
      return {
        code: 'NETWORK_ERROR',
        message: ERROR_MESSAGES.NETWORK_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message: axiosError.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      statusCode: axiosError.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: ERROR_MESSAGES.UNKNOWN_ERROR,
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  };
};

/**
 * Generic API request wrapper
 */
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any,
  config?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request<T>({
      method,
      url,
      data,
      ...config,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    return {
      success: false,
      error: apiError,
      message: apiError.message,
    };
  }
}

export default apiClient;
