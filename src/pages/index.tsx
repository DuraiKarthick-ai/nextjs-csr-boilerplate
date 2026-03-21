import React from "react";
import dynamic from "next/dynamic";

const AuthGate = dynamic(() => import("@/components/auth/AuthGate"), {
  ssr: false,
});

/**
 * Standalone landing page for the Signs app.
 *
 * In production this app is consumed as a remote via Module Federation
 * (the Portal loads `./ProductsPage`). When accessed directly at
 * localhost:3002, the AuthGate detects standalone mode and shows a
 * single "Go to Portal" screen — nothing else is loaded.
 *
 * AuthGate is loaded with `ssr: false` because it depends on
 * usePortalAuth which uses Module Federation's shared React singleton
 * — not available during server-side rendering.
 */
export default function SignsIndex() {
  return (
    <>
      <title>Signs — Standalone</title>
      <AuthGate>
        {/* Children only render when authenticated via Portal */}
        <p>Authenticated — this should not appear standalone.</p>
      </AuthGate>
    </>
  );
}
