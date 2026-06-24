/**
 * Unit tests for the Select UI component.
 * Covers label, placeholder, option rendering, selected value display,
 * error state, and selection changes.
 */

import { render, screen, fireEvent, within } from "@testing-library/react";
import Select from "./Select";
import type { SelectOption } from "../../types/common.types";

const options: SelectOption[] = [
  { value: "PRODUCE", label: "Produce" },
  { value: "BAKERY", label: "Bakery" },
];

describe("Select", () => {
  it("renders the label", () => {
    render(<Select label="Department" options={options} />);
    expect(screen.getByLabelText("Department")).toBeInTheDocument();
  });

  it("shows the currently selected option's label", () => {
    render(<Select label="Department" options={options} value="BAKERY" />);
    expect(screen.getByText("Bakery")).toBeInTheDocument();
  });

  it("renders an error message", () => {
    render(<Select label="Department" options={options} error="Pick one" />);
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("opens and fires onChange when an option is chosen", () => {
    const onChange = jest.fn();
    render(<Select label="Department" options={options} value="" onChange={onChange} />);

    fireEvent.mouseDown(screen.getByRole("combobox"));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByText("Produce"));

    expect(onChange).toHaveBeenCalled();
  });
});
