/**
 * useQuickPrintItem — ECS print and PDF-download flows for Quick Print by Item.
 *
 * Print flow:
 *   On modal open  → create-session, get-printers, get-trays
 *   On Start Print → clear-signs → adhoc-load → print-batch
 *
 * Download flow:
 *   On Download as PDF → custom-signs/render (one per item, styleName: "Default") → multi-page PDF → save
 *
 * Items are pre-enriched with styleId when added to the list.
 */

import { useState, useCallback } from "react";
import type { PrintStep, PrintMode, PrintSuccessInfo } from "../../dashboard/hooks/useDashboardPrint";
import type { ShapeNameValue } from "../../../types/sign.types";
import type { PrintItem } from "../types";
import { multipleBase64PngsToPdfBlob, downloadBlob } from "../../../utils/pdfFromImage";
import { renderCustomSign } from "../../custom-sign/services/customSignService";
import { API_BASE_URL } from "../../../services/config";
import { DEFAULT_SIGN_STYLE_NAME } from "../../../lib/constants";
// Use the env-driven store ID (same one PrintByItem uses for item-search) so the
// render/adhoc calls target the store the items were actually looked up against.
// The hardcoded "106" in lib/constants caused ECS to 500 (item has no sign data at 51).
import { DEFAULT_STORE_ID } from "../../../services/config";

const PRINT_STEP_LABELS = [
  "Clearing print queue",
  "Loading sign layouts",
  "Sending to printer",
  "Print job submitted",
] as const;

const DOWNLOAD_STEP_LABELS = [
  "Generating sign previews",
  "Building PDF document",
  "Saving PDF to your device",
] as const;

const FALLBACK_TRAY = "Tray1";
const STORE_ID = String(DEFAULT_STORE_ID);

function makeSteps(labels: readonly string[]): PrintStep[] {
  return labels.map((label, i) => ({
    label,
    status: i === 0 ? "active" : "pending",
  }));
}

function buildAdhocArgs(items: PrintItem[]): Record<string, unknown>[] {
  return items.map((item) => ({
    productCode:     item.itemUpc,
    description:     item.description ?? "",
    productTypeCode: item.productTypeCode ?? "ITM",
    sellUnitId:      STORE_ID,
    qty:             parseInt(item.quantity) || 1,
    styleId:         item.styleId,
    styleName:       item.styleName,
  }));
}

export interface UseQuickPrintItemResult {
  isOpen: boolean;
  mode: PrintMode;
  isPrintStarted: boolean;
  steps: PrintStep[];
  printError: string | null;
  isDone: boolean;
  printers: string[];
  trays: string[];
  selectedPrinter: string;
  selectedTray: string;
  isLoadingPrinters: boolean;
  successInfo: PrintSuccessInfo | null;
  openPrintModal: (items: PrintItem[]) => Promise<void>;
  startPrint: () => Promise<void>;
  startDownload: () => Promise<void>;
  onPrinterChange: (printer: string) => Promise<void>;
  onTrayChange: (tray: string) => void;
  closeModal: () => void;
}

export function useQuickPrintItem(): UseQuickPrintItemResult {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<PrintMode>("print");
  const [isPrintStarted, setIsPrintStarted] = useState(false);
  const [steps, setSteps] = useState<PrintStep[]>([]);
  const [printError, setPrintError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [successInfo, setSuccessInfo] = useState<PrintSuccessInfo | null>(null);

  const [pendingItems, setPendingItems] = useState<PrintItem[]>([]);

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

  const openPrintModal = useCallback(async (items: PrintItem[]): Promise<void> => {
    setPendingItems(items);
    setIsOpen(true);
    setMode("print");
    setIsPrintStarted(false);
    setPrintError(null);
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
      setPrintError(err instanceof Error ? err.message : "Failed to connect to print server");
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
    if (!sessionID || !selectedPrinter || pendingItems.length === 0) return;

    setMode("print");
    setIsPrintStarted(true);
    setPrintError(null);
    setIsDone(false);
    setSteps(makeSteps(PRINT_STEP_LABELS));

    try {
      const clearRes = await fetch(`${API_BASE_URL}/api/print/clear-signs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionID }),
      });
      const clearData = await clearRes.json() as { success: boolean; message?: string };
      if (!clearData.success) throw new Error(clearData.message ?? "Failed to clear print queue");
      advanceStep(0);

      const loadRes = await fetch(`${API_BASE_URL}/api/print/adhoc-load`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionID, storeId: STORE_ID, items: buildAdhocArgs(pendingItems) }),
      });
      const loadData = await loadRes.json() as { success: boolean; message?: string };
      if (!loadData.success) throw new Error(loadData.message ?? "Failed to load sign layouts");
      advanceStep(1);

      const printRes = await fetch(`${API_BASE_URL}/api/print/print-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionID, printer: selectedPrinter, tray: selectedTray }),
      });
      const printData = await printRes.json() as { success: boolean; message?: string };
      if (!printData.success) throw new Error(printData.message ?? "Failed to send to printer");
      advanceStep(2);

      const totalCopies = pendingItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
      setSuccessInfo({ printer: selectedPrinter, tray: selectedTray, pageCount: totalCopies });
      advanceStep(3);
      setIsDone(true);
    } catch (err: unknown) {
      failActiveStep();
      setPrintError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  }, [sessionID, selectedPrinter, selectedTray, pendingItems]);

  const startDownload = useCallback(async (): Promise<void> => {
    if (pendingItems.length === 0) return;

    setMode("download");
    setIsPrintStarted(true);
    setPrintError(null);
    setIsDone(false);
    setSteps(makeSteps(DOWNLOAD_STEP_LABELS));

    try {
      // Step 1: call custom-signs/render for each item using the item's own
      // style (enriched from item-search when added to the list). The hardcoded
      // "Default" style does not exist on ECS and caused the render to fail.
      const renderRequests = pendingItems.map((item) => ({
        styleName: item.styleName ?? DEFAULT_SIGN_STYLE_NAME,
        outputType: "png" as const,
        productCode: item.itemUpc,
        storeId: Number(STORE_ID),
        outputParams: "",
        shapeNameValues: [] as ShapeNameValue[],
      }));

      const renderResponse = await renderCustomSign(renderRequests);
      const rendered = renderResponse?.data ?? [];
      if (rendered.length === 0) {
        throw new Error("No sign images returned from render API");
      }
      advanceStep(0);

      // Build full image list — repeat each sign per its quantity (copies)
      const allBase64: string[] = [];
      rendered.forEach((img, idx) => {
        const qty = parseInt(pendingItems[idx]?.quantity ?? "1") || 1;
        for (let i = 0; i < qty; i++) allBase64.push(img.responseData);
      });

      // Step 2: convert to multi-page PDF
      const blob = await multipleBase64PngsToPdfBlob(allBase64);
      advanceStep(1);

      // Step 3: trigger browser download
      downloadBlob(blob, "quick-print-signs.pdf");
      advanceStep(2);
      setIsDone(true);
    } catch (err: unknown) {
      failActiveStep();
      setPrintError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  }, [pendingItems]);

  const closeModal = useCallback((): void => {
    setIsOpen(false);
    setMode("print");
    setIsPrintStarted(false);
    setSteps([]);
    setPrintError(null);
    setIsDone(false);
    setSuccessInfo(null);
    setSessionID(null);
    setPrinters([]);
    setTrays([FALLBACK_TRAY]);
    setSelectedPrinter("");
    setSelectedTray(FALLBACK_TRAY);
    setTraysCache({});
    setIsLoadingPrinters(false);
    setPendingItems([]);
  }, []);

  return {
    isOpen,
    mode,
    isPrintStarted,
    steps,
    printError,
    isDone,
    printers,
    trays,
    selectedPrinter,
    selectedTray,
    isLoadingPrinters,
    successInfo,
    openPrintModal,
    startPrint,
    startDownload,
    onPrinterChange,
    onTrayChange,
    closeModal,
  };
}
