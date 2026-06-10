/**
 * Application-wide constants.
 * All static configuration values are centralised here to avoid
 * magic strings and numbers scattered throughout the codebase.
 */

/** Base API path prefix for Signs endpoints. */
export const API_BASE_PATH = "/api/signs" as const;

/** Default page size for all paginated list views. */
export const DEFAULT_PAGE_SIZE = 20 as const;

/** Debounce delay (ms) for search inputs. */
export const SEARCH_DEBOUNCE_MS = 300 as const;

/** Maximum number of signs that can be batched in a single print job. */
export const MAX_PRINT_BATCH_SIZE = 100 as const;

/** Default quantity pre-filled in print forms. */
export const DEFAULT_PRINT_QUANTITY = 1 as const;

/** Maximum quantity allowed per sign in a print request. */
export const MAX_PRINT_QUANTITY = 99 as const;

/** Date format string used consistently across the UI. */
export const DATE_FORMAT = "MM/dd/yyyy" as const;

/** Currency locale used for price formatting. */
export const CURRENCY_LOCALE = "en-US" as const;

/** Currency code displayed in price fields. */
export const CURRENCY_CODE = "USD" as const;

/**
 * Enum-like constant map for sign department codes shown in selects.
 * Add or remove departments here to reflect catalogue changes.
 */
export const DEPARTMENTS: Record<string, string> = {
  PRODUCE: "Produce",
  BAKERY: "Bakery",
  DELI: "Deli",
  MEATS: "Meats",
  SEAFOOD: "Seafood",
  DAIRY: "Dairy",
  FROZEN: "Frozen",
  GROCERY: "Grocery",
  HEALTH_BEAUTY: "Health & Beauty",
  ELECTRONICS: "Electronics",
  CLOTHING: "Clothing",
  HOME: "Home",
};

/** Navigation route paths used throughout the application. */
export const ROUTES = {
  DASHBOARD: "/dashboard",
  CUSTOM_SIGN: "/signs/custom",
  QUICK_PRINT: "/signs/quick-print",
  WORKLIST: "/signs/worklist",
} as const;

/**
 * ECS external batch API endpoint path segments.
 * Combined with ECS_API_BASE_URL in the Next.js API route handlers.
 */
export const ECS_BATCH_API_PATHS = {
  GET_ALL_BATCHES: "/batch/get-all-batches",
  GET_BATCH_DETAIL: "/batch/get-batch-detail",
} as const;

/** Internal Next.js API route paths for the ECS batch endpoints. */
export const BATCH_API_PATHS = {
  BATCHES: `${API_BASE_PATH}/batches`,
  BATCH_DETAIL: `${API_BASE_PATH}/batch-detail`,
  INIT_AUTH: `${API_BASE_PATH}/init-auth`,
} as const;

/**
 * ECS external custom-sign API endpoint path segments.
 * Combined with ECS_API_BASE_URL in the Next.js API route handlers.
 */
export const ECS_CUSTOM_SIGN_PATHS = {
  RENDER: "/custom-signs/render",
} as const;

/** Internal Next.js API route path for the sign preview endpoint. */
export const PREVIEW_SIGN_API_PATHS = {
  RENDER: `${API_BASE_PATH}/custom-sign-render`,
} as const;

/** Default store ID sent to the ECS render API. */
export const DEFAULT_STORE_ID = 51 as const;

/** Default style name sent to the ECS custom-sign render API. */
export const DEFAULT_SIGN_STYLE_NAME = "Man Key Test" as const;

/** Output type sent to the ECS custom-sign render API. */
export const SIGN_OUTPUT_TYPE = "png" as const;

/** Printer queue identifier for the default store printer. */
export const DEFAULT_PRINTER_QUEUE = "STORE_DEFAULT" as const;

/** HTTP status codes used in API route responses. */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
