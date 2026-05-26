"use client";

import { useState, useMemo } from "react";
import type { ViewType } from "@/types";
import AuthGate from "@/components/auth/authGate";
import Layout from "@/components/layout/layout";
import { WindowControlsProvider } from "@/hooks/useWindowControls";
import styles from "./bridge.module.scss";

export interface FederatedAppProps {
  /**
   * Optional initial view. When omitted, the shell opens on Dashboard so the
   * host app sees the full application surface instead of a single quick-sign
   * form.
   */
  initialView?: ViewType;
  /** Host callback — minimize the tile/window. */
  onMinimize?: () => void;
  /** Host callback — maximize/expand the tile/window. */
  onMaximize?: () => void;
  /** Host callback — close the tile/window. */
  onClose?: () => void;
}

/**
 * Single remote shell exposed to the Portal host.
 *
 * This component loads the same authenticated header/sidebar/layout flow that
 * the standalone Next app uses, so the host can mount one remote and get the
 * full Signs Management experience.
 *
 * The onMinimize/onMaximize/onClose callbacks are provided by the host app
 * and trigger Redux actions on the host side to control tile state.
 */
export default function FederatedApp({
  initialView = "dashboard",
  onMinimize,
  onMaximize,
  onClose,
}: FederatedAppProps) {
  const [open] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>(initialView);

  const handleNavigate = (view: ViewType): void => {
    setActiveView(view);
  };

  const windowControls = useMemo(
    () => ({ onMinimize, onMaximize, onClose }),
    [onMinimize, onMaximize, onClose],
  );

  return (
    <div className={styles.bridge}>
      <WindowControlsProvider value={windowControls}>
        <AuthGate>
          <Layout open={open} activeView={activeView} onNavigate={handleNavigate}>
            {null}
          </Layout>
        </AuthGate>
      </WindowControlsProvider>
    </div>
  );
}
