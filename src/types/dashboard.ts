/* ── Signs Management Dashboard Types ──────────────────────────── */

/** Sidebar navigation items */
export interface SidebarItem {
  id: string;
  label: string;
  /** Whether the item is currently active */
  active?: boolean;
}

/** Stats card shown at the top of the dashboard */
export interface StatCard {
  id: string;
  label: string;
  value: number;
  icon: "jobs" | "completed" | "templates" | "printers";
}

/** Job status in the Recent Activity table */
export type JobStatus = "Completed" | "Pending" | "Printing" | "Failed";

/** A single row in the Recent Activity table */
export interface RecentActivityJob {
  jobId: string;
  product: string;
  template: string;
  status: JobStatus;
}

/** Full dashboard data payload */
export interface SignsDashboardData {
  stats: StatCard[];
  recentActivity: RecentActivityJob[];
  lastUpdated: string;
}
