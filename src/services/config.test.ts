/**
 * Unit tests for the application API configuration module.
 * Because the exported constants are computed at module load, each test
 * resets the module registry and sets the relevant env vars before importing.
 */

const OLD_ENV = process.env;

describe("config", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_TIMEOUT_MS;
    delete process.env.SIGNS_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_DEFAULT_STORE_ID;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe("API_BASE_URL", () => {
    it("uses NEXT_PUBLIC_API_BASE_URL when set", async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "https://signs.example.com";
      const { API_BASE_URL } = await import("./config");
      expect(API_BASE_URL).toBe("https://signs.example.com");
    });

    it("falls back to window.location.origin when the env var is unset", async () => {
      // jsdom provides window with a default origin of http://localhost.
      const { API_BASE_URL } = await import("./config");
      expect(API_BASE_URL).toBe(window.location.origin);
    });
  });

  describe("API_TIMEOUT_MS", () => {
    it("defaults to 10000 when unset", async () => {
      const { API_TIMEOUT_MS } = await import("./config");
      expect(API_TIMEOUT_MS).toBe(10000);
    });

    it("reads the configured value", async () => {
      process.env.NEXT_PUBLIC_API_TIMEOUT_MS = "5000";
      const { API_TIMEOUT_MS } = await import("./config");
      expect(API_TIMEOUT_MS).toBe(5000);
    });
  });

  describe("SIGNS_API_BASE_URL", () => {
    it("defaults to an empty string when unset", async () => {
      const { SIGNS_API_BASE_URL } = await import("./config");
      expect(SIGNS_API_BASE_URL).toBe("");
    });

    it("reads the configured value", async () => {
      process.env.SIGNS_API_BASE_URL = "https://ecs.example.com/api";
      const { SIGNS_API_BASE_URL } = await import("./config");
      expect(SIGNS_API_BASE_URL).toBe("https://ecs.example.com/api");
    });
  });

  describe("DEFAULT_STORE_ID", () => {
    it("defaults to '106' when unset", async () => {
      const { DEFAULT_STORE_ID } = await import("./config");
      expect(DEFAULT_STORE_ID).toBe("106");
    });

    it("reads the configured value", async () => {
      process.env.NEXT_PUBLIC_DEFAULT_STORE_ID = "106";
      const { DEFAULT_STORE_ID } = await import("./config");
      expect(DEFAULT_STORE_ID).toBe("106");
    });
  });
});
