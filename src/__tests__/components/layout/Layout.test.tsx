import React from "react";
import { render, screen } from "@testing-library/react";
import Layout from "@/components/layout/layout";
import type { ViewType } from "@/types";

jest.mock("@/components/sideNav/sideNav", () => {
  const MockSideNav = () => <nav data-testid="side-nav" />;
  MockSideNav.displayName = "MockSideNav";
  return MockSideNav;
});

jest.mock("@/components/dashboard/dashboard", () => {
  const MockDashboard = () => <div data-testid="dashboard" />;
  MockDashboard.displayName = "MockDashboard";
  return MockDashboard;
});

jest.mock("@/components/quickSign/quickSign", () => {
  const MockQuickSign = () => <div data-testid="quick-sign" />;
  MockQuickSign.displayName = "MockQuickSign";
  return MockQuickSign;
});

jest.mock("@/components/customPrint/customPrint", () => {
  const MockCustomPrint = () => <div data-testid="custom-print" />;
  MockCustomPrint.displayName = "MockCustomPrint";
  return MockCustomPrint;
});

jest.mock("@/components/signWorklist/signWorklist", () => {
  const MockSignWorklist = () => <div data-testid="sign-worklist" />;
  MockSignWorklist.displayName = "MockSignWorklist";
  return MockSignWorklist;
});

describe("Layout", () => {
  const mockOnNavigate = jest.fn();

  const defaultProps = {
    open: true,
    children: null,
    onNavigate: mockOnNavigate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Verifies that the SideNav is always rendered regardless of the active view.
   */
  it("always renders SideNav", () => {
    // Arrange
    render(<Layout {...defaultProps} activeView="dashboard" />);

    // Act (component renders on mount)

    // Assert
    expect(screen.getByTestId("side-nav")).toBeInTheDocument();
  });

  /**
   * Verifies that Dashboard is the only content rendered when activeView is 'dashboard'.
   */
  it("renders only Dashboard when activeView is 'dashboard'", () => {
    // Arrange
    render(<Layout {...defaultProps} activeView="dashboard" />);

    // Act (component renders on mount)

    // Assert
    expect(screen.getByTestId("dashboard")).toBeInTheDocument();
    expect(screen.queryByTestId("quick-sign")).not.toBeInTheDocument();
    expect(screen.queryByTestId("custom-print")).not.toBeInTheDocument();
  });

  /**
   * Verifies that QuickSign is the only content rendered when activeView is 'quickSign'.
   */
  it("renders only QuickSign when activeView is 'quickSign'", () => {
    // Arrange
    render(<Layout {...defaultProps} activeView="quickSign" />);

    // Act (component renders on mount)

    // Assert
    expect(screen.getByTestId("quick-sign")).toBeInTheDocument();
    expect(screen.queryByTestId("dashboard")).not.toBeInTheDocument();
    expect(screen.queryByTestId("custom-print")).not.toBeInTheDocument();
  });

  /**
   * Verifies that CustomPrint is the only content rendered when activeView is 'customSign'.
   */
  it("renders only CustomPrint when activeView is 'customSign'", () => {
    // Arrange
    render(<Layout {...defaultProps} activeView="customSign" />);

    // Act (component renders on mount)

    // Assert
    expect(screen.getByTestId("custom-print")).toBeInTheDocument();
    expect(screen.queryByTestId("dashboard")).not.toBeInTheDocument();
    expect(screen.queryByTestId("quick-sign")).not.toBeInTheDocument();
  });

  /**
   * Verifies that views without a dedicated component (signWorklist, signAudit)
   * render no content panel — just the sidebar — until those screens are implemented.
   */
  it.each(["signWorklist", "signAudit"] as ViewType[])(
    "renders no content panel for unimplemented view '%s'",
    (view) => {
      // Arrange
      render(<Layout {...defaultProps} activeView={view} />);

      // Act (component renders on mount)

      // Assert
      expect(screen.queryByTestId("dashboard")).not.toBeInTheDocument();
      expect(screen.queryByTestId("quick-sign")).not.toBeInTheDocument();
      expect(screen.queryByTestId("custom-print")).not.toBeInTheDocument();
    },
  );

  /**
   * Verifies that the sidebar is collapsed when open prop is false.
   */
  it("renders the sidebar in closed state when open is false", () => {
    // Arrange
    render(<Layout {...defaultProps} activeView="dashboard" open={false} />);

    // Act
    const sidebar = screen.getByRole("complementary");
    const layoutShell = sidebar.parentElement;

    // Assert
    expect(layoutShell).not.toBeNull();
    expect(layoutShell?.className).toMatch(/navFolded/);
  });
});
