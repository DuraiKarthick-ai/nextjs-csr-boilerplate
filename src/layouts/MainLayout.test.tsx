/**
 * Unit tests for MainLayout.
 * Verifies the shell composes Header + Sidebar around the page content,
 * all inside the AppProvider context.
 */

import { render, screen } from "@testing-library/react";
import MainLayout from "./MainLayout";

describe("MainLayout", () => {
  it("renders the page content", () => {
    render(
      <MainLayout>
        <p>Page body</p>
      </MainLayout>
    );
    expect(screen.getByText("Page body")).toBeInTheDocument();
  });

  it("composes the header and sidebar shell", () => {
    render(
      <MainLayout>
        <span>x</span>
      </MainLayout>
    );
    // Header content
    expect(screen.getByText("Warehouse 110")).toBeInTheDocument();
    // Sidebar content
    expect(screen.getByRole("button", { name: "My Apps" })).toBeInTheDocument();
  });
});
