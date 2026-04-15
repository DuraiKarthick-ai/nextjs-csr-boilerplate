/**
 * usePrint — reusable hook for submitting print requests.
 *
 * Manages loading / success / error state around the print API call.
 * Any screen (Quick Sign, Dashboard, Custom Sign) can use this hook
 * to trigger a print and display the result via PrintSuccessDialog.
 */

import { useCallback, useState } from "react";
import { printService } from "@/services/printService";
import type { PrintRequestPayload, PrintResponse } from "@/types/print";

export interface UsePrintResult {
  /** Whether a print request is currently in-flight. */
  isPrinting: boolean;
  /** The most recent successful print response, or null. */
  printResult: PrintResponse | null;
  /** Error message from the last failed print attempt, or null. */
  printError: string | null;
  /** Submits a print request with the given payload. */
  submitPrint: (payload: PrintRequestPayload) => Promise<void>;
  /** Resets printResult and printError back to null. */
  resetPrint: () => void;
}

/**
 * Hook that wraps the print service call with React state management.
 *
 * @returns {UsePrintResult} Print state and action handlers.
 */
export function usePrint(): UsePrintResult {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printResult, setPrintResult] = useState<PrintResponse | null>(null);
  const [printError, setPrintError] = useState<string | null>(null);

  /**
   * Submits a print request and updates state accordingly.
   *
   * @param {PrintRequestPayload} payload - The print request to submit.
   */
  const submitPrint = useCallback(async (payload: PrintRequestPayload): Promise<void> => {
    setIsPrinting(true);
    setPrintError(null);
    setPrintResult(null);

    try {
      const result = await printService.submitPrint(payload);
      setPrintResult(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Print request failed";
      setPrintError(message);
    } finally {
      setIsPrinting(false);
    }
  }, []);

  /**
   * Resets the print result and error state.
   */
  const resetPrint = useCallback(() => {
    setPrintResult(null);
    setPrintError(null);
  }, []);

  return { isPrinting, printResult, printError, submitPrint, resetPrint };
}
