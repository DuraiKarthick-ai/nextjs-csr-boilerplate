import { batchService } from "@/services/batchService";
import { dashboardService } from "@/services/dashboardService";

jest.mock("@/services/batchService");

const mockGetAllBatches = batchService.getAllBatches as jest.MockedFunction<
  typeof batchService.getAllBatches
>;

/** Sample API response matching the get-all-batches shape. */
const mockItems = [
  {
    batchId: 11007,
    configId: 237021,
    batchName: "Content Change Batch",
  },
  {
    batchId: 11008,
    configId: 213020,
    batchName: "Daily Batch",
  },
];

describe("dashboardService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDashboardData", () => {
    /**
     * Happy path: verifies that get-all-batches rows are correctly mapped
     * to the DashboardActivity domain model.
     */
    it("maps API response items to DashboardActivity array", async () => {
      // Arrange
      mockGetAllBatches.mockResolvedValueOnce(mockItems);

      // Act
      const result = await dashboardService.getDashboardData();

      // Assert
      expect(result.activities).toHaveLength(2);
      expect(result.activities[0]).toEqual({
        id: 11007,
        batchConfigId: 237021,
        activityName: "Content Change Batch",
        status: "Available",
        printCount: 0,
        lastUpdated: expect.any(String),
      });
      expect(result.activities[1]?.activityName).toBe("Daily Batch");
    });

    /**
     * Verifies static stat cards are always included regardless of API data.
     */
    it("returns the four static stat cards", async () => {
      // Arrange
      mockGetAllBatches.mockResolvedValueOnce(mockItems);

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
      mockGetAllBatches.mockResolvedValueOnce(mockItems);

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
      mockGetAllBatches.mockResolvedValueOnce([]);

      // Act
      const result = await dashboardService.getDashboardData();

      // Assert
      expect(result.activities).toHaveLength(0);
      expect(result.stats).toHaveLength(4);
    });

    /**
     * Ensures batch API errors are propagated to the caller
     * (useDashboard hook) rather than swallowed silently.
     */
    it("re-throws errors from batchService for the caller to handle", async () => {
      // Arrange
      mockGetAllBatches.mockRejectedValueOnce(new Error("Network error"));

      // Act & Assert
      await expect(dashboardService.getDashboardData()).rejects.toThrow("Network error");
    });
  });
});
