import React from "react";
import { render } from "@testing-library/react";
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
    // Arrange & Act
    render(<IndexRedirect />);

    // Assert
    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  /**
   * Verifies the redirect page renders nothing visible.
   */
  it("renders nothing while redirecting", () => {
    // Arrange & Act
    const { container } = render(<IndexRedirect />);

    // Assert
    expect(container.innerHTML).toBe("");
  });
});
