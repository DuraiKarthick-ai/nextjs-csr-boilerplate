/**
 * mockBatchData — Static fallback data for the ECS Batch API.
 *
 * Used when the get-all-batches or get-batch-detail API calls fail
 * or return an empty result. This ensures the UI remains functional
 * for development, demos, and offline scenarios.
 */

import type { BatchItem, BatchDetailItem } from "../../../types/batch.types";
import { BatchStatus } from "../../../types/batch.types";

/**
 * Static fallback batch list used when fetchAllBatches fails or returns empty.
 *
 * @type {BatchItem[]}
 */
export const FALLBACK_BATCHES: BatchItem[] = [
  {
    batchId: 1001,
    batchName: "Weekly Price Change - Week 22",
    storeId: "0001",
    batchConfigId: 10,
    status: BatchStatus.READY,
    signQuantity: 45,
    printedQuantity: 0,
  },
  {
    batchId: 1002,
    batchName: "Emergency Price Change - June",
    storeId: "0001",
    batchConfigId: 11,
    status: BatchStatus.READY,
    signQuantity: 12,
    printedQuantity: 5,
  },
  {
    batchId: 1003,
    batchName: "Seasonal Promotion - Summer",
    storeId: "0001",
    batchConfigId: 12,
    status: BatchStatus.COMPLETED,
    signQuantity: 0,
    printedQuantity: 30,
  },
  {
    batchId: 1004,
    batchName: "Ad Week Batch - June 8",
    storeId: "0001",
    batchConfigId: 10,
    status: BatchStatus.READY,
    signQuantity: 20,
    printedQuantity: 0,
  },
];

/**
 * Static fallback batch detail items used when fetchBatchDetail fails or returns empty.
 * Scoped to a representative batch for demo purposes.
 *
 * @type {BatchDetailItem[]}
 */
export const FALLBACK_BATCH_DETAIL_ITEMS: BatchDetailItem[] = [
  {
    itemNumber: "0001234",
    description: "2% Reduced Fat Milk 1 Gallon",
    department: "Dairy",
    signSize: "3x5",
    copies: 2,
    printStatus: "PENDING",
    changeReason: "Regular Price Change",
    effectiveDate: "2026-06-08",
  },
  {
    itemNumber: "0005678",
    description: "Large Eggs 12 Count",
    department: "Dairy",
    signSize: "3x5",
    copies: 1,
    printStatus: "PENDING",
    changeReason: "Competitive Price Match",
    effectiveDate: "2026-06-08",
  },
  {
    itemNumber: "0009012",
    description: "Sliced White Bread 20 oz",
    department: "Bakery",
    signSize: "3x5",
    copies: 3,
    printStatus: "PRINTED",
    changeReason: "Regular Price Change",
    effectiveDate: "2026-06-06",
  },
  {
    itemNumber: "0003456",
    description: "Ground Beef 80/20 1 lb",
    department: "Meat",
    signSize: "5x7",
    copies: 2,
    printStatus: "PENDING",
    changeReason: "Promotional Price",
    effectiveDate: "2026-06-08",
  },
  {
    itemNumber: "0007890",
    description: "Russet Potatoes 5 lb Bag",
    department: "Produce",
    signSize: "3x5",
    copies: 1,
    printStatus: "PENDING",
    changeReason: "Regular Price Change",
    effectiveDate: "2026-06-08",
  },
  {
    itemNumber: "0002345",
    description: "Orange Juice 64 oz",
    department: "Beverages",
    signSize: "3x5",
    copies: 2,
    printStatus: "PRINTED",
    changeReason: "Competitive Price Match",
    effectiveDate: "2026-06-06",
  },
];
