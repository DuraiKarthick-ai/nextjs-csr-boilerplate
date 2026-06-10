"use client";

import React, { useState } from "react";
import "../lib/i18n";
import PageContainer from "../shared/layout/PageContainer";
import Sidebar from "../shared/layout/Sidebar";
import CustomSignScreen from "../features/custom-sign/component/customSign";
import DashboardScreen from "../features/dashboard/component/dashboard";
import QuickPrintScreen from "../features/quick-print/component/quickPrint";
import WorklistScreen from "../features/worklist/component/worklist";
import { ROUTES } from "../lib/constants";
import { AppProvider } from "../store/useAppStore";
import { WorklistProvider } from "../store/worklistStore";
import type { BatchQueryParams } from "../types/batch.types";
import styles from "./bridge.module.scss";

/** Views supported by the federated Signs shell. */
export type FederatedView =
  | "dashboard"
  | "quick-print"
  | "custom-sign"
  | "worklist";

export interface FederatedAppProps {
  /**
   * Optional initial view rendered inside the federated shell.
   * Defaults to dashboard.
   */
  initialView?: FederatedView;
  /** Host callback — minimize the tile/window. */
  onMinimize?: () => void;
  /** Host callback — maximize/expand the tile/window. */
  onMaximize?: () => void;
  /** Host callback — close the tile/window. */
  onClose?: () => void;
}

/**
 * Converts a federated view key into its corresponding route pathname.
 *
 * @param {FederatedView} view - Federated view key.
 * @returns {string} Route pathname used by nav components.
 */
function viewToRoute(view: FederatedView): string {
  switch (view) {
    case "quick-print":
      return ROUTES.QUICK_PRINT;
    case "custom-sign":
      return ROUTES.CUSTOM_SIGN;
    case "worklist":
      return ROUTES.WORKLIST;
    case "dashboard":
    default:
      return ROUTES.DASHBOARD;
  }
}

/**
 * Parses a route href and maps it to an internal federated view key.
 *
 * @param {string} href - Requested internal href.
 * @returns {FederatedView | null} View key, or null when not supported.
 */
function hrefToView(href: string): FederatedView | null {
  const parsed = new URL(href, "http://localhost");
  switch (parsed.pathname) {
    case ROUTES.DASHBOARD:
      return "dashboard";
    case ROUTES.QUICK_PRINT:
      return "quick-print";
    case ROUTES.CUSTOM_SIGN:
      return "custom-sign";
    case ROUTES.WORKLIST:
      return "worklist";
    default:
      return null;
  }
}

/**
 * Extracts worklist batch params from a worklist href query string.
 *
 * @param {string} href - Worklist href containing optional query params.
 * @returns {BatchQueryParams | null} Parsed batch params when complete.
 */
function getWorklistParamsFromHref(href: string): BatchQueryParams | null {
  const parsed = new URL(href, "http://localhost");
  if (parsed.pathname !== ROUTES.WORKLIST) return null;

  const batchId = parsed.searchParams.get("batchId");
  const storeId = parsed.searchParams.get("storeId");
  const batchConfigId = parsed.searchParams.get("batchConfigId");
  const batchName = parsed.searchParams.get("batchName");

  if (!batchId || !storeId || !batchConfigId || !batchName) return null;

  return {
    batchId: Number(batchId),
    storeId,
    batchConfigId: Number(batchConfigId),
    batchName,
  };
}

/**
 * Returns the screen component that matches the requested federated view.
 *
 * @param {FederatedView} activeView - Active view requested by the host or nav.
 * @param {(href: string) => void} onNavigateHref - Internal federation nav handler.
 * @param {BatchQueryParams | null} worklistParams - Optional worklist batch params.
 * @returns {JSX.Element} The rendered screen wrapped in the standard page container.
 */
function renderActiveView(
  activeView: FederatedView,
  onNavigateHref: (href: string) => void,
  worklistParams: BatchQueryParams | null
): JSX.Element {
  switch (activeView) {
    case "quick-print":
      return (
        <PageContainer>
          <QuickPrintScreen />
        </PageContainer>
      );
    case "custom-sign":
      return (
        <PageContainer>
          <CustomSignScreen />
        </PageContainer>
      );
    case "worklist":
      return (
        <PageContainer>
          <WorklistProvider>
            <WorklistScreen batchParams={worklistParams} />
          </WorklistProvider>
        </PageContainer>
      );
    case "dashboard":
    default:
      return (
        <PageContainer>
          <DashboardScreen onNavigateHref={onNavigateHref} />
        </PageContainer>
      );
  }
}

/**
 * Single remote shell exposed to the Portal host.
 *
 * This component renders Sidebar plus the requested feature screen for host
 * embedding. Header and TopBar are intentionally excluded in federation mode.
 * Host window-control
 * callbacks are accepted for API compatibility with the existing portal host.
 * They are intentionally not invoked here because the current app shell does
 * not expose minimize/maximize/close affordances.
 *
 * @param {FederatedAppProps} props - Remote shell props supplied by the host.
 * @returns {JSX.Element} The federated Signs shell.
 */
export default function FederatedApp({
  initialView = "dashboard",
  onMinimize: _onMinimize,
  onMaximize: _onMaximize,
  onClose,
}: FederatedAppProps): JSX.Element {
  const [activeView, setActiveView] = useState<FederatedView>(initialView);
  const [worklistParams, setWorklistParams] = useState<BatchQueryParams | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  /**
   * Handles internal navigation requests from federated components.
   *
   * @param {string} href - Requested internal href.
   * @returns {void}
   */
  function handleNavigateHref(href: string): void {
    const nextView = hrefToView(href);
    if (!nextView) return;

    if (nextView === "worklist") {
      setWorklistParams(getWorklistParamsFromHref(href));
    } else {
      setWorklistParams(null);
    }

    setActiveView(nextView);
  }

  function handleMyApps(): void {
    setIsSidebarVisible(false);
    onClose?.();
  }

  return (
    <div className={styles.bridge}>
      <AppProvider>
        <div className={styles.federatedLayout}>
          {isSidebarVisible && (
            <aside className={styles.federatedSidebar}>
              <Sidebar
                onNavigateHref={handleNavigateHref}
                activePathOverride={viewToRoute(activeView)}
                onMyApps={handleMyApps}
              />
            </aside>
          )}
          <main className={styles.federatedMain}>
            {renderActiveView(activeView, handleNavigateHref, worklistParams)}
          </main>
        </div>
      </AppProvider>
    </div>
  );
}
