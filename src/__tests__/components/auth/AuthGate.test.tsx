import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthGate from "@/components/auth/AuthGate";
import type { PortalAuthResult } from "@/hooks/usePortalAuth";

jest.mock("@/hooks/usePortalAuth", () => ({
  usePortalAuth: jest.fn(),
  PORTAL_LOGIN_URL: "http://localhost:3001",
}));

import { usePortalAuth } from "@/hooks/usePortalAuth";
const mockUsePortalAuth = usePortalAuth as jest.MockedFunction<typeof usePortalAuth>;

/** Base auth state — represents a fully authenticated user. */
const authenticatedAuth: PortalAuthResult = {
  isStandalone: false,
  isResolvingCtx: false,
  isAuthenticated: true,
  isLoading: false,
  user: { sub: "u1", email: "test@costco.com", name: "Test User", roles: ["user"] },
  error: null,
  login: jest.fn(),
  logout: jest.fn(async () => {}),
  getAccessToken: jest.fn(async () => "token"),
  refreshSession: jest.fn(async () => true),
};

describe("AuthGate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_AUTH_REQUIRED;
  });

  /**
   * OWASP A07: When auth is disabled via env (NEXT_PUBLIC_AUTH_REQUIRED=false),
   * children must be rendered immediately without any auth checks.
   */
  describe("auth bypass (NEXT_PUBLIC_AUTH_REQUIRED=false)", () => {
    it("renders children unconditionally without checking auth state", () => {
      // Arrange
      process.env.NEXT_PUBLIC_AUTH_REQUIRED = "false";
      mockUsePortalAuth.mockReturnValue({ ...authenticatedAuth, isAuthenticated: false });

      // Act
      render(<AuthGate><p>Protected content</p></AuthGate>);

      // Assert
      expect(screen.getByText("Protected content")).toBeInTheDocument();
    });
  });

  /**
   * While the hook is still resolving the federated portal context,
   * a "Connecting to Portal…" spinner should be shown.
   */
  describe("resolving context state", () => {
    it("shows connecting spinner while portal context is resolving", () => {
      // Arrange
      mockUsePortalAuth.mockReturnValue({ ...authenticatedAuth, isResolvingCtx: true });

      // Act
      render(<AuthGate><p>Protected</p></AuthGate>);

      // Assert
      expect(screen.getByRole("status")).toHaveTextContent("Connecting to Portal…");
      expect(screen.queryByText("Protected")).not.toBeInTheDocument();
    });
  });

  /**
   * When running standalone (no portal host), users must be directed
   * to the Portal application.
   */
  describe("standalone mode", () => {
    it("shows 'Authentication Required' screen with portal link", () => {
      // Arrange
      mockUsePortalAuth.mockReturnValue({
        ...authenticatedAuth,
        isResolvingCtx: false,
        isStandalone: true,
      });

      // Act
      render(<AuthGate><p>Protected</p></AuthGate>);

      // Assert
      expect(screen.getByRole("heading", { name: /authentication required/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /go to portal/i })).toHaveAttribute(
        "href",
        "http://localhost:3001",
      );
      expect(screen.queryByText("Protected")).not.toBeInTheDocument();
    });

    it("uses portalUrl prop when provided instead of default PORTAL_LOGIN_URL", () => {
      // Arrange
      mockUsePortalAuth.mockReturnValue({
        ...authenticatedAuth,
        isResolvingCtx: false,
        isStandalone: true,
      });

      // Act
      render(<AuthGate portalUrl="http://custom-portal:8080"><p>Protected</p></AuthGate>);

      // Assert
      expect(screen.getByRole("link", { name: /go to portal/i })).toHaveAttribute(
        "href",
        "http://custom-portal:8080",
      );
    });
  });

  /**
   * When the user is not authenticated (portal resolved but session absent),
   * a login prompt must be shown.
   */
  describe("unauthenticated state", () => {
    it("shows 'Please Log In' screen when not authenticated", () => {
      // Arrange
      mockUsePortalAuth.mockReturnValue({
        ...authenticatedAuth,
        isResolvingCtx: false,
        isStandalone: false,
        isAuthenticated: false,
        isLoading: false,
      });

      // Act
      render(<AuthGate><p>Protected</p></AuthGate>);

      // Assert
      expect(screen.getByRole("heading", { name: /please log in/i })).toBeInTheDocument();
      expect(screen.queryByText("Protected")).not.toBeInTheDocument();
    });

    it("calls auth.login when 'Log in via Portal' button is clicked", async () => {
      // Arrange
      const loginFn = jest.fn();
      mockUsePortalAuth.mockReturnValue({
        ...authenticatedAuth,
        isResolvingCtx: false,
        isStandalone: false,
        isAuthenticated: false,
        isLoading: false,
        login: loginFn,
      });
      render(<AuthGate><p>Protected</p></AuthGate>);

      // Act
      await userEvent.click(screen.getByRole("button", { name: /log in via portal/i }));

      // Assert
      expect(loginFn).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * While the auth session is being validated, a loading spinner is shown.
   */
  describe("loading state", () => {
    it("shows 'Checking authentication…' spinner while auth is loading", () => {
      // Arrange
      mockUsePortalAuth.mockReturnValue({
        ...authenticatedAuth,
        isResolvingCtx: false,
        isStandalone: false,
        isAuthenticated: false,
        isLoading: true,
      });

      // Act
      render(<AuthGate><p>Protected</p></AuthGate>);

      // Assert
      expect(screen.getByRole("status")).toHaveTextContent("Checking authentication…");
      expect(screen.queryByText("Protected")).not.toBeInTheDocument();
    });
  });

  /**
   * When fully authenticated, children must be rendered without any wrappers.
   */
  describe("authenticated state", () => {
    it("renders children when user is authenticated", () => {
      // Arrange
      mockUsePortalAuth.mockReturnValue(authenticatedAuth);

      // Act
      render(<AuthGate><p>Dashboard content</p></AuthGate>);

      // Assert
      expect(screen.getByText("Dashboard content")).toBeInTheDocument();
    });
  });
});
