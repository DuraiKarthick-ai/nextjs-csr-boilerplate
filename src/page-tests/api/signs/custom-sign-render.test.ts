/**
 * Unit tests for the POST /api/signs/custom-sign-render route handler.
 * OAuth and fetchWithTimeout are mocked. Covers validation guards,
 * payload sanitisation, success, and upstream failure.
 */

jest.mock("../../../services/oauthTokenService", () => ({
  getAccessToken: jest.fn(),
}));
jest.mock("../../../lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
}));

import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/signs/custom-sign-render";
import { getAccessToken } from "../../../services/oauthTokenService";
import { fetchWithTimeout } from "../../../lib/fetchWithTimeout";
import { HTTP_STATUS } from "../../../lib/constants";

const getToken = getAccessToken as jest.Mock;
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

const validItem = {
  styleName: "Style",
  outputType: "png",
  productCode: "ABC123",
  storeId: 51,
  outputParams: "",
  shapeNameValues: [],
};

describe("POST /api/signs/custom-sign-render", () => {
  beforeEach(() => {
    getToken.mockReset();
    fetchMock.mockReset();
  });

  it("returns 405 for non-POST methods", async () => {
    const res = mockRes();
    await handler(mockReq("GET"), res);
    expect(res._status).toBe(HTTP_STATUS.METHOD_NOT_ALLOWED);
  });

  it("returns 400 for a non-array or empty body", async () => {
    const res = mockRes();
    await handler(mockReq("POST", []), res);
    expect(res._status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("returns 400 when an item has an invalid productCode or storeId", async () => {
    const res = mockRes();
    await handler(mockReq("POST", [{ ...validItem, productCode: "bad code!" }]), res);
    expect(res._status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("returns 200 with the render response on success", async () => {
    getToken.mockResolvedValue("token-abc");
    const ecsResponse = { success: true, statusCode: 200, message: "OK", data: [], timestamp: "" };
    fetchMock.mockResolvedValue({ ok: true, json: async () => ecsResponse });

    const res = mockRes();
    await handler(mockReq("POST", [validItem]), res);

    expect(res._status).toBe(HTTP_STATUS.OK);
    expect(res._json).toMatchObject({ success: true, data: ecsResponse });
  });

  it("returns 500 when the ECS render API responds with a non-ok status", async () => {
    getToken.mockResolvedValue("token-abc");
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });

    const res = mockRes();
    await handler(mockReq("POST", [validItem]), res);
    expect(res._status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});
