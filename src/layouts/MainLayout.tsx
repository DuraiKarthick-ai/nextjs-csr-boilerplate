"use client";

/**
 * MainLayout — root layout wrapper applied to every page.
 * Composes the Header, Sidebar, TopBar, and page content area
 * into the full ERP shell. Wraps all children with AppProvider
 * so that global state (sidebar open/close, active department)
 * is available via useAppStore throughout the tree.
 *
 * @param {MainLayoutProps} props - Component props.
 * @returns {JSX.Element} The application shell.
 */

import React from "react";
import Header from "../shared/layout/Header";
import Sidebar from "../shared/layout/Sidebar";
import useAppStore, { AppProvider } from "../store/useAppStore";
import styles from "./mainLayout.module.scss";

interface MainLayoutProps {
  /** The page content rendered in the main area. */
  children: React.ReactNode;
  /** Optional search handler forwarded to the TopBar. */
  onSearch?: (term: string) => void;
  /** Display name of the logged-in user forwarded to the TopBar. */
  userName?: string;
}

/** Inner shell — must live inside AppProvider to access context. */
function LayoutShell({ children }: { children: React.ReactNode }): JSX.Element {
  const { isSidebarOpen, closeSidebar } = useAppStore();
  return (
    <>
      <Header />
      <div className={`${styles.layout} ${!isSidebarOpen ? styles.navFolded : ""}`}>
        <div className={`container ${styles.contentWrapper}`}>
          <aside className={styles.sidebar}>
            <Sidebar onMyApps={closeSidebar} />
          </aside>
          <main className={styles.main}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

/**
 * Full-page ERP layout composing Header, Sidebar and content.
 * Provides AppProvider context to the entire component tree.
 *
 * @param {MainLayoutProps} props
 * @returns {JSX.Element}
 */
function MainLayout({ children }: MainLayoutProps): JSX.Element {
  return (
    <AppProvider>
      <LayoutShell>{children}</LayoutShell>
    </AppProvider>
  );
}

export default MainLayout;
