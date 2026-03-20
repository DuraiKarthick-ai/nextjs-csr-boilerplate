import React from "react";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import AuthGate from "@/components/auth/AuthGate";
import SignsLayout from "@/components/layout/SignsLayout";

/* ── component ─────────────────────────────────────────────────── */

/**
 * ProductsPage — Federated Component (entry point for the Signs MFE)
 *
 * This is the component exposed via Module Federation as `./ProductsPage`.
 * The Portal host loads this component inside its shell.
 *
 * - Wraps content with `<AuthGate>` to enforce authentication.
 * - Renders the full Signs Management dashboard with sidebar + stats + table.
 */
export default function ProductsPage() {
  /* ── portal auth context (hook-safe) ─── */
  const _auth = usePortalAuth();

  return (
    <AuthGate>
      <SignsLayout />
    </AuthGate>
  );
}
