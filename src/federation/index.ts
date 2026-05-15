/**
 * Module Federation — single entry point.
 *
 * The host app imports one remote (`signs/app`) and receives all components,
 * hooks, services, styles, and type definitions. Keeping a single expose
 * in next.config.js avoids listing every component individually and makes
 * additions/removals transparent to the host.
 *
 * Usage in host app:
 *   const { Dashboard, SignWorklist } = await import("signs/app");
 *
 * Or with React.lazy:
 *   const { Dashboard } = React.lazy(() => import("signs/app"));
 */

// ── Components ──────────────────────────────────────────────────────
export { default as AuthGate } from "@/components/auth/authGate";
export { default as ContentWrapper } from "@/components/contentWrapper/contentWrapper";
export { default as CustomPrint } from "@/components/customPrint/customPrint";
export { default as Dashboard } from "@/components/dashboard/dashboard";
export { default as Header } from "@/components/header/header";
export { default as Layout } from "@/components/layout/layout";
export { default as PrintSuccessDialog } from "@/components/printSuccessDialog/printSuccessDialog";
export { default as QuickSign } from "@/components/quickSign/quickSign";
export { default as QuickPrintDepartmentCategory } from "@/components/quickSign/quickPrintDepartmentCategory/quickPrintDepartmentCategory";
export { default as QuickPrintItem } from "@/components/quickSign/quickPrintItem/quickPrintItem";
export { default as SideNav } from "@/components/sideNav/sideNav";
export { default as SignAudit } from "@/components/signAudit/signAudit";
export { default as SignManagement } from "@/components/signManagement/signManagement";
export { default as SignWorklist } from "@/components/signWorklist/signWorklist";
export { default as EmergencyPriceChange } from "@/components/signWorklist/emergencyPriceChange/emergencyPriceChange";
export { default as Endcap } from "@/components/signWorklist/endcap/endcap";
export { default as ItemNameChange } from "@/components/signWorklist/itemNameChange/itemNameChange";
export { default as SignWorklistSignAudit } from "@/components/signWorklist/signAudit/signAudit";
export * from "@/components/shared/icons";
export { default as SuccessToast } from "@/components/shared/SuccessToast";

// ── Hooks ────────────────────────────────────────────────────────────
export { useDashboard } from "@/hooks/useDashboard";
export { usePrint } from "@/hooks/usePrint";

// ── Types ────────────────────────────────────────────────────────────
export type * from "@/types";
export type * from "@/types/batch";
export type * from "@/types/dashboard";
export type * from "@/types/print";
