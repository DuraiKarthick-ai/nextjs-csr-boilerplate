/**
 * Unit tests for POST /api/print/printers. ecsWsCall is mocked.
 */

jest.mock("../../../lib/ecsWebSocket", () => ({ ecsWsCall: jest.fn() }));

import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/print/printers";
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

describe("POST /api/print/printers", () => {
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

  it("returns 400 when sessionID is missing", async () => {
    const res = mockRes();
    await handler(req("POST", {}), res);
    expect(res._status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("returns 200 with the printers list", async () => {
    wsCall.mockResolvedValue({ printers: ["P1", "P2"] });
    const res = mockRes();
    await handler(req("POST", { sessionID: "s1" }), res);
    expect(res._status).toBe(HTTP_STATUS.OK);
    expect(res._json.printers).toEqual(["P1", "P2"]);
  });

  it("returns 500 when the WS call fails", async () => {
    wsCall.mockRejectedValue(new Error("ws down"));
    const res = mockRes();
    await handler(req("POST", { sessionID: "s1" }), res);
    expect(res._status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});
