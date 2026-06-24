/**
 * Unit tests for dashboardService.
 * apiClient is mocked so no real HTTP requests are made.
 */

jest.mock("../../../services/apiClient", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

import apiClient from "../../../services/apiClient";
import { fetchAllBatches } from "./dashboardService";
import { BATCH_API_PATHS } from "../../../lib/constants";

const post = (apiClient as unknown as { post: jest.Mock }).post;

describe("fetchAllBatches", () => {
  beforeEach(() => post.mockReset());

  it("posts the storeId to the batches route and returns the unwrapped data", async () => {
    const batches = { batches: [{ batchId: 1 }] };
    post.mockResolvedValue({ data: { success: true, message: "OK", data: batches } });

    const result = await fetchAllBatches("106");

    expect(post).toHaveBeenCalledWith(BATCH_API_PATHS.BATCHES, { storeId: "106" });
    expect(result).toBe(batches);
  });

  it("propagates errors from the client", async () => {
    post.mockRejectedValue(new Error("network down"));
    await expect(fetchAllBatches("106")).rejects.toThrow("network down");
  });
});
