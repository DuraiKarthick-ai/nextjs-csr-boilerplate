/**
 * Unit tests for the GET /api/signs/worklist route handler.
 * fetchWithTimeout is mocked.
 */

jest.mock("../../../lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
}));

import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/signs/worklist";
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

function mockReq(method: string, query: Record<string, unknown> = {}): NextApiRequest {
  return { method, query } as unknown as NextApiRequest;
}

describe("GET /api/signs/worklist", () => {
  beforeEach(() => fetchMock.mockReset());

  it("returns 405 for non-GET methods", async () => {
    const res = mockRes();
    await handler(mockReq("POST"), res);
    expect(res._status).toBe(HTTP_STATUS.METHOD_NOT_ALLOWED);
  });

  it("returns 200 with the paginated payload on success", async () => {
    const payload = { data: [], meta: { page: 1 }, message: "OK", success: true };
    fetchMock.mockResolvedValue({ ok: true, json: async () => payload });

    const res = mockRes();
    await handler(mockReq("GET", { page: "2", pageSize: "10", department: "BAKERY" }), res);

    expect(res._status).toBe(HTTP_STATUS.OK);
    expect(res._json).toBe(payload);
    // The allowed filter and pagination should be forwarded in the URL.
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("page=2");
    expect(calledUrl).toContain("pageSize=10");
    expect(calledUrl).toContain("department=BAKERY");
  });

  it("returns 500 when the backend responds with a non-ok status", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    const res = mockRes();
    await handler(mockReq("GET"), res);
    expect(res._status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});
