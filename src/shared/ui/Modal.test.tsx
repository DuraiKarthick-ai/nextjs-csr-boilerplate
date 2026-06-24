/**
 * Unit tests for the Modal UI component.
 * Covers open/closed rendering, title, body, footer, and close handling.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "./Modal";

describe("Modal", () => {
  it("renders the title and children when open", () => {
    render(
      <Modal isOpen onClose={jest.fn()} title="Confirm">
        <p>Body content</p>
      </Modal>
    );
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("does not render content when closed", () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()} title="Hidden">
        <p>Secret</p>
      </Modal>
    );
    expect(screen.queryByText("Secret")).not.toBeInTheDocument();
  });

  it("renders footer content when provided", () => {
    render(
      <Modal isOpen onClose={jest.fn()} title="WithFooter" footer={<button>OK</button>}>
        <p>x</p>
      </Modal>
    );
    expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
  });

  it("invokes onClose when the close icon is clicked", () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen onClose={onClose} title="Closable">
        <p>x</p>
      </Modal>
    );
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
