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
 *
 * The <AuthGate> inside ProductsPage will detect standalone mode
 * and show a "Go to Portal" screen automatically.
 */
export default function SignsIndex() {
  return (
    <>
      <title>Signs — Standalone</title>
      <div style={{ maxWidth: 1024, margin: "0 auto", padding: "2rem 1rem" }}>
        <ProductsPage />
      </div>
    </>
  );
}
