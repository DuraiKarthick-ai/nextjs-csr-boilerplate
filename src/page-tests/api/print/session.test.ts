/**
 * Unit tests for POST /api/print/session.
 * Covers method rejection and the error path. With ECS_PRINT_SERVER_URL unset,
 * the URL parse fails and the handler returns 500 without any real network call.
 */

jest.mock("../../../services/config", () => ({
  ECS_PRINT_SERVER_URL: "",
  ECS_WEB_USERNAME: "user",
  ECS_WEB_PASSWORD: "pass",
  ECS_WEB_API_TOKEN: "token",
  ECS_WEB_SERVER_URL: "",
}));

import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/print/session";
import { HTTP_STATUS } from "../../../lib/constants";

function mockRes(): NextApiResponse & { _status: number; _json: Record<string, unknown> } {
  const res = {} as NextApiResponse & { _status: number; _json: Record<string, unknown> };
  res.setHeader = jest.fn().mockReturnValue(res) as never;
  res.status = jest.fn((c: number) => ((res._status = c), res)) as never;
  res.json = jest.fn((b: unknown) => ((res._json = b as Record<string, unknown>), res)) as never;
  return res;
}
const req = (method: string) => ({ method, body: {} }) as unknown as NextApiRequest;

describe("POST /api/print/session", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it("returns 405 for non-POST", async () => {
    const res = mockRes();
    await handler(req("GET"), res);
    expect(res._status).toBe(HTTP_STATUS.METHOD_NOT_ALLOWED);
  });

  it("returns 500 with debug info when the session request cannot be made", async () => {
    const res = mockRes();
    await handler(req("POST"), res);
    expect(res._status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(res._json.success).toBe(false);
    expect(res._json.debug).toBeDefined();
  });
});
