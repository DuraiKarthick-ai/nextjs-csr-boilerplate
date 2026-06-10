/**
 * useDashboardPrint — orchestrates ECS print and PDF-download flows.
 *
 * Print flow  → physical printer:
 *   1. create-session
 *   2. load-batch      (batchSign-preview)
 *   3. print-batch     (get-layouts + print-signs-for-layout)
 *   4. done
 *
 * Download flow → PDF file in browser (no on-screen preview):
 *   1. create-session
 *   2. load-preview    (batchSign-preview RPC + preview-first WEB renderer)
 *   3. base64 → PDF blob
 *   4. browser download
 */

import { useState, useCallback } from "react";
import type { BatchItem } from "../../../types/batch.types";
import { multipleBase64PngsToPdfBlob, downloadBlob } from "../../../utils/pdfFromImage";
import { API_BASE_URL } from "../../../services/config";

export type StepStatus = "pending" | "active" | "done" | "error";
export type PrintMode = "print" | "download";

export interface PrintStep {
  label: string;
  status: StepStatus;
}

const PRINT_STEP_LABELS = [
  "Connecting to print server",
  "Retrieving sign layouts from batch",
  "Sending signs to printer queue",
  "Print job submitted",
] as const;

const DOWNLOAD_STEP_LABELS = [
  "Connecting to print server",
  "Preparing sign previews",
  "Building PDF document",
  "Saving PDF to your device",
] as const;

export interface PrintSuccessInfo {
  printer: string;
  tray: string;
  pageCount: number;
}

export interface UseDashboardPrintResult {
  isOpen: boolean;
  mode: PrintMode;
  steps: PrintStep[];
  error: string | null;
  isDone: boolean;
  activeBatchName: string;
  successInfo: PrintSuccessInfo | null;
  startPrint: (batch: BatchItem, printer: string, tray: string) => Promise<void>;
  startDownload: (batch: BatchItem) => Promise<void>;
  closeModal: () => void;
}

/**
 * Converts an array of step labels into PrintStep objects, marking the first as active.
 * @param {readonly string[]} labels - Step label strings.
 * @returns {PrintStep[]} Array of steps with initial statuses.
 */
function makeSteps(labels: readonly string[]): PrintStep[] {
  return labels.map((label, i) => ({
    label,
    status: i === 0 ? "active" : "pending",
  }));
}

export function useDashboardPrint(): UseDashboardPrintResult {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<PrintMode>("print");
  const [steps, setSteps] = useState<PrintStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [activeBatchName, setActiveBatchName] = useState("");
  const [successInfo, setSuccessInfo] = useState<PrintSuccessInfo | null>(null);

  /**
   * Marks the step at completedIndex as done and activates the next step.
   * @param {number} completedIndex - Zero-based index of the step just completed.
   */
  function advanceStep(completedIndex: number): void {
    setSteps((prev) =>
      prev.map((step, i) => {
        if (i === completedIndex) return { ...step, status: "done" };
        if (i === completedIndex + 1) return { ...step, status: "active" };
        return step;
      })
    );
  }

  /** Sets the currently active step to error status when an unrecoverable failure occurs. */
  function failActiveStep(): void {
    setSteps((prev) =>
      prev.map((step) =>
        step.status === "active" ? { ...step, status: "error" } : step
      )
    );
  }

  /**
   * Initiates the physical print flow for a batch: creates an ECS session,
   * loads the batch into SignSink, and dispatches layouts to the printer.
   * @param {BatchItem} batch - The batch to print.
   * @param {string} printer - Target printer name.
   * @param {string} tray - Target tray name.
   * @returns {Promise<void>}
   */
  const startPrint = useCallback(async (
    batch: BatchItem,
    printer: string,
    tray: string
  ): Promise<void> => {
    setIsOpen(true);
    setMode("print");
    setError(null);
    setIsDone(false);
    setActiveBatchName(batch.batchName);
    setSteps(makeSteps(PRINT_STEP_LABELS));

    try {
      // Step 1 — create-session
      const sessionUrl = `${API_BASE_URL}/api/print/session`;
      const sessionRes = await fetch(sessionUrl, { method: "POST" });
      const sessionData = await sessionRes.json() as { success: boolean; sessionID?: string; message?: string; _sentToECS?: unknown };
      // TODO: remove console logging before production
      console.log("[PRINT] Step 1 — create-session\n  ECS URL:", (sessionData._sentToECS as Record<string,unknown>)?.url, "\n  ECS Payload:", JSON.stringify((sessionData._sentToECS as Record<string,unknown>)?.payload, null, 2));
      if (!sessionData.success || !sessionData.sessionID) {
        throw new Error(sessionData.message ?? "Failed to create print session");
      }
      const sessionID = sessionData.sessionID;
      advanceStep(0);

      // Step 2 — batchSign-preview (load-batch)
      const loadBatchUrl = `${API_BASE_URL}/api/print/load-batch`;
      const loadRes = await fetch(loadBatchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionID, jobID: batch.batchConfigId, batchID: batch.batchId }),
      });
      const loadData = await loadRes.json() as { success: boolean; message?: string; _sentToECS?: unknown; _ecsResponse?: unknown };
      // TODO: remove console logging before production
      console.log("[PRINT] Step 2 — batchSign-preview\n  ECS URL:", (loadData._sentToECS as Record<string,unknown>)?.url, "\n  ECS Payload:", JSON.stringify((loadData._sentToECS as Record<string,unknown>)?.payload, null, 2), "\n  ECS Response:", JSON.stringify(loadData._ecsResponse, null, 2));
      if (!loadData.success) throw new Error(loadData.message ?? "Failed to load sign data");
      advanceStep(1);

      // Step 3 — get-layouts-from-sink + print-signs-for-layout (print-batch)
      const printBatchUrl = `${API_BASE_URL}/api/print/print-batch`;
      const printBatchPayload = { sessionID, printer, tray };
      // TODO: remove console logging before production
      console.log("[PRINT] Step 3 — print-batch\n  POST", printBatchUrl, "\n  Body:", JSON.stringify(printBatchPayload, null, 2));
      const printRes = await fetch(printBatchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(printBatchPayload),
      });
      const printData = await printRes.json() as {
        success: boolean;
        message?: string;
        layoutCount?: number;
        _sentToECS?: {
          getLayouts?: { url: string; payload: unknown; response: unknown };
          printLayouts?: { url: string; payload: unknown }[];
        };
      };
      // TODO: remove console logging before production
      const pEcs = printData._sentToECS;
      if (pEcs?.getLayouts) {
        console.log("[PRINT] Step 3a — get-layouts-from-sink\n  ECS URL:", pEcs.getLayouts.url, "\n  ECS Payload:", JSON.stringify(pEcs.getLayouts.payload, null, 2), "\n  ECS Response:", JSON.stringify(pEcs.getLayouts.response, null, 2));
      }
      if (pEcs?.printLayouts?.length) {
        pEcs.printLayouts.forEach((call, idx) => {
          console.log(`[PRINT] Step 3b — print-signs-for-layout [layout ${idx + 1}]\n  ECS URL:`, call.url, "\n  ECS Payload:", JSON.stringify(call.payload, null, 2));
        });
      }
      console.log("[PRINT] Step 3 result:", { success: printData.success, layoutCount: printData.layoutCount, message: printData.message });
      if (!printData.success) throw new Error(printData.message ?? "Failed to send to printer");
      advanceStep(2);

      setSuccessInfo({ printer, tray, pageCount: batch.signQuantity ?? printData.layoutCount ?? 0 });
      advanceStep(3);
      setIsDone(true);
    } catch (err: unknown) {
      failActiveStep();
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  }, []);

  /**
   * Initiates the PDF download flow for a batch: creates an ECS session,
   * collects all sign preview images, builds a multi-page PDF, and triggers browser download.
   * @param {BatchItem} batch - The batch to download as PDF.
   * @returns {Promise<void>}
   */
  const startDownload = useCallback(async (batch: BatchItem): Promise<void> => {
    setIsOpen(true);
    setMode("download");
    setError(null);
    setIsDone(false);
    setActiveBatchName(batch.batchName);
    setSteps(makeSteps(DOWNLOAD_STEP_LABELS));

    try {
      // Step 1 — create-session
      const sessionUrl = `${API_BASE_URL}/api/print/session`;
      const sessionRes = await fetch(sessionUrl, { method: "POST" });
      const sessionData = await sessionRes.json() as { success: boolean; sessionID?: string; message?: string; _sentToECS?: unknown };
      // TODO: remove console logging before production
      console.log("[DOWNLOAD] Step 1 — create-session\n  ECS URL:", (sessionData._sentToECS as Record<string,unknown>)?.url, "\n  ECS Payload:", JSON.stringify((sessionData._sentToECS as Record<string,unknown>)?.payload, null, 2));
      if (!sessionData.success || !sessionData.sessionID) {
        throw new Error(sessionData.message ?? "Failed to create print session");
      }
      const sessionID = sessionData.sessionID;
      advanceStep(0);

      // Step 2 — batchSign-preview + preview-first (load-preview)
      const previewUrl = `${API_BASE_URL}/api/print/load-preview`;
      const previewRes = await fetch(previewUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionID, jobID: batch.batchConfigId, batchID: batch.batchId }),
      });
      const previewData = await previewRes.json() as { success: boolean; previewImages?: string[]; message?: string; _sentToECS?: unknown };
      const ecs = previewData._sentToECS as Record<string,unknown> | undefined;
      if (ecs) {
        const s1 = ecs.step1 as Record<string,unknown> | undefined;
        const s2 = ecs.step2 as Record<string,unknown> | undefined;
        // TODO: remove console logging before production
        if (s1) console.log("[DOWNLOAD] Step 2a — batchSign-preview\n  ECS URL:", s1.url, "\n  ECS Payload:", JSON.stringify(s1.payload, null, 2));
        if (s2) console.log("[DOWNLOAD] Step 2b — preview-first/next\n  ECS URL:", s2.url, "\n  ECS Payload:", JSON.stringify(s2.payload, null, 2));
      }
      // TODO: remove console logging before production
      console.log("[DOWNLOAD] Step 2 result:", { success: previewData.success, message: previewData.message, imageCount: previewData.previewImages?.length ?? 0 });
      if (!previewData.success || !previewData.previewImages?.length) {
        throw new Error(previewData.message ?? "Failed to generate PDF");
      }
      advanceStep(1);

      // TODO: remove console logging before production
      console.log(`[DOWNLOAD] Step 3 — converting ${previewData.previewImages.length} image(s) to PDF`);
      const blob = await multipleBase64PngsToPdfBlob(previewData.previewImages);
      const filename = `${batch.batchName.replace(/[^a-z0-9]/gi, "_")}.pdf`;
      // TODO: remove console logging before production
      console.log("[DOWNLOAD] Step 3 — PDF blob ready, size:", blob.size, "filename:", filename);
      advanceStep(2);

      downloadBlob(blob, filename);
      // TODO: remove console logging before production
      console.log("[DOWNLOAD] Step 4 — download triggered");
      advanceStep(3);
      setIsDone(true);
    } catch (err: unknown) {
      failActiveStep();
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  }, []);

  /** Closes the print progress modal and resets all flow state. */
  const closeModal = useCallback((): void => {
    setIsOpen(false);
    setSteps([]);
    setError(null);
    setIsDone(false);
    setActiveBatchName("");
    setSuccessInfo(null);
  }, []);

  return { isOpen, mode, steps, error, isDone, activeBatchName, successInfo, startPrint, startDownload, closeModal };
}
