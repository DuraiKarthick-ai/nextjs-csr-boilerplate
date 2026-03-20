import React from "react";
import Sidebar from "./Sidebar";
import SignsManagement from "@/components/dashboard/SignsManagement";
import { SIDEBAR_ITEMS } from "@/data/mockDashboard";
import { MOCK_DASHBOARD_DATA } from "@/data/mockDashboard";
import type { SignsDashboardData } from "@/types/dashboard";
import styles from "./SignsLayout.module.css";

/* ── Props ─────────────────────────────────────────────────────── */

interface SignsLayoutProps {
  /**
   * Dashboard data — defaults to mock data.
   * When the real API is ready, pass live data here.
   */
  dashboardData?: SignsDashboardData;
}

/* ── Component ─────────────────────────────────────────────────── */

/**
 * SignsLayout — Top-level layout for the Signs MFE.
 *
 * Renders a left sidebar with navigation and the active screen
 * in the content area. Currently only "Signs Management" has a
 * real screen; other sidebar items show a placeholder.
 */
export default function SignsLayout({ dashboardData }: SignsLayoutProps) {
  const [activeId, setActiveId] = React.useState("signs-management");
  const data = dashboardData ?? MOCK_DASHBOARD_DATA;

  return (
    <div className={styles.layout}>
      <Sidebar
        items={SIDEBAR_ITEMS}
        activeId={activeId}
        onSelect={setActiveId}
      />
      <main className={styles.content}>
        {activeId === "signs-management" ? (
          <SignsManagement data={data} />
        ) : (
          <PlaceholderScreen id={activeId} />
        )}
      </main>
    </div>
  );
}

/* ── Placeholder for non-implemented screens ───────────────────── */

const SCREEN_LABELS: Record<string, string> = {
  "sign-worklist": "Sign Worklist",
  "custom-template": "Custom Template",
  "sign-audit": "Sign Audit",
  "quick-sign-print": "Quick Sign Print",
};

function PlaceholderScreen({ id }: { id: string }) {
  const label = SCREEN_LABELS[id] ?? id;
  return (
    <div className={styles.placeholder}>
      <div className={styles.placeholderIcon}>🚧</div>
      <h2 className={styles.placeholderTitle}>{label}</h2>
      <p className={styles.placeholderDesc}>
        This screen is coming soon. Click <strong>Signs Management</strong> in
        the sidebar to return to the dashboard.
      </p>
    </div>
  );
}
