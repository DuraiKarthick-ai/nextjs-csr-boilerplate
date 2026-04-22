import apiClient from "@/utils/apiClient";
import { signAuditService } from "@/services/signAuditService";
import type { SignAuditRequestPayload, SignAuditResponseItem } from "@/types/signAudit";

jest.mock("@/utils/apiClient");

const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;

const samplePayload: SignAuditRequestPayload = {
  filters: {
    date: "2026-04-07",
    operator: "ALL",
  },
  sort: {
    field: "itemNumber",
    order: "ASC",
  },
  pagination: {
    page: 1,
    pageSize: 10,
  },
};

const sampleResponse: SignAuditResponseItem[] = [
  {
    auditDate: "2025-07-05",
    itemNumber: "2345678",
    itemName: "Frozen Yogurt",
    department: "023",
    upc: "16456",
    regularPrice: 1.69,
    salePrice: 0.69,
    operatorId: "232323",
  },
];

describe("signAuditService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSignAuditData", () => {
    it("sends the payload and returns sign audit rows", async () => {
      // Arrange
      mockPost.mockResolvedValueOnce({ data: sampleResponse });

      // Act
      const result = await signAuditService.getSignAuditData(samplePayload);

      // Assert
      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("/dashboard/signAudit"),
        samplePayload,
      );
      expect(result).toEqual(sampleResponse);
    });

    it("propagates API errors to the caller", async () => {
      // Arrange
      mockPost.mockRejectedValueOnce(new Error("Network error"));

      // Act & Assert
      await expect(signAuditService.getSignAuditData(samplePayload)).rejects.toThrow("Network error");
    });
  });
});
