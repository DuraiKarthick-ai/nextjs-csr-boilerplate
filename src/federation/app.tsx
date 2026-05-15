"use client";

import { useState } from "react";
import type { ViewType } from "@/types";
import AuthGate from "@/components/auth/authGate";
import Layout from "@/components/layout/layout";
import styles from "./bridge.module.scss";

export interface FederatedAppProps {
  /**
   * Optional initial view. When omitted, the shell opens on Dashboard so the
   * host app sees the full application surface instead of a single quick-sign
   * form.
   */
  initialView?: ViewType;
}

/**
 * Single remote shell exposed to the Portal host.
 *
 * This component loads the same authenticated header/sidebar/layout flow that
 * the standalone Next app uses, so the host can mount one remote and get the
 * full Signs Management experience.
 */
export default function FederatedApp({ initialView = "dashboard" }: FederatedAppProps) {
  const [open, setOpen] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>(initialView);

  const handleNavigate = (view: ViewType): void => {
    setActiveView(view);
  };

  return (
    <div className={styles.bridge}>
      <AuthGate>
        <Layout open={open} activeView={activeView} onNavigate={handleNavigate}>
          {null}
        </Layout>
      </AuthGate>
    </div>
  );
}
