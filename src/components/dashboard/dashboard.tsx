"use client";

import React from "react";
import Link from "next/link";
import { useDashboard } from "@/hooks/useDashboard";
import { useTableScroll } from "@/hooks/useTableScroll";
import { usePrint } from "@/hooks/usePrint";
import ContentWrapper from "../contentWrapper/contentWrapper";
import SuccessToast from "../shared/SuccessToast";
import { QuickPrintIcon, CustomPrintIcon } from "../shared/icons";
import { DEFAULT_STORE_ID, DEFAULT_REQUESTED_BY } from "@/constants/print";
import type { PrintRequestPayload } from "@/types/print";
import type { DashboardActivity } from "@/types/dashboard";
import styles from "./dashboard.module.scss";

/** Maps Batch Activity names from the API to Sign Worklist tab keys. */
const ACTIVITY_TAB_MAP: Record<string, string> = {
  "Emergency Price Change": "price",
  "Endcap": "endcap",
  "Item Name Change": "item",
  "Sign Audit": "audit",
};

/**
 * Dashboard component — Sign Management Dashboard.
 *
 * Fetches batch activity data from the dashboard API via useDashboard hook
 * and renders the Batch Activity table with live status and print counts.
 *
 * @returns {JSX.Element} The rendered dashboard UI.
 */
export default function Dashboard() {

  const rows = [1, 2, 3];

  const { isPrinting, printResult, printError, submitPrint, resetPrint } = usePrint();
  const [printingActivityId, setPrintingActivityId] = React.useState<number | null>(null);
  const [printedCount, setPrintedCount] = React.useState<number>(0);

  const { data, isLoading, error } = useDashboard();

  const handleDashboardPrint = async (activity: DashboardActivity) => {
    setPrintingActivityId(activity.id);
    setPrintedCount(activity.printCount);
    const payload: PrintRequestPayload = {
      storeId: DEFAULT_STORE_ID,
      requestedBy: DEFAULT_REQUESTED_BY,
      printRequests: [
        {
          type: "BY_ITEM",
          entries: [
            {
              itemNumberOrUpc: String(activity.id),
              size: "SMALL",
              quantity: activity.printCount,
            },
          ],
        },
      ],
    };
    await submitPrint(payload);
    setPrintingActivityId(null);
  };
  const { visibleCount, scrollRef } = useTableScroll(data.activities.length);
  const visibleActivities = data.activities.slice(0, visibleCount);

  return (
    <ContentWrapper
      title="Sign Management Dashboard"
      lastUpdated={isLoading ? "Loading…" : data.lastUpdated}
    >
      <div className={styles.groupBox}>
        <ul>
          <li>
            <Link href="/quickSign">
              <div className={styles.quickLinksWrap}>
                <i><QuickPrintIcon /></i>
                <label>Quick Print</label>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/customSign">
              <div className={styles.quickLinksWrap}>
                <i><CustomPrintIcon /></i>
                <label>Custom Sign</label>
              </div>
            </Link>
          </li>
        </ul>

        <div className={styles.tableContainer}>
          <div className={styles.title}>
            <p>Batch Activity</p>
          </div>

          <div className={styles.tableScrollWrap} ref={scrollRef}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>
                    <p>Batch Jobs</p>
                  </th>
                  <th>
                    <p>Status</p>
                  </th>
                  <th>
                    <p>Actions</p>
                  </th>
                </tr>
              </thead>

              <tbody>

                {isLoading && rows.map((row) => (
                  <tr key={`skeleton-${row}`}>
                    <td>
                      <div className="shimmer md"></div>
                    </td>
                    <td>
                      <div className="shimmer sm"></div>
                    </td>
                    <td>
                      <div className="shimmer xs"></div>
                    </td>
                  </tr>
                ))}

                {error && (
                  <tr>
                    <td colSpan={3}>
                      <div className={`${styles.noDatafound} noDataContent`}>
                        <h4>No records found</h4>
                        <label>Failed to load batch activity. Please try again.</label>
                      </div>
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  !error &&
                  visibleActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td>
                        {ACTIVITY_TAB_MAP[activity.activityName] ? (
                          <Link href={`/signWorklist?tab=${ACTIVITY_TAB_MAP[activity.activityName]}`}>
                            <p className={styles.batchLink}>{activity.activityName}</p>
                          </Link>
                        ) : (
                          <p>{activity.activityName}</p>
                        )}
                      </td>
                      <td>
                        <div className="statusTag minWidth">
                          <span>{activity.status}</span>
                        </div>
                      </td>
                      <td>
                        <button
                          className="printButton"
                          disabled={printingActivityId !== null}
                          onClick={() => handleDashboardPrint(activity)}
                        >
                          {printingActivityId === activity.id ? "Printing…" : `Print (${activity.printCount})`}
                        </button>
                      </td>
                    </tr>
                  ))}
                  
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SuccessToast
        open={printResult !== null}
        onClose={resetPrint}
        message={
          printResult
            ? `${printedCount} pages Printed successfully in ${printResult.printerName}`
            : ""
        }
      />

    </ContentWrapper>
  );
}