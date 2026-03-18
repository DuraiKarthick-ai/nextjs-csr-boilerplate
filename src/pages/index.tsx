import React from "react";
import dynamic from "next/dynamic";

const ProductsPage = dynamic(
  () => import("@/components/products/ProductsPage"),
  { ssr: false }
);

/**
 * Standalone landing page for the Signs app.
 * In production this app is consumed as a remote; this page exists
 * for independent development and debugging.
 */
export default function SignsIndex() {
  return (
    <>
      {/* Intentionally avoids next/head to prevent Module Federation SSR runtime hook issues in standalone mode. */}
      <title>Signs — Standalone</title>

      <div style={{ maxWidth: 1024, margin: "0 auto", padding: "2rem 1rem" }}>
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 6,
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            color: "#92400e",
          }}
        >
          ⚠️ Running in <strong>standalone mode</strong>. Auth context is
          stubbed. For full functionality, access this app through the Portal.
        </div>

        <ProductsPage />
      </div>
    </>
  );
}
