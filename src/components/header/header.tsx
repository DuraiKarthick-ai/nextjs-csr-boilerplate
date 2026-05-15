
import { useMemo } from "react";
import Link from "next/link";
import styles from "./header.module.scss";

interface HeaderProps {
  toggle: () => void;
  open: boolean;
}

const LOGO_FILE = "/images/costco_wholesale.png";

/**
 * Builds logo URL that works in both standalone and federated host contexts.
 *
 * Priority:
 * 1) Explicit signs app origin env vars.
 * 2) Remote entry script origin/path when mounted by Module Federation.
 * 3) Local relative path fallback.
 */
function resolveLogoSrc(): string {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SIGNS_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

  if (typeof window !== "undefined" && configuredOrigin) {
    try {
      const configuredUrl = new URL(configuredOrigin);

      // In standalone mode, keep assets relative so local http/https mismatches
      // in dev do not break the image URL.
      if (configuredUrl.host === window.location.host) {
        return LOGO_FILE;
      }

      return `${configuredOrigin.replace(/\/$/, "")}${LOGO_FILE}`;
    } catch {
      // Ignore malformed env values and continue to other resolution paths.
    }
  }

  if (configuredOrigin) {
    return `${configuredOrigin.replace(/\/$/, "")}${LOGO_FILE}`;
  }

  if (typeof document !== "undefined") {
    const remoteEntryScript = Array.from(document.scripts).find((script) =>
      script.src.includes("remoteEntry.js")
    );

    if (remoteEntryScript?.src) {
      try {
        const remoteUrl = new URL(remoteEntryScript.src);
        const basePath = remoteUrl.pathname.includes("/_next/")
          ? remoteUrl.pathname.split("/_next/")[0]
          : "";
        return `${remoteUrl.origin}${basePath}${LOGO_FILE}`;
      } catch {
        // Ignore URL parse failures and continue to relative fallback.
      }
    }
  }

  return LOGO_FILE;
}

export default function Header({ toggle, open }: HeaderProps) {
  const logoSrc = useMemo(resolveLogoSrc, []);

  const handBurgMenuIcon  = (
    <svg width="23" height="16" viewBox="0 0 23 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 15.132H22.6979V12.61H0V15.132ZM0 8.82698H22.6979V6.30498H0V8.82698ZM0 0V2.52199H22.6979V0H0Z" fill="#000000"/>
    </svg>
  )

  const downIcon = (
    <svg width="12" height="12" viewBox="0 0 9 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.34258 3.73182L1.05904 0.19569C0.816767 -0.0652156 0.423971 -0.0652156 0.181702 0.19569C-0.0605673 0.456595 -0.0605673 0.879606 0.181702 1.14051L3.90391 5.14905C4.14618 5.40995 4.53898 5.40995 4.78125 5.14905L8.50346 1.14051C8.74573 0.879606 8.74573 0.456595 8.50346 0.19569C8.26119 -0.0652156 7.8684 -0.0652156 7.62613 0.19569L4.34258 3.73182Z"
        fill="#005DAB" />
    </svg>
  )

  const searchIcon = (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 11H11.71L11.43 10.73C12.41 9.59 13 8.11 13 6.5C13 2.91 10.09 0 6.5 0C2.91 0 0 2.91 0 6.5C0 10.09 2.91 13 6.5 13C8.11 13 9.59 12.41 10.73 11.43L11 11.71V12.5L16 17.49L17.49 16L12.5 11V11ZM6.5 11C4.01 11 2 8.99 2 6.5C2 4.01 4.01 2 6.5 2C8.99 2 11 4.01 11 6.5C11 8.99 8.99 11 6.5 11Z" fill="#ffffff"/>
    </svg>
  )

  const dashboardIcon = (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 10H8V0H0V10ZM0 18H8V12H0V18ZM10 18H18V8H10V18ZM10 0V6H18V0H10Z" fill="#666666"/>
    </svg>
  )

  const notificationIcon = (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 17V15H2V8C2 6.61667 2.41667 5.39167 3.25 4.325C4.08333 3.24167 5.16667 2.53333 6.5 2.2V1.5C6.5 1.08333 6.64167 0.733333 6.925 0.449999C7.225 0.15 7.58333 0 8 0C8.41667 0 8.76667 0.15 9.05 0.449999C9.35 0.733333 9.5 1.08333 9.5 1.5V2.2C10.8333 2.53333 11.9167 3.24167 12.75 4.325C13.5833 5.39167 14 6.61667 14 8V15H16V17H0ZM8 20C7.45 20 6.975 19.8083 6.575 19.425C6.19167 19.025 6 18.55 6 18H10C10 18.55 9.8 19.025 9.4 19.425C9.01667 19.8083 8.55 20 8 20ZM4 15H12V8C12 6.9 11.6083 5.95833 10.825 5.175C10.0417 4.39167 9.1 4 8 4C6.9 4 5.95833 4.39167 5.175 5.175C4.39167 5.95833 4 6.9 4 8V15Z" fill="#005DAB"/>
  </svg>
  )

  return (
    <header className={styles.header}>
        <div className={styles.primaryHeader}>
          <div className="container">
            <div className={`d-flex flex-align-center ${styles.primaryHeaderWrap}`}>
              <Link href={""} onClick={toggle} className={`${styles.handBurgMenu} ${open ? styles.active : ""}`}>
                <i>
                  {handBurgMenuIcon}
                </i>
              </Link>
              <div className={styles.logoWrap}>
                <Link href={"/"}>
                  <div className={styles.logo}>
                    <img src={logoSrc} alt="web logo" width={160} height={40} loading="eager" />
                  </div>
                </Link>
                <h4>IBMi Replatforming</h4>
              </div>
              <div className={styles.userHelpInfoWrap}>
                <ul className="d-flex flex-align-center">
                  <li>
                    <Link href={""}>
                      <span>Help</span>
                    </Link>
                  </li>
                  <li>
                    <Link href={""} className="d-flex flex-align-center">
                      <span>Welcome, Roshini</span>
                      <i>
                        {downIcon}
                      </i>
                    </Link>
                  </li>
                  <li>
                    <label>Warehouse 110</label>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.subHeader}>
          <div className="container">
            <div className={`d-flex flex-align-center ${styles.subHeaderWrap}`}>
              <div className={styles.headerSearch}>
                <div className={styles.searchWrap}>
                  <input placeholder="Search Apps, Files ETC"></input>
                  <i>
                    {searchIcon}
                  </i>
                </div>
              </div>
              <div className={styles.titleIcons}>
                <ul>
                  <li>
                    <Link href={""}>
                      <i>
                        {dashboardIcon}
                      </i>
                    </Link>
                  </li>
                  <li>
                    <label className={styles.operationTypeTag}><span>NSI</span><span>ENT</span></label>
                  </li>
                </ul>
                <div className={styles.rightAlignedbtnWrap}>
                  <Link href={""} className={styles.notificationBtn}>
                    <i>
                      {notificationIcon}
                    </i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
    </header>
  );
}
