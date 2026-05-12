import apiClient from "@/utils/apiClient";
import { batchService } from "@/services/batchService";
import type {
  BatchDetailItem,
  BatchItem,
  GetBatchDetailApiResponse,
  GetBatchDetailRequestPayload,
  GetAllBatchesApiResponse,
  GetAllBatchesRequestPayload,
} from "@/types/batch";

jest.mock("@/utils/apiClient");

const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;

const samplePayload: GetAllBatchesRequestPayload = {
  storeId: "100",
};

const sampleResponse: GetAllBatchesApiResponse = {
  success: true,
  statusCode: 200,
  message: "Batches retrieved successfully",
  data: [
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
    {
      batchId: 11009,
      configId: 237022,
      batchName: "Emergency Batch",
    },
  ],
  timestamp: "2026-05-11T13:16:19.421122553",
};

const sampleDetailPayload: GetBatchDetailRequestPayload = {
  batchId: 6010,
  storeId: "100",
  batchConfigId: 237020,
};

const sampleDetailRows: BatchDetailItem[] = [
  {
    "Item Number": "39343",
    "Item Name": null,
    Dept: null,
    Category: null,
    "Change Reason": null,
    "Valid From": "04/30/2026",
    isPrinted: false,
  },
];

const sampleDetailResponse: GetBatchDetailApiResponse = {
  success: true,
  statusCode: 200,
  message: "Batch detail retrieved successfully",
  data: {
    batchId: 6010,
    itemDetails: sampleDetailRows,
  },
  timestamp: "2026-05-11T13:11:35.667762834",
};

describe("batchService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllBatches", () => {
    it("sends the storeId payload and returns the batch list", async () => {
      // Arrange
      mockPost.mockResolvedValueOnce({ data: sampleResponse });

      // Act
      const result = await batchService.getAllBatches(samplePayload);

      // Assert
      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        samplePayload,
      );
      expect(result).toEqual(sampleResponse.data);
    });

    it("propagates API errors to the caller", async () => {
      // Arrange
      mockPost.mockRejectedValueOnce(new Error("Network error"));

      // Act + Assert
      await expect(batchService.getAllBatches(samplePayload)).rejects.toThrow("Network error");
    });
  });

  describe("getBatchDetail", () => {
    it("sends batch identifiers and returns detail rows", async () => {
      // Arrange
      mockPost.mockResolvedValueOnce({ data: sampleDetailResponse });

      // Act
      const result = await batchService.getBatchDetail(sampleDetailPayload);

      // Assert
      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        sampleDetailPayload,
      );
      expect(result).toEqual(sampleDetailRows);
    });

    it("propagates get-batch-detail API errors to the caller", async () => {
      // Arrange
      mockPost.mockRejectedValueOnce(new Error("Batch detail error"));

      // Act + Assert
      await expect(batchService.getBatchDetail(sampleDetailPayload)).rejects.toThrow(
        "Batch detail error",
      );
    });
  });
});
