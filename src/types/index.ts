/**
 * Shape returned by the Signs backend API
 * GET /api/v1/signs/items
 */
export interface SignItem {
  /** New API shape (camelCase) */
  signItemId?: number;
  companycode: number;
  location: number;
  department: number;
  itemnum: number;
  onhandSellQty: number;
  itemstatus: string;
  categorycode: string;
  itemdesc1: string;
  itemdesc2?: string;
  itemdesc3?: string;
  sellprice?: number;
  reasonforchange?: string;
  createdDate?: string;
  processingStatus?: string;

  /** Backward-compatible aliases (older payloads used PascalCase) */
  id?: number;
  Companycode?: number;
  OnhandSellQty?: number;
  Itemstatus?: string;
  Categorycode?: string;
  Itemdesc1?: string;
  Itemdesc2?: string;
  Itemdesc3?: string;
  Sellprice?: number;
  Reasonforchange?: string;
}

/** Response wrapper — the backend may return a bare array or an object. */
export type SignItemsResponse = SignItem[];

/**
 * @deprecated — kept for backward compat; aliased to SignItem.
 */
export type Product = SignItem;

/**
 * @deprecated — kept for backward compat.
 */
export interface ProductsResponse {
  products: SignItem[];
  total: number;
}

/**
 * Re-export AuthContextType so Signs can type-check
 * the federated context without importing the full portal package.
 */
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    sub: string;
    email: string;
    name: string;
    roles: string[];
  } | null;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  refreshSession: () => Promise<boolean>;
}
