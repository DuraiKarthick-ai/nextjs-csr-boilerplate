/**
 * Constants for the Quick Sign component.
 */

import type { SignSize } from "@/types/print";
import type { DeptForm, ItemRow } from "./quickSign.types";

/** Default store ID for print requests. */
export const DEFAULT_STORE_ID = "1234";

/** Default user ID for print requests. */
export const DEFAULT_REQUESTED_BY = "g197511";

/** Item search API URL. */
export const ITEM_SEARCH_URL =
  "https://69ce482633a09f831b7d3ab9.mockapi.io/api/v1/dashboard/itemSearch";

/** Maps size select option values to API sign sizes. */
export const SIZE_MAP: Record<number, SignSize> = {
  10: "SMALL",
  20: "MEDIUM",
  30: "LARGE",
};

/** Number of item rows shown by default. */
export const DEFAULT_ROW_COUNT = 6;

/** Minimum number of digits required before triggering an item search. */
export const MIN_SEARCH_LENGTH = 5;

/** Maximum allowed digit length for item number input. */
export const MAX_ITEM_DIGITS = 7;

/** Debounce delay (ms) for item search API calls. */
export const SEARCH_DEBOUNCE_MS = 300;

/** Initial state for item rows. */
export const INITIAL_ITEM_ROWS: ItemRow[] = Array.from(
  { length: DEFAULT_ROW_COUNT },
  () => ({ itemNumberOrUpc: "", quantity: "1", selectedItem: null })
);

/** Initial state for the department form. */
export const INITIAL_DEPT_FORM: DeptForm = {
  departmentNumber: "",
  categoryCode: "",
  size: "",
  quantity: "",
  printOnlyItemsWithOnHand: true,
};
