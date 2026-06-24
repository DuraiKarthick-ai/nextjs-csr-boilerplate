/**
 * Unit tests for the Header layout component.
 * Rendered inside AppProvider (Header uses useAppStore). Covers branding,
 * the sidebar toggle, and the language menu open/select flow.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import Header from "./Header";
import { AppProvider } from "../../store/useAppStore";

function renderHeader() {
  return render(
    <AppProvider>
      <Header />
    </AppProvider>
  );
}

describe("Header", () => {
  it("renders the warehouse label and user greeting", () => {
    renderHeader();
    expect(screen.getByText("Warehouse 110")).toBeInTheDocument();
    expect(screen.getByText("Welcome, Roshini")).toBeInTheDocument();
  });

  it("toggles the sidebar without crashing", () => {
    renderHeader();
    const toggle = screen.getByRole("button", { name: /sidebar/i });
    expect(() => fireEvent.click(toggle)).not.toThrow();
  });

  it("opens the language menu and switches language", () => {
    renderHeader();
    // Default language button shows English.
    const langButton = screen.getByRole("button", { name: /English/ });
    fireEvent.click(langButton);

    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Français" }));
    expect(screen.getByRole("button", { name: /Français/ })).toBeInTheDocument();

    // Switch back to English so global i18n state does not leak to other tests.
    fireEvent.click(screen.getByRole("button", { name: /Français/ }));
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect(screen.getByRole("button", { name: /English/ })).toBeInTheDocument();
  });
});
