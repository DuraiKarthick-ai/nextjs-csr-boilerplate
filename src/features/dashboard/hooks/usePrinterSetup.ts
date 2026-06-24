/**
 * usePrinterSetup — creates a setup session on mount and fetches the list of
 * available printers. Manages per-batch printer/tray selection and caches tray
 * lists per printer to avoid redundant API calls.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { API_BASE_URL } from "../../../services/config";

const FALLBACK_TRAY = "Tray1";

export interface UsePrinterSetupResult {
  setupSessionID: string | null;
  printers: string[];
  isLoadingPrinters: boolean;
  printerError: string | null;
  getSelectedPrinter: (batchId: number) => string;
  getSelectedTray: (batchId: number) => string;
  getTraysForBatch: (batchId: number) => string[];
  isLoadingTrays: (batchId: number) => boolean;
  setSelectedPrinter: (batchId: number, printer: string) => Promise<void>;
  setSelectedTray: (batchId: number, tray: string) => void;
}

export function usePrinterSetup(): UsePrinterSetupResult {
  const [setupSessionID, setSetupSessionID] = useState<string | null>(null);
  const [printers, setPrinters] = useState<string[]>([]);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [printerError, setPrinterError] = useState<string | null>(null);

  // Per-batch selections keyed by batchId
  const [printerByBatch, setPrinterByBatch] = useState<Record<number, string>>({});
  const [trayByBatch, setTrayByBatch] = useState<Record<number, string>>({});

  // Tray cache: printer name → trays list
  const [traysCache, setTraysCache] = useState<Record<string, string[]>>({});
  // Per-batch tray loading state (keyed by batchId)
  const [trayLoadingByBatch, setTrayLoadingByBatch] = useState<Record<number, boolean>>({});
  // In-flight tray fetches: printer name → Promise — deduplicates concurrent calls for the same printer
  const pendingTrayFetches = useRef<Map<string, Promise<string[]>>>(new Map());

  useEffect(() => {
    const init = async () => {
      setIsLoadingPrinters(true);
      setPrinterError(null);
      try {
        // Create setup session
        const sessionRes = await fetch(`${API_BASE_URL}/api/print/session`, { method: "POST" });
        const sessionData = await sessionRes.json() as { success: boolean; sessionID?: string; message?: string };
        if (!sessionData.success || !sessionData.sessionID) {
          throw new Error(sessionData.message ?? "Failed to create setup session");
        }
        const sid = sessionData.sessionID;
        setSetupSessionID(sid);

        // Fetch printers
        const printersRes = await fetch(`${API_BASE_URL}/api/print/printers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionID: sid }),
        });
        const printersData = await printersRes.json() as { success: boolean; printers?: string[]; message?: string };
        if (!printersData.success) throw new Error(printersData.message ?? "Failed to fetch printers");

        const list = printersData.printers ?? [];
        setPrinters(list);

        // Pre-fetch trays for the first printer so the default is ready
        const first = list[0];
        if (first) {
          const traysRes = await fetch(`${API_BASE_URL}/api/print/trays`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionID: sid, printer: first }),
          });
          const traysData = await traysRes.json() as { success: boolean; trays?: string[] };
          if (traysData.success) {
            const fetchedTrays = traysData.trays?.length ? traysData.trays : [FALLBACK_TRAY];
            setTraysCache((prev) => ({ ...prev, [first]: fetchedTrays }));
          }
        }
      } catch (err: unknown) {
        setPrinterError(err instanceof Error ? err.message : "Failed to initialise printers.");
      } finally {
        setIsLoadingPrinters(false);
      }
    };

    void init();
  }, []);

  const fetchAndCacheTrays = useCallback(async (sessionID: string, printer: string): Promise<string[]> => {
    // Return cached result if already fetched
    if (traysCache[printer]) return traysCache[printer];

    // Return in-flight promise if a fetch for this printer is already running —
    // prevents N concurrent calls when N batches all share the same default printer
    const existing = pendingTrayFetches.current.get(printer);
    if (existing) return existing;

    const fetchPromise = fetch(`${API_BASE_URL}/api/print/trays`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionID, printer }),
    })
      .then((res) => res.json() as Promise<{ success: boolean; trays?: string[] }>)
      .then((data) => {
        const trays = data.trays?.length ? data.trays : [FALLBACK_TRAY];
        setTraysCache((prev) => ({ ...prev, [printer]: trays }));
        pendingTrayFetches.current.delete(printer);
        return trays;
      })
      .catch(() => {
        pendingTrayFetches.current.delete(printer);
        return [FALLBACK_TRAY];
      });

  pendingTrayFetches.current.set(printer, fetchPromise);
    return fetchPromise;
  }, [traysCache]);

  const setSelectedPrinter = useCallback(async (batchId: number, printer: string): Promise<void> => {
    setPrinterByBatch((prev) => ({ ...prev, [batchId]: printer }));
    setTrayByBatch((prev) => ({ ...prev, [batchId]: "" }));

    if (!setupSessionID) return;

    setTrayLoadingByBatch((prev) => ({ ...prev, [batchId]: true }));
    try {
      const trays = await fetchAndCacheTrays(setupSessionID, printer);
      setTrayByBatch((prev) => ({ ...prev, [batchId]: trays[0] ?? "" }));
    } finally {
      setTrayLoadingByBatch((prev) => ({ ...prev, [batchId]: false }));
    }
  }, [setupSessionID, fetchAndCacheTrays]);

  const setSelectedTray = useCallback((batchId: number, tray: string): void => {
    setTrayByBatch((prev) => ({ ...prev, [batchId]: tray }));
  }, []);

  const getSelectedPrinter = useCallback((batchId: number): string => {
    return printerByBatch[batchId] ?? printers[0] ?? "";
  }, [printerByBatch, printers]);

  const getSelectedTray = useCallback((batchId: number): string => {
    const printer = getSelectedPrinter(batchId);
    return trayByBatch[batchId] ?? traysCache[printer]?.[0] ?? FALLBACK_TRAY;
  }, [trayByBatch, getSelectedPrinter, traysCache]);

  const getTraysForBatch = useCallback((batchId: number): string[] => {
    const printer = getSelectedPrinter(batchId);
    return traysCache[printer] ?? [FALLBACK_TRAY];
  }, [getSelectedPrinter, traysCache]);

  const isLoadingTrays = useCallback((batchId: number): boolean => {
    return trayLoadingByBatch[batchId] ?? false;
  }, [trayLoadingByBatch]);

  return {
    setupSessionID,
    printers,
    isLoadingPrinters,
    printerError,
    getSelectedPrinter,
    getSelectedTray,
    getTraysForBatch,
    isLoadingTrays,
    setSelectedPrinter,
    setSelectedTray,
  };
}
