/**
 * Input validation utilities used across forms and API boundary checks.
 * Security note: these validators must also be applied server-side — they
 * are provided here for UI feedback only and do NOT replace server validation.
 */

import { MAX_PRINT_QUANTITY } from "./constants";

/**
 * Validates that an item number matches the expected alphanumeric format.
 * Prevents injection by rejecting special characters.
 *
 * @param {string} itemNumber - The item number string to validate.
 * @returns {boolean} True if the item number is valid.
 */
export function isValidItemNumber(itemNumber: string): boolean {
  const ITEM_NUMBER_PATTERN = /^[A-Za-z0-9-]{1,20}$/;
  return ITEM_NUMBER_PATTERN.test(itemNumber.trim());
}

/**
 * Validates that a price value is a positive number with at most 2 decimal
 * places, preventing negative and zero prices.
 *
 * @param {number} price - The price value to validate.
 * @returns {boolean} True if the price is a valid positive amount.
 */
export function isValidPrice(price: number): boolean {
  if (!isFinite(price) || price <= 0) return false;
  const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
  return PRICE_PATTERN.test(String(price));
}

/**
 * Validates a print quantity is within the permitted range [1, MAX_PRINT_QUANTITY].
 *
 * @param {number} quantity - The quantity to validate.
 * @returns {boolean} True if the quantity falls within the allowed range.
 */
export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= MAX_PRINT_QUANTITY;
}

/**
 * Validates that a required text field is not blank after trimming whitespace.
 * Prevents empty sign titles and department names from being submitted.
 *
 * @param {string} value - The form field value to check.
 * @returns {boolean} True if the trimmed value is non-empty.
 */
export function isNonEmptyString(value: string): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validates that a department code exists within a provided list of valid codes.
 * Prevents arbitrary department strings from reaching the API.
 *
 * @param {string} department - The department code to validate.
 * @param {string[]} validDepartments - Array of permitted department codes.
 * @returns {boolean} True if the department code is in the allowed list.
 */
export function isValidDepartment(
  department: string,
  validDepartments: string[]
): boolean {
  return validDepartments.includes(department);
}

/**
 * Validates a date string is a parseable ISO 8601 date without a future limit.
 *
 * @param {string} dateString - The ISO date string to validate.
 * @returns {boolean} True if the string represents a valid date.
 */
export function isValidDateString(dateString: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Sanitises a free-text search term by stripping characters that could form
 * injection payloads before the value is passed to an API.
 * Security: output should still be re-validated on the server.
 *
 * @param {string} input - Raw search input from the user.
 * @returns {string} Sanitised string safe for inclusion in query parameters.
 */
export function sanitiseSearchTerm(input: string): string {
  return input.replace(/[<>"';&|`$\\]/g, "").trim().slice(0, 100);
}
