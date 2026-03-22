import React from "react";
import SignsLayout from "@/components/layout/SignsLayout";

/* ── component ─────────────────────────────────────────────────── */

/**
 * ProductsPage — Federated entry point for the Signs MFE.
 *
 * Exposed via Module Federation as `./ProductsPage` in next.config.js.
 * The Portal host loads this component inside its shell.
 *
 * Renders the full Signs Management dashboard (sidebar + stat cards
 * + recent activity table). All data is fetched from the dashboard
 * API inside SignsLayout → useDashboard.
 */
export default function ProductsPage() {
  return <SignsLayout />;
}
