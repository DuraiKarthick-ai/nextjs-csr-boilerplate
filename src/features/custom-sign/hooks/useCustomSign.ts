/**
 * useCustomSign hook — manages state and actions for the Custom Sign Builder.
 * Handles product code input, size selection, lookup, per-field re-render on blur,
 * preview image state, print submission via ECS WebSocket, and form reset.
 *
 * Print flow (ECS):
 *   handleLookup       → renderCustomSign (preview) + item-search (styleId) run in parallel
 *   openPrintModal()   → create-session, get-printers, get-trays
 *   startPrint()       → clear-signs → adhoc-preview-load-data → get-layouts + print
 */

import { useState, useCallback } from "react";
import type {
  CustomSignRenderRequest,
  CustomSignRenderResponseItem,
} from "../../../types/sign.types";
import type { PrintStep, PrintMode, PrintSuccessInfo } from "../../dashboard/hooks/useDashboardPrint";
import { base64PngToPdfBlob, downloadBlob } from "../../../utils/pdfFromImage";
import { renderCustomSign } from "../services/customSignService";
import { isValidItemNumber } from "../../../lib/validators";
import {
  DEFAULT_PRINT_QUANTITY,
  DEFAULT_SIGN_STYLE_NAME,
  DEFAULT_STORE_ID,
  SIGN_OUTPUT_TYPE,
} from "../../../lib/constants";
import { API_BASE_URL } from "../../../services/config";

const PRINT_STEP_LABELS = [
  "Clearing print queue",
  "Loading sign layouts",
  "Sending to printer",
  "Print job submitted",
] as const;

const DOWNLOAD_STEP_LABELS = [
  "Generating sign preview",
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

export interface UseCustomSignResult {
  productCode: string;
  size: string;
  quantity: number;
  titleLine1: string;
  titleLine2: string;
  previewBase64: string | null;
  isLoaded: boolean;
  isLookingUp: boolean;
  isRerendering: boolean;
  error: string | null;
  setProductCode: (value: string) => void;
  setSize: (value: string) => void;
  setQuantity: (quantity: number) => void;
  setTitleLine1: (value: string) => void;
  setTitleLine2: (value: string) => void;
  handleLookup: () => Promise<void>;
  handleFieldBlur: () => Promise<void>;
  handleReset: () => void;
  // Print modal
  openPrintModal: () => Promise<void>;
  startPrint: () => Promise<void>;
  startDownload: () => Promise<void>;
  onPrinterChange: (printer: string) => Promise<void>;
  onTrayChange: (tray: string) => void;
  closeModal: () => void;
  isOpen: boolean;
  mode: PrintMode;
  isPrintStarted: boolean;
  steps: PrintStep[];
  printError: string | null;
  isDone: boolean;
  successInfo: PrintSuccessInfo | null;
  printers: string[];
  trays: string[];
  selectedPrinter: string;
  selectedTray: string;
  isLoadingPrinters: boolean;
}

function useCustomSign(): UseCustomSignResult {
  // ── Form state ────────────────────────────────────────────────────────────
  const [productCode, setProductCode] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState<number>(DEFAULT_PRINT_QUANTITY);
  const [titleLine1, setTitleLine1] = useState("");
  const [titleLine2, setTitleLine2] = useState("");
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isRerendering, setIsRerendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // styleId populated at lookup time; used when startPrint builds the adhoc args
  const [styleId, setStyleId] = useState<number | undefined>(undefined);
  const [itemStyleName, setItemStyleName] = useState<string>("");
  const [itemDescription, setItemDescription] = useState<string>("");
  const [itemProductTypeCode, setItemProductTypeCode] = useState<string>("ITM");

  // ── Print modal state ─────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<PrintMode>("print");
  const [isPrintStarted, setIsPrintStarted] = useState(false);
  const [steps, setSteps] = useState<PrintStep[]>([]);
  const [printError, setPrintError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [successInfo, setSuccessInfo] = useState<PrintSuccessInfo | null>(null);

  const [sessionID, setSessionID] = useState<string | null>(null);
  const [printers, setPrinters] = useState<string[]>([]);
  const [trays, setTrays] = useState<string[]>([FALLBACK_TRAY]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [selectedTray, setSelectedTray] = useState(FALLBACK_TRAY);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [traysCache, setTraysCache] = useState<Record<string, string[]>>({});

  // ── Helpers ───────────────────────────────────────────────────────────────
  function buildRenderPayload(): CustomSignRenderRequest[] {
    return [
      {
        styleName: DEFAULT_SIGN_STYLE_NAME,
        outputType: SIGN_OUTPUT_TYPE,
        productCode: productCode.trim(),
        storeId: Number(STORE_ID),
        outputParams: "",
        shapeNameValues: [
          { name: "User Text 1", value: titleLine1 },
          { name: "User Text 2", value: titleLine2 },
        ],
      },
    ];
  }

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

  // ── Lookup ────────────────────────────────────────────────────────────────
  /**
   * Validates size and product code, then runs the ECS render API and item-search
   * in parallel. Both must succeed to mark the item as loaded. styleId is stored
   * for later use by startPrint.
   */
  const handleLookup = useCallback(async (): Promise<void> => {
    if (!size) {
      setError("Please select a size.");
      return;
    }
    if (!isValidItemNumber(productCode)) {
      setError("Please enter a valid Item # / UPC (alphanumeric, max 20 characters).");
      return;
    }

    setError(null);
    setIsLookingUp(true);
    setIsLoaded(false);
    setPreviewBase64(null);
    setStyleId(undefined);

    try {
      const [response, searchRes] = await Promise.all([
        renderCustomSign(buildRenderPayload()),
        fetch(`${API_BASE_URL}/api/print/item-search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [{ storeId: STORE_ID, productCode: productCode.trim(), productTypeCode: "ITM" }],
          }),
        }),
      ]);

      const firstItem: CustomSignRenderResponseItem | undefined = response?.data?.[0];
      if (!firstItem?.responseData) {
        setError("No preview data returned. Please try again.");
        return;
      }

      const searchData = await searchRes.json() as {
        success: boolean;
        items?: { styleId: number; styleName: string; description: string; productTypeCode: string }[];
        message?: string;
      };

      const itemDetail = searchData.success ? searchData.items?.[0] : undefined;
      if (!itemDetail) {
        setError("Item not found. Please check the item number.");
        return;
      }

      setStyleId(itemDetail.styleId);
      setItemStyleName(itemDetail.styleName);
      setItemDescription(itemDetail.description);
      setItemProductTypeCode(itemDetail.productTypeCode);

      setPreviewBase64(firstItem.responseData);
      setIsLoaded(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lookup failed. Please try again.");
    } finally {
      setIsLookingUp(false);
    }
  }, [productCode, size, titleLine1, titleLine2]);

  /**
   * Called onBlur of any editable text field. Re-renders the sign preview
   * with the latest field values.
   */
  const handleFieldBlur = useCallback(async (): Promise<void> => {
    if (!isLoaded) return;

    setError(null);
    setIsRerendering(true);

    try {
      const response = await renderCustomSign(buildRenderPayload());
      const firstItem: CustomSignRenderResponseItem | undefined = response?.data?.[0];
      if (firstItem?.responseData) {
        setPreviewBase64(firstItem.responseData);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Preview update failed.");
    } finally {
      setIsRerendering(false);
    }
  }, [isLoaded, productCode, titleLine1, titleLine2]);

  // ── Print modal ───────────────────────────────────────────────────────────
  /**
   * Opens the print modal and creates a session + pre-fetches printers/trays.
   */
  const openPrintModal = useCallback(async (): Promise<void> => {
    if (!isLoaded) {
      setError("Please perform a lookup before printing.");
      return;
    }

    setIsOpen(true);
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
  }, [isLoaded]);

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

  /**
   * Runs the print flow: clear-signs → adhoc-preview-load-data → print-batch.
   * styleId was captured at handleLookup time — no additional item-search needed.
   */
  const startPrint = useCallback(async (): Promise<void> => {
    if (!sessionID || !selectedPrinter) return;

    setMode("print");
    setIsPrintStarted(true);
    setPrintError(null);
    setIsDone(false);
    setSteps(makeSteps(PRINT_STEP_LABELS));

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

      // ── Step 2: adhoc-preview-load-data ───────────────────────────────────
      const adhocArgs = [{
        productCode:     productCode.trim(),
        description:     itemDescription,
        productTypeCode: itemProductTypeCode,
        sellUnitId:      STORE_ID,
        qty:             quantity,
        styleId,
        styleName:       itemStyleName,
      }];

      const loadRes = await fetch(`${API_BASE_URL}/api/print/adhoc-load`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionID, storeId: STORE_ID, items: adhocArgs }),
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
      const printData = await printRes.json() as { success: boolean; message?: string };
      if (!printData.success) throw new Error(printData.message ?? "Failed to send to printer");
      advanceStep(2);

      setSuccessInfo({ printer: selectedPrinter, tray: selectedTray, pageCount: quantity });
      advanceStep(3);
      setIsDone(true);
    } catch (err: unknown) {
      failActiveStep();
      setPrintError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  }, [sessionID, selectedPrinter, selectedTray, productCode, quantity, styleId, itemStyleName, itemDescription, itemProductTypeCode]);

  /**
   * Downloads the current sign as a PDF using the render API (styleName: "Default").
   * Opens the modal directly in download mode — no ECS print session needed.
   * previewBase64 is already loaded from handleLookup and updated on field blur,
   * so no additional API call is needed.
   */
  const startDownload = useCallback(async (): Promise<void> => {
    if (!isLoaded || !previewBase64) return;

    setIsOpen(true);
    setMode("download");
    setIsPrintStarted(true);
    setPrintError(null);
    setIsDone(false);
    setSuccessInfo(null);
    setSteps(makeSteps(DOWNLOAD_STEP_LABELS));

    try {
      // Step 1: preview is already loaded — just advance immediately
      advanceStep(0);

      // Step 2: convert base64 PNG to PDF blob
      const blob = await base64PngToPdfBlob(previewBase64);
      advanceStep(1);

      // Step 3: trigger browser download
      const filename = `${productCode.trim().replace(/[^a-z0-9]/gi, "_")}-sign.pdf`;
      downloadBlob(blob, filename);
      advanceStep(2);
      setIsDone(true);
    } catch (err: unknown) {
      failActiveStep();
      setPrintError(err instanceof Error ? err.message : "Download failed.");
    }
  }, [isLoaded, previewBase64, productCode]);

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
  }, []);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = useCallback((): void => {
    setProductCode("");
    setQuantity(DEFAULT_PRINT_QUANTITY);
    setTitleLine1("");
    setTitleLine2("");
    setPreviewBase64(null);
    setIsLoaded(false);
    setError(null);
    setStyleId(undefined);
    setItemStyleName("");
    setItemDescription("");
    setItemProductTypeCode("ITM");
    // size is intentionally not cleared
  }, []);

  return {
    productCode,
    size,
    quantity,
    titleLine1,
    titleLine2,
    previewBase64,
    isLoaded,
    isLookingUp,
    isRerendering,
    error,
    setProductCode,
    setSize,
    setQuantity,
    setTitleLine1,
    setTitleLine2,
    handleLookup,
    handleFieldBlur,
    handleReset,
    openPrintModal,
    startPrint,
    startDownload,
    onPrinterChange,
    onTrayChange,
    closeModal,
    isOpen,
    mode,
    isPrintStarted,
    steps,
    printError,
    isDone,
    successInfo,
    printers,
    trays,
    selectedPrinter,
    selectedTray,
    isLoadingPrinters,
  };
}

export default useCustomSign;
