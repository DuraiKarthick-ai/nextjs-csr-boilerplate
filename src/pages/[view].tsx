import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import dynamic from "next/dynamic";
import type { ViewType } from "@/types";
import Header from "../components/header/header";
import Layout from "../components/layout/layout";

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

interface SignsViewPageProps {
  initialView: ViewType;
  navigateTo?: (path: string) => void;
}

/**
 * Resolves and validates the dynamic [view] route on the server.
 *
 * @param context - Next.js server-side context with route params.
 * @returns Props for valid view routes, or notFound for invalid slugs.
 */
export const getServerSideProps: GetServerSideProps<SignsViewPageProps> = async (context) => {
  const routeView = context.params?.view;

  if (!isValidView(routeView)) {
    return { notFound: true };
  }

  return {
    props: {
      initialView: routeView,
    },
  };
};

/**
 * Dynamic view page for the Signs Management app.
 *
 * Reads the active view from the URL path (e.g. /dashboard, /quickSign)
 * and delegates rendering to Layout.  Navigation between views uses
 * client-side router.push so the URL always reflects the current screen.
 *
 * @returns {JSX.Element} The authenticated app shell with the selected view.
 */
export default function SignsViewPage({
  initialView,
  navigateTo,
}: InferGetServerSidePropsType<typeof getServerSideProps> &
  Pick<SignsViewPageProps, "navigateTo">): JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<ViewType>(initialView);

  /**
   * Keeps activeView in sync when the URL changes via <Link>, browser
   * back/forward, or any navigation that updates router.query.view.
   */
  useEffect(() => {
    const routeView = router.query.view;
    if (isValidView(routeView) && routeView !== activeView) {
      setActiveView(routeView);
    }
  }, [router.query.view]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Switches the active view client-side without a full page reload.
   * Updates local state immediately for instant UI feedback and syncs
   * the URL shallowly so getServerSideProps is NOT re-invoked.
   *
   * @param {ViewType} view - The view to navigate to.
   */
  const handleNavigate = (view: ViewType): void => {
    if (navigateTo) {
      navigateTo(`/${view}`);
      return;
    }

    setActiveView(view);
    void router.push(`/${view}`, undefined, { shallow: true });
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
