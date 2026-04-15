import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PrintSuccessDialog from "@/components/printSuccessDialog/printSuccessDialog";

describe("PrintSuccessDialog", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Verifies title/message/confirm text render when the dialog is open.
   */
  it("renders success content when open", () => {
    // Arrange
    render(
      <PrintSuccessDialog
        open={true}
        onClose={onClose}
        title="Printed Successfully"
        message="5 pages printed in Xerox Phaser"
        confirmLabel="OK"
      />,
    );

    // Act (render only)

    // Assert
    expect(screen.getByRole("heading", { name: "Printed Successfully" })).toBeInTheDocument();
    expect(screen.getByText("5 pages printed in Xerox Phaser")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
  });

  /**
   * Verifies close icon invokes onClose callback.
   */
  it("calls onClose when close icon button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <PrintSuccessDialog
        open={true}
        onClose={onClose}
        title="Printed Successfully"
        message="5 pages printed in Xerox Phaser"
      />,
    );

    // Act
    await user.click(screen.getByRole("button", { name: /close success dialog/i }));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  /**
   * Verifies the primary action button invokes onClose callback.
   */
  it("calls onClose when confirm button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <PrintSuccessDialog
        open={true}
        onClose={onClose}
        title="Printed Successfully"
        message="5 pages printed in Xerox Phaser"
        confirmLabel="Close"
      />,
    );

    // Act
    await user.click(screen.getByRole("button", { name: "Close" }));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
