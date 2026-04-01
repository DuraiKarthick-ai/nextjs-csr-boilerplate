import Link from "next/link";
import styles from "./dashboard.module.scss";

export default function Dashboard() {

  const tabIcon = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 8C4.9 8 4 8.9 4 10C4 11.1 4.9 12 6 12C7.1 12 8 11.1 8 10C8 8.9 7.1 8 6 8ZM2 4C0.9 4 0 4.9 0 6C0 7.1 0.9 8 2 8C3.1 8 4 7.1 4 6C4 4.9 3.1 4 2 4ZM2 12C0.9 12 0 12.9 0 14C0 15.1 0.9 16 2 16C3.1 16 4 15.1 4 14C4 12.9 3.1 12 2 12ZM14 4C15.1 4 16 3.1 16 2C16 0.9 15.1 0 14 0C12.9 0 12 0.9 12 2C12 3.1 12.9 4 14 4ZM10 12C8.9 12 8 12.9 8 14C8 15.1 8.9 16 10 16C11.1 16 12 15.1 12 14C12 12.9 11.1 12 10 12ZM14 8C12.9 8 12 8.9 12 10C12 11.1 12.9 12 14 12C15.1 12 16 11.1 16 10C16 8.9 15.1 8 14 8ZM10 4C8.9 4 8 4.9 8 6C8 7.1 8.9 8 10 8C11.1 8 12 7.1 12 6C12 4.9 11.1 4 10 4ZM6 0C4.9 0 4 0.9 4 2C4 3.1 4.9 4 6 4C7.1 4 8 3.1 8 2C8 0.9 7.1 0 6 0Z"
        fill="#A3A3A3"
      />
    </svg>
  );

  const refreshIcon = (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.2083 2.44792C12.6979 0.9375 10.625 0 8.32292 0C3.71875 0 0 3.72917 0 8.33333C0 12.9375 3.71875 16.6667 8.32292 16.6667C12.2083 16.6667 15.4479 14.0104 16.375 10.4167H14.2083C13.3542 12.8437 11.0417 14.5833 8.32292 14.5833C4.875 14.5833 2.07292 11.7812 2.07292 8.33333C2.07292 4.88542 4.875 2.08333 8.32292 2.08333C10.0521 2.08333 11.5937 2.80208 12.7187 3.9375L9.36458 7.29167H16.6562V0L14.2083 2.44792Z"
        fill="#79747E"
      />
    </svg>
  )

  const minimizeIcon = (
    <svg
      width="16"
      height="2"
      viewBox="0 0 16 2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 0H0V2H16V0Z" fill="#79747E" />
    </svg>
  )

  const fullscreeIcon = (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 6.66667V0H8.33333L11.075 2.74167L2.74167 11.075L0 8.33333V15H6.66667L3.925 12.2583L12.2583 3.925L15 6.66667Z"
        fill="#79747E"
      />
    </svg>
  )

  const closeIcon = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
        fill="#79747E"
      />
    </svg>
  )

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
    <div className={styles.contentWrap}>
      <div className={styles.topContentBar}>
        <div className={styles.leftActionWrap}>
          <ul>
            <li>
              <i>
                {tabIcon}
              </i>
            </li>
            <li>
              <i>
                {refreshIcon}
              </i>
            </li>
            <li>
              <p>Last Updated 10:31am - 08/02/25</p>
            </li>
          </ul>
        </div>
        <div className={styles.rightActionWrap}>
          <ul>
            <li>
              <i>
                {minimizeIcon}
              </i>
            </li>
            <li>
              <i>
                {fullscreeIcon}
              </i>
            </li>
            <li>
              <i>
                {closeIcon}
              </i>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <h2>Sign Management Dashboard</h2>
        </div>

        <div className={styles.groupBox}>
          <ul>
            <li>
              <Link href="#">
                <div className={styles.quickLinksWrap}>
                  <i>{quickPrintIcon}</i>
                  <label>Quick Print</label>
                </div>
              </Link>
            </li>
            <li>
              <Link href="#">
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
                <tr>
                  <td><p>Emergency Price Change</p></td>
                  <td>
                    <div className="statusTag"><span>Ready to Print</span></div></td>
                  <td><button className="printButton">Print (10)</button></td>
                </tr>

                <tr>
                  <td><p>Endcap</p></td>
                  <td><div className="statusTag"><span>Ready to Print</span></div></td>
                  <td><button className="printButton">Print (25)</button></td>
                </tr>

                <tr>
                  <td><p>Item Name Change</p></td>
                  <td><div className="statusTag"><span>Ready to Print</span></div></td>
                  <td><button className="printButton">Print (12)</button></td>
                </tr>

                <tr>
                  <td><p>Sign Audit Exceptions</p></td>
                  <td><div className="statusTag"><span>Ready to Print</span></div></td>
                  <td><button className="printButton">Print (12)</button></td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}