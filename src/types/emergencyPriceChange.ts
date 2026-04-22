/**
 * Request payload structure for Emergency Price Change API.
 */
export interface EmergencyPriceChangeRequestPayload {
  storeId: string;
  requestDate: string;
  filters: {
    itemNumber: string | null;
    itemName: string | null;
    department: string | null;
    category: string | null;
    upc: string | null;
    quantity: string | null;
    changeReason: string | null;
    signSize: string | null;
    printStatus: string | null;
  };
}

/**
 * Single Emergency Price Change row returned by API.
 */
export interface EmergencyPriceChangeResponseItem {
  auditDate: string;
  itemNumber: string;
  itemName: string;
  department: string;
  category: string;
  upc: string;
  onHand: string;
  quantity: number;
  regularPrice: number;
  salePrice: number;
  changeReason: string;
  signSize: string | null;
  printStatus: string;
}
