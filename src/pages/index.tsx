import React from "react";
import dynamic from "next/dynamic";

const SignsLayout = dynamic(
  () => import("@/components/layout/SignsLayout"),
  { ssr: false }
);

/**
 * Landing page for the Signs app.
 *
 * In production this app is consumed as a remote via Module Federation
 * (the Portal loads `./ProductsPage`). When accessed directly (standalone
 * or GKE external URL) this page renders the Signs Management dashboard.
 *
 * SignsLayout is loaded with `ssr: false` because it depends on hooks
 * that reference Module Federation's shared React singleton — not
 * available during server-side rendering.
 */
export default function SignsIndex() {
  return (
    <>
      <title>Signs Management</title>
      <SignsLayout />
    </>
  );
}
