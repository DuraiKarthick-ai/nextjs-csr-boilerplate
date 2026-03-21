import { useEffect, useState, useCallback } from "react";
import type {
  SignsDashboardData,
  RecentActivityJob,
  JobStatus,
  StatCard,
} from "@/types/dashboard";
import apiClient from "@/utils/apiClient";

/* ── API configuration ─────────────────────────────────────────── */

const DASHBOARD_API_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_API_URL ??
  "https://69be2cb317c3d7d977915d55.mockapi.io/api/v1/dashboard";

/* ── Static stat cards (not provided by the API) ───────────────── */

const STAT_CARDS: StatCard[] = [
  { id: "active-jobs",     label: "Active Jobs",      value: 24,  icon: "jobs" },
  { id: "completed-today", label: "Completed Today",  value: 156, icon: "completed" },
  { id: "templates",       label: "Templates",        value: 12,  icon: "templates" },
  { id: "printers-online", label: "Printers Online",  value: 8,   icon: "printers" },
];

/* ── Empty initial state (shown while the API loads) ───────────── */

const INITIAL_DASHBOARD: SignsDashboardData = {
  stats: STAT_CARDS,
  recentActivity: [],
  lastUpdated: "",
};

/* ── Allowed statuses (guard unknown strings from the API) ───── */

const VALID_STATUSES = new Set<JobStatus>([
  "Completed",
  "Pending",
  "Printing",
  "Failed",
]);

function normalizeStatus(raw: string): JobStatus {
  /* Capitalize first letter to handle "completed" → "Completed" etc. */
  const capitalized =
    raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  if (VALID_STATUSES.has(capitalized as JobStatus)) {
    return capitalized as JobStatus;
  }
  return "Pending"; // fallback
}

/* ── Raw shape returned by the mock API ────────────────────────── */

interface DashboardApiItem {
  jobId: string;
  product: string;
  template: string;
  status: string;
  actions?: string | string[];
  notes?: Record<string, unknown>;
}

/* ── Hook return type ──────────────────────────────────────────── */

export interface UseDashboardResult {
  data: SignsDashboardData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/* ── Hook ──────────────────────────────────────────────────────── */

/**
 * Fetches the Signs Management dashboard data from the remote API.
 *
 * - Maps the flat array response into `SignsDashboardData`.
 * - Stat cards are defined as constants (not provided by the API).
 * - Starts with an empty table; populated once the API responds.
 */
export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<SignsDashboardData>(INITIAL_DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.get<DashboardApiItem[]>(DASHBOARD_API_URL);
      const json = res.data;

      /* Map API items → RecentActivityJob[] */
      const recentActivity: RecentActivityJob[] = json.map((item) => ({
        jobId: item.jobId,
        product: item.product,
        template: item.template,
        status: normalizeStatus(item.status),
      }));

      /* Build dashboard data — keep static stats, inject live activity */
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const dateStr = now.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });

      setData({
        stats: STAT_CARDS,
        recentActivity,
        lastUpdated: `Last Updated ${timeStr} - ${dateStr}`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch dashboard data";
      console.error("[useDashboard] fetch error:", message);
      setError(message);
      /* Keep whatever data we had before (or the initial mock) */
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return { data, isLoading, error, refetch: fetchDashboard };
}
