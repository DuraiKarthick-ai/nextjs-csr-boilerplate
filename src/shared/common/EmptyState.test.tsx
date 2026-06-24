/**
 * Unit tests for the EmptyState component.
 * Covers default rendering, custom title/description, and an optional action.
 */

import { render, screen } from "@testing-library/react";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("renders a polite status region", () => {
    render(<EmptyState />);
    const region = screen.getByRole("status");
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute("aria-live", "polite");
  });

  it("renders a custom title and description", () => {
    render(<EmptyState title="No batches" description="Nothing to show yet" />);
    expect(screen.getByText("No batches")).toBeInTheDocument();
    expect(screen.getByText("Nothing to show yet")).toBeInTheDocument();
  });

  it("renders an optional action element", () => {
    render(<EmptyState title="Empty" action={<button>Refresh</button>} />);
    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
  });
});
