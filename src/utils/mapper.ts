/**
 * API-to-UI mapping utilities.
 * Transforms raw API response shapes into view-model objects consumed
 * by components, decoupling the UI layer from backend contract changes.
 */

import type { Sign, LookupResult } from "../types/sign.types";
import type { WorklistItem } from "../types/worklist.types";
import type { SelectOption } from "../types/common.types";
import { formatCurrency, formatDate } from "../lib/format";
import { DEPARTMENTS } from "../lib/constants";

/**
 * Mapped view model for a Sign record.
 */
export interface SignViewModel {
  id: string;
  title: string;
  subtitle: string;
  formattedPrice: string;
  department: string;
  itemNumber: string;
  signType: string;
  createdAt: string;
}

/**
 * Mapped view model for a WorklistItem record.
 */
export interface WorklistItemViewModel {
  id: string;
  itemNumber: string;
  description: string;
  department: string;
  formattedOldPrice: string;
  formattedNewPrice: string;
  priceDeltaLabel: string;
  effectiveDate: string;
  status: string;
  printStatus: string;
  isPrinted: boolean;
}

/**
 * Maps a raw Sign API record to a display-ready view model.
 *
 * @param {Sign} sign - The raw sign record from the API.
 * @returns {SignViewModel} The mapped view model.
 */
export function mapSignToViewModel(sign: Sign): SignViewModel {
  return {
    id: sign.id,
    title: sign.title,
    subtitle: sign.subtitle ?? "",
    formattedPrice: formatCurrency(sign.price),
    department: sign.department,
    itemNumber: sign.itemNumber,
    signType: sign.signType,
    createdAt: formatDate(sign.createdAt),
  };
}

/**
 * Maps an array of Sign records to an array of view models.
 *
 * @param {Sign[]} signs - Array of raw sign records.
 * @returns {SignViewModel[]} Array of mapped view models.
 */
export function mapSignsToViewModels(signs: Sign[]): SignViewModel[] {
  return signs.map(mapSignToViewModel);
}

/**
 * Maps a raw WorklistItem API record to a display-ready view model.
 *
 * @param {WorklistItem} item - The raw worklist item from the API.
 * @returns {WorklistItemViewModel} The mapped view model.
 */
export function mapWorklistItemToViewModel(item: WorklistItem): WorklistItemViewModel {
  const delta = item.newPrice - item.oldPrice;
  const sign = delta > 0 ? "+" : "";
  const priceDeltaLabel = `${sign}${formatCurrency(delta)}`;

  return {
    id: item.id,
    itemNumber: item.itemNumber,
    description: item.description,
    department: item.department,
    formattedOldPrice: formatCurrency(item.oldPrice),
    formattedNewPrice: formatCurrency(item.newPrice),
    priceDeltaLabel,
    effectiveDate: formatDate(item.effectiveDate),
    status: item.status,
    printStatus: item.printStatus,
    isPrinted: item.isPrinted,
  };
}

/**
 * Maps an array of WorklistItem records to view models.
 *
 * @param {WorklistItem[]} items - Array of raw worklist items.
 * @returns {WorklistItemViewModel[]} Array of mapped view models.
 */
export function mapWorklistItemsToViewModels(items: WorklistItem[]): WorklistItemViewModel[] {
  return items.map(mapWorklistItemToViewModel);
}

/**
 * Maps the DEPARTMENTS constant into SelectOption format for dropdowns.
 *
 * @returns {SelectOption[]} Array of label/value options.
 */
export function mapDepartmentsToOptions(): SelectOption[] {
  return Object.entries(DEPARTMENTS).map(([value, label]) => ({ value, label }));
}

/**
 * Maps a LookupResult to a partial Sign-like object for pre-filling forms.
 *
 * @param {LookupResult} result - The lookup result from the API.
 * @returns {Omit<Sign, "id" | "createdAt" | "updatedAt" | "signType">} Prefill data.
 */
export function mapLookupResultToSignPrefill(
  result: LookupResult
): Omit<Sign, "id" | "createdAt" | "updatedAt" | "signType"> {
  return {
    title: result.description,
    price: result.price,
    department: result.department,
    itemNumber: result.itemNumber,
  };
}
