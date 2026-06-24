/**
 * Unit tests for quickPrintService.
 * apiClient is mocked; verifies request paths/params and response unwrapping.
 */

jest.mock("../../../services/apiClient", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

import apiClient from "../../../services/apiClient";
import { lookupItem, submitBatchPrint } from "./quickPrintService";
import { API_BASE_PATH } from "../../../lib/constants";

const get = (apiClient as unknown as { get: jest.Mock }).get;
const post = (apiClient as unknown as { post: jest.Mock }).post;

describe("quickPrintService", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it("lookupItem sends the itemNumber param and returns the lookup data", async () => {
    const lookup = { itemNumber: "123", description: "Milk", department: "DAIRY", price: 3, found: true };
    get.mockResolvedValue({ data: { success: true, message: "OK", data: lookup } });

    const result = await lookupItem("123");

    expect(get).toHaveBeenCalledWith(`${API_BASE_PATH}/lookup`, { params: { itemNumber: "123" } });
    expect(result).toBe(lookup);
  });

  it("submitBatchPrint posts the request and returns the print response", async () => {
    const printResp = { jobId: "j2", status: "QUEUED", message: "ok" };
    post.mockResolvedValue({ data: { success: true, message: "OK", data: printResp } });

    const result = await submitBatchPrint({ signIds: ["a"], quantity: 2 });

    expect(post).toHaveBeenCalledWith(`${API_BASE_PATH}/print`, { signIds: ["a"], quantity: 2 });
    expect(result).toBe(printResp);
  });
});
