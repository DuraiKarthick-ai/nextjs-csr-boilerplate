import apiClient from "@/utils/apiClient";
import { emergencyPriceChangeService } from "@/services/emergencyPriceChangeService";
import type {
  EmergencyPriceChangeRequestPayload,
  EmergencyPriceChangeResponseItem,
} from "@/types/emergencyPriceChange";

jest.mock("@/utils/apiClient");

const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;

const samplePayload: EmergencyPriceChangeRequestPayload = {
  storeId: "301",
  requestDate: "2025-07-05",
  filters: {
    itemNumber: null,
    itemName: null,
    department: null,
    category: null,
    upc: null,
    quantity: null,
    changeReason: null,
    signSize: null,
    printStatus: null,
  },
};

const sampleResponse: EmergencyPriceChangeResponseItem[] = [
  {
    auditDate: "2025-07-05",
    itemNumber: "2345678",
    itemName: "Frozen Yogurt",
    department: "023",
    category: "OBD",
    upc: "16456",
    onHand: "Y",
    quantity: 12,
    regularPrice: 1.69,
    salePrice: 0.69,
    changeReason: "Rebate change",
    signSize: null,
    printStatus: "NOT_PRINTED",
  },
];

describe("emergencyPriceChangeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getEmergencyPriceChangeData", () => {
    it("sends the payload and returns emergency price change rows", async () => {
      // Arrange
      mockPost.mockResolvedValueOnce({ data: sampleResponse });

      // Act
      const result = await emergencyPriceChangeService.getEmergencyPriceChangeData(samplePayload);

      // Assert
      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("/dashboard/emergencyPriceChange"),
        samplePayload
      );
      expect(result).toEqual(sampleResponse);
    });

    it("propagates API errors to the caller", async () => {
      // Arrange
      mockPost.mockRejectedValueOnce(new Error("Network error"));

      // Act & Assert
      await expect(
        emergencyPriceChangeService.getEmergencyPriceChangeData(samplePayload)
      ).rejects.toThrow("Network error");
    });
  });
});
