/**
 * Unit tests for the POST /api/signs/print route handler.
 * fetchWithTimeout is mocked.
 */

jest.mock("../../../lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
}));

import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/signs/print";
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

function mockReq(method: string, body: unknown = {}): NextApiRequest {
  return { method, body } as unknown as NextApiRequest;
}

describe("POST /api/signs/print", () => {
  beforeEach(() => fetchMock.mockReset());

  it("returns 405 for non-POST methods", async () => {
    const res = mockRes();
    await handler(mockReq("GET"), res);
    expect(res._status).toBe(HTTP_STATUS.METHOD_NOT_ALLOWED);
  });

  it("returns 400 when signIds is missing or empty", async () => {
    const res = mockRes();
    await handler(mockReq("POST", { signIds: [], quantity: 1 }), res);
    expect(res._status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("returns 400 for an invalid quantity", async () => {
    const res = mockRes();
    await handler(mockReq("POST", { signIds: ["a"], quantity: 0 }), res);
    expect(res._status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("returns 200 with the print response on success", async () => {
    const printResp = { jobId: "j1", status: "QUEUED", message: "ok" };
    fetchMock.mockResolvedValue({ ok: true, json: async () => printResp });

    const res = mockRes();
    await handler(mockReq("POST", { signIds: ["a"], quantity: 2 }), res);

    expect(res._status).toBe(HTTP_STATUS.OK);
    expect(res._json).toEqual({ success: true, message: "Print submitted.", data: printResp });
  });

  it("returns 500 when the backend responds with a non-ok status", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    const res = mockRes();
    await handler(mockReq("POST", { signIds: ["a"], quantity: 2 }), res);
    expect(res._status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});
