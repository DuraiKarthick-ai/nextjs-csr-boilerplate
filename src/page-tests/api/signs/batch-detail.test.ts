/**
 * Unit tests for the POST /api/signs/batch-detail route handler.
 * OAuth and fetchWithTimeout are mocked.
 */

jest.mock("../../../services/oauthTokenService", () => ({
  getAccessToken: jest.fn(),
}));
jest.mock("../../../lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
}));

import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/signs/batch-detail";
import { getAccessToken } from "../../../services/oauthTokenService";
import { fetchWithTimeout } from "../../../lib/fetchWithTimeout";
import { HTTP_STATUS } from "../../../lib/constants";

const getToken = getAccessToken as jest.Mock;
const fetchMock = fetchWithTimeout as jest.Mock;

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

const validBody = {
  batchId: 22,
  storeId: "106",
  batchConfigId: 10,
  batchName: "Batch A",
};

describe("POST /api/signs/batch-detail", () => {
  beforeEach(() => {
    getToken.mockReset();
    fetchMock.mockReset();
  });

  it("returns 405 for non-POST methods", async () => {
    const res = mockRes();
    await handler(mockReq("GET"), res);
    expect(res._status).toBe(HTTP_STATUS.METHOD_NOT_ALLOWED);
  });

  it("returns 400 for an invalid body", async () => {
    const res = mockRes();
    await handler(mockReq("POST", { batchId: "not-a-number" }), res);
    expect(res._status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("maps ECS item details and converts dates on success", async () => {
    getToken.mockResolvedValue("token-abc");
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        statusCode: 200,
        message: "OK",
        data: {
          batchId: 22,
          itemDetails: [
            {
              "Item Number": "123",
              "Item Name": "Milk",
              Dept: "14",
              Category: null,
              "Change Reason": "PC",
              "Valid From": "06/19/2026",
              isPrinted: true,
            },
          ],
        },
        timestamp: "",
      }),
    });

    const res = mockRes();
    await handler(mockReq("POST", validBody), res);

    expect(res._status).toBe(HTTP_STATUS.OK);
    const body = res._json as {
      data: { items: Array<{ itemNumber: string; effectiveDate: string; printStatus: string }> };
    };
    expect(body.data.items[0].itemNumber).toBe("123");
    expect(body.data.items[0].effectiveDate).toBe("2026-06-19");
    expect(body.data.items[0].printStatus).toBe("PRINTED");
  });

  it("returns 500 when the upstream responds with a non-ok status", async () => {
    getToken.mockResolvedValue("token-abc");
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });

    const res = mockRes();
    await handler(mockReq("POST", validBody), res);
    expect(res._status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});
