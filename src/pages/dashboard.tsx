import React from "react";
import { useRouter } from "next/router";
import PageContainer from "../shared/layout/PageContainer";
import DashboardScreen from "../features/dashboard/component/dashboard";

/**
 * Dashboard page — rendered at /dashboard.
 * Delegates all navigation to the Next.js router so federation-mode
 * hosts can override via the onNavigateHref prop.
 *
 * @returns {JSX.Element}
 */
export default function DashboardPage(): JSX.Element {
  const router = useRouter();

  return (
    <PageContainer>
      <DashboardScreen onNavigateHref={(href) => void router.push(href)} />
    </PageContainer>
  );
}
