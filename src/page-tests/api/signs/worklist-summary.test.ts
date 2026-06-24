/**
 * Unit tests for the GET /api/signs/worklist-summary route handler.
 * fetchWithTimeout is mocked. Covers success and the non-production
 * dev-fallback path (NODE_ENV is "test" under Jest).
 */

jest.mock("../../../lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
}));

import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/signs/worklist-summary";
import { fetchWithTimeout } from "../../../lib/fetchWithTimeout";
import { HTTP_STATUS } from "../../../lib/constants";

const fetchMock = fetchWithTimeout as jest.Mock;

function mockRes(): NextApiResponse & { _status: number; _json: unknown } {
  const res = {} as NextApiResponse & { _status: number; _json: unknown };
  res.setHeader = jest.fn().mockReturnValue(res) as never;
  res.status = jest.fn((code: number) => ((res._status = code), res)) as never;
  res.json = jest.fn((body: unknown) => ((res._json = body), res)) as never;
  return res;
}

function mockReq(method: string): NextApiRequest {
  return { method, query: {} } as unknown as NextApiRequest;
}

describe("GET /api/signs/worklist-summary", () => {
  beforeEach(() => fetchMock.mockReset());

  it("returns 405 for non-GET methods", async () => {
    const res = mockRes();
    await handler(mockReq("POST"), res);
    expect(res._status).toBe(HTTP_STATUS.METHOD_NOT_ALLOWED);
  });

  it("returns 200 with the backend summary on success", async () => {
    const payload = {
      success: true,
      message: "OK",
      data: { totalItems: 3, pendingItems: 1, printedItems: 2, failedItems: 0, approvedItems: 2 },
    };
    fetchMock.mockResolvedValue({ ok: true, json: async () => payload });

    const res = mockRes();
    await handler(mockReq("GET"), res);

    expect(res._status).toBe(HTTP_STATUS.OK);
    expect(res._json).toBe(payload);
  });

  it("falls back to mock data with 200 in non-production when the backend fails", async () => {
    fetchMock.mockRejectedValue(new Error("backend down"));

    const res = mockRes();
    await handler(mockReq("GET"), res);

    expect(res._status).toBe(HTTP_STATUS.OK);
    expect(res._json).toMatchObject({ success: true, message: "OK (dev fallback)" });
  });
});
