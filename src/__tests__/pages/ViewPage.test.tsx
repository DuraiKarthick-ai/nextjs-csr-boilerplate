import React from "react";
import { render, screen } from "@testing-library/react";
import SignsViewPage from "@/pages/[view]";

/* ── Mock next/router ─────────────────────────────────────────────── */
const mockPush = jest.fn();
let mockQuery: Record<string, string> = { view: "dashboard" };

jest.mock("next/router", () => ({
  useRouter: () => ({
    query: mockQuery,
    push: mockPush,
    replace: jest.fn(),
    pathname: "/[view]",
    asPath: `/${mockQuery.view ?? "dashboard"}`,
    isReady: true,
  }),
}));

/* ── Mock child components to isolate page logic ──────────────────── */
jest.mock("@/components/auth/AuthGate", () => {
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
  return (loader: () => Promise<{ default: React.ComponentType }>) => {
    const LazyComponent = React.lazy(loader);
    const DynamicMock = (props: Record<string, unknown>) => (
      <React.Suspense fallback={null}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
    DynamicMock.displayName = "DynamicMock";
    return DynamicMock;
  };
});

describe("[view] page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = { view: "dashboard" };
  });

  /**
   * Verifies the page renders all shell components (AuthGate, Header, Layout).
   */
  it("renders AuthGate, Header, and Layout", () => {
    // Arrange
    mockQuery = { view: "dashboard" };

    // Act
    render(<SignsViewPage />);

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
    mockQuery = { view: "customSign" };

    // Act
    render(<SignsViewPage />);

    // Assert
    expect(screen.getByTestId("layout")).toHaveAttribute("data-active-view", "customSign");
  });

  /**
   * Verifies that an invalid view parameter falls back to 'dashboard'.
   */
  it("falls back to 'dashboard' for an invalid view parameter", () => {
    // Arrange
    mockQuery = { view: "nonexistent" };

    // Act
    render(<SignsViewPage />);

    // Assert
    expect(screen.getByTestId("layout")).toHaveAttribute("data-active-view", "dashboard");
  });

  /**
   * Verifies that onNavigate calls router.push with the correct path.
   */
  it("calls router.push when onNavigate is triggered", async () => {
    // Arrange
    const user = (await import("@testing-library/user-event")).default.setup();
    render(<SignsViewPage />);

    // Act
    await user.click(screen.getByTestId("nav-trigger"));

    // Assert
    expect(mockPush).toHaveBeenCalledWith("/quickSign");
  });
});
