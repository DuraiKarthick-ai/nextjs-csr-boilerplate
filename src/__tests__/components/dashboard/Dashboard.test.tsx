import React from "react";
import { render, screen } from "@testing-library/react";
import Dashboard from "@/components/dashboard/dashboard";

jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = "MockLink";
  return MockLink;
});

jest.mock("@/hooks/useDashboard", () => ({
  useDashboard: () => ({
    data: {
      stats: [],
      activities: [],
      lastUpdated: "Last Updated 10:00 AM - 04/02/26",
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock("@/hooks/useTableScroll", () => ({
  useTableScroll: () => ({ visibleCount: 10, scrollRef: { current: null } }),
}));

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Verifies the Quick Print link navigates to /quickSign.
   */
  it("renders Quick Print link pointing to /quickSign", () => {
    // Arrange & Act
    render(<Dashboard />);

    // Assert
    const quickPrintLink = screen.getByText("Quick Print").closest("a");
    expect(quickPrintLink).toHaveAttribute("href", "/quickSign");
  });

  /**
   * Verifies the Custom Sign link navigates to /customSign.
   */
  it("renders Custom Sign link pointing to /customSign", () => {
    // Arrange & Act
    render(<Dashboard />);

    // Assert
    const customSignLink = screen.getByText("Custom Sign").closest("a");
    expect(customSignLink).toHaveAttribute("href", "/customSign");
  });
});
