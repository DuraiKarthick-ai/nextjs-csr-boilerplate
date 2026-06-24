/**
 * Unit tests for the POST /api/signs/batches route handler.
 * The OAuth token service and fetchWithTimeout are mocked so no real
 * network or auth calls are made.
 */

jest.mock("../../../services/oauthTokenService", () => ({
  getAccessToken: jest.fn(),
}));
jest.mock("../../../lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
}));

import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/signs/batches";
import { getAccessToken } from "../../../services/oauthTokenService";
import { fetchWithTimeout } from "../../../lib/fetchWithTimeout";
import { HTTP_STATUS } from "../../../lib/constants";
import { BatchStatus as BatchStatusEnum } from "../../../types/batch.types";

const getToken = getAccessToken as jest.Mock;
const fetchMock = fetchWithTimeout as jest.Mock;

/** Builds a mock NextApiResponse capturing status and json calls. */
function mockRes(): NextApiResponse & { _status: number; _json: unknown } {
  const res = {} as NextApiResponse & { _status: number; _json: unknown };
  res.setHeader = jest.fn().mockReturnValue(res) as never;
  res.status = jest.fn((code: number) => {
    res._status = code;
    return res;
  }) as never;
  res.json = jest.fn((body: unknown) => {
    res._json = body;
    return res;
  }) as never;
  return res;
}

function mockReq(method: string, body: unknown = {}): NextApiRequest {
  return { method, body } as unknown as NextApiRequest;
}

describe("POST /api/signs/batches", () => {
  beforeEach(() => {
    getToken.mockReset();
    fetchMock.mockReset();
  });

  it("returns 405 for non-POST methods", async () => {
    const res = mockRes();
    await handler(mockReq("GET"), res);
    expect(res._status).toBe(HTTP_STATUS.METHOD_NOT_ALLOWED);
  });

  it("returns 400 when storeId is missing or blank", async () => {
    const res = mockRes();
    await handler(mockReq("POST", { storeId: "  " }), res);
    expect(res._status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("maps ECS batches and returns 200 on success", async () => {
    getToken.mockResolvedValue("token-abc");
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        statusCode: 200,
        message: "OK",
        data: [
          { batchId: 1, configId: 10, batchName: "Batch A", signQuantity: 3, printedQuantity: 1 },
          { batchId: 2, configId: 11, batchName: "Batch B", signQuantity: 0, printedQuantity: 0 },
        ],
      }),
    });

    const res = mockRes();
    await handler(mockReq("POST", { storeId: "106" }), res);

    expect(res._status).toBe(HTTP_STATUS.OK);
    const body = res._json as { success: boolean; data: { batches: Array<{ status: string }> } };
    expect(body.success).toBe(true);
    expect(body.data.batches).toHaveLength(2);
    expect(body.data.batches[0].status).toBe(BatchStatusEnum.READY);
    expect(body.data.batches[1].status).toBe(BatchStatusEnum.COMPLETED);
  });

  it("returns 500 when the upstream responds with a non-ok status", async () => {
    getToken.mockResolvedValue("token-abc");
    fetchMock.mockResolvedValue({ ok: false, status: 502, json: async () => ({}) });

    const res = mockRes();
    await handler(mockReq("POST", { storeId: "106" }), res);

    expect(res._status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });

  it("returns 500 when obtaining the OAuth token fails", async () => {
    getToken.mockRejectedValue(new Error("oauth down"));

    const res = mockRes();
    await handler(mockReq("POST", { storeId: "106" }), res);

    expect(res._status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});
