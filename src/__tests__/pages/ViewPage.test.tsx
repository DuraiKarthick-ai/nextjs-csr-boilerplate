import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignsViewPage, { getServerSideProps } from "@/pages/[view]";

/* ── Mock child components to isolate page logic ──────────────────── */
jest.mock("@/components/auth/authGate", () => {
  const MockAuthGate = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-gate">{children}</div>
  );
  MockAuthGate.displayName = "MockAuthGate";
  return MockAuthGate;
});

jest.mock("@/components/header/header", () => {
  const MockHeader = () => <header data-testid="header" />;
  MockHeader.displayName = "MockHeader";
  return MockHeader;
});

jest.mock("@/components/layout/layout", () => {
  const MockLayout = ({
    activeView,
    onNavigate,
  }: {
    activeView: string;
    onNavigate: (v: string) => void;
  }) => (
    <div data-testid="layout" data-active-view={activeView}>
      <button data-testid="nav-trigger" onClick={() => onNavigate("quickSign")} />
    </div>
  );
  MockLayout.displayName = "MockLayout";
  return MockLayout;
});

/* ── Disable dynamic() SSR wrapper so the mock resolves synchronously ── */
jest.mock("next/dynamic", () => {
  return () => {
    const DynamicMock = ({ children }: { children: React.ReactNode }) => (
      <div data-testid="auth-gate">{children}</div>
    );
    DynamicMock.displayName = "DynamicMock";
    return DynamicMock;
  };
});

/* ── Mock next/router so useRouter() doesn't fail in jsdom ─────────── */
const mockPush = jest.fn();
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
    query: {},
    pathname: "/[view]",
    isReady: true,
  }),
}));

describe("[view] page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  /**
   * Verifies the page renders all shell components (AuthGate, Header, Layout).
   */
  it("renders AuthGate, Header, and Layout", () => {
    // Arrange
    const pageProps = { initialView: "dashboard" as const };
    // Act
    render(<SignsViewPage {...pageProps} />);

    // Assert
    expect(screen.getByTestId("auth-gate")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("layout")).toBeInTheDocument();
  });

  /**
   * Verifies that the activeView passed to Layout matches the URL parameter.
   */
  it("passes the URL view parameter as activeView to Layout", () => {
    // Arrange
    const pageProps = { initialView: "customSign" as const };
    // Act
    render(<SignsViewPage {...pageProps} />);

    // Assert
    expect(screen.getByTestId("layout")).toHaveAttribute("data-active-view", "customSign");
  });

  /**
   * Verifies that an invalid view parameter falls back to 'dashboard'.
   */
  it("returns notFound for an invalid view route parameter", async () => {
    // Arrange
    const ctx = {
      params: { view: "nonexistent" },
    } as unknown as Parameters<typeof getServerSideProps>[0];

    // Act
    const result = await getServerSideProps(ctx);

    // Assert
    expect(result).toEqual({ notFound: true });
  });

  /**
   * Verifies that onNavigate calls router.push with the correct path.
   */
  it("navigates to the selected route when onNavigate is triggered", async () => {
    // Arrange
    const user = userEvent.setup();
    const navigateTo = jest.fn();
    render(<SignsViewPage initialView="dashboard" navigateTo={navigateTo} />);

    // Act
    await user.click(screen.getByTestId("nav-trigger"));

    // Assert
    expect(navigateTo).toHaveBeenCalledWith("/quickSign");
  });

  /**
   * Verifies shallow router.push is used for client-side nav (no full page reload).
   */
  it("uses shallow router.push when no navigateTo override is provided", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SignsViewPage initialView="dashboard" />);

    // Act
    await user.click(screen.getByTestId("nav-trigger"));

    // Assert
    expect(mockPush).toHaveBeenCalledWith("/quickSign", undefined, { shallow: true });
  });

  /**
   * Verifies server-side props include the validated route parameter.
   */
  it("returns initialView when route parameter is valid", async () => {
    // Arrange
    const ctx = {
      params: { view: "quickSign" },
    } as unknown as Parameters<typeof getServerSideProps>[0];

    // Act
    const result = await getServerSideProps(ctx);

    // Assert
    expect(result).toEqual({
      props: { initialView: "quickSign" },
    });
  });
});
