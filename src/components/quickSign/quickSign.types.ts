/**
 * Type definitions for the Quick Sign component.
 */

/** Shape of an item returned by the item-search API. */
export interface ItemSearchResult {
  date: string;
  itemNumber: number;
  itemName: string;
  dept: string;
  upc: string;
  regularPrice: number;
  salePrice: number;
}

/** State shape for a single "By Item" row. */
export interface ItemRow {
  upc: string;
  itemNumber: string;
  quantity: string;
  selectedItem: ItemSearchResult | null;
}

/** State shape for the "By Department & Category" form. */
export interface DeptForm {
  departmentNumber: string;
  categoryCode: string;
  size: number | "";
  quantity: string;
  printOnlyItemsWithOnHand: boolean;
}

/** Active tab identifier. */
export type QuickSignTab = "item" | "dept";
