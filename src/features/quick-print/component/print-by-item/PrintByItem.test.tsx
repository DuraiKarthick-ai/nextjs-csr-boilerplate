import React from "react";
import { render, screen } from "@testing-library/react";
import PrintByItem from "./PrintByItem";

describe("PrintByItem", () => {
  it("renders size, item UPC, and quantity fields", () => {
    render(<PrintByItem />);
    expect(screen.getByPlaceholderText("Enter or Scan Item # / UPC")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Quantity")).toBeInTheDocument();
    expect(screen.getByText("Quick Sign Print List")).toBeInTheDocument();
  });
});
