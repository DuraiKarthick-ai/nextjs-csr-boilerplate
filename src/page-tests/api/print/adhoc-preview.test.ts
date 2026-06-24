/**
 * Unit tests for POST /api/print/adhoc-preview. ecsWsCall is mocked.
 */

jest.mock("../../../lib/ecsWebSocket", () => ({ ecsWsCall: jest.fn() }));

import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/print/adhoc-preview";
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
const item = { productCode: "123", description: "Milk", productTypeCode: "A", sellUnitId: "106", qty: 1 };

describe("POST /api/print/adhoc-preview", () => {
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
    await handler(req("POST", { items: [item] }), res);
    expect(res._status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("returns 400 when items is empty", async () => {
    const res = mockRes();
    await handler(req("POST", { sessionID: "s1", items: [] }), res);
    expect(res._status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("collects preview images and returns 200", async () => {
    wsCall
      .mockResolvedValueOnce({ sinkSize: 1 }) // adhoc-preview-load-data
      .mockResolvedValueOnce({ data: "img0" }); // preview-first

    const res = mockRes();
    await handler(req("POST", { sessionID: "s1", storeId: "106", items: [item] }), res);

    expect(res._status).toBe(HTTP_STATUS.OK);
    expect(res._json.previewImages).toEqual(["img0"]);
  });

  it("returns 500 when no preview images are returned", async () => {
    wsCall.mockResolvedValueOnce({ sinkSize: 1 }).mockResolvedValueOnce({});
    const res = mockRes();
    await handler(req("POST", { sessionID: "s1", items: [item] }), res);
    expect(res._status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});
