"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./sideNav.module.scss";
import type { ViewType } from "@/types";

interface SideNavProps {
  /** The currently active view key used to highlight the matching nav button. */
  activeView: ViewType;
  /** Callback invoked with the selected ViewType when a nav button is clicked. */
  onNavigate: (view: ViewType) => void;
}

/**
 * Sidebar navigation component for the Signs Management application.
 *
 * Renders navigation buttons for each application view and highlights
 * the currently active one. Delegates view switching to the onNavigate callback.
 *
 * @param {SideNavProps} props - activeView key and onNavigate callback.
 * @returns {JSX.Element} The rendered sidebar navigation.
 */
export default function SideNav({ activeView, onNavigate }: SideNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const backIcon = (
    <svg
      width="12"
      height="12"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.02808 7.125H12.6666V5.54167H3.02808L7.46142 1.10833L6.33329 0L-4.1008e-05 6.33333L6.33329 12.6667L7.46142 11.5583L3.02808 7.125Z"
        fill="white"
      />
    </svg>
  );

  const downArrow = (
    <svg
      width="12"
      height="12"
      viewBox="0 0 9 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.34258 3.73182L1.05904 0.19569C0.816767 -0.0652156 0.423971 -0.0652156 0.181702 0.19569C-0.0605673 0.456595 -0.0605673 0.879606 0.181702 1.14051L3.90391 5.14905C4.14618 5.40995 4.53898 5.40995 4.78125 5.14905L8.50346 1.14051C8.74573 0.879606 8.74573 0.456595 8.50346 0.19569C8.26119 -0.0652156 7.8684 -0.0652156 7.62613 0.19569L4.34258 3.73182Z"
        fill="#ffffff"
      />
    </svg>
  );

  const toolsIcon = (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.4 7.3875C17.33 7.3875 18.9 5.8175 18.9 3.8875C18.9 3.3075 18.74 2.7675 18.49 2.2875L15.79 4.9875L14.3 3.4975L17 0.7975C16.52 0.5475 15.98 0.3875 15.4 0.3875C13.47 0.3875 11.9 1.9575 11.9 3.8875C11.9 4.2975 11.98 4.6875 12.11 5.0475L10.26 6.8975L8.48 5.1175L9.19 4.4075L7.78 2.9975L9.9 0.8775C8.73 -0.2925 6.83 -0.2925 5.66 0.8775L2.12 4.4175L3.53 5.8275H0.71L0 6.5375L3.54 10.0775L4.25 9.3675V6.5375L5.66 7.9475L6.37 7.2375L8.15 9.0175L0.74 16.4275L2.86 18.5475L14.24 7.1775C14.6 7.3075 14.99 7.3875 15.4 7.3875Z"
        fill="#F4F5F5"
      />
    </svg>
  );

  return (
    <div className={styles.sideNav}>
      <div className={styles.myApps}>
        <Link href="#">
          <i>{backIcon}</i>
          <span>My Apps</span>
        </Link>
      </div>
      <nav>
        <ul className={styles.mainMenu}>
          <li>
            <button
              className={`${styles.menuToggle} ${isMenuOpen ? styles.active : ""}`}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <span>Signs Management</span>
              <i>{downArrow}</i>
            </button>
            {isMenuOpen && <ul className={styles.subMenu}>
              <li>
                <button
                  className={activeView === "dashboard" ? styles.activeSubItem : ""}
                  onClick={() => onNavigate("dashboard")}
                >
                  <span>Sign Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  className={activeView === "quickSign" ? styles.activeSubItem : ""}
                  onClick={() => onNavigate("quickSign")}
                >
                  <span>Quick Sign Print</span>
                </button>
              </li>
              <li>
                <button
                  className={activeView === "customSign" ? styles.activeSubItem : ""}
                  onClick={() => onNavigate("customSign")}
                >
                  <span>Custom Sign</span>
                </button>
              </li>
              <li>
                <button
                  className={activeView === "signWorklist" ? styles.activeSubItem : ""}
                  onClick={() => onNavigate("signWorklist")}
                >
                  <span>Sign Worklist</span>
                </button>
              </li>
              <li>
                <button
                  className={activeView === "signAudit" ? styles.activeSubItem : ""}
                  onClick={() => onNavigate("signAudit")}
                >
                  <span>Sign Audit</span>
                </button>
              </li>
            </ul>}
          </li>
        </ul>
      </nav>
      <div className={styles.bottomLink}>
        <Link href="#">
          <i>{toolsIcon}</i>
          <span>Tools</span>
        </Link>
      </div>
    </div>
  );
}
