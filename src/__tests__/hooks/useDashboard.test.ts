import { renderHook, waitFor, act } from "@testing-library/react";
import { useDashboard } from "@/hooks/useDashboard";
import { dashboardService } from "@/services/dashboardService";
import type { SignsDashboardData } from "@/types/dashboard";

jest.mock("@/services/dashboardService");

const mockGetDashboardData = dashboardService.getDashboardData as jest.MockedFunction<
  typeof dashboardService.getDashboardData
>;

const mockData: SignsDashboardData = {
  stats: [{ id: "active-jobs", label: "Active Jobs", value: 24, icon: "jobs" }],
  activities: [
    {
      id: 1,
      activityName: "Emergency Price Change",
      status: "Ready to Print",
      printCount: 10,
      lastUpdated: "2026-04-02T09:15:00Z",
    },
  ],
  lastUpdated: "Last Updated 10:00 AM - 04/02/26",
};

describe("useDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Verifies the hook begins in a loading state before the API resolves.
   */
  it("starts with isLoading true and empty data", () => {
    // Arrange
    mockGetDashboardData.mockResolvedValueOnce(mockData);

    // Act
    const { result } = renderHook(() => useDashboard());

    // Assert
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data.activities).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  /**
   * Verifies that after a successful fetch, data is populated and
   * loading / error states are cleared.
   */
  it("populates data and clears isLoading on success", async () => {
    // Arrange
    mockGetDashboardData.mockResolvedValueOnce(mockData);

    // Act
    const { result } = renderHook(() => useDashboard());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  /**
   * Verifies error state is set and data remains empty when the API fails.
   */
  it("sets error message and stops loading on API failure", async () => {
    // Arrange
    mockGetDashboardData.mockRejectedValueOnce(new Error("Network error"));

    // Act
    const { result } = renderHook(() => useDashboard());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.error).toBe("Network error");
    expect(result.current.data.activities).toHaveLength(0);
  });

  /**
   * Verifies that non-Error rejections produce a generic fallback message.
   */
  it("uses fallback error message for non-Error rejections", async () => {
    // Arrange
    mockGetDashboardData.mockRejectedValueOnce("unexpected");

    // Act
    const { result } = renderHook(() => useDashboard());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.error).toBe("Failed to fetch dashboard data");
  });

  /**
   * Verifies that calling refetch triggers a second API call and
   * updates data accordingly.
   */
  it("refetch triggers a new API call and updates data", async () => {
    // Arrange
    const updatedData = { ...mockData, lastUpdated: "Last Updated 11:00 AM - 04/02/26" };
    mockGetDashboardData
      .mockResolvedValueOnce(mockData)
      .mockResolvedValueOnce(updatedData);
    const { result } = renderHook(() => useDashboard());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Act
    act(() => {
      result.current.refetch();
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(mockGetDashboardData).toHaveBeenCalledTimes(2);
    expect(result.current.data.lastUpdated).toBe("Last Updated 11:00 AM - 04/02/26");
  });
});
