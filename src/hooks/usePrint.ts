/**
 * usePrint — reusable hook for submitting print requests.
 *
 * Manages loading / success / error state around the print API call.
 * Any screen (Quick Sign, Dashboard, Custom Sign) can use this hook
 * to trigger a print and display the result via SuccessToast.
 */

import { useCallback, useState } from "react";
import { printService, type PrintSubmitOptions } from "@/services/printService";
import type { PrintRequestPayload, PrintResponse } from "@/types/print";

type ApiErrorPayload = {
  error?: string;
  responseMessage?: string;
};

/**
 * Extracts a user-facing error message from unknown API/client errors.
 *
 * @param {unknown} err - Error thrown by service/API layer.
 * @returns {string} Best available error message for UI display.
 */
function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const maybeAxiosError = err as {
      response?: {
        data?: ApiErrorPayload;
        status?: number;
      };
      message?: string;
    };

    const apiMessage = maybeAxiosError.response?.data?.error
      ?? maybeAxiosError.response?.data?.responseMessage;

    if (apiMessage && apiMessage.trim() !== "") {
      return apiMessage;
    }

    if (typeof maybeAxiosError.message === "string" && maybeAxiosError.message.trim() !== "") {
      return maybeAxiosError.message;
    }

    if (typeof maybeAxiosError.response?.status === "number") {
      return `Print request failed (HTTP ${maybeAxiosError.response.status})`;
    }
  }

  if (err instanceof Error && err.message.trim() !== "") {
    return err.message;
  }

  return "Print request failed";
}

export interface UsePrintResult {
  /** Whether a print request is currently in-flight. */
  isPrinting: boolean;
  /** The most recent successful print response, or null. */
  printResult: PrintResponse | null;
  /** Error message from the last failed print attempt, or null. */
  printError: string | null;
  /** Submits a print request with the given payload. Returns the response on success, null on failure. */
  submitPrint: (payload: PrintRequestPayload, options?: PrintSubmitOptions) => Promise<PrintResponse | null>;
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
  const submitPrint = useCallback(async (
    payload: PrintRequestPayload,
    options?: PrintSubmitOptions,
  ): Promise<PrintResponse | null> => {
    setIsPrinting(true);
    setPrintError(null);
    setPrintResult(null);

    try {
      const result = await printService.submitPrint(payload, options);
      setPrintResult(result);
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setPrintError(message);
      return null;
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
