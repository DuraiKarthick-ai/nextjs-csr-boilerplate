/**
 * Types for the Get All Batches API.
 */

/** Request payload for fetching available batches. */
export interface GetAllBatchesRequestPayload {
  storeId: string;
}

/** A single batch entry returned by the API. */
export interface BatchItem {
  batchId: number;
  configId: number;
  batchName: string;
}

/** Standard API wrapper returned by the Get All Batches endpoint. */
export interface GetAllBatchesApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: BatchItem[];
  timestamp: string;
}

/** Request payload for fetching detail rows of a specific batch. */
export interface GetBatchDetailRequestPayload {
  batchId: number;
  storeId: string;
  batchConfigId: number;
}

/** Single detail row returned from the batch-detail API. */
export interface BatchDetailItem {
  [columnName: string]: string | number | boolean | null;
}

/** Standard API wrapper returned by the Get Batch Detail endpoint. */
export interface GetBatchDetailApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    batchId: number;
    itemDetails: BatchDetailItem[];
  };
  timestamp: string;
}
