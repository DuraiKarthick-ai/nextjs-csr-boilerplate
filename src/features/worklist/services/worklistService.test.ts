/**
 * Unit tests for worklistService.
 * apiClient is mocked; verifies request paths/params and response unwrapping.
 */

jest.mock("../../../services/apiClient", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

import apiClient from "../../../services/apiClient";
import {
  fetchWorklist,
  fetchWorklistSummary,
  printWorklistItems,
  fetchBatchDetail,
} from "./worklistService";
import { API_BASE_PATH, DEFAULT_PAGE_SIZE, BATCH_API_PATHS } from "../../../lib/constants";

const get = (apiClient as unknown as { get: jest.Mock }).get;
const post = (apiClient as unknown as { post: jest.Mock }).post;

describe("worklistService", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  describe("fetchWorklist", () => {
    it("returns the full paginated response and sends filters + pagination", async () => {
      const paginated = { data: [], meta: {}, message: "OK", success: true };
      get.mockResolvedValue({ data: paginated });

      const result = await fetchWorklist({ department: "BAKERY" });

      expect(get).toHaveBeenCalledWith(`${API_BASE_PATH}/worklist`, {
        params: { department: "BAKERY", page: 1, pageSize: DEFAULT_PAGE_SIZE },
      });
      expect(result).toBe(paginated);
    });

    it("forwards an explicit page and pageSize", async () => {
      get.mockResolvedValue({ data: { data: [], meta: {}, message: "", success: true } });
      await fetchWorklist({}, 3, 50);
      expect(get).toHaveBeenCalledWith(`${API_BASE_PATH}/worklist`, {
        params: { page: 3, pageSize: 50 },
      });
    });
  });

  describe("fetchWorklistSummary", () => {
    it("returns the unwrapped summary data", async () => {
      const summary = { totalItems: 5, pendingItems: 2, printedItems: 1, failedItems: 0, approvedItems: 2 };
      get.mockResolvedValue({ data: { success: true, message: "OK", data: summary } });

      const result = await fetchWorklistSummary();

      expect(get).toHaveBeenCalledWith(`${API_BASE_PATH}/worklist/summary`);
      expect(result).toBe(summary);
    });
  });

  describe("printWorklistItems", () => {
    it("posts the request and returns the unwrapped print response", async () => {
      const printResp = { jobId: "j1", status: "QUEUED", message: "ok" };
      post.mockResolvedValue({ data: { success: true, message: "OK", data: printResp } });

      const result = await printWorklistItems({ itemIds: ["1", "2"] });

      expect(post).toHaveBeenCalledWith(`${API_BASE_PATH}/worklist/print`, {
        itemIds: ["1", "2"],
      });
      expect(result).toBe(printResp);
    });
  });

  describe("fetchBatchDetail", () => {
    it("maps batch params into the request body and unwraps the data", async () => {
      const detail = { batchId: 22, batchName: "B", storeId: "106", batchConfigId: 10, items: [] };
      post.mockResolvedValue({ data: { success: true, message: "OK", data: detail } });

      const result = await fetchBatchDetail({
        batchId: 22,
        storeId: "106",
        batchConfigId: 10,
        batchName: "B",
      });

      expect(post).toHaveBeenCalledWith(BATCH_API_PATHS.BATCH_DETAIL, {
        batchId: 22,
        storeId: "106",
        batchConfigId: 10,
        batchName: "B",
      });
      expect(result).toBe(detail);
    });
  });
});
