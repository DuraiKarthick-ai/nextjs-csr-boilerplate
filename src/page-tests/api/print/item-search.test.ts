/**
 * Unit tests for POST /api/print/item-search.
 * OAuth and fetchWithTimeout are mocked.
 */

jest.mock("../../../services/oauthTokenService", () => ({ getAccessToken: jest.fn() }));
jest.mock("../../../lib/fetchWithTimeout", () => ({ fetchWithTimeout: jest.fn() }));

import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/print/item-search";
import { getAccessToken } from "../../../services/oauthTokenService";
import { fetchWithTimeout } from "../../../lib/fetchWithTimeout";
import { HTTP_STATUS } from "../../../lib/constants";

const getToken = getAccessToken as jest.Mock;
const fetchMock = fetchWithTimeout as jest.Mock;

function mockRes(): NextApiResponse & { _status: number; _json: Record<string, unknown> } {
  const res = {} as NextApiResponse & { _status: number; _json: Record<string, unknown> };
  res.setHeader = jest.fn().mockReturnValue(res) as never;
  res.status = jest.fn((c: number) => ((res._status = c), res)) as never;
  res.json = jest.fn((b: unknown) => ((res._json = b as Record<string, unknown>), res)) as never;
  return res;
}
const req = (method: string, body: unknown = {}) => ({ method, body }) as unknown as NextApiRequest;

const item = { storeId: "106", productCode: "123", productTypeCode: "A" };

describe("POST /api/print/item-search", () => {
  beforeEach(() => {
    getToken.mockReset();
    fetchMock.mockReset();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it("returns 405 for non-POST", async () => {
    const res = mockRes();
    await handler(req("GET"), res);
    expect(res._status).toBe(HTTP_STATUS.METHOD_NOT_ALLOWED);
  });

  it("returns 400 when items is empty", async () => {
    const res = mockRes();
    await handler(req("POST", { items: [] }), res);
    expect(res._status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("returns 200 with the found items on success", async () => {
    getToken.mockResolvedValue("token");
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: [{ productCode: "123" }] }) });

    const res = mockRes();
    await handler(req("POST", { items: [item] }), res);

    expect(res._status).toBe(HTTP_STATUS.OK);
    expect(res._json.items).toHaveLength(1);
  });

  it("skips items whose upstream call is not ok", async () => {
    getToken.mockResolvedValue("token");
    fetchMock.mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });

    const res = mockRes();
    await handler(req("POST", { items: [item] }), res);

    expect(res._status).toBe(HTTP_STATUS.OK);
    expect(res._json.items).toHaveLength(0);
  });

  it("returns 500 when obtaining the token fails", async () => {
    getToken.mockRejectedValue(new Error("oauth down"));
    const res = mockRes();
    await handler(req("POST", { items: [item] }), res);
    expect(res._status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});
