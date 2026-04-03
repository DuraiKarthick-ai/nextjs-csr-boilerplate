import SideNav from "../sideNav/sideNav";
import styles from "./layout.module.scss";
import SignManagement from "../signManagement/signManagement";
import CustomPrint from "../customPrint/customPrint";

import { ReactNode } from "react";
import Dashboard from "../dashboard/dashboard";

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
          {/* <SignManagement></SignManagement> */}
          {/* <Dashboard></Dashboard> */}
          <CustomPrint></CustomPrint>
          {children}
          
        </main>
      </div>
    </div>
  );
}
