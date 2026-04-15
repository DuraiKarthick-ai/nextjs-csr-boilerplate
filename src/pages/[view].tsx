"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Header from "../components/header/Header";
import Layout from "../components/layout/layout";
import type { ViewType } from "@/types";

const AuthGate = dynamic(() => import("@/components/auth/authGate"), {
  ssr: false,
});

/** All valid view slugs that map to a ViewType. */
const VALID_VIEWS: ReadonlySet<string> = new Set<ViewType>([
  "dashboard",
  "quickSign",
  "customSign",
  "signWorklist",
  "signAudit",
]);

/**
 * Type-guard that validates a router parameter against the known ViewType union.
 *
 * @param {unknown} value - The value to validate (typically from router.query).
 * @returns {boolean} True when the value is a recognised ViewType slug.
 */
function isValidView(value: unknown): value is ViewType {
  return typeof value === "string" && VALID_VIEWS.has(value);
}

/**
 * Dynamic view page for the Signs Management app.
 *
 * Reads the active view from the URL path (e.g. /dashboard, /quickSign)
 * and delegates rendering to Layout.  Navigation between views uses
 * client-side router.push so the URL always reflects the current screen.
 *
 * @returns {JSX.Element} The authenticated app shell with the selected view.
 */
export default function SignsViewPage(): JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(true);

  const activeView: ViewType = isValidView(router.query.view)
    ? router.query.view
    : "dashboard";

  /**
   * Navigates to the selected view by pushing a new URL.
   *
   * @param {ViewType} view - The view to navigate to.
   */
  const handleNavigate = (view: ViewType): void => {
    void router.push(`/${view}`);
  };

  return (
    <AuthGate>
      <Header open={open} toggle={() => setOpen(!open)} />
      <Layout open={open} activeView={activeView} onNavigate={handleNavigate}>
        {null}
      </Layout>
    </AuthGate>
  );
}
