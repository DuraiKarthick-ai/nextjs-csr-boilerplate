/**
 * Unit test for the GET /api/health liveness endpoint.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../pages/api/health";

describe("GET /api/health", () => {
  it("responds 200 with an empty body", () => {
    const end = jest.fn();
    const status = jest.fn().mockReturnValue({ end });
    const res = { status } as unknown as NextApiResponse;

    handler({} as NextApiRequest, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(end).toHaveBeenCalled();
  });
});
