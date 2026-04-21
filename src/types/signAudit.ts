/**
 * Supported sort fields for the Sign Audit API.
 */
export type SignAuditSortField = "itemNumber" | "itemName";

/**
 * Sort direction expected by the Sign Audit API.
 */
export type SignAuditSortOrder = "ASC" | "DESC";

/**
 * Request body for fetching Sign Audit rows.
 */
export interface SignAuditRequestPayload {
  filters: {
    date: string;
    operator: string;
  };
  sort: {
    field: SignAuditSortField;
    order: SignAuditSortOrder;
  };
  pagination: {
    page: number;
    pageSize: number;
  };
}

/**
 * Single Sign Audit row returned by the API.
 */
export interface SignAuditResponseItem {
  auditDate: string;
  itemNumber: string;
  itemName: string;
  department: string;
  upc: string;
  regularPrice: number;
  salePrice: number;
  operatorId: string;
}
