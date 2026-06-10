/**
 * Module Federation entry point.
 *
 * `signs/app` default-exports the full remote shell. The named exports expose
 * the current layout, feature screens, hooks, constants, and shared types that
 * exist in this repo's present folder structure.
 */

export { default } from "./app";
export type { FederatedAppProps, FederatedView } from "./app";

// Current layout components
export { default as PageContainer } from "../shared/layout/PageContainer";
export { default as Sidebar } from "../shared/layout/Sidebar";

// Current feature screens
export { default as DashboardScreen } from "../features/dashboard/component/dashboard";
export { default as QuickPrintScreen } from "../features/quick-print/component/quickPrint";
export { default as CustomSignScreen } from "../features/custom-sign/component/customSign";
export { default as WorklistScreen } from "../features/worklist/component/worklist";

// Current hooks
export { default as useBatches } from "../features/dashboard/hooks/useBatches";
export { default as useBatchDetail } from "../features/worklist/hooks/useBatchDetail";
export { default as useDebounce } from "../hooks/useDebounce";
export { default as useOAuthInit } from "../hooks/useOAuthInit";
export { default as usePagination } from "../hooks/usePagination";

// Shared constants and app store surface
export { ROUTES } from "../lib/constants";
export { AppProvider } from "../store/useAppStore";

// Shared types
export type * from "../types/batch.types";
export type * from "../types/common.types";
export type * from "../types/sign.types";
export type * from "../types/worklist.types";
