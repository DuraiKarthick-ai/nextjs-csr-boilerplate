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
    batchId: 45003,
    batchName: "Daily Sign Maintenance",
    storeId: "51",
    batchConfigId: 213020,
    status: BatchStatus.READY,
    signQuantity: 3305,
    printedQuantity: 0,
  },
  {
    batchId: 51710,
    batchName: "Content Change Batch",
    storeId: "51",
    batchConfigId: 237021,
    status: BatchStatus.READY,
    signQuantity: 2,
    printedQuantity: 0,
  },
  {
    batchId: 54003,
    batchName: "Daily Sign Maintenance",
    storeId: "51",
    batchConfigId: 213020,
    status: BatchStatus.READY,
    signQuantity: 3,
    printedQuantity: 0,
  },
  {
    batchId: 54013,
    batchName: "Daily Sign Maintenance",
    storeId: "51",
    batchConfigId: 213020,
    status: BatchStatus.READY,
    signQuantity: 6,
    printedQuantity: 0,
  },
  {
    batchId: 54026,
    batchName: "Daily Sign Maintenance",
    storeId: "51",
    batchConfigId: 213020,
    status: BatchStatus.READY,
    signQuantity: 15,
    printedQuantity: 0,
  },
  {
    batchId: 54057,
    batchName: "Daily Sign Maintenance",
    storeId: "51",
    batchConfigId: 213020,
    status: BatchStatus.READY,
    signQuantity: 18,
    printedQuantity: 0,
  },
  {
    batchId: 54094,
    batchName: "Daily Sign Maintenance",
    storeId: "51",
    batchConfigId: 213020,
    status: BatchStatus.READY,
    signQuantity: 11,
    printedQuantity: 0,
  },
  {
    batchId: 54117,
    batchName: "Content Change Batch",
    storeId: "51",
    batchConfigId: 237021,
    status: BatchStatus.READY,
    signQuantity: 3,
    printedQuantity: 0,
  },
  {
    batchId: 54124,
    batchName: "Daily Sign Maintenance",
    storeId: "51",
    batchConfigId: 213020,
    status: BatchStatus.READY,
    signQuantity: 4,
    printedQuantity: 0,
  },
  {
    batchId: 58003,
    batchName: "Daily Sign Maintenance",
    storeId: "51",
    batchConfigId: 213020,
    status: BatchStatus.READY,
    signQuantity: 2,
    printedQuantity: 0,
  },
  {
    batchId: 61003,
    batchName: "Content Change Batch",
    storeId: "51",
    batchConfigId: 237021,
    status: BatchStatus.READY,
    signQuantity: 55,
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
