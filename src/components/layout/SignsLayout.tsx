import React from "react";
import Sidebar from "./Sidebar";
import SignsManagement from "@/components/dashboard/SignsManagement";
import { SIDEBAR_ITEMS } from "@/data/mockDashboard";
import { useDashboard } from "@/hooks/useDashboard";
import styles from "./SignsLayout.module.css";

/* ── Component ─────────────────────────────────────────────────── */

/**
 * SignsLayout — Top-level layout for the Signs MFE.
 *
 * Renders a left sidebar with navigation and the active screen
 * in the content area. Dashboard data is fetched from the remote
 * API via the `useDashboard` hook; on error the UI falls back to
 * mock data so the screen is never blank.
 */
export default function SignsLayout() {
  const [activeId, setActiveId] = React.useState("signs-management");
  const { data, isLoading, error, refetch } = useDashboard();

  return (
    <div className={styles.layout}>
      <Sidebar
        items={SIDEBAR_ITEMS}
        activeId={activeId}
        onSelect={setActiveId}
      />
      <main className={styles.content}>
        {activeId === "signs-management" ? (
          <>
            {/* Non-blocking error banner */}
            {error && (
              <div className={styles.errorBanner}>
                <span>⚠ {error}</span>
                <button
                  className={styles.retryBtn}
                  type="button"
                  onClick={() => void refetch()}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Show spinner ONLY on initial load, then swap to the dashboard */}
            {isLoading && data.recentActivity.length === 0 ? (
              <div className={styles.loadingOverlay}>
                <div className={styles.spinner} />
                <p>Loading dashboard…</p>
              </div>
            ) : (
              <SignsManagement data={data} isLoading={isLoading} onRefresh={refetch} />
            )}
          </>
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
