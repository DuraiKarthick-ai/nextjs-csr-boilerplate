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
 * Re-export AuthContextType so Signs can type-check
 * the federated context without importing the full portal package.
 */
export interface AuthUser {
  sub: string;
  email: string | null;
  name: string | null;
  roles: string[];
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  refreshSession: () => Promise<boolean>;
}

/**
 * Recursively replaces `undefined` values with `null` so the object is
 * safe to pass through `JSON.stringify` / Next.js `getServerSideProps`.
 */
export function sanitizeUser(raw: Record<string, unknown> | null | undefined): AuthUser | null {
  if (!raw) return null;
  return {
    sub: typeof raw.sub === "string" ? raw.sub : "",
    email: typeof raw.email === "string" ? raw.email : null,
    name: typeof raw.name === "string" ? raw.name : null,
    roles: Array.isArray(raw.roles) ? raw.roles : [],
  };
}
