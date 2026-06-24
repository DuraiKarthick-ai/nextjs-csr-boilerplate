/**
 * Unit tests for POST /api/print/load-batch. ecsWsCall is mocked.
 */

jest.mock("../../../lib/ecsWebSocket", () => ({ ecsWsCall: jest.fn() }));

import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/print/load-batch";
import { ecsWsCall } from "../../../lib/ecsWebSocket";
import { HTTP_STATUS } from "../../../lib/constants";

const wsCall = ecsWsCall as jest.Mock;

function mockRes(): NextApiResponse & { _status: number; _json: Record<string, unknown> } {
  const res = {} as NextApiResponse & { _status: number; _json: Record<string, unknown> };
  res.setHeader = jest.fn().mockReturnValue(res) as never;
  res.status = jest.fn((c: number) => ((res._status = c), res)) as never;
  res.json = jest.fn((b: unknown) => ((res._json = b as Record<string, unknown>), res)) as never;
  return res;
}
const req = (method: string, body: unknown = {}) => ({ method, body }) as unknown as NextApiRequest;

describe("POST /api/print/load-batch", () => {
  beforeEach(() => {
    wsCall.mockReset();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it("returns 405 for non-POST", async () => {
    const res = mockRes();
    await handler(req("GET"), res);
    expect(res._status).toBe(HTTP_STATUS.METHOD_NOT_ALLOWED);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = mockRes();
    await handler(req("POST", { sessionID: "s1" }), res);
    expect(res._status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("returns 200 on success", async () => {
    wsCall.mockResolvedValue({ ok: true });
    const res = mockRes();
    await handler(req("POST", { sessionID: "s1", jobID: 1, batchID: 2 }), res);
    expect(res._status).toBe(HTTP_STATUS.OK);
    expect(res._json.success).toBe(true);
  });

  it("returns 500 when the WS call fails", async () => {
    wsCall.mockRejectedValue(new Error("ws down"));
    const res = mockRes();
    await handler(req("POST", { sessionID: "s1", jobID: 1, batchID: 2 }), res);
    expect(res._status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});
