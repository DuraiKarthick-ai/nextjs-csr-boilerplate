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

/**
 * A single row in the Batch Activity table.
 * Matches the MockAPI v1/dashboard response shape.
 */
export interface DashboardActivity {
  id: number;
  batchConfigId: number;
  activityName: string;
  status: string;
  printCount: number;
  lastUpdated: string;
}

/** Full dashboard data payload */
export interface SignsDashboardData {
  stats: StatCard[];
  activities: DashboardActivity[];
  lastUpdated: string;
}
