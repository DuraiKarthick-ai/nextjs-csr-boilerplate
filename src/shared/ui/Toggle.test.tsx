/**
 * Unit tests for the Toggle UI component.
 * Covers label/description rendering, change callback, and disabled state.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import Toggle from "./Toggle";

describe("Toggle", () => {
  it("renders the label", () => {
    render(<Toggle checked={false} onChange={jest.fn()} label="Enable" />);
    expect(screen.getByLabelText("Enable")).toBeInTheDocument();
  });

  it("renders an optional description", () => {
    render(
      <Toggle checked={false} onChange={jest.fn()} label="Enable" description="Turns it on" />
    );
    expect(screen.getByText("Turns it on")).toBeInTheDocument();
  });

  it("reflects the checked state", () => {
    render(<Toggle checked onChange={jest.fn()} label="On" />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onChange with the new boolean value", () => {
    const onChange = jest.fn();
    render(<Toggle checked={false} onChange={onChange} label="Flip" />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("renders a disabled switch when disabled", () => {
    render(<Toggle checked={false} onChange={jest.fn()} label="Locked" disabled />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });
});
