import SideNav from "../sideNav/sideNav";
import styles from "./layout.module.scss";
import Dashboard from "../dashboard/dashboard";
import QuickSign from "../quickSign/quickSign";
import { ReactNode } from "react";
import CustomPrint from "../customPrint/customPrint";
import SignWorklist from "../signWorklist/signWorklist";
import type { ViewType } from "@/types";

interface LayoutProps {
  open: boolean;
  children: ReactNode;
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
}

/**
 * Root layout component that composes the sidebar and main content area.
 *
 * Conditionally renders the active view based on the `activeView` prop,
 * ensuring only the selected screen is mounted at any time.
 *
 * @param {LayoutProps} props - Component props including open state, activeView, and onNavigate.
 * @returns {JSX.Element} The layout shell with sidebar and conditionally rendered view.
 */
export default function Layout({ open, children, activeView, onNavigate }: LayoutProps) {
  return (
    <div className="container">
      <div className={styles.layout}>
        <aside className={`${styles.sidebar} ${!open ? styles.closed : ""}`}>
          <SideNav activeView={activeView} onNavigate={onNavigate} />
        </aside>
        <main className={styles.main}>
          {activeView === "dashboard" && <Dashboard />}
          {activeView === "quickSign" && <QuickSign />}
          {activeView === "customSign" && <CustomPrint />}
          {activeView === "signWorklist" && <SignWorklist />}
          {children}
        </main>
      </div>
    </div>
  );
}
