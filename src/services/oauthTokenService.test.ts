/**
 * Unit tests for the server-side OAuth token service.
 * Covers token retrieval, in-memory caching, environment validation, and
 * upstream failure handling. fetchWithTimeout is mocked so no real network
 * calls are made, and the module is re-imported per test to reset its cache.
 */

jest.mock("../lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
}));

const OLD_ENV = process.env;

/** Loads a fresh copy of the service plus its mocked fetch dependency. */
async function loadService(): Promise<{
  getAccessToken: () => Promise<string>;
  fetchMock: jest.Mock;
}> {
  const { fetchWithTimeout } = await import("../lib/fetchWithTimeout");
  const service = await import("./oauthTokenService");
  return {
    getAccessToken: service.getAccessToken,
    fetchMock: fetchWithTimeout as unknown as jest.Mock,
  };
}

/** Builds a successful OAuth token response. */
function tokenResponse(accessToken = "test-token", expiresIn: string | number = "3599"): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({ access_token: accessToken, expires_in: expiresIn }),
  } as unknown as Response;
}

describe("oauthTokenService.getAccessToken", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...OLD_ENV,
      SIGNS_OAUTH_TOKEN_URL: "https://oauth.example.com/token",
      SIGNS_APIGEE_CLIENT_ID: "client-id",
      SIGNS_APIGEE_CLIENT_SECRET: "client-secret",
    };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("fetches and returns an access token", async () => {
    const { getAccessToken, fetchMock } = await loadService();
    fetchMock.mockResolvedValue(tokenResponse("abc123"));

    await expect(getAccessToken()).resolves.toBe("abc123");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sends a client_credentials grant to the configured token URL", async () => {
    const { getAccessToken, fetchMock } = await loadService();
    fetchMock.mockResolvedValue(tokenResponse());

    await getAccessToken();

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://oauth.example.com/token");
    expect(options.method).toBe("POST");
    expect(String(options.body)).toContain("grant_type=client_credentials");
    expect(String(options.body)).toContain("client_id=client-id");
  });

  it("caches the token and does not refetch on the second call", async () => {
    const { getAccessToken, fetchMock } = await loadService();
    fetchMock.mockResolvedValue(tokenResponse("cached-token"));

    const first = await getAccessToken();
    const second = await getAccessToken();

    expect(first).toBe("cached-token");
    expect(second).toBe("cached-token");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws when SIGNS_OAUTH_TOKEN_URL is missing", async () => {
    delete process.env.SIGNS_OAUTH_TOKEN_URL;
    const { getAccessToken } = await loadService();
    await expect(getAccessToken()).rejects.toThrow(/SIGNS_OAUTH_TOKEN_URL/);
  });

  it("throws when client credentials are missing", async () => {
    delete process.env.SIGNS_APIGEE_CLIENT_ID;
    const { getAccessToken } = await loadService();
    await expect(getAccessToken()).rejects.toThrow(/SIGNS_APIGEE_CLIENT_ID/);
  });

  it("throws when the upstream responds with a non-ok status", async () => {
    const { getAccessToken, fetchMock } = await loadService();
    fetchMock.mockResolvedValue({ ok: false, status: 401 } as Response);
    await expect(getAccessToken()).rejects.toThrow(/status 401/);
  });

  it("throws when the response lacks an access_token", async () => {
    const { getAccessToken, fetchMock } = await loadService();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ expires_in: "3599" }),
    } as unknown as Response);
    await expect(getAccessToken()).rejects.toThrow(/access_token/);
  });
});
