"use client";

/**
 * Header — Costco ERP application header using MUI AppBar.
 * Displays the application logo, title, and global sidebar toggle.
 *
 * @param {HeaderProps} props - Component props.
 * @returns {JSX.Element} The top navigation header bar.
 */

import Link from "next/link";
import styles from "./header.module.scss";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import useAppStore from "../../store/useAppStore";
import TopBar from "./TopBar";

interface HeaderProps {
  /** Application title shown in the header. Defaults to i18n key. */
  title?: string;
  onSearch?: (term: string) => void;
  /** Display name of the logged-in user forwarded to the TopBar. */
  userName?: string;
}

// Always serve from this app's own public folder
const LOGO_SRC = "/images/costco_wholesale.png";

/**
 * Top-level ERP header with sidebar toggle and app branding.
 *
 * @param {HeaderProps} props
 * @returns {JSX.Element}
 */
function Header({ title, onSearch, userName }: HeaderProps): JSX.Element {
  const { t, i18n } = useTranslation("common");
  const { toggleSidebar, isSidebarOpen } = useAppStore();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!isLangMenuOpen) return;
    const handler = (e: MouseEvent): void => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isLangMenuOpen]);

  function handleChangeLang(lang: "en" | "fr"): void {
    void i18n.changeLanguage(lang);
    setIsLangMenuOpen(false);
  }

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

  return (
    <header className={styles.header}>
      <div className={styles.primaryHeader}>
        <div className="container">
          <div className={`d-flex flex-align-center ${styles.primaryHeaderWrap}`}>
            <button
              type="button"
              className={`${styles.handBurgMenu} ${isSidebarOpen ? styles.active : ""}`}
              onClick={toggleSidebar}
              aria-label={isSidebarOpen ? t("header.closeSidebar") : t("header.openSidebar")}
            >
              <i aria-hidden="true">
                {handBurgMenuIcon}
              </i>
            </button>
            <div className={styles.logoWrap}>
              <Link href={"/"}>
                <div className={styles.logo}>
                  <Image src={LOGO_SRC} alt="Costco Wholesale" width={160} height={40} priority />
                </div>
              </Link>
              <h4>{title ?? t("header.title")}</h4>
            </div>
            <div className={styles.userHelpInfoWrap}>
              <ul className="d-flex flex-align-center">
                <li>
                  <label>Warehouse 110</label>
                </li>
                {/* Hided new UX change */}
                { false && 
                  <li>
                    <Link href={""}>
                      <span>Help</span>
                    </Link>
                  </li>
                }
                <li>
                  <Link href={""} className="d-flex flex-align-center">
                    <span>Welcome, Roshini</span>
                    <i>
                      {downIcon}
                    </i>
                  </Link>
                </li>
                <li ref={langRef} className={styles.langSelectorWrap}>
                  <button
                    type="button"
                    className={`d-flex flex-align-center ${styles.langButton}`}
                    onClick={() => setIsLangMenuOpen((o) => !o)}
                    aria-haspopup="listbox"
                    aria-expanded={isLangMenuOpen}
                  >
                    <span>{i18n.language === "fr" ? "Français" : "English"}</span>
                    <i>{downIcon}</i>
                  </button>
                  {isLangMenuOpen && (
                    <ul className={styles.langDropdown} role="listbox">
                      <li role="option" aria-selected={i18n.language === "en"}>
                        <button type="button" onClick={() => handleChangeLang("en")}>English</button>
                      </li>
                      <li role="option" aria-selected={i18n.language === "fr"}>
                        <button type="button" onClick={() => handleChangeLang("fr")}>Français</button>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <TopBar onSearch={onSearch} userName={userName} />
    </header>
  );
}

export default Header;
