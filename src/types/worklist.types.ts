/**
 * Type definitions for the Worklist (Emergency Price Change) feature.
 * Covers worklist items, filter criteria, status enumerations,
 * and summary statistics used throughout the Worklist domain.
 */

import { BaseEntity } from "./common.types";

/**
 * Enum representing the approval/processing status of a worklist item.
 */
export enum WorklistItemStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PROCESSED = "PROCESSED",
}

/**
 * Enum representing the print status of a worklist item.
 */
export enum WorklistPrintStatus {
  NOT_PRINTED = "NOT_PRINTED",
  PRINTING = "PRINTING",
  PRINTED = "PRINTED",
  FAILED = "FAILED",
}

/**
 * Represents a single emergency price-change item in the worklist.
 */
export interface WorklistItem extends BaseEntity {
  itemNumber: string;
  description: string;
  department: string;
  oldPrice: number;
  newPrice: number;
  effectiveDate: string;
  status: WorklistItemStatus;
  printStatus: WorklistPrintStatus;
  isPrinted: boolean;
  signId?: string;
}

/**
 * Filter criteria used to narrow down worklist items.
 */
export interface WorklistFilter {
  department?: string;
  status?: WorklistItemStatus;
  printStatus?: WorklistPrintStatus;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

/**
 * Aggregated summary counts displayed in the worklist dashboard widget.
 */
export interface WorklistSummaryData {
  totalItems: number;
  pendingItems: number;
  printedItems: number;
  failedItems: number;
  approvedItems: number;
}

/**
 * Represents a batch print request for multiple worklist items.
 */
export interface WorklistPrintRequest {
  itemIds: string[];
  printerQueue?: string;
}
