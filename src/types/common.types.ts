/**
 * Common shared types used across the Signs application.
 * These types provide consistent data structures for API responses,
 * pagination, and generic UI state management.
 */

/**
 * Generic API response wrapper.
 * @template T - The type of the response data payload.
 */
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

/**
 * Pagination metadata returned from list endpoints.
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated API response combining data array with pagination metadata.
 * @template T - The type of each item in the paginated list.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  message: string;
  success: boolean;
}

/**
 * Describes the current loading/async state of a data-fetching operation.
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Generic key-value select option used in dropdowns.
 */
export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Error state used across components to represent structured error information.
 */
export interface ErrorState {
  message: string;
  code?: string;
}

/**
 * Base entity fields shared by all domain records.
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}
