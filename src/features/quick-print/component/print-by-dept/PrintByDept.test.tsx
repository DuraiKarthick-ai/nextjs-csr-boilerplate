import React from "react";
import { render, screen } from "@testing-library/react";
import PrintByDept from "./PrintByDept";

describe("PrintByDept", () => {
  it("renders department, category, quantity, and size fields", () => {
    render(<PrintByDept />);
    expect(screen.getByPlaceholderText("Enter Department #")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Category Code")).toBeInTheDocument();
    expect(screen.getByText("Print Only Items With On Hand")).toBeInTheDocument();
  });
});
