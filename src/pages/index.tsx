"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Header from "../components/header/header";
import Layout from "../components/layout/layout";

/**
 * Landing page for the Signs app.
 *
 * Both AuthGate and Layout are loaded with ssr: false because they depend
 * on Module Federation's shared React singleton — not available during SSR.
 *
 * OWASP A01: Server-side auth protection is handled by middleware.ts.
 * AuthGate here provides the UI-layer redirect for unauthenticated users.
 */
const AuthGate = dynamic(() => import("@/components/auth/AuthGate"), {
  ssr: false,
});

export default function SignsIndex() {
  const [open, setOpen] = useState(true);

  return (
    <AuthGate>
      <Header open={open} toggle={() => setOpen(!open)} />
      <Layout open={open}>{null}</Layout>
    </AuthGate>
  );
}
