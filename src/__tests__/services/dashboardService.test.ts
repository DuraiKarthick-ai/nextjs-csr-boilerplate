import apiClient from "@/utils/apiClient";
import { dashboardService } from "@/services/dashboardService";

jest.mock("@/utils/apiClient");

const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;

/** Sample API response matching the MockAPI v1/dashboard shape. */
const mockItems = [
  {
    id: 1,
    activityName: "Emergency Price Change",
    status: "Ready to Print",
    printCount: 10,
    lastUpdated: "2026-04-02T09:15:00Z",
  },
  {
    id: 2,
    activityName: "Endcap",
    status: "Ready to Print",
    printCount: 25,
    lastUpdated: "2026-04-02T08:50:00Z",
  },
];

describe("dashboardService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDashboardData", () => {
    /**
     * Happy path: verifies that raw API items are correctly mapped
     * to the DashboardActivity domain model.
     */
    it("maps API response items to DashboardActivity array", async () => {
      // Arrange
      mockGet.mockResolvedValueOnce({ data: mockItems });

      // Act
      const result = await dashboardService.getDashboardData();

      // Assert
      expect(result.activities).toHaveLength(2);
      expect(result.activities[0]).toEqual({
        id: 1,
        activityName: "Emergency Price Change",
        status: "Ready to Print",
        printCount: 10,
        lastUpdated: "2026-04-02T09:15:00Z",
      });
      expect(result.activities[1].activityName).toBe("Endcap");
    });

    /**
     * Verifies static stat cards are always included regardless of API data.
     */
    it("returns the four static stat cards", async () => {
      // Arrange
      mockGet.mockResolvedValueOnce({ data: mockItems });

      // Act
      const result = await dashboardService.getDashboardData();

      // Assert
      expect(result.stats).toHaveLength(4);
      const ids = result.stats.map((s) => s.id);
      expect(ids).toEqual(["active-jobs", "completed-today", "templates", "printers-online"]);
    });

    /**
     * Verifies the lastUpdated string is present and correctly prefixed.
     */
    it("includes a 'Last Updated' timestamp string", async () => {
      // Arrange
      mockGet.mockResolvedValueOnce({ data: mockItems });

      // Act
      const result = await dashboardService.getDashboardData();

      // Assert
      expect(result.lastUpdated).toMatch(/^Last Updated/);
    });

    /**
     * Verifies the service handles empty API responses gracefully.
     */
    it("returns empty activities array when API returns no items", async () => {
      // Arrange
      mockGet.mockResolvedValueOnce({ data: [] });

      // Act
      const result = await dashboardService.getDashboardData();

      // Assert
      expect(result.activities).toHaveLength(0);
      expect(result.stats).toHaveLength(4);
    });

    /**
     * OWASP A10: Ensures API errors are propagated to the caller
     * (useDashboard hook) rather than swallowed silently.
     */
    it("re-throws errors from apiClient for the caller to handle", async () => {
      // Arrange
      mockGet.mockRejectedValueOnce(new Error("Network error"));

      // Act & Assert
      await expect(dashboardService.getDashboardData()).rejects.toThrow("Network error");
    });
  });
});
