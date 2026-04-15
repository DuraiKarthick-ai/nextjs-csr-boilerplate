import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SideNav from "@/components/sideNav/sideNav";
import type { ViewType } from "@/types";

jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("SideNav", () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Verifies that every navigation entry defined in the sidebar is rendered.
   */
  it("renders all four navigation menu items", () => {
    // Arrange
    render(<SideNav activeView="dashboard" onNavigate={mockOnNavigate} />);

    // Act (component renders on mount)

    // Assert
    expect(screen.getByText("Sign Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Quick Sign Print")).toBeInTheDocument();
    expect(screen.getByText("Custom Sign")).toBeInTheDocument();
    expect(screen.getByText("Sign Worklist")).toBeInTheDocument();
  });

  /**
   * Verifies that clicking each nav button fires onNavigate with the correct ViewType key.
   */
  it.each([
    { label: "Sign Dashboard", view: "dashboard" as ViewType },
    { label: "Quick Sign Print", view: "quickSign" as ViewType },
    { label: "Custom Sign", view: "customSign" as ViewType },
    { label: "Sign Worklist", view: "signWorklist" as ViewType },
  ])(
    "calls onNavigate with '$view' when '$label' button is clicked",
    async ({ label, view }) => {
      // Arrange
      const user = userEvent.setup();
      render(<SideNav activeView="dashboard" onNavigate={mockOnNavigate} />);

      // Act
      await user.click(screen.getByRole("button", { name: label }));

      // Assert
      expect(mockOnNavigate).toHaveBeenCalledWith(view);
      expect(mockOnNavigate).toHaveBeenCalledTimes(1);
    },
  );

  /**
   * Verifies that the active style class is applied to the button
   * that matches the current activeView prop.
   */
  it("applies the active style class to the button matching activeView", () => {
    // Arrange
    render(<SideNav activeView="quickSign" onNavigate={mockOnNavigate} />);

    // Act
    const activeButton = screen.getByRole("button", { name: "Quick Sign Print" });

    // Assert
    expect(activeButton).toHaveClass("activeSubItem");
  });

  /**
   * Verifies that non-active nav buttons do not receive the active style class.
   */
  it("does not apply active style class to buttons that are not the activeView", () => {
    // Arrange
    render(<SideNav activeView="dashboard" onNavigate={mockOnNavigate} />);

    // Act
    const inactiveButton = screen.getByRole("button", { name: "Quick Sign Print" });

    // Assert
    expect(inactiveButton).not.toHaveClass("activeSubItem");
  });

  /**
   * Verifies that exactly one button has the active style at any time.
   */
  it("applies the active style class to exactly one button", () => {
    // Arrange
    render(<SideNav activeView="customSign" onNavigate={mockOnNavigate} />);

    // Act
    const allButtons = screen.getAllByRole("button");
    const activeButtons = allButtons.filter((btn) =>
      btn.className.includes("activeSubItem"),
    );

    // Assert
    expect(activeButtons).toHaveLength(1);
    expect(activeButtons[0]).toHaveAccessibleName("Custom Sign");
  });
});
