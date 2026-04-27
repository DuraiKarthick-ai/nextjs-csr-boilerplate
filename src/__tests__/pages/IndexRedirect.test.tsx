import React from "react";
import { render, screen } from "@testing-library/react";
import IndexRedirect from "@/pages/index";

const mockReplace = jest.fn();

jest.mock("next/router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    query: {},
    pathname: "/",
    asPath: "/",
    isReady: true,
    push: jest.fn(),
  }),
}));

describe("Index page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Verifies that landing on / triggers a redirect to /dashboard.
   */
  it("redirects to /dashboard on mount", () => {
    // Arrange

    // Act
    render(<IndexRedirect />);

    // Assert
    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  /**
   * Verifies the root page renders a health-check-safe response with a fallback link.
   */
  it("renders fallback content while redirecting", () => {
    // Arrange

    // Act
    render(<IndexRedirect />);

    // Assert
    expect(screen.getByRole("heading", { name: "Signs" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByText("Redirecting to the dashboard.")).toBeInTheDocument();
  });
});
