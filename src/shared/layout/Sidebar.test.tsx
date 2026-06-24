/**
 * Unit tests for the Sidebar navigation component.
 * Covers nav rendering, submenu toggle, federation-mode navigation callback,
 * and the My Apps action.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "./Sidebar";

describe("Sidebar", () => {
  it("renders the Sign Management menu and My Apps button", () => {
    render(<Sidebar />);
    expect(screen.getByText("Signs Management")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "My Apps" })).toBeInTheDocument();
  });

  it("toggles the submenu open state", () => {
    render(<Sidebar />);
    const menuButton = screen.getByRole("button", { name: /Signs Management/i });
    const initial = menuButton.getAttribute("aria-expanded");
    fireEvent.click(menuButton);
    expect(menuButton.getAttribute("aria-expanded")).not.toBe(initial);
  });

  it("invokes onNavigateHref instead of navigating in federation mode", () => {
    const onNavigateHref = jest.fn();
    render(<Sidebar onNavigateHref={onNavigateHref} />);

    // Open submenu then click the first nav link.
    fireEvent.click(screen.getByRole("button", { name: /Signs Management/i }));
    fireEvent.click(screen.getByText("Signs Dashboard"));

    expect(onNavigateHref).toHaveBeenCalled();
  });

  it("calls onMyApps when the My Apps button is clicked", () => {
    const onMyApps = jest.fn();
    render(<Sidebar onMyApps={onMyApps} />);
    fireEvent.click(screen.getByRole("button", { name: "My Apps" }));
    expect(onMyApps).toHaveBeenCalled();
  });
});
