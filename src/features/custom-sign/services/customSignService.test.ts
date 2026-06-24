/**
 * Unit tests for customSignService.
 * apiClient is mocked; verifies request paths and response unwrapping.
 */

jest.mock("../../../services/apiClient", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

import apiClient from "../../../services/apiClient";
import { renderCustomSign, printCustomSign } from "./customSignService";
import { API_BASE_PATH, PREVIEW_SIGN_API_PATHS } from "../../../lib/constants";
import type { CustomSignRenderRequest } from "../../../types/sign.types";

const post = (apiClient as unknown as { post: jest.Mock }).post;

describe("customSignService", () => {
  beforeEach(() => post.mockReset());

  it("renderCustomSign posts the payload to the render route and unwraps the data", async () => {
    const payload: CustomSignRenderRequest[] = [
      {
        styleName: "Style",
        outputType: "png",
        productCode: "123",
        storeId: 51,
        outputParams: "",
        shapeNameValues: [],
      },
    ];
    const renderResp = { success: true, statusCode: 200, message: "OK", data: [], timestamp: "" };
    post.mockResolvedValue({ data: { success: true, message: "OK", data: renderResp } });

    const result = await renderCustomSign(payload);

    expect(post).toHaveBeenCalledWith(PREVIEW_SIGN_API_PATHS.RENDER, payload);
    expect(result).toBe(renderResp);
  });

  it("printCustomSign posts the quantity and returns the print response", async () => {
    const printResp = { jobId: "j3", status: "QUEUED", message: "ok" };
    post.mockResolvedValue({ data: { success: true, message: "OK", data: printResp } });

    const result = await printCustomSign(4);

    expect(post).toHaveBeenCalledWith(`${API_BASE_PATH}/print`, { quantity: 4 });
    expect(result).toBe(printResp);
  });
});
