/* ── Print API Types ──────────────────────────────────────────── */

/** Sign size options for print requests. */
export type SignSize = "SMALL" | "MEDIUM" | "LARGE";

/** Discriminated print request type. */
export type PrintRequestType = "BY_ITEM" | "BY_DEPARTMENT_CATEGORY" | "CUSTOM_SIGN";

/** Entry for BY_ITEM print requests. */
export interface ByItemEntry {
  itemNumberOrUpc: string;
  size: SignSize;
  quantity: number;
}

/** Entry for BY_DEPARTMENT_CATEGORY print requests. */
export interface ByDepartmentCategoryEntry {
  departmentNumber: string;
  categoryCode: string | null;
  size: SignSize;
  quantity: number;
  printOnlyItemsWithOnHand: boolean;
}

/** Content lines and badges for a custom sign. */
export interface CustomSignContent {
  line1: string;
  line2: string;
  line3: string;
  badges: string[];
  pricePerEach: string;
  sellPrice: string;
}

/** Entry for CUSTOM_SIGN print requests. */
export interface CustomSignEntry {
  itemNumberOrUpc: string;
  size: SignSize;
  quantity: number;
  signContent: CustomSignContent;
}

/** A single typed print request block. */
export interface PrintRequestBlock {
  type: PrintRequestType;
  entries: ByItemEntry[] | ByDepartmentCategoryEntry[] | CustomSignEntry[];
}

/** Top-level print request payload sent to the API. */
export interface PrintRequestPayload {
  storeId: string;
  requestedBy: string;
  printRequests: PrintRequestBlock[];
}

/** Print API response object. */
export interface PrintResponse {
  responseCode: string;
  responseMessage: string;
  printerName: string;
  status: string;
}
