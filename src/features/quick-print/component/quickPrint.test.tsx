import React from "react";
import { render, screen } from "@testing-library/react";
import QuickPrintScreen from "./quickPrint";

describe("QuickPrintScreen", () => {
  it("renders quick print title", () => {
    // Arrange

    // Act
    render(<QuickPrintScreen />);

    // Assert
    expect(screen.getByText("Signs Dashboard - Quick Sign Print")).toBeInTheDocument();
  });
});
