// src/types/api.types.ts
/**
 * API Type Definitions
 */

// Generic API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

// API Error
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
}

// Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Pagination Parameters
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter Parameters (generic)
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

// API Request Config
export interface ApiRequestConfig {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  withAuth?: boolean;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request Options
export interface RequestOptions extends ApiRequestConfig {
  method?: HttpMethod;
  data?: any;
}
