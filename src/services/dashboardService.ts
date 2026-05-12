/**
 * Dashboard API service layer.
 *
 * Centralizes dashboard data mapping based on the batch jobs API.
 * useDashboard.ts imports from here instead of calling apiClient directly.
 *
 * OWASP A10: The API URL origin is validated against the allowlist inside apiClient.
 */

import { batchService } from "@/services/batchService";
import type { DashboardActivity, SignsDashboardData, StatCard } from "@/types/dashboard";

const DASHBOARD_STORE_ID = process.env.NEXT_PUBLIC_BATCH_STORE_ID ?? "100";
const DASHBOARD_DEFAULT_STATUS = "Ready to Print";

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
  * Fetches batch jobs from get-all-batches and maps them to the dashboard domain model.
   *
   * @returns {Promise<SignsDashboardData>} Resolved dashboard data including activities and stat cards.
   * @throws {Error} Re-throws API or network errors for the caller (useDashboard hook) to handle.
   * @security OWASP A10: URL validated against allowlist in apiClient before the request is made.
   */
  async getDashboardData(): Promise<SignsDashboardData> {
    const items = await batchService.getAllBatches({ storeId: DASHBOARD_STORE_ID });
    const nowIso = new Date().toISOString();

    const activities: DashboardActivity[] = items.map((item) => ({
      id: item.batchId,
      batchConfigId: item.configId,
      activityName: item.batchName,
      status: DASHBOARD_DEFAULT_STATUS,
      printCount: 0,
      lastUpdated: nowIso,
    }));

    return {
      stats: STAT_CARDS,
      activities,
      lastUpdated: buildLastUpdated(),
    };
  },
};
