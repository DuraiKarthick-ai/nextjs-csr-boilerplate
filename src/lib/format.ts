/**
 * Formatting utilities for currency, dates, and numeric values.
 * All formatting is locale-aware and driven by constants to
 * ensure consistent display throughout the application.
 */

import { CURRENCY_CODE, CURRENCY_LOCALE, DATE_FORMAT } from "./constants";

/**
 * Formats a numeric value as a USD currency string.
 *
 * @param {number} amount - The numeric price to format.
 * @returns {string} The formatted currency string (e.g. "$12.99").
 *
 * @example formatCurrency(12.9) // "$12.90"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: CURRENCY_CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats an ISO date string using the application date format.
 *
 * @param {string} isoDate - ISO 8601 date string to format.
 * @returns {string} Formatted date string (e.g. "05/25/2026").
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) {
    return "";
  }

  const [month, day, year] = [
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    date.getFullYear(),
  ];

  // Respect the DATE_FORMAT constant ("MM/dd/yyyy")
  return DATE_FORMAT.replace("MM", month)
    .replace("dd", day)
    .replace("yyyy", String(year));
}

/**
 * Calculates the price change delta between old and new prices.
 *
 * @param {number} oldPrice - The original price.
 * @param {number} newPrice - The updated price.
 * @returns {number} The difference (can be negative for reductions).
 */
export function calculatePriceDelta(oldPrice: number, newPrice: number): number {
  return parseFloat((newPrice - oldPrice).toFixed(2));
}

/**
 * Returns a human-readable label for the price change direction.
 *
 * @param {number} oldPrice - The original price.
 * @param {number} newPrice - The updated price.
 * @returns {"increase" | "decrease" | "unchanged"} The change direction.
 */
export function getPriceChangeDirection(
  oldPrice: number,
  newPrice: number
): "increase" | "decrease" | "unchanged" {
  if (newPrice > oldPrice) return "increase";
  if (newPrice < oldPrice) return "decrease";
  return "unchanged";
}

/**
 * Truncates a string to the specified length, appending "…" if cut.
 *
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - Maximum character length before truncation.
 * @returns {string} The (possibly truncated) string.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}
