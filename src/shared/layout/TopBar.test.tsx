/**
 * Unit tests for the TopBar layout component.
 * Covers rendering of the search input and view-toggle controls.
 */

import { render, screen } from "@testing-library/react";
import TopBar from "./TopBar";

describe("TopBar", () => {
  it("renders the search input", () => {
    render(<TopBar />);
    expect(screen.getByPlaceholderText("Search Apps, Files ETC")).toBeInTheDocument();
  });

  it("renders the view-toggle and expand controls", () => {
    render(<TopBar />);
    expect(screen.getByRole("button", { name: "Toggle view" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expand" })).toBeInTheDocument();
  });

  it("renders without crashing when given optional props", () => {
    render(<TopBar userName="Roshini" onSearch={jest.fn()} />);
    expect(screen.getByPlaceholderText("Search Apps, Files ETC")).toBeInTheDocument();
  });
});
