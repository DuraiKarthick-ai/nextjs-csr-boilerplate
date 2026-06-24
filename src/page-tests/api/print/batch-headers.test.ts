/**
 * Unit tests for POST /api/print/batch-headers.
 * config is mocked with a configured ECS web server; fetchWithTimeout is mocked.
 */

jest.mock("../../../services/config", () => ({
  ECS_WEB_SERVER_URL: "https://ecs.example.com",
  ECS_WEB_USERNAME: "user",
  ECS_WEB_PASSWORD: "pass",
  ECS_WEB_API_TOKEN: "token",
}));
jest.mock("../../../lib/fetchWithTimeout", () => ({ fetchWithTimeout: jest.fn() }));

import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/print/batch-headers";
import { fetchWithTimeout } from "../../../lib/fetchWithTimeout";
import { HTTP_STATUS } from "../../../lib/constants";

const fetchMock = fetchWithTimeout as jest.Mock;

function mockRes(): NextApiResponse & { _status: number; _json: Record<string, unknown> } {
  const res = {} as NextApiResponse & { _status: number; _json: Record<string, unknown> };
  res.setHeader = jest.fn().mockReturnValue(res) as never;
  res.status = jest.fn((c: number) => ((res._status = c), res)) as never;
  res.json = jest.fn((b: unknown) => ((res._json = b as Record<string, unknown>), res)) as never;
  return res;
}
const req = (method: string, body: unknown = {}) => ({ method, body }) as unknown as NextApiRequest;

describe("POST /api/print/batch-headers", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it("returns 405 for non-POST", async () => {
    const res = mockRes();
    await handler(req("GET"), res);
    expect(res._status).toBe(HTTP_STATUS.METHOD_NOT_ALLOWED);
  });

  it("returns 400 when storeId is missing", async () => {
    const res = mockRes();
    await handler(req("POST", {}), res);
    expect(res._status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("logs on then returns 200 with batch headers", async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [{ token: "abc" }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ batchHeaders: [{ batchId: 1 }] }) });

    const res = mockRes();
    await handler(req("POST", { storeId: "106" }), res);

    expect(res._status).toBe(HTTP_STATUS.OK);
    expect(res._json.batchHeaders).toEqual([{ batchId: 1 }]);
  });

  it("returns 500 when the logon step fails", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
    const res = mockRes();
    await handler(req("POST", { storeId: "106" }), res);
    expect(res._status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});
