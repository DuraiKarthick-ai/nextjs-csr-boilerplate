import SideNav from "../sideNav/sideNav";
import styles from "./layout.module.scss";
import Dashboard from "../dashboard/dashboard";
import QuickSign from "../quickSign/quickSign";
import { ReactNode } from "react";

interface LayoutProps {
  open: boolean;
  children: ReactNode;
}

export default function Layout({ open, children }: LayoutProps) {
  return (
    <div className="container">
      <div className={styles.layout}>
        <aside className={`${styles.sidebar} ${!open ? styles.closed : ""}`}>
          <SideNav />
        </aside>
        <main className={styles.main}>
          {/* <Dashboard /> */}
          <QuickSign />
          {children}
        </main>
      </div>
    </div>
  );
}
