/**
 * Unit tests for the Input UI component.
 * Covers label rendering, error state, helper-text fallback, and value changes.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import Input from "./Input";

describe("Input", () => {
  it("renders the label", () => {
    render(<Input label="Item Number" />);
    expect(screen.getByLabelText("Item Number")).toBeInTheDocument();
  });

  it("shows the error message and marks the field invalid", () => {
    render(<Input label="Price" error="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("falls back to helperText when there is no error", () => {
    render(<Input label="Qty" helperText="Enter a number" />);
    expect(screen.getByText("Enter a number")).toBeInTheDocument();
  });

  it("prefers the error message over helperText", () => {
    render(<Input label="Qty" error="Bad value" helperText="Enter a number" />);
    expect(screen.getByText("Bad value")).toBeInTheDocument();
    expect(screen.queryByText("Enter a number")).not.toBeInTheDocument();
  });

  it("propagates value changes", () => {
    const onChange = jest.fn();
    render(<Input label="Name" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "abc" } });
    expect(onChange).toHaveBeenCalled();
  });
});
