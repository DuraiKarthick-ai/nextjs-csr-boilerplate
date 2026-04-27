import React from "react";
import { render, screen } from "@testing-library/react";
import IndexPage from "@/pages/index";

describe("Index page", () => {
  /**
   * Verifies that landing on / renders a minimal 200-friendly response payload.
   */
  it("renders minimal root response", () => {
    // Arrange

    // Act
    render(<IndexPage />);

    // Assert
    expect(screen.getByLabelText("root-status")).toHaveTextContent("ok");
  });
});
