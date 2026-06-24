/**
 * Unit tests for the Loader component.
 * Covers the status role, accessible label override, and size variants.
 */

import { render, screen } from "@testing-library/react";
import Loader from "./Loader";

describe("Loader", () => {
  it("renders a status region", () => {
    render(<Loader />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses an explicit label when provided", () => {
    render(<Loader label="Fetching batches" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Fetching batches");
    expect(screen.getByText("Fetching batches")).toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)("renders the %s size variant", (size) => {
    render(<Loader label="loading" size={size} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
