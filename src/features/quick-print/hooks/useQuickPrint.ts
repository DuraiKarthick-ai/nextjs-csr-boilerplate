/**
 * useQuickPrint hook — manages state and actions for the Quick Print feature.
 * Handles item lookup, queue management, quantity, and print submission.
 *
 * @returns {UseQuickPrintResult} Hook state and action handlers.
 */

import { useState, useCallback } from "react";
import type { LookupResult } from "../../../types/sign.types";
import { lookupItem, submitBatchPrint } from "../services/quickPrintService";
import { buildPrintRequest } from "../../../utils/print";
import { isValidItemNumber } from "../../../lib/validators";
import { DEFAULT_PRINT_QUANTITY } from "../../../lib/constants";

/** An item that has been looked up and queued for printing. */
export interface QueuedItem {
  signId: string;
  itemNumber: string;
  description: string;
  department: string;
  formattedPrice: string;
  quantity: number;
}

/** Shape returned by useQuickPrint. */
export interface UseQuickPrintResult {
  /** Current item number input value. */
  itemNumber: string;
  /** Items currently in the print queue. */
  queuedItems: QueuedItem[];
  /** Whether a lookup request is in flight. */
  isLookingUp: boolean;
  /** Whether a print request is in flight. */
  isPrinting: boolean;
  /** Error message, or null if none. */
  error: string | null;
  /** Updates the item number input. */
  setItemNumber: (value: string) => void;
  /** Looks up the current item number and adds it to the queue. */
  handleLookup: () => Promise<void>;
  /** Updates the quantity for a specific queued item. */
  updateQuantity: (signId: string, quantity: number) => void;
  /** Removes a specific item from the queue. */
  removeItem: (signId: string) => void;
  /** Submits all queued items for printing. */
  handlePrintAll: () => Promise<void>;
  /** Clears all queued items. */
  clearQueue: () => void;
}

/**
 * Quick Print feature hook.
 *
 * @returns {UseQuickPrintResult}
 */
function useQuickPrint(): UseQuickPrintResult {
  const [itemNumber, setItemNumber] = useState<string>("");
  const [queuedItems, setQueuedItems] = useState<QueuedItem[]>([]);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validates and looks up the current item number, adding it to the queue.
   *
   * @returns {Promise<void>}
   */
  const handleLookup = useCallback(async (): Promise<void> => {
    if (!isValidItemNumber(itemNumber)) {
      setError("Enter a valid item number (alphanumeric, max 20 characters).");
      return;
    }
    setError(null);
    setIsLookingUp(true);
    try {
      const result: LookupResult = await lookupItem(itemNumber);
      if (!result.found) {
        setError(`Item "${itemNumber}" was not found.`);
        return;
      }
      setQueuedItems((prev) => {
        const exists = prev.some((i) => i.itemNumber === result.itemNumber);
        if (exists) return prev;
        const newItem: QueuedItem = {
          signId: result.itemNumber,
          itemNumber: result.itemNumber,
          description: result.description,
          department: result.department,
          formattedPrice: `$${result.price.toFixed(2)}`,
          quantity: DEFAULT_PRINT_QUANTITY,
        };
        return [...prev, newItem];
      });
      setItemNumber("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lookup failed.");
    } finally {
      setIsLookingUp(false);
    }
  }, [itemNumber]);

  /**
   * Updates the print quantity for a specific queued item.
   *
   * @param {string} signId - The sign ID of the item to update.
   * @param {number} quantity - The new quantity value.
   */
  const updateQuantity = useCallback((signId: string, quantity: number): void => {
    setQueuedItems((prev) =>
      prev.map((item) => (item.signId === signId ? { ...item, quantity } : item))
    );
  }, []);

  /**
   * Removes a queued item by sign ID.
   *
   * @param {string} signId - The sign ID to remove.
   */
  const removeItem = useCallback((signId: string): void => {
    setQueuedItems((prev) => prev.filter((item) => item.signId !== signId));
  }, []);

  /**
   * Submits all queued items for printing, honouring each item's individual
   * quantity. One print request is sent per item so per-item copy counts
   * are preserved exactly as the user set them.
   *
   * @returns {Promise<void>}
   */
  const handlePrintAll = useCallback(async (): Promise<void> => {
    if (queuedItems.length === 0) {
      setError("No items in the print queue.");
      return;
    }
    setError(null);
    setIsPrinting(true);
    try {
      const printRequests = queuedItems.map((item) =>
        buildPrintRequest([item.signId], item.quantity)
      );
      await Promise.all(printRequests.map((req) => submitBatchPrint(req)));
      setQueuedItems([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Print failed.");
    } finally {
      setIsPrinting(false);
    }
  }, [queuedItems]);

  /** Clears all items from the queue. */
  const clearQueue = useCallback((): void => {
    setQueuedItems([]);
    setError(null);
  }, []);

  return {
    itemNumber,
    queuedItems,
    isLookingUp,
    isPrinting,
    error,
    setItemNumber,
    handleLookup,
    updateQuantity,
    removeItem,
    handlePrintAll,
    clearQueue,
  };
}

export default useQuickPrint;
