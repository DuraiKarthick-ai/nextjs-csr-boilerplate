"use client";

/**
 * Sidebar — collapsible MUI Drawer-based navigation sidebar.
 * Renders navigation links derived from the ROUTES constant.
 *
 * @returns {JSX.Element} The sidebar navigation panel.
 */

import { useState, useEffect, type MouseEvent } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { ROUTES } from "../../lib/constants";
import styles from "./sidebar.module.scss";

/** Navigation link definition. */
interface NavLink {
  labelKey: string;
  href: string;
}

/** Ordered navigation link definitions. */
const NAV_LINKS: NavLink[] = [
  { labelKey: "nav.dashboard", href: ROUTES.DASHBOARD },
  { labelKey: "nav.quickPrint", href: ROUTES.QUICK_PRINT },
  { labelKey: "nav.customSign", href: ROUTES.CUSTOM_SIGN },
];

interface SidebarProps {
  /**
   * Optional callback used by federation mode to handle navigation internally
   * without pushing host-level URLs.
   */
  onNavigateHref?: (href: string) => void;
  /** Optional active-path override supplied by federation mode. */
  activePathOverride?: string;
  /** Called when the user clicks "← My Apps" to leave the app. */
  onMyApps?: () => void;
}

/**
 * Collapsible sidebar navigation built on MUI Drawer.
 *
 * @returns {JSX.Element}
 */
function Sidebar({ onNavigateHref, activePathOverride, onMyApps }: SidebarProps): JSX.Element {
  const { t } = useTranslation("common");


  // Always initialise as false to match SSR output and avoid hydration mismatch.
  // After mount, read sessionStorage on the client to restore persisted state.
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>(ROUTES.DASHBOARD);

  /**
   * Reads the current browser pathname in a client-safe way.
   *
   * @returns {string} Current pathname, or dashboard route as fallback.
   */
  function getCurrentPathname(): string {
    if (typeof window === "undefined") return ROUTES.DASHBOARD;
    return window.location.pathname || ROUTES.DASHBOARD;
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncPathname = (): void => {
      setCurrentPath(getCurrentPathname());
    };

    syncPathname();
    window.addEventListener("popstate", syncPathname);

    return () => {
      window.removeEventListener("popstate", syncPathname);
    };
  }, []);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("signs_submenu_open");
      if (stored === "1") {
        setIsMenuOpen(true);
      } else if (stored === null) {
        // No stored preference — open if current route is a submenu link.
        setIsMenuOpen(NAV_LINKS.some((link) => link.href === getCurrentPathname()));
      }
    } catch {
      // sessionStorage unavailable — keep default false.
    }
  }, []);


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
    <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.8039 10.4383L11.6826 12.5596L17.6788 18.5558L19.8001 16.4345L13.8039 10.4383Z" fill="#F4F5F5"/>
      <path d="M15.4 7.3875C17.33 7.3875 18.9 5.8175 18.9 3.8875C18.9 3.3075 18.74 2.7675 18.49 2.2875L15.79 4.9875L14.3 3.4975L17 0.7975C16.52 0.5475 15.98 0.3875 15.4 0.3875C13.47 0.3875 11.9 1.9575 11.9 3.8875C11.9 4.2975 11.98 4.6875 12.11 5.0475L10.26 6.8975L8.48 5.1175L9.19 4.4075L7.78 2.9975L9.9 0.8775C8.73 -0.2925 6.83 -0.2925 5.66 0.8775L2.12 4.4175L3.53 5.8275H0.71L0 6.5375L3.54 10.0775L4.25 9.3675V6.5375L5.66 7.9475L6.37 7.2375L8.15 9.0175L0.74 16.4275L2.86 18.5475L14.24 7.1775C14.6 7.3075 14.99 7.3875 15.4 7.3875Z" fill="#F4F5F5"/>
    </svg>
  );

  return (
    <div className={styles.sideNav}>
      <div className={styles.myApps}>
        <button type="button" className={styles.myAppsBtn} aria-label={t("nav.myApps")} onClick={onMyApps}>
          <i>{backIcon}</i>
          <span>{t("nav.myApps")}</span>
        </button>
      </div>
      <nav>
        <ul className={styles.mainMenu}>
          <li>
            <button
              type="button"
              className={isMenuOpen ? styles.activeMainItem : ""}
              onClick={() => {
                setIsMenuOpen((prev) => {
                  const next = !prev;
                  try { sessionStorage.setItem("signs_submenu_open", next ? "1" : "0"); } catch (e) {}
                  return next;
                });
              }}
              aria-expanded={isMenuOpen}>
               <span>{t("nav.signManagement")}</span>
               <i>{downArrow}</i>
             </button>
            <ul className={`${styles.subMenu} ${isMenuOpen ? styles.subMenuOpen : ""}`}>
              {NAV_LINKS.map((link) => {
                const isActive = (activePathOverride ?? currentPath) === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className={isActive ? styles.activeSubItem : ""}
                      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                        if (onNavigateHref) {
                          event.preventDefault();
                          onNavigateHref(link.href);
                        }
                        // keep submenu open when navigating to a submenu item
                        setIsMenuOpen(true);
                        setCurrentPath(link.href);
                        try { sessionStorage.setItem("signs_submenu_open", "1"); } catch (e) {}
                      }}
                    >
                      <span>{t(link.labelKey)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </nav>
      <div className={styles.bottomLink}>
        <button type="button" className={styles.toolsBtn} aria-label={t("nav.tools")}>
          <i>{toolsIcon}</i>
          <span>{t("nav.tools")}</span>
        </button>
      </div>

    </div>
  );

}

export default Sidebar;
