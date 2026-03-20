import React from "react";
import type {
  StatCard,
  RecentActivityJob,
  JobStatus,
  SignsDashboardData,
} from "@/types/dashboard";
import styles from "./SignsManagement.module.css";

/* ── SVG Icons (matching Figma stat-card icons) ────────────────── */

const StatIcons: Record<StatCard["icon"], React.ReactNode> = {
  jobs: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  completed: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  templates: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  printers: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
};

/* ── Status icon + colour map ──────────────────────────────────── */

const STATUS_CONFIG: Record<JobStatus, { className: string; icon: string }> = {
  Completed: { className: styles.statusCompleted ?? "", icon: "✓" },
  Pending:   { className: styles.statusPending ?? "",   icon: "▬" },
  Printing:  { className: styles.statusPrinting ?? "",  icon: "⎙" },
  Failed:    { className: styles.statusFailed ?? "",     icon: "✕" },
};

/* ── Props ─────────────────────────────────────────────────────── */

interface SignsManagementProps {
  data: SignsDashboardData;
}

/* ── Component ─────────────────────────────────────────────────── */

export default function SignsManagement({ data }: SignsManagementProps) {
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalRows = data.recentActivity.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIdx = (currentPage - 1) * rowsPerPage;
  const pageRows = data.recentActivity.slice(startIdx, startIdx + rowsPerPage);

  const handleRowsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div>
      {/* ── Top bar (last updated, refresh, window controls) ─── */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <span className={styles.gridIcon} aria-hidden>⣿</span>
          <button className={styles.refreshBtn} type="button" aria-label="Refresh">
            ↻
          </button>
          <span className={styles.lastUpdated}>{data.lastUpdated}</span>
        </div>
        <div className={styles.topBarActions}>
          <button className={styles.topBarBtn} type="button" aria-label="Minimize">—</button>
          <button className={styles.topBarBtn} type="button" aria-label="Maximize">⤢</button>
          <button className={styles.topBarBtn} type="button" aria-label="Close">✕</button>
        </div>
      </div>

      {/* ── Page title ─── */}
      <h1 className={styles.pageTitle}>Signs Management</h1>

      {/* ── Stat cards ─── */}
      <div className={styles.statsRow}>
        {data.stats.map((stat) => (
          <div key={stat.id} className={styles.statCard}>
            <div className={styles.statIconWrap}>{StatIcons[stat.icon]}</div>
            <div>
              <div className={styles.statValue}>
                {stat.value < 10 ? `0${stat.value}` : stat.value}
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Activity ─── */}
      <h2 className={styles.sectionTitle}>Recent Activity</h2>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Product</th>
              <th>Template</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((job) => (
              <RecentActivityRow key={job.jobId} job={job} />
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                  No recent activity
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── Pagination ─── */}
        <div className={styles.pagination}>
          <div className={styles.paginationLabel}>
            Rows per page:
            <select
              className={styles.paginationSelect}
              value={rowsPerPage}
              onChange={handleRowsChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
          <span className={styles.paginationInfo}>
            {startIdx + 1}-{Math.min(startIdx + rowsPerPage, totalRows)} of {totalRows}
          </span>
          <div className={styles.paginationNav}>
            <button
              className={styles.paginationArrow}
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              aria-label="Previous page"
            >
              ‹
            </button>
            <button
              className={styles.paginationArrow}
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Table row sub-component ───────────────────────────────────── */

function RecentActivityRow({ job }: { job: RecentActivityJob }) {
  const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.Pending;

  return (
    <tr>
      <td>{job.jobId}</td>
      <td>
        <span className={styles.productLink}>{job.product}</span>
      </td>
      <td>{job.template}</td>
      <td>
        <span className={styles.statusBadge}>
          <span className={`${styles.statusIcon} ${cfg.className}`}>
            {cfg.icon}
          </span>
          {job.status}
        </span>
      </td>
      <td>
        <button className={styles.previewBtn} type="button">
          Preview
        </button>
      </td>
    </tr>
  );
}
