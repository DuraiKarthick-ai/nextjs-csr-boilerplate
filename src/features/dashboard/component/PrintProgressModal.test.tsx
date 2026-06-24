/**
 * Unit tests for PrintProgressModal.
 * Covers the closed state, the printer/tray selection phase, progress display,
 * error and success states, and the action-button callbacks.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import PrintProgressModal from "./PrintProgressModal";
import type { PrintStep } from "../hooks/useDashboardPrint";

const steps: PrintStep[] = [
  { label: "Step 1", status: "done" },
  { label: "Step 2", status: "active" },
];

describe("PrintProgressModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <PrintProgressModal
        isOpen={false}
        batchName="B"
        mode="print"
        steps={[]}
        error={null}
        isDone={false}
        onClose={jest.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the selection phase with printer/tray and Start Print", () => {
    const onStartPrint = jest.fn();
    const onStartDownload = jest.fn();
    render(
      <PrintProgressModal
        isOpen
        batchName="Batch A"
        mode="print"
        steps={[]}
        error={null}
        isDone={false}
        onClose={jest.fn()}
        printers={["P1", "P2"]}
        trays={["T1"]}
        selectedPrinter="P1"
        selectedTray="T1"
        isLoadingPrinters={false}
        onStartPrint={onStartPrint}
        onStartDownload={onStartDownload}
        isPrintStarted={false}
      />
    );

    expect(screen.getByText("Print")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start print job" }));
    expect(onStartPrint).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Download as PDF" }));
    expect(onStartDownload).toHaveBeenCalled();
  });

  it("fires printer and tray change handlers", () => {
    const onPrinterChange = jest.fn();
    const onTrayChange = jest.fn();
    render(
      <PrintProgressModal
        isOpen
        batchName="B"
        mode="print"
        steps={[]}
        error={null}
        isDone={false}
        onClose={jest.fn()}
        printers={["P1", "P2"]}
        trays={["T1", "T2"]}
        selectedPrinter="P1"
        selectedTray="T1"
        isLoadingPrinters={false}
        onPrinterChange={onPrinterChange}
        onTrayChange={onTrayChange}
        onStartPrint={jest.fn()}
        isPrintStarted={false}
      />
    );

    fireEvent.change(screen.getByLabelText("Printer"), { target: { value: "P2" } });
    expect(onPrinterChange).toHaveBeenCalledWith("P2");
    fireEvent.change(screen.getByLabelText("Tray"), { target: { value: "T2" } });
    expect(onTrayChange).toHaveBeenCalledWith("T2");
  });

  it("renders the progress bar while printing", () => {
    render(
      <PrintProgressModal
        isOpen
        batchName="B"
        mode="print"
        steps={steps}
        error={null}
        isDone={false}
        onClose={jest.fn()}
      />
    );
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "50");
    expect(screen.getByText("Printing…")).toBeInTheDocument();
  });

  it("shows an error state", () => {
    render(
      <PrintProgressModal
        isOpen
        batchName="B"
        mode="print"
        steps={steps}
        error="Boom"
        isDone={false}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Boom");
    expect(screen.getByText("Print Failed")).toBeInTheDocument();
  });

  it("shows a success state with printer/tray detail", () => {
    render(
      <PrintProgressModal
        isOpen
        batchName="B"
        mode="print"
        steps={steps}
        error={null}
        isDone
        successInfo={{ printer: "P1", tray: "T1", pageCount: 3 }}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText("Print Complete")).toBeInTheDocument();
    expect(screen.getByText(/3 pages printed successfully on P1/)).toBeInTheDocument();
  });

  it("invokes onClose from the footer button", () => {
    const onClose = jest.fn();
    render(
      <PrintProgressModal
        isOpen
        batchName="B"
        mode="download"
        steps={steps}
        error={null}
        isDone
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Close print progress dialog" }));
    expect(onClose).toHaveBeenCalled();
  });
});
