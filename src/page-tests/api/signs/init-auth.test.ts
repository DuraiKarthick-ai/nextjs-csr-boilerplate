/**
 * Unit tests for the POST /api/signs/init-auth route handler.
 * getAccessToken is mocked so no real OAuth call is made.
 */

jest.mock("../../../services/oauthTokenService", () => ({
  getAccessToken: jest.fn(),
}));

import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/signs/init-auth";
import { getAccessToken } from "../../../services/oauthTokenService";
import { HTTP_STATUS } from "../../../lib/constants";

const getToken = getAccessToken as jest.Mock;

function mockRes(): NextApiResponse & { _status: number; _json: unknown } {
  const res = {} as NextApiResponse & { _status: number; _json: unknown };
  res.setHeader = jest.fn().mockReturnValue(res) as never;
  res.status = jest.fn((code: number) => {
    res._status = code;
    return res;
  }) as never;
  res.json = jest.fn((body: unknown) => {
    res._json = body;
    return res;
  }) as never;
  return res;
}

function mockReq(method: string): NextApiRequest {
  return { method } as unknown as NextApiRequest;
}

describe("POST /api/signs/init-auth", () => {
  beforeEach(() => {
    getToken.mockReset();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns 405 for non-POST methods", async () => {
    const res = mockRes();
    await handler(mockReq("GET"), res);
    expect(res._status).toBe(HTTP_STATUS.METHOD_NOT_ALLOWED);
  });

  it("returns 200 and initialised=true when the token is obtained", async () => {
    getToken.mockResolvedValue("token-abc");
    const res = mockRes();
    await handler(mockReq("POST"), res);

    expect(res._status).toBe(HTTP_STATUS.OK);
    expect(res._json).toEqual({
      success: true,
      message: "Authentication initialised.",
      data: { initialised: true },
    });
  });

  it("returns 500 when the token fetch fails", async () => {
    getToken.mockRejectedValue(new Error("oauth down"));
    const res = mockRes();
    await handler(mockReq("POST"), res);

    expect(res._status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(res._json).toMatchObject({ success: false, data: { initialised: false } });
  });
});
