import React from "react";
import dynamic from "next/dynamic";

const SignsLayout = dynamic(
  () => import("@/components/layout/SignsLayout"),
  { ssr: false }
);

/**
 * Standalone landing page for the Signs app.
 * In production this app is consumed as a remote via Module Federation;
 * this page exists for independent development and debugging.
 *
 * Renders the full Signs Management dashboard (sidebar + content).
 * When running standalone the AuthGate inside ProductsPage would block,
 * but here we render the layout directly so the dashboard is always visible.
 */
export default function SignsIndex() {
  return (
    <>
      <title>Signs — Standalone</title>
      <SignsLayout />
    </>
  );
}
