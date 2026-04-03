import { useEffect, useState, useCallback } from "react";
import type { SignsDashboardData } from "@/types/dashboard";
import { dashboardService } from "@/services/dashboardService";

/**
 * Structure fix: useDashboard now delegates all API logic to dashboardService.
 * The hook only manages React state — no direct apiClient calls here.
 */

const INITIAL_DASHBOARD: SignsDashboardData = {
  stats: [],
  activities: [],
  lastUpdated: "",
};

export interface UseDashboardResult {
  data: SignsDashboardData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<SignsDashboardData>(INITIAL_DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await dashboardService.getDashboardData();
      setData(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch dashboard data";
      if (process.env.NODE_ENV === "development") {
        console.error("[useDashboard] fetch error:", message);
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return { data, isLoading, error, refetch: fetchDashboard };
}
