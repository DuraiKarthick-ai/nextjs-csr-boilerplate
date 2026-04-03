/**
 * Dashboard API service layer.
 *
 * Centralizes the dashboard endpoint URL and response-to-domain mapping.
 * useDashboard.ts imports from here instead of calling apiClient directly.
 *
 * OWASP A10: The API URL origin is validated against the allowlist inside apiClient.
 */

import apiClient from "@/utils/apiClient";
import type { DashboardActivity, SignsDashboardData, StatCard } from "@/types/dashboard";

/**
 * Resolved dashboard API base URL.
 * Override at build time via NEXT_PUBLIC_DASHBOARD_API_URL.
 */
const DASHBOARD_API_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_API_URL ??
  "https://69ce482633a09f831b7d3ab9.mockapi.io/api/v1/dashboard/dashboard";

/**
 * Raw shape returned by the MockAPI v1/dashboard endpoint.
 * @internal
 */
interface DashboardApiItem {
  id: number;
  activityName: string;
  status: string;
  printCount: number;
  lastUpdated: string;
}

/** Static stat cards — populated from known business metrics. */
const STAT_CARDS: StatCard[] = [
  { id: "active-jobs",     label: "Active Jobs",     value: 24,  icon: "jobs" },
  { id: "completed-today", label: "Completed Today", value: 156, icon: "completed" },
  { id: "templates",       label: "Templates",       value: 12,  icon: "templates" },
  { id: "printers-online", label: "Printers Online", value: 8,   icon: "printers" },
];

/**
 * Formats the current date/time as a human-readable "Last Updated" string.
 * @returns {string} Formatted string, e.g. "Last Updated 10:31 AM - 04/02/26".
 */
function buildLastUpdated(): string {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
  return `Last Updated ${timeStr} - ${dateStr}`;
}

export const dashboardService = {
  /**
   * Fetches batch activity data from the dashboard API and maps it to the domain model.
   *
   * @returns {Promise<SignsDashboardData>} Resolved dashboard data including activities and stat cards.
   * @throws {Error} Re-throws API or network errors for the caller (useDashboard hook) to handle.
   * @security OWASP A10: URL validated against allowlist in apiClient before the request is made.
   */
  async getDashboardData(): Promise<SignsDashboardData> {
    const response = await apiClient.get<DashboardApiItem[]>(DASHBOARD_API_URL);
    const items = response.data;

    const activities: DashboardActivity[] = items.map((item) => ({
      id: item.id,
      activityName: item.activityName,
      status: item.status,
      printCount: item.printCount,
      lastUpdated: item.lastUpdated,
    }));

    return {
      stats: STAT_CARDS,
      activities,
      lastUpdated: buildLastUpdated(),
    };
  },
};
