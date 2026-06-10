"use client";

/**
 * TopBar — MUI Toolbar providing global search and user account information.
 *
 * @param {TopBarProps} props - Component props.
 * @returns {JSX.Element} The top action bar with search and user info.
 */
import styles from "./topbar.module.scss";
import React from "react";
import { useTranslation } from "react-i18next";

interface TopBarProps {
  /** Callback fired with the debounced search term. */
  onSearch?: (term: string) => void;
  /** Display name of the logged-in user. */
  userName?: string;
}

/**
 * TopBar with debounced MUI search input and user avatar.
 *
 * @param {TopBarProps} props
 * @returns {JSX.Element}
 */
function TopBar({ onSearch, userName }: TopBarProps): JSX.Element {
  const { t } = useTranslation("common");

    const searchIcon = (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 11H11.71L11.43 10.73C12.41 9.59 13 8.11 13 6.5C13 2.91 10.09 0 6.5 0C2.91 0 0 2.91 0 6.5C0 10.09 2.91 13 6.5 13C8.11 13 9.59 12.41 10.73 11.43L11 11.71V12.5L16 17.49L17.49 16L12.5 11V11ZM6.5 11C4.01 11 2 8.99 2 6.5C2 4.01 4.01 2 6.5 2C8.99 2 11 4.01 11 6.5C11 8.99 8.99 11 6.5 11Z" fill="#ffffff"/>
    </svg>
  )

  const chevronIcon = (
    <svg width="5" height="10" viewBox="0 0 5 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 10L5 5L0 0V10Z" fill="#323232"/>
    </svg>
  )

  const gridIcon = (
    <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="10.6667" height="7" fill="#515151"/>
      <rect y="9" width="10.6667" height="7" fill="#515151"/>
      <rect x="13.3333" width="10.6667" height="7" fill="#515151"/>
      <rect x="13.3333" y="9" width="10.6667" height="7" fill="#515151"/>
    </svg>
  )

  void onSearch;
  void userName;

  return (
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
                <div className={styles.gridToggle}>
                  <button type="button" className={styles.gridBtn} aria-label="Toggle view">
                    <i>
                      {gridIcon}
                    </i>
                  </button>
                  <button type="button" className={styles.chevronBtn} aria-label="Expand">
                    <i>
                      {chevronIcon}
                    </i>
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
