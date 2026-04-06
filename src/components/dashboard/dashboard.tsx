"use client";

import Link from "next/link";
import styles from "./dashboard.module.scss";
import ContentWrapper from "../contentWrapper/contentWrapper";
import { useDashboard } from "@/hooks/useDashboard";
import { useTableScroll } from "@/hooks/useTableScroll";

/**
 * Dashboard component — Sign Management Dashboard.
 *
 * Fetches batch activity data from the dashboard API via useDashboard hook
 * and renders the Batch Activity table with live status and print counts.
 *
 * @returns {JSX.Element} The rendered dashboard UI.
 */
export default function Dashboard() {
  const { data, isLoading, error } = useDashboard();
  const { visibleCount, scrollRef } = useTableScroll(data.activities.length);
  const visibleActivities = data.activities.slice(0, visibleCount);

  const quickPrintIcon  = (
    <svg width="24" height="21" viewBox="0 0 24 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.8333 5.83333H3.5C1.56333 5.83333 0 7.39667 0 9.33333V16.3333H4.66667V21H18.6667V16.3333H23.3333V9.33333C23.3333 7.39667 21.77 5.83333 19.8333 5.83333ZM16.3333 18.6667H7V12.8333H16.3333V18.6667ZM19.8333 10.5C19.1917 10.5 18.6667 9.975 18.6667 9.33333C18.6667 8.69167 19.1917 8.16667 19.8333 8.16667C20.475 8.16667 21 8.69167 21 9.33333C21 9.975 20.475 10.5 19.8333 10.5ZM18.6667 0H4.66667V4.66667H18.6667V0Z" fill="#005DAB"/>
    </svg>
  )

  const customPrintIcon  = (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.4467 9.9271L17.2783 8.09544L12.9033 3.72044L11.0717 5.5521L6.24167 0.733769C5.33167 -0.17623 3.85 -0.17623 2.94 0.733769L0.723333 2.95044C-0.186667 3.86044 -0.186667 5.3421 0.723333 6.2521L5.54167 11.0704L0 16.6238V20.9988H4.375L9.92833 15.4454L14.7467 20.2638C15.855 21.3721 17.3483 20.9638 18.0483 20.2638L20.265 18.0471C21.175 17.1371 21.175 15.6554 20.265 14.7454L15.4467 9.9271ZM7.21 9.41377L2.38 4.59544L4.585 2.37877L6.06667 3.86044L4.69 5.24877L6.335 6.89377L7.72333 5.50544L9.415 7.1971L7.21 9.41377ZM16.4033 18.6188L11.585 13.8004L13.8017 11.5838L15.4933 13.2754L14.105 14.6638L15.75 16.3088L17.1383 14.9204L18.62 16.4021L16.4033 18.6188Z" fill="#005DAB"/>
      <path d="M20.6616 4.71204C21.1166 4.25704 21.1166 3.52204 20.6616 3.06704L17.9316 0.33704C17.3833 -0.211294 16.6249 -0.00129366 16.2866 0.33704L14.1516 2.47204L18.5266 6.84704L20.6616 4.71204Z" fill="#005DAB"/>
    </svg>

  )

  return (
    <ContentWrapper title="Sign Management Dashboard" lastUpdated={isLoading ? "Loading…" : data.lastUpdated}>
        <div className={styles.groupBox}>
          <ul>
            <li>
              <Link href="/quickSign">
                <div className={styles.quickLinksWrap}>
                  <i>{quickPrintIcon}</i>
                  <label>Quick Print</label>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/customSign">
                <div className={styles.quickLinksWrap}>
                  <i>{customPrintIcon}</i>
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
                  <th><p>Status</p></th>
                  <th><p>Actions</p></th>
                </tr>
              </thead>

              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={3}><p>Loading batch activity…</p></td>
                  </tr>
                )}
                {error && (
                  <tr>
                    <td colSpan={3}><p>Failed to load batch activity. Please try again.</p></td>
                  </tr>
                )}
                {!isLoading && !error && visibleActivities.map((activity) => (
                  <tr key={activity.id}>
                    <td><p>{activity.activityName}</p></td>
                    <td>
                      <div className="statusTag"><span>{activity.status}</span></div>
                    </td>
                    <td>
                      <button className="printButton">Print ({activity.printCount})</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

        </div>
    </ContentWrapper>
  );
}