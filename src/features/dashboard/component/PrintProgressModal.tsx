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
}

/**
 * Renders an SVG icon representing the current step status.
 * @param {{ status: PrintStep["status"] }} props - The step status value.
 * @returns {JSX.Element} A checkmark (done), cross (error), dot (active), or empty fragment (pending).
 */
const StatusIcon = ({ status }: { status: PrintStep["status"] }): JSX.Element => {
  switch (status) {
    case "done":
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "error":
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 2l8 8M10 2l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "active":
      return (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <circle cx="5" cy="5" r="3" fill="#fff" />
        </svg>
      );
    default:
      return <></>;
  }
};

/**
 * Modal dialog that displays real-time progress for print and PDF download flows.
 * Shows step-by-step status, a progress bar, error messaging, and a success summary
 * including printer name, tray, and page count on successful print completion.
 *
 * @param {PrintProgressModalProps} props - Modal state and callbacks from useDashboardPrint.
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
}: PrintProgressModalProps): JSX.Element | null {
  if (!isOpen) return null;

  const doneCount = steps.filter((s) => s.status === "done").length;
  const progressPct = steps.length > 0 ? (doneCount / steps.length) * 100 : 0;

  const title = isDone
    ? mode === "print" ? "Print Complete" : "Download Complete"
    : error
    ? mode === "print" ? "Print Failed" : "Download Failed"
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

          <ul className={styles.stepList}>
            {steps.map((step) => (
              <li key={step.label}>
                <p className={`${styles.stepLabel} ${styles[`stepLabel--${step.status}`]}`}>
                  <i>
                    <StatusIcon status={step.status} />
                  </i>
                  <span>{step.label}</span>
                </p>
              </li>
            ))}
          </ul>

        </div>

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
          <button
            className={isDone || error ? 'primaryButton' : 'primaryButtonOutline'}
            onClick={onClose}
            disabled={!isDone && !error}
            aria-label="Close print progress dialog"
          >
            {isDone ? "Done" : error ? "Close" : "Processing…"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default PrintProgressModal;
