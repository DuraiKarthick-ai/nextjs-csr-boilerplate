/**
 * Type definitions for the ECS Batch API feature.
 * Covers batch list items, batch detail items, request/response shapes,
 * and navigation query parameters used when routing from dashboard to worklist.
 */

/**
 * Enum representing the display status of a batch job.
 * Derived server-side from signQuantity: > 0 → Ready, 0 → Completed.
 */
export enum BatchStatus {
  READY = "Ready",
  COMPLETED = "Completed",
}

/**
 * Represents a single batch entry returned by the get-all-batches endpoint.
 */
export interface BatchItem {
  batchId: number;
  batchName: string;
  storeId: string;
  batchConfigId: number;
  /** Derived from signQuantity: Ready when > 0, Completed when 0. */
  status: BatchStatus;
  /** Total number of signs in the batch (maps to ECS signQuantity). */
  signQuantity?: number;
  /** Number of signs already printed (maps to ECS printedQuantity). */
  printedQuantity?: number;
}

/**
 * Request payload for the get-all-batches ECS endpoint.
 */
export interface GetAllBatchesRequest {
  storeId: string;
}

/**
 * Response shape from the get-all-batches ECS endpoint.
 */
export interface GetAllBatchesResponse {
  batches: BatchItem[];
}

/**
 * Request payload for the get-batch-detail ECS endpoint.
 * All fields are required and are sourced from the get-all-batches response.
 */
export interface BatchDetailRequest {
  batchId: number;
  storeId: string;
  batchConfigId: number;
  batchName: string;
}

/**
 * Represents a single sign item within a batch detail response.
 */
export interface BatchDetailItem {
  itemNumber: string;
  description: string;
  department: string;
  signSize: string;
  copies: number;
  printStatus: string;
  changeReason: string;
  effectiveDate: string;
}

/**
 * Response shape from the get-batch-detail ECS endpoint.
 */
export interface BatchDetailResponse {
  batchId: number;
  batchName: string;
  storeId: string;
  batchConfigId: number;
  items: BatchDetailItem[];
}

/**
 * Query parameters carried in the URL when navigating from the dashboard
 * batch-job hyperlink to the worklist screen.
 */
export interface BatchQueryParams {
  batchId: number;
  storeId: string;
  batchConfigId: number;
  batchName: string;
}
