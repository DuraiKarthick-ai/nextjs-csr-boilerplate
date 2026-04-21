"use client";
import { useState } from "react";
import styles from "./quickSign.module.scss";
import ContentWrapper from "../contentWrapper/contentWrapper";
import QuickPrintItem from "./quickPrintItem/quickPrintItem";
import QuickPrintDepartmentCategory from "./quickPrintDepartmentCategory/quickPrintDepartmentCategory";

export default function QuickSign() {

  const [active, setActive] = useState("item");

  return (
    <ContentWrapper title="Signs Management">
      <div className={styles.groupBox}>

        <div className={styles.tabsHeading}>
          <ul>
            <li>
              <button
                className={`${styles.tab} ${active === "item" ? styles.active : ""}`}
                onClick={() => setActive("item")}
              >
                By Item
              </button>
            </li>
            <li>
              <button
                className={`${styles.tab} ${active === "dept" ? styles.active : ""}`}
                onClick={() => setActive("dept")}
              >
                By Department & Category
              </button>
            </li>
          </ul>
        </div>

        {/* Ouick Print Item */}
        {active === "item" && (
          <QuickPrintItem></QuickPrintItem>
        )}

        {/* Ouick Print Department & Category */}
        {active === "dept" && (
          <QuickPrintDepartmentCategory></QuickPrintDepartmentCategory>
        )}

      </div>
    </ContentWrapper>
  );
}