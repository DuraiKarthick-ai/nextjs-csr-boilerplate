"use client";

import React from "react";
import type { PrintStep, PrintMode, PrintSuccessInfo } from "../hooks/useDashboardPrint";
import styles from "./PrintProgressModal.module.scss";

interface PrintProgressModalProps {
  isOpen: boolean;
  batchName: string;
  mode: PrintMode;
  steps: PrintStep[];
  error: string | null;
  isDone: boolean;
  successInfo?: PrintSuccessInfo | null;
  onClose: () => void;

  /** When provided, renders a printer/tray selection row before the print starts. */
  printers?: string[];
  trays?: string[];
  selectedPrinter?: string;
  selectedTray?: string;
  isLoadingPrinters?: boolean;
  onPrinterChange?: (printer: string) => void;
  onTrayChange?: (tray: string) => void;
  /** When provided, shows a "Start Print" button and hides it once printing starts. */
  onStartPrint?: () => void;
  /** When provided, shows a "Download as PDF" button alongside Start Print. */
  onStartDownload?: () => void;
  isPrintStarted?: boolean;
}


/**
 * Modal dialog that displays real-time progress for print and PDF download flows.
 * When onStartPrint is provided, renders a printer/tray selection row before
 * the flow starts so the user can confirm the target printer and tray.
 *
 * @param {PrintProgressModalProps} props - Modal state and callbacks.
 * @returns {JSX.Element | null} The modal element, or null when not open.
 */
function PrintProgressModal({
  isOpen,
  batchName,
  mode,
  steps,
  error,
  isDone,
  successInfo,
  onClose,
  printers,
  trays,
  selectedPrinter,
  selectedTray,
  isLoadingPrinters,
  onPrinterChange,
  onTrayChange,
  onStartPrint,
  onStartDownload,
  isPrintStarted,
}: PrintProgressModalProps): JSX.Element | null {
  if (!isOpen) return null;

  const doneCount = steps.filter((s) => s.status === "done").length;
  const progressPct = steps.length > 0 ? (doneCount / steps.length) * 100 : 0;

  const hasSelection = !!onStartPrint;
  const showSelection = hasSelection && !isPrintStarted;

  const title = isDone
    ? mode === "print" ? "Print Complete" : "Download Complete"
    : error
    ? mode === "print" ? "Print Failed" : "Download Failed"
    : showSelection
    ? "Print"
    : mode === "print" ? "Printing…" : "Generating PDF…";

  const successMessage = mode === "print" && successInfo
    ? `${successInfo.pageCount} page${successInfo.pageCount !== 1 ? "s" : ""} printed successfully on ${successInfo.printer} · ${successInfo.tray}`
    : mode === "print"
    ? "Your signs have been sent to the printer successfully."
    : "Your PDF has been downloaded successfully.";

  return (
    <div className={styles.backgroundOverlay} role="dialog" aria-modal="true" aria-label="Print progress">
      <div className={styles.dialog}>

        <div className={styles.dialogTitle}>
          <h3>{title}<span>{batchName}</span></h3>
        </div>

        {/* ── Printer / Tray selection (worklist pre-print phase) ── */}
        {hasSelection && (
          <div className={styles.printerSelection}>
            <div className={styles.printerSelectionRow}>
              <div className={styles.printerSelectionField}>
                <label htmlFor="print-modal-printer">Printer</label>
                {isLoadingPrinters ? (
                  <div className="shimmer md" />
                ) : (
                  <select
                    id="print-modal-printer"
                    value={selectedPrinter ?? ""}
                    onChange={(e) => onPrinterChange?.(e.target.value)}
                    disabled={isPrintStarted}
                  >
                    {printers?.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className={styles.printerSelectionField}>
                <label htmlFor="print-modal-tray">Tray</label>
                {isLoadingPrinters ? (
                  <div className="shimmer sm" />
                ) : (
                  <select
                    id="print-modal-tray"
                    value={selectedTray ?? ""}
                    onChange={(e) => onTrayChange?.(e.target.value)}
                    disabled={isPrintStarted}
                  >
                    {trays?.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Progress bar (visible once print starts or in dashboard flow) ── */}
        {(isPrintStarted || !hasSelection) && (
          <div className={styles.dialogContent}>
            <div className={styles.progressBar}>
              <div className={styles.progressTitle}>
                <h5>PROGRESS</h5>
                <h5 className={styles.progressPct}>{Math.round(progressPct)}%</h5>
              </div>
              <div className={styles.progressRow}>
                <div
                  className={styles.progressTrack}
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.errorBox} role="alert">
            <p>{error}</p>
          </div>
        )}

        {isDone && !error && (
          <div className={styles.successBox} role="alert">
            <p className={styles.successTitle}>
              {mode === "print" ? "Printed Successfully" : "Download Complete"}
            </p>
            <p>{successMessage}</p>
          </div>
        )}

        <div className={styles.dialogFooter}>
          {/* Download as PDF button — pushed to the left */}
          {showSelection && !error && onStartDownload && (
            <button
              className="primaryButtonOutline"
              onClick={onStartDownload}
              disabled={isLoadingPrinters ?? false}
              aria-label="Download as PDF"
              style={{ marginRight: "auto" }}
            >
              Download as PDF
            </button>
          )}

          {/* Start Print button — only for worklist selection phase */}
          {showSelection && !error && (
            <button
              className="primaryButton"
              onClick={onStartPrint}
              disabled={isLoadingPrinters ?? false}
              aria-label="Start print job"
            >
              {isLoadingPrinters ? "Loading printers…" : "Start Print"}
            </button>
          )}

          <button
            className={isDone || !!error ? "primaryButton" : "primaryButtonOutline"}
            onClick={onClose}
            disabled={!isDone && !error && isPrintStarted}
            aria-label="Close print progress dialog"
          >
            {isDone ? "Done" : error ? "Close" : isPrintStarted ? "Processing…" : "Cancel"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default PrintProgressModal;
