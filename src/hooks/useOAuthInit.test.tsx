/**
 * Unit tests for the useOAuthInit hook.
 * apiClient is mocked; covers the authenticated, unauthenticated, and error paths.
 */

jest.mock("../services/apiClient", () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

import { renderHook, waitFor } from "@testing-library/react";
import useOAuthInit from "./useOAuthInit";
import apiClient from "../services/apiClient";

const post = (apiClient as unknown as { post: jest.Mock }).post;

describe("useOAuthInit", () => {
  beforeEach(() => post.mockReset());

  it("sets isAuthenticated when the warmup succeeds", async () => {
    post.mockResolvedValue({ data: { data: { initialised: true } } });

    const { result } = renderHook(() => useOAuthInit());
    expect(result.current.isInitialising).toBe(true);

    await waitFor(() => expect(result.current.isInitialising).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("leaves isAuthenticated false when the server reports not initialised", async () => {
    post.mockResolvedValue({ data: { data: { initialised: false } } });

    const { result } = renderHook(() => useOAuthInit());
    await waitFor(() => expect(result.current.isInitialising).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("captures an error when the warmup request fails", async () => {
    post.mockRejectedValue(new Error("init failed"));

    const { result } = renderHook(() => useOAuthInit());
    await waitFor(() => expect(result.current.isInitialising).toBe(false));
    expect(result.current.error).toBe("init failed");
    expect(result.current.isAuthenticated).toBe(false);
  });
});
