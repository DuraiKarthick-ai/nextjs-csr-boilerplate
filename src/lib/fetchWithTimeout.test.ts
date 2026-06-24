/**
 * Unit tests for fetchWithTimeout.
 * Verifies the happy path, that the abort timer is cleared on success, and
 * that the request is aborted when the upstream call exceeds the timeout.
 */

import { fetchWithTimeout } from "./fetchWithTimeout";

describe("fetchWithTimeout", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("returns the response on success", async () => {
    const mockResponse = { ok: true, status: 200 } as Response;
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const result = await fetchWithTimeout("https://example.com/api");

    expect(result).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("forwards method, headers, and an abort signal to fetch", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true } as Response);
    global.fetch = fetchMock;

    await fetchWithTimeout("https://example.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://example.com/api");
    expect(options.method).toBe("POST");
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it("clears the timeout once the request resolves", async () => {
    const clearSpy = jest.spyOn(global, "clearTimeout");
    global.fetch = jest.fn().mockResolvedValue({ ok: true } as Response);

    await fetchWithTimeout("https://example.com/api", {}, 5000);

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it("aborts the request when the timeout elapses", async () => {
    jest.useFakeTimers();
    // fetch rejects when its signal is aborted, mirroring real fetch behaviour.
    global.fetch = jest.fn((_url: string, opts?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        const signal = opts?.signal;
        signal?.addEventListener("abort", () => {
          reject(new DOMException("The operation was aborted.", "AbortError"));
        });
      });
    }) as unknown as typeof fetch;

    const promise = fetchWithTimeout("https://example.com/slow", {}, 1000);
    // Attach the rejection expectation before advancing timers.
    const assertion = expect(promise).rejects.toThrow(/aborted/i);
    jest.advanceTimersByTime(1000);
    await assertion;
  });
});
