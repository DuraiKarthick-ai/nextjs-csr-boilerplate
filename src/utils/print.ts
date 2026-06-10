/**
 * Print utility helpers shared across print-related features.
 * Provides safe, reusable functions for triggering browser print dialogs
 * and building print-ready payloads.
 *
 * Security: no user-controlled markup is injected into the DOM.
 */

import {
  DEFAULT_PRINTER_QUEUE,
  DEFAULT_PRINT_QUANTITY,
  MAX_PRINT_BATCH_SIZE,
} from "../lib/constants";
import { isValidQuantity } from "../lib/validators";
import type { PrintRequest } from "../types/sign.types";

/**
 * Builds a validated PrintRequest payload from a list of sign IDs and quantity.
 * Clamps batch size to {@link MAX_PRINT_BATCH_SIZE} and validates quantity.
 *
 * @param {string[]} signIds - The sign IDs to include in the request.
 * @param {number} [quantity=DEFAULT_PRINT_QUANTITY] - Copies to print per sign.
 * @param {string} [printerQueue=DEFAULT_PRINTER_QUEUE] - Target printer queue.
 * @returns {PrintRequest} The validated print request payload.
 * @throws {Error} If quantity is invalid.
 */
export function buildPrintRequest(
  signIds: string[],
  quantity: number = DEFAULT_PRINT_QUANTITY,
  printerQueue: string = DEFAULT_PRINTER_QUEUE
): PrintRequest {
  if (!isValidQuantity(quantity)) {
    throw new Error(`Invalid quantity: ${quantity}. Must be between 1 and 99.`);
  }

  const clampedIds = signIds.slice(0, MAX_PRINT_BATCH_SIZE);

  return {
    signIds: clampedIds,
    quantity,
    printerQueue,
  };
}

/**
 * Triggers the browser's native print dialog for a given element ID.
 * Clones DOM nodes into the print window without using innerHTML or
 * document.write, preventing XSS via API-sourced content in the element.
 * The popup is closed by the browser after the user finishes printing via
 * the afterprint event — not synchronously, to avoid closing before the
 * print dialog renders on Safari and mobile browsers.
 *
 * @param {string} elementId - The id of the DOM element to print.
 * @returns {void}
 */
export function triggerPrint(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) {
    return;
  }

  const doc = printWindow.document;

  const titleEl = doc.createElement("title");
  titleEl.textContent = "Print";
  doc.head.appendChild(titleEl);

  const clonedNode = doc.importNode(element, true);
  doc.body.appendChild(clonedNode);

  printWindow.focus();

  printWindow.addEventListener("afterprint", () => {
    printWindow.close();
  });

  printWindow.print();
}

/**
 * Returns a CSS class name indicating the print-queue status colour.
 * Used to style print status badges consistently.
 *
 * @param {string} status - The print status string value.
 * @returns {string} Tailwind CSS class string representing the status colour.
 */
export function getPrintStatusColorClass(status: string): string {
  const STATUS_COLOR_MAP: Record<string, string> = {
    QUEUED: "bg-yellow-100 text-yellow-800",
    PRINTING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    PRINTED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    NOT_PRINTED: "bg-gray-100 text-gray-600",
  };

  return STATUS_COLOR_MAP[status] ?? "bg-gray-100 text-gray-600";
}
