import { useState, useCallback, useRef } from "react";
import { DEFAULT_STORE_ID } from "@/constants/print";

export interface PrintFlowParams {
  jobID: number;
  batchID: number;
  sellUnitId: string;
}

interface PrinterInfo {
  printers: string[];
  selectedPrinter: string;
}

interface PreviewState {
  imageData: string | null;
  label: string;
  loading: boolean;
}

interface PrintFlowState {
  sessionID: string | null;
  sessionLoading: boolean;
  sessionError: string | null;
  printerInfo: PrinterInfo;
  printersLoading: boolean;
  printersError: string | null;
  trays: string[];
  selectedTray: string;
  traysLoading: boolean;
  traysError: string | null;
  preview: PreviewState;
  previewError: string | null;
  printing: boolean;
  printError: string | null;
  printSuccess: boolean;
}

async function callEcsStep(body: Record<string, unknown>) {
  const relayBody = {
    storeId: DEFAULT_STORE_ID,
    ...body,
  };
  const res = await fetch("/api/print/ecs-step", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(relayBody),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

export function usePrintFlow() {
  const [state, setState] = useState<PrintFlowState>({
    sessionID: null,
    sessionLoading: false,
    sessionError: null,
    printerInfo: { printers: [], selectedPrinter: "" },
    printersLoading: false,
    printersError: null,
    trays: [],
    selectedTray: "",
    traysLoading: false,
    traysError: null,
    preview: { imageData: null, label: "", loading: false },
    previewError: null,
    printing: false,
    printError: null,
    printSuccess: false,
  });

  const sessionRef = useRef<string | null>(null);

  const patch = (partial: Partial<PrintFlowState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  /** Step 1: Create session → Step 2: Get printers */
  const initSession = useCallback(async (params: PrintFlowParams) => {
    patch({ sessionLoading: true, sessionError: null, sessionID: null });

    try {
      // create-session
      const sessionResult = await callEcsStep({ step: "create-session" });
      const sid = sessionResult.response?.sessionID;
      if (!sid) throw new Error("No sessionID returned from create-session");
      sessionRef.current = sid;
      patch({ sessionID: sid, sessionLoading: false });

      // batchSign-preview (load batch data)
      await callEcsStep({
        step: "batchSign-preview",
        sessionID: sid,
        jobID: params.jobID,
        batchID: params.batchID,
        sellUnitId: params.sellUnitId,
      });

      // get-printers
      patch({ printersLoading: true, printersError: null });
      const printersResult = await callEcsStep({ step: "get-printers", sessionID: sid });
      const printerList: string[] = Array.isArray(printersResult.response?.printers)
        ? printersResult.response.printers
        : [];

      const selected = printerList.length === 1 ? printerList[0]! : "";
      patch({
        printerInfo: { printers: printerList, selectedPrinter: selected },
        printersLoading: false,
      });

      // Auto-fetch trays if single printer
      if (printerList.length === 1) {
        await fetchTrays(sid, printerList[0]!);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Session creation failed";
      patch({ sessionLoading: false, sessionError: msg, printersLoading: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Fetch trays for a printer */
  const fetchTrays = async (sid: string, printer: string) => {
    patch({ traysLoading: true, traysError: null, trays: [], selectedTray: "" });
    try {
      const result = await callEcsStep({ step: "get-trays", sessionID: sid, printer });
      const trayList: string[] = Array.isArray(result.response?.trays)
        ? result.response.trays
        : [];
      patch({ trays: trayList, selectedTray: trayList[0] ?? "", traysLoading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch trays";
      patch({ traysLoading: false, traysError: msg });
    }
  };

  /** Select a printer and fetch its trays */
  const selectPrinter = useCallback(async (printer: string) => {
    patch({ printerInfo: { ...state.printerInfo, selectedPrinter: printer } });
    if (sessionRef.current) {
      await fetchTrays(sessionRef.current, printer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.printerInfo]);

  /** Select a tray */
  const selectTray = useCallback((tray: string) => {
    patch({ selectedTray: tray });
  }, []);

  /** Preview navigation */
  const loadPreview = useCallback(async (direction: "preview-first" | "preview-next" | "preview-last") => {
    if (!sessionRef.current) return;
    patch({ preview: { imageData: null, label: "", loading: true }, previewError: null });
    try {
      const result = await callEcsStep({ step: direction, sessionID: sessionRef.current });
      const base64 = result.response?.data ?? null;
      patch({
        preview: {
          imageData: base64,
          label: direction.replace("preview-", ""),
          loading: false,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Preview failed";
      patch({ preview: { imageData: null, label: "", loading: false }, previewError: msg });
    }
  }, []);

  /** Print */
  const printSigns = useCallback(async () => {
    if (!sessionRef.current) return;
    const { selectedPrinter } = state.printerInfo;
    const { selectedTray } = state;
    if (!selectedPrinter || !selectedTray) return;

    patch({ printing: true, printError: null, printSuccess: false });
    try {
      // Get layouts first
      const layoutsResult = await callEcsStep({ step: "get-layouts-from-sink", sessionID: sessionRef.current });
      const layouts: Array<{ layoutID_1: string }> = Array.isArray(layoutsResult.response?.layouts)
        ? layoutsResult.response.layouts
        : [];

      // Print each layout
      for (const layout of layouts) {
        await callEcsStep({
          step: "print-signs-for-layout",
          sessionID: sessionRef.current,
          layoutId: layout.layoutID_1,
          printer: selectedPrinter,
          tray: selectedTray,
        });
      }
      patch({ printing: false, printSuccess: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Print failed";
      patch({ printing: false, printError: msg });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.printerInfo, state.selectedTray]);

  /** Reset all state */
  const reset = useCallback(() => {
    sessionRef.current = null;
    setState({
      sessionID: null,
      sessionLoading: false,
      sessionError: null,
      printerInfo: { printers: [], selectedPrinter: "" },
      printersLoading: false,
      printersError: null,
      trays: [],
      selectedTray: "",
      traysLoading: false,
      traysError: null,
      preview: { imageData: null, label: "", loading: false },
      previewError: null,
      printing: false,
      printError: null,
      printSuccess: false,
    });
  }, []);

  return {
    ...state,
    initSession,
    selectPrinter,
    selectTray,
    loadPreview,
    printSigns,
    reset,
  };
}
