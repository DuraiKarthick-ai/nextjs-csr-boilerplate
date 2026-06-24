/**
 * useWorklistPrint — orchestrates the ECS print flow for the Worklist screen.
 *
 * Flow:
 *   On modal open  → create-session, get-printers, get-trays (setup phase)
 *   On Start Print → clear-signs
 *                  → item-search (fetch styleId + description per item)
 *                  → adhoc-preview-load-data (load items into SignSink)
 *                  → get-layouts-from-sink + print-signs-for-layout
 *
 * The same session is reused for both setup and print to avoid creating
 * two sessions per print job.
 */

import { useState, useCallback } from "react";
import type { BatchQueryParams, BatchDetailItem } from "../../../types/batch.types";
import type { PrintStep, PrintSuccessInfo } from "../../dashboard/hooks/useDashboardPrint";
import { API_BASE_URL } from "../../../services/config";

const WORKLIST_STEP_LABELS = [
  "Clearing print queue",
  "Loading sign layouts",
  "Sending to printer",
  "Print job submitted",
] as const;

const FALLBACK_TRAY = "Tray1";
const DEFAULT_PRODUCT_TYPE_CODE = "ITM";

function makeSteps(labels: readonly string[]): PrintStep[] {
  return labels.map((label, i) => ({
    label,
    status: i === 0 ? "active" : "pending",
  }));
}

export interface UseWorklistPrintResult {
  isOpen: boolean;
  isPrintStarted: boolean;
  steps: PrintStep[];
  error: string | null;
  isDone: boolean;
  printers: string[];
  trays: string[];
  selectedPrinter: string;
  selectedTray: string;
  isLoadingPrinters: boolean;
  successInfo: PrintSuccessInfo | null;
  openPrintModal: (batchParams: BatchQueryParams, selectedItems: BatchDetailItem[]) => Promise<void>;
  startPrint: () => Promise<void>;
  onPrinterChange: (printer: string) => Promise<void>;
  onTrayChange: (tray: string) => void;
  closeModal: () => void;
}

export function useWorklistPrint(): UseWorklistPrintResult {
  const [isOpen, setIsOpen] = useState(false);
  const [isPrintStarted, setIsPrintStarted] = useState(false);
  const [steps, setSteps] = useState<PrintStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [successInfo, setSuccessInfo] = useState<PrintSuccessInfo | null>(null);

  // Captured at modal open time to avoid closure staleness when "Start Print" fires later
  const [pendingBatchParams, setPendingBatchParams] = useState<BatchQueryParams | null>(null);
  const [pendingItems, setPendingItems] = useState<BatchDetailItem[]>([]);

  const [sessionID, setSessionID] = useState<string | null>(null);
  const [printers, setPrinters] = useState<string[]>([]);
  const [trays, setTrays] = useState<string[]>([FALLBACK_TRAY]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [selectedTray, setSelectedTray] = useState(FALLBACK_TRAY);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [traysCache, setTraysCache] = useState<Record<string, string[]>>({});

  function advanceStep(completedIndex: number): void {
    setSteps((prev) =>
      prev.map((step, i) => {
        if (i === completedIndex) return { ...step, status: "done" };
        if (i === completedIndex + 1) return { ...step, status: "active" };
        return step;
      })
    );
  }

  function failActiveStep(): void {
    setSteps((prev) =>
      prev.map((step) =>
        step.status === "active" ? { ...step, status: "error" } : step
      )
    );
  }

  /**
   * Opens the print modal, creates a session, and pre-fetches printers and trays
   * for the first printer so the dropdowns are ready before the user starts printing.
   */
  const openPrintModal = useCallback(async (
    batchParams: BatchQueryParams,
    selectedItems: BatchDetailItem[]
  ): Promise<void> => {
    setPendingBatchParams(batchParams);
    setPendingItems(selectedItems);

    setIsOpen(true);
    setIsPrintStarted(false);
    setError(null);
    setIsDone(false);
    setSuccessInfo(null);
    setSteps([]);
    setIsLoadingPrinters(true);

    try {
      const sessionRes = await fetch(`${API_BASE_URL}/api/print/session`, { method: "POST" });
      const sessionData = await sessionRes.json() as { success: boolean; sessionID?: string; message?: string };
      if (!sessionData.success || !sessionData.sessionID) {
        throw new Error(sessionData.message ?? "Failed to create print session");
      }
      const sid = sessionData.sessionID;
      setSessionID(sid);

      const printersRes = await fetch(`${API_BASE_URL}/api/print/printers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionID: sid }),
      });
      const printersData = await printersRes.json() as { success: boolean; printers?: string[] };
      const printerList = printersData.printers ?? [];
      setPrinters(printerList);

      const firstPrinter = printerList[0] ?? "";
      setSelectedPrinter(firstPrinter);

      if (firstPrinter) {
        const traysRes = await fetch(`${API_BASE_URL}/api/print/trays`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionID: sid, printer: firstPrinter }),
        });
        const traysData = await traysRes.json() as { success: boolean; trays?: string[] };
        const trayList = traysData.trays?.length ? traysData.trays : [FALLBACK_TRAY];
        setTrays(trayList);
        setTraysCache({ [firstPrinter]: trayList });
        setSelectedTray(trayList[0] ?? FALLBACK_TRAY);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect to print server");
    } finally {
      setIsLoadingPrinters(false);
    }
  }, []);

  const onPrinterChange = useCallback(async (printer: string): Promise<void> => {
    setSelectedPrinter(printer);
    setSelectedTray(FALLBACK_TRAY);
    if (!sessionID) return;

    if (traysCache[printer]) {
      setTrays(traysCache[printer]);
      setSelectedTray(traysCache[printer][0] ?? FALLBACK_TRAY);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/print/trays`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionID, printer }),
      });
      const data = await res.json() as { success: boolean; trays?: string[] };
      const trayList = data.trays?.length ? data.trays : [FALLBACK_TRAY];
      setTrays(trayList);
      setTraysCache((prev) => ({ ...prev, [printer]: trayList }));
      setSelectedTray(trayList[0] ?? FALLBACK_TRAY);
    } catch {
      setTrays([FALLBACK_TRAY]);
      setSelectedTray(FALLBACK_TRAY);
    }
  }, [sessionID, traysCache]);

  const onTrayChange = useCallback((tray: string): void => {
    setSelectedTray(tray);
  }, []);

  const startPrint = useCallback(async (): Promise<void> => {
    if (!sessionID || !selectedPrinter || !pendingBatchParams || pendingItems.length === 0) return;
    const batchParams = pendingBatchParams;
    const selectedItems = pendingItems;

    setIsPrintStarted(true);
    setError(null);
    setIsDone(false);
    setSteps(makeSteps(WORKLIST_STEP_LABELS));

    try {
      // ── Step 1: clear-signs ───────────────────────────────────────────────
      const clearRes = await fetch(`${API_BASE_URL}/api/print/clear-signs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionID }),
      });
      const clearData = await clearRes.json() as { success: boolean; message?: string };
      if (!clearData.success) throw new Error(clearData.message ?? "Failed to clear print queue");
      advanceStep(0);

      // ── Step 2: item-search → adhoc-preview-load-data ─────────────────────
      const storeId = batchParams.storeId ?? "";

      const searchRes = await fetch(`${API_BASE_URL}/api/print/item-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selectedItems.map((item) => ({
            storeId,
            productCode: item.itemNumber,
            productTypeCode: DEFAULT_PRODUCT_TYPE_CODE,
          })),
        }),
      });
      const searchData = await searchRes.json() as {
        success: boolean;
        message?: string;
        items?: { productCode: string; description: string; productTypeCode: string; styleId: number }[];
      };
      if (!searchData.success) throw new Error(searchData.message ?? "Failed to fetch item details");

      const itemDetailMap = new Map(
        (searchData.items ?? []).map((r) => [r.productCode, r])
      );

      const adhocArgs = selectedItems.map((item) => {
        const detail = itemDetailMap.get(item.itemNumber);
        return {
          productCode:     item.itemNumber,
          description:     detail?.description ?? item.description ?? "",
          productTypeCode: detail?.productTypeCode ?? DEFAULT_PRODUCT_TYPE_CODE,
          sellUnitId:      storeId,
          qty:             item.copies,
          styleId:         detail?.styleId,
          ...(batchParams.batchId != null ? { batchID: batchParams.batchId } : {}),
        };
      });

      const loadRes = await fetch(`${API_BASE_URL}/api/print/adhoc-load`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionID, storeId, items: adhocArgs }),
      });
      const loadData = await loadRes.json() as { success: boolean; message?: string };
      if (!loadData.success) throw new Error(loadData.message ?? "Failed to load sign layouts");
      advanceStep(1);

      // ── Step 3: get-layouts-from-sink + print-signs-for-layout ────────────
      const printRes = await fetch(`${API_BASE_URL}/api/print/print-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionID, printer: selectedPrinter, tray: selectedTray }),
      });
      const printData = await printRes.json() as { success: boolean; message?: string; layoutCount?: number };
      if (!printData.success) throw new Error(printData.message ?? "Failed to send to printer");
      advanceStep(2);

      const totalCopies = selectedItems.reduce((sum, item) => sum + item.copies, 0);
      setSuccessInfo({ printer: selectedPrinter, tray: selectedTray, pageCount: totalCopies });
      advanceStep(3);
      setIsDone(true);
    } catch (err: unknown) {
      failActiveStep();
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  }, [sessionID, selectedPrinter, selectedTray, pendingBatchParams, pendingItems]);

  const closeModal = useCallback((): void => {
    setIsOpen(false);
    setIsPrintStarted(false);
    setSteps([]);
    setError(null);
    setIsDone(false);
    setSuccessInfo(null);
    setSessionID(null);
    setPrinters([]);
    setTrays([FALLBACK_TRAY]);
    setSelectedPrinter("");
    setSelectedTray(FALLBACK_TRAY);
    setTraysCache({});
    setIsLoadingPrinters(false);
    setPendingBatchParams(null);
    setPendingItems([]);
  }, []);

  return {
    isOpen,
    isPrintStarted,
    steps,
    error,
    isDone,
    printers,
    trays,
    selectedPrinter,
    selectedTray,
    isLoadingPrinters,
    successInfo,
    openPrintModal,
    startPrint,
    onPrinterChange,
    onTrayChange,
    closeModal,
  };
}
