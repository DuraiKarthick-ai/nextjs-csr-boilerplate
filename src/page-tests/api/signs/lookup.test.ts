/**
 * Unit tests for the GET /api/signs/lookup route handler.
 * fetchWithTimeout is mocked so no real backend call is made.
 */

jest.mock("../../../lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
}));

import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/signs/lookup";
import { fetchWithTimeout } from "../../../lib/fetchWithTimeout";
import { HTTP_STATUS } from "../../../lib/constants";

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

function mockReq(method: string, query: Record<string, unknown> = {}): NextApiRequest {
  return { method, query } as unknown as NextApiRequest;
}

describe("GET /api/signs/lookup", () => {
  beforeEach(() => fetchMock.mockReset());

  it("returns 405 for non-GET methods", async () => {
    const res = mockRes();
    await handler(mockReq("POST"), res);
    expect(res._status).toBe(HTTP_STATUS.METHOD_NOT_ALLOWED);
  });

  it("returns 400 for an invalid item number", async () => {
    const res = mockRes();
    await handler(mockReq("GET", { itemNumber: "bad value!!" }), res);
    expect(res._status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("returns 200 with the lookup data on success", async () => {
    const lookup = { itemNumber: "123", description: "Milk", department: "DAIRY", price: 3, found: true };
    fetchMock.mockResolvedValue({ ok: true, json: async () => lookup });

    const res = mockRes();
    await handler(mockReq("GET", { itemNumber: "123" }), res);

    expect(res._status).toBe(HTTP_STATUS.OK);
    expect(res._json).toEqual({ success: true, message: "OK", data: lookup });
  });

  it("returns 500 when the backend responds with a non-ok status", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });

    const res = mockRes();
    await handler(mockReq("GET", { itemNumber: "123" }), res);
    expect(res._status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});
