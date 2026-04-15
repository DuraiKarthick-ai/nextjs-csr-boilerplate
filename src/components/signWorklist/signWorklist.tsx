"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ContentWrapper from "../contentWrapper/contentWrapper";
import styles from "./signWorklist.module.scss";
import SignAuditSection from "./signAudit/signAudit";
import EmergencyPriceChange from "./emergencyPriceChange/emergencyPriceChange";
import Endcap from "./endcap/endcap";
import ItemNameChange from "./itemNameChange/itemNameChange";

/**
 * Placeholder component for the Sign Worklist screen.
 *
 * @returns {JSX.Element} The rendered Sign Worklist view.
 */
/** Valid worklist tab keys. */
const VALID_TABS = new Set(["price", "endcap", "item", "audit"]);

export default function SignWorklist(): JSX.Element {
  const router = useRouter();
  const [active, setActive] = useState("price");

  /** Sync active tab from the URL query param on mount or query change. */
  useEffect(() => {
    const tab = router.query.tab;
    if (typeof tab === "string" && VALID_TABS.has(tab)) {
      setActive(tab);
    }
  }, [router.query.tab]);

  return (
    <ContentWrapper title="Signs Management">
      <div className={styles.signManagement}>

        <div className={styles.tabsHeading}>
          <ul>
            <li>
              <button
                className={`${styles.tab} ${active === "price" ? styles.active : ""}`}
                onClick={() => setActive("price")}
                type="button"
              >
                Emergency Price Change
              </button>
            </li>
            <li>
              <button
                className={`${styles.tab} ${active === "endcap" ? styles.active : ""}`}
                onClick={() => setActive("endcap")}
                type="button"
              >
                Endcap
              </button>
            </li>
            <li>
              <button
                className={`${styles.tab} ${active === "item" ? styles.active : ""}`}
                onClick={() => setActive("item")}
                type="button"
              >
                Item Name Change
              </button>
            </li>
            <li>
              <button
                className={`${styles.tab} ${active === "audit" ? styles.active : ""}`}
                onClick={() => setActive("audit")}
                type="button"
              >
                Sign Audit
              </button>
            </li>
          </ul>
        </div>

        <div className={styles.tabsContent}>

          {/* EMERGENCY PRICE CHANGE */}
          {active === "price" && <EmergencyPriceChange></EmergencyPriceChange>}

          {/* END CAP */}
          {active === "endcap" && <Endcap></Endcap>}

          {/* ITEM NAME CHANGE */}
          {active === "item" && <ItemNameChange></ItemNameChange>}

          {/* SIGN AUDIT */}
          {active === "audit" && <SignAuditSection></SignAuditSection>}

        </div>
      </div>
    </ContentWrapper>
  );
}