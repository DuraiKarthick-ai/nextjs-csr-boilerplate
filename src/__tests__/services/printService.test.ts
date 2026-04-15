import apiClient from "@/utils/apiClient";
import { printService } from "@/services/printService";
import type { PrintRequestPayload, PrintResponse } from "@/types/print";

jest.mock("@/utils/apiClient");

const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;

const samplePayload: PrintRequestPayload = {
  storeId: "1234",
  requestedBy: "g197511",
  printRequests: [
    {
      type: "BY_ITEM",
      entries: [
        { itemNumberOrUpc: "100012345", size: "SMALL", quantity: 2 },
      ],
    },
  ],
};

const sampleResponse: PrintResponse = {
  responseCode: "200",
  responseMessage: "Sign printed successfully",
  printerName: "Xerox Phaser 6510 81 ED D4",
  status: "PRINTED",
};

describe("printService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("submitPrint", () => {
    /**
     * Happy path: verifies the payload is forwarded to apiClient.post
     * and the response data is returned.
     */
    it("sends the payload and returns the print response", async () => {
      // Arrange
      mockPost.mockResolvedValueOnce({ data: sampleResponse });

      // Act
      const result = await printService.submitPrint(samplePayload);

      // Assert
      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("/dashboard/print"),
        samplePayload,
      );
      expect(result).toEqual(sampleResponse);
    });

    /**
     * Error path: verifies network/API errors propagate to the caller.
     */
    it("propagates errors from the API call", async () => {
      // Arrange
      mockPost.mockRejectedValueOnce(new Error("Network error"));

      // Act & Assert
      await expect(printService.submitPrint(samplePayload)).rejects.toThrow("Network error");
    });
  });
});
