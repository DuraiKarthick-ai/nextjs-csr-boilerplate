import React, { useState, useEffect } from "react";
import styles from "./quickPrint.module.scss";
import { useTranslation } from "react-i18next";
import PrintByItem from "./print-by-item/PrintByItem";
import PrintByDept from "./print-by-dept/PrintByDept";

function QuickPrintScreen(): JSX.Element {
  const { t } = useTranslation("signs");
  const [active, setActive] = useState("item");
  const [updatedTime, setUpdatedTime] = useState("");

  useEffect(() => {
    setUpdatedTime(
      new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    );
  }, []);

  return (
    <div className={styles.contentWrap}>
      <div className={styles.topContentBar}>
        <div className={styles.topTitle}>
          <h2>{t("quickPrint.screenTitle")}</h2>
        </div>
        <div className={styles.actionWrap}>
          <ul>
            <li>
              <div className={`d-flex flex-align-center ${styles.lastUpdated}`}>
                <i>
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.2083 2.44792C12.6979 0.9375 10.625 0 8.32292 0C3.71875 0 0 3.72917 0 8.33333C0 12.9375 3.71875 16.6667 8.32292 16.6667C12.2083 16.6667 15.4479 14.0104 16.375 10.4167H14.2083C13.3542 12.8437 11.0417 14.5833 8.32292 14.5833C4.875 14.5833 2.07292 11.7812 2.07292 8.33333C2.07292 4.88542 4.875 2.08333 8.32292 2.08333C10.0521 2.08333 11.5937 2.80208 12.7187 3.9375L9.36458 7.29167H16.6562V0L14.2083 2.44792Z" fill="#79747E" />
                  </svg>
                </i>
                <p>Updated {updatedTime}</p>
              </div>
            </li>
            <li>
              <i>
                <svg width="16" height="2" viewBox="0 0 16 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 0H0V2H16V0Z" fill="#79747E" />
                </svg>
              </i>
            </li>
            <li>
              <i>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 6.66667V0H8.33333L11.075 2.74167L2.74167 11.075L0 8.33333V15H6.66667L3.925 12.2583L12.2583 3.925L15 6.66667Z" fill="#79747E" />
                </svg>
              </i>
            </li>
            <li>
              <i>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="#79747E" />
                </svg>
              </i>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.section}>
        
        <div className={styles.groupBox}>

          <div className={styles.groupBoxHeader}>
            <div className={styles.subTitle}>
              <h3>{t("quickPrint.groupTitle")}</h3>
            </div>
          </div>

          <div className={styles.tabsHeading}>
            <ul>
              <li>
                <button
                  className={`${styles.tab} ${active === "item" ? styles.active : ""}`}
                  onClick={() => setActive("item")}
                >
                  {t("quickPrint.tabs.byItem")}
                </button>
              </li>
              <li>
                <button
                  className={`${styles.tab} ${active === "dept" ? styles.active : ""}`}
                  onClick={() => setActive("dept")}
                >
                  {t("quickPrint.tabs.byDept")}
                </button>
              </li>
            </ul>
          </div>

          {active === "item" && 
            <div className={styles.tabsContent}>
              <div className={styles.animateContent}>
                <PrintByItem />
              </div>
            </div>
          }
          {active === "dept" && 
            <div className={styles.tabsContent}>
              <div className={styles.animateContent}>
                <PrintByDept />
              </div>
            </div>
          }

        </div>
      </div>
    </div>
  );
}

export default QuickPrintScreen;
