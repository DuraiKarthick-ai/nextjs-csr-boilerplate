"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

import styles from "./signWorklist.module.scss";
import { Autocomplete, CircularProgress, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, TextField, ThemeProvider } from "@mui/material";
import Image from "next/image";
import { tableFilterTheme, datePickerTheme } from "@/theme/customizeTheme";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type { BatchQueryParams, BatchDetailItem } from "../../../types/batch.types";
import { API_BASE_URL } from "../../../services/config";
import { DEFAULT_SIGN_STYLE_NAME } from "../../../lib/constants";
import useBatchDetail from "../hooks/useBatchDetail";
import useWorklist from "../hooks/useWorklist";
import { useWorklistPrint } from "../hooks/useWorklistPrint";
import PrintProgressModal from "../../dashboard/component/PrintProgressModal";
import ErrorMessage from "../../../shared/common/ErrorMessage";

type SortKey = "effectiveDate" | "itemNumber" | "description" | "changeReason" | "signSize" | "copies" | "printStatus";
type SortOrder = "asc" | "desc";

/** Active filter state for all filterable columns. */
interface FilterState {
  date: Dayjs | null;
  itemNumber: string;
  itemName: string;
  changeReason: string;
  signSize: string;
  printStatus: string;
}

const INITIAL_FILTERS: FilterState = {
  date: null,
  itemNumber: "",
  itemName: "",
  changeReason: "",
  signSize: "",
  printStatus: "",
};

/**
 * Number of rows rendered per "page" of the worklist table.
 * The full dataset is held in memory (ECS returns it all at once), but only
 * this many rows are rendered to the DOM at a time. Each time the user scrolls
 * near the bottom of the table, another PAGE_SIZE rows are appended. This keeps
 * the DOM small enough to stay responsive even for very large batches.
 */
const PAGE_SIZE = 50;

/**
 * Distance in pixels from the bottom of the scroll container at which the next
 * page of rows is appended, so new rows load slightly before the user hits the
 * very end.
 */
const SCROLL_THRESHOLD_PX = 150;

/** Props accepted by the WorklistScreen component. */
interface WorklistScreenProps {
  /**
   * Batch identifiers sourced from URL query params when the user navigates
   * from a dashboard batch-job hyperlink. When null, no batch detail is loaded
   * and the table renders its empty state.
   */
  batchParams?: BatchQueryParams | null;
}

/**
 * Returns a stable row key used for selection and copies tracking.
 *
 * @param {BatchDetailItem} row - The row data.
 * @param {number} index - The row index within the full data set.
 * @returns {string} A unique key combining itemNumber and index.
 */
function getRowKey(row: BatchDetailItem, index: number): string {
  return `${row.itemNumber}-${index}`;
}

/**
 * Renders the Sign Worklist (Daily Sign Maintenance) screen.
 *
 * Displays a filterable, sortable, and selectable table of batch sign items.
 * When batchParams are provided the ECS batch detail API is called via
 * useBatchDetail; on failure an error is shown and the table stays empty.
 * When no batchParams are given, the table renders its empty state.
 *
 * @param {WorklistScreenProps} props
 * @returns {JSX.Element} The rendered Sign Worklist view.
 */
export default function WorklistScreen({ batchParams = null }: WorklistScreenProps): JSX.Element {
  const { items: batchItems, isLoading: isBatchLoading, error: batchError } = useBatchDetail(batchParams);
  useWorklist();
  const worklistPrint = useWorklistPrint();

  const data = batchItems;
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [itemCopies, setItemCopies] = useState<Record<string, number>>({});

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  /**
   * Prefetched preview images keyed by item number (productCode). Each sign is
   * rendered directly by its product code, so lookups are position-independent —
   * a searched item is handled the same whether or not it was in the first page.
   * Filled in pages of PAGE_SIZE so clicking a row's Preview is instant when the
   * image is already cached. Held in a ref so filling it does not re-render the table.
   */
  const previewCacheRef = useRef<Record<string, string>>({});
  /** How many rows of `data` have been prefetched so far (paged sequentially). */
  const prefetchedCountRef = useRef<number>(0);
  /** In-flight prefetch page request, so callers can await it instead of racing. */
  const prefetchInFlightRef = useRef<Promise<void> | null>(null);
  /** Mirror of prefetchedCountRef in state, so the scroll effect can react. */
  const [prefetchedCount, setPrefetchedCount] = useState<number>(0);

  /** How many rows are currently rendered to the DOM (grows on scroll). */
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  /** Scroll container around the table; used to detect scroll-to-bottom. */
  const tableScrollRef = useRef<HTMLDivElement>(null);

  /**
   * Synchronises the raw data state when the API result or batch context changes.
   * Resets selection and per-row copy overrides on each data refresh.
   */
  useEffect(() => {
    setSelectedRows(new Set());
    setItemCopies({});
    // Reset the preview prefetch cache for the new batch.
    previewCacheRef.current = {};
    prefetchedCountRef.current = 0;
    prefetchInFlightRef.current = null;
    setPrefetchedCount(0);
  }, [batchItems, batchParams]);

  /**
   * Sorted and filtered rows derived from raw data and active filter/sort state.
   * Filters are applied first, then the active sort column is applied.
   */
  const displayData = useMemo<BatchDetailItem[]>(() => {
    let result = [...data];

    if (filters.date) {
      const dateStr = filters.date.format("YYYY-MM-DD");
      result = result.filter((row) => row.effectiveDate === dateStr);
    }
    if (filters.itemNumber) {
      result = result.filter((row) => row.itemNumber === filters.itemNumber);
    }
    if (filters.itemName) {
      result = result.filter((row) => row.description === filters.itemName);
    }
    if (filters.changeReason) {
      result = result.filter((row) => row.changeReason === filters.changeReason);
    }
    if (filters.signSize) {
      result = result.filter((row) => row.signSize === filters.signSize);
    }
    if (filters.printStatus) {
      result = result.filter((row) => row.printStatus === filters.printStatus);
    }

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortOrder === "asc" ? valA - valB : valB - valA;
        }
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (sortOrder === "asc") return strA < strB ? -1 : strA > strB ? 1 : 0;
        return strA > strB ? -1 : strA < strB ? 1 : 0;
      });
    }

    return result;
  }, [data, filters, sortKey, sortOrder]);

  /**
   * The subset of rows currently rendered to the DOM. Only the first
   * `visibleCount` filtered/sorted rows are mapped to table rows; the rest are
   * appended as the user scrolls. Slicing from index 0 preserves each row's
   * original position in displayData, so getRowKey indices stay consistent.
   */
  const visibleData = useMemo<BatchDetailItem[]>(
    () => displayData.slice(0, visibleCount),
    [displayData, visibleCount]
  );

  /**
   * Resets the visible window back to the first page whenever the underlying
   * filtered/sorted dataset changes (filter applied, sort changed, new batch
   * loaded). Without this, a stale large window could persist after filtering.
   */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0;
    }
  }, [displayData]);

  /**
   * Appends the next page of rows when the user scrolls near the bottom of the
   * table container, until all filtered rows are rendered.
   */
  function handleTableScroll(): void {
    const el = tableScrollRef.current;
    if (!el) return;
    const reachedBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_THRESHOLD_PX;
    if (reachedBottom) {
      setVisibleCount((prev) =>
        prev >= displayData.length ? prev : prev + PAGE_SIZE
      );
    }
  }

  /**
   * Renders preview images for a set of rows by product code: looks up each
   * item's style via item-search, then renders all rows in one batched call.
   * Returns a map of itemNumber → base64 PNG (missing entries are omitted).
   */
  const renderRowsByProductCode = useCallback(async (
    rows: BatchDetailItem[]
  ): Promise<Record<string, string>> => {
    if (!batchParams || rows.length === 0) return {};
    const storeId = batchParams.storeId;

    // 1. item-search → real style name per item (rendering needs a valid style).
    const searchRes = await fetch(`${API_BASE_URL}/api/print/item-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: rows.map((r) => ({ storeId, productCode: r.itemNumber, productTypeCode: "ITM" })),
      }),
    });
    const searchData = await searchRes.json() as { success: boolean; items?: { productCode: string; styleName: string }[] };
    const styleByCode = new Map((searchData.items ?? []).map((it) => [it.productCode, it.styleName]));

    // 2. custom-sign-render → one batched render for the whole page.
    const renderBody = rows.map((r) => ({
      styleName: styleByCode.get(r.itemNumber) ?? DEFAULT_SIGN_STYLE_NAME,
      outputType: "png",
      productCode: r.itemNumber,
      storeId: Number(storeId),
      outputParams: "",
      shapeNameValues: [],
    }));
    const renderRes = await fetch(`${API_BASE_URL}/api/signs/custom-sign-render`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(renderBody),
    });
    const renderData = await renderRes.json() as { success: boolean; data?: { data?: { responseData: string }[] } };
    const items = renderData.data?.data ?? [];

    const out: Record<string, string> = {};
    rows.forEach((r, i) => {
      const img = items[i]?.responseData;
      if (img) out[r.itemNumber] = img;
    });
    return out;
  }, [batchParams]);

  /**
   * Prefetches the next page of preview images (by product code) into the cache.
   * Best-effort: failures are swallowed, since a per-row Preview click can still
   * render that item on demand. Advances the page cursor even on failure so a
   * single bad page does not stall prefetching of the rest.
   */
  const prefetchPreviewPage = useCallback(async (): Promise<void> => {
    if (!batchParams) return;
    // Coalesce concurrent callers (background scroll prefetch + on-demand search).
    if (prefetchInFlightRef.current) return prefetchInFlightRef.current;
    const start = prefetchedCountRef.current;
    const slice = data.slice(start, start + PAGE_SIZE);
    if (slice.length === 0) return;

    const run = (async (): Promise<void> => {
      try {
        const rendered = await renderRowsByProductCode(slice);
        previewCacheRef.current = { ...previewCacheRef.current, ...rendered };
      } catch {
        // Best-effort prefetch; per-row Preview can still render on demand.
      } finally {
        prefetchedCountRef.current = start + slice.length;
        setPrefetchedCount(prefetchedCountRef.current);
      }
    })();

    prefetchInFlightRef.current = run;
    try { await run; } finally { prefetchInFlightRef.current = null; }
  }, [batchParams, data, renderRowsByProductCode]);

  /**
   * Keeps the preview cache one page ahead of the rendered rows: prefetches the
   * first PAGE_SIZE images on load and the next page each time the table scroll
   * reveals more rows, until every sign in the batch is cached.
   */
  useEffect(() => {
    if (!batchParams || data.length === 0) return;
    const target = Math.min(visibleCount, data.length);
    if (prefetchedCount < target) {
      void prefetchPreviewPage();
    }
  }, [batchParams, data.length, visibleCount, prefetchedCount, prefetchPreviewPage]);

  /** Number of currently active filter fields. */
  const activeFilterCount = useMemo<number>(() => {
    let count = 0;
    if (filters.date) count++;
    if (filters.itemNumber) count++;
    if (filters.itemName) count++;
    if (filters.changeReason) count++;
    if (filters.signSize) count++;
    if (filters.printStatus) count++;
    return count;
  }, [filters]);

  /** Unique item numbers derived from raw data for the Item # filter dropdown. */
  const uniqueItemNumbers = useMemo<string[]>(
    () => [...new Set(data.map((r) => r.itemNumber))].sort(),
    [data]
  );

  /** Unique item names derived from raw data for the Item Name filter dropdown. */
  const uniqueItemNames = useMemo<string[]>(
    () => [...new Set(data.map((r) => r.description))].sort(),
    [data]
  );

  /** Unique change reasons derived from raw data for the Change Reason filter dropdown. */
  const uniqueChangeReasons = useMemo<string[]>(
    () => [...new Set(data.map((r) => r.changeReason))].sort(),
    [data]
  );

  /** Unique sign sizes derived from raw data for the Sign Size filter dropdown. */
  const uniqueSignSizes = useMemo<string[]>(
    () => [...new Set(data.map((r) => r.signSize))].sort(),
    [data]
  );

  /** Unique print statuses derived from raw data for the Print Status filter dropdown. */
  const uniquePrintStatuses = useMemo<string[]>(
    () => [...new Set(data.map((r) => r.printStatus))].sort(),
    [data]
  );

  /** Whether all currently visible rows are selected. */
  const isAllSelected =
    displayData.length > 0 &&
    displayData.every((row, i) => selectedRows.has(getRowKey(row, i)));

  /** Whether some (but not all) visible rows are selected. */
  const isIndeterminate =
    displayData.some((row, i) => selectedRows.has(getRowKey(row, i))) && !isAllSelected;

  /**
   * Toggles selection for all currently visible (filtered) rows.
   * Deselects all if every row is already selected; otherwise selects all.
   */
  function handleSelectAll(): void {
    const newSet = new Set(selectedRows);
    if (isAllSelected) {
      displayData.forEach((row, i) => newSet.delete(getRowKey(row, i)));
    } else {
      displayData.forEach((row, i) => newSet.add(getRowKey(row, i)));
    }
    setSelectedRows(newSet);
  }

  /**
   * Toggles the selection state for a single row.
   *
   * @param {string} key - The unique row key to toggle.
   */
  function handleSelectRow(key: string): void {
    const newSet = new Set(selectedRows);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setSelectedRows(newSet);
  }

  /**
   * Merges a partial filter update into the current filter state.
   *
   * @param {Partial<FilterState>} partial - The filter fields to update.
   */
  function handleFilterChange(partial: Partial<FilterState>): void {
    setFilters((prev) => ({ ...prev, ...partial }));
  }

  /**
   * Resets all filters, sort state, and row selection back to initial values.
   */
  function handleClearFilters(): void {
    setFilters(INITIAL_FILTERS);
    setSortKey(null);
    setSortOrder("asc");
    setSelectedRows(new Set());
  }

  /**
   * Retrieves the current copies value for a row, falling back to the row's default.
   *
   * @param {string} key - The unique row key.
   * @param {number} defaultVal - The default copies value from the data.
   * @returns {number} The current copies value for this row.
   */
  function getCopies(key: string, defaultVal: number): number {
    return itemCopies[key] ?? defaultVal;
  }

  /**
   * Updates the copies override for a specific row.
   * Ignores non-numeric or negative values.
   *
   * @param {string} key - The unique row key.
   * @param {string} value - The raw string value from the input field.
   */
  function handleCopiesChange(key: string, value: string): void {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setItemCopies((prev) => ({ ...prev, [key]: num }));
    }
  }

  /**
   * Handles column sort toggling. Reverses sort order when the same column is clicked twice.
   *
   * @param {SortKey} key - The column key to sort by.
   */
  function handleSort(key: SortKey): void {
    setSortOrder(sortKey === key && sortOrder === "asc" ? "desc" : "asc");
    setSortKey(key);
  }

  /**
   * Opens the preview dialog. Shows the prefetched image instantly when it is
   * already cached (no API call); otherwise renders that one item by its
   * product code on demand — position-independent, so a searched item beyond
   * the prefetched pages is handled the same way.
   */
  function handlePreview(row: BatchDetailItem): void {
    setPreviewOpen(true);
    setPreviewError(null);

    const cached = previewCacheRef.current[row.itemNumber];
    if (cached) {
      setPreviewImage(cached);
      setIsPreviewLoading(false);
      return;
    }

    setPreviewImage(null);
    setIsPreviewLoading(true);
    void (async () => {
      try {
        const rendered = await renderRowsByProductCode([row]);
        const img = rendered[row.itemNumber];
        if (!img) throw new Error("No preview image returned");
        previewCacheRef.current[row.itemNumber] = img; // cache for instant re-click
        setPreviewImage(img);
      } catch (err) {
        setPreviewError(err instanceof Error ? err.message : "Preview failed. Please try again.");
      } finally {
        setIsPreviewLoading(false);
      }
    })();
  }

  function handlePreviewClose(): void {
    setPreviewOpen(false);
  }

  function handlePreviewPrint(): void {
    if (!previewImage) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      `<html><body style="margin:0;display:flex;justify-content:center;">` +
      `<img src="data:image/png;base64,${previewImage}" style="max-width:100%;" onload="window.print();window.close();" />` +
      `</body></html>`
    );
    win.document.close();
  }

  /**
   * Returns the appropriate sort direction icon for a given column header.
   *
   * @param {SortKey} key - The column key to evaluate.
   * @returns {JSX.Element} The SVG sort icon.
   */
  function getSortIcon(key: SortKey): JSX.Element {
    if (sortKey !== key) return sortArrowDown;
    return sortOrder === "asc" ? sortArrowUp : sortArrowDown;
  }

  const sortArrowUp = (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 6L1.0575 7.0575L5.25 2.8725V12H6.75V2.8725L10.935 7.065L12 6L6 0L0 6Z" fill="#313335"/>
    </svg>
  );

  const sortArrowDown = (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6L10.9425 4.9425L6.75 9.1275V0H5.25V9.1275L1.065 4.935L0 6L6 12L12 6Z" fill="#313335"/>
    </svg>
  );

  const printIcon = (
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 5H3C1.34 5 0 6.34 0 8V14H4V18H16V14H20V8C20 6.34 18.66 5 17 5ZM14 16H6V11H14V16ZM17 9C16.45 9 16 8.55 16 8C16 7.45 16.45 7 17 7C17.55 7 18 7.45 18 8C18 8.55 17.55 9 17 9ZM16 0H4V4H16V0Z" fill="white"/>
    </svg>
  );

  const previewIcon = (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 16H2V2H9V0H2C0.89 0 0 0.9 0 2V16C0 17.1 0.89 18 2 18H16C17.1 18 18 17.1 18 16V9H16V16ZM11 0V2H14.59L4.76 11.83L6.17 13.24L16 3.41V7H18V0H11Z" fill="#3071A9"/>
    </svg>
  );

  return (
    <div className={styles.contentWrap}>
      <div className={styles.topContentBar}>
        <div className={styles.topTitle}>
          <h2>
            {batchParams
              ? `Signs Dashboard - ${batchParams.batchName}`
              : "Signs Dashboard - Daily Sign Maintenance"}
          </h2>
        </div>
        <div className={styles.actionWrap}>
          <ul>
            <li>
              <div className={`d-flex flex-align-center ${styles.lastUpdated}`}>
                <i>
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.2083 2.44792C12.6979 0.9375 10.625 0 8.32292 0C3.71875 0 0 3.72917 0 8.33333C0 12.9375 3.71875 16.6667 8.32292 16.6667C12.2083 16.6667 15.4479 14.0104 16.375 10.4167H14.2083C13.3542 12.8437 11.0417 14.5833 8.32292 14.5833C4.875 14.5833 2.07292 11.7812 2.07292 8.33333C2.07292 4.88542 4.875 2.08333 8.32292 2.08333C10.0521 2.08333 11.5937 2.80208 12.7187 3.9375L9.36458 7.29167H16.6562V0L14.2083 2.44792Z" fill="#79747E" />
                  </svg>
                </i>
                <p>Updated 10:31 am</p>
              </div>
            </li>
            <li>
              <i>
                <svg width="16" height="2" viewBox="0 0 16 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 0H0V2H16V0Z" fill="#79747E" />
                </svg>
              </i>
            </li>
            <li>
              <i>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 6.66667V0H8.33333L11.075 2.74167L2.74167 11.075L0 8.33333V15H6.66667L3.925 12.2583L12.2583 3.925L15 6.66667Z" fill="#79747E" />
                </svg>
              </i>
            </li>
            <li>
              <i>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="#79747E" />
                </svg>
              </i>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.groupBox}>

          <div className={styles.groupBoxHeader}>
            <div className={styles.subTitle}>
              <h3>{batchParams ? batchParams.batchName : "Daily Sign Maintenance"}</h3>
            </div>

            <div className={styles.filterButtonWrap}>
              <ul>
                {activeFilterCount > 0 && (
                  <li>
                      <p>({activeFilterCount} Filter{activeFilterCount !== 1 ? "s" : ""} Active)</p>
                  </li>
                  )}
                {activeFilterCount > 0 && (
                  <li>
                    <button type="button" className={styles.clearFiltersBtn} onClick={handleClearFilters}>
                      <span>Clear All Filters</span>
                    </button>
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    className="primaryButton"
                    disabled={selectedRows.size === 0 || worklistPrint.isOpen}
                    onClick={() => {
                      if (!batchParams) return;
                      // Apply per-row copies overrides before passing to the hook
                      const selectedItems = displayData
                        .filter((row, idx) => selectedRows.has(getRowKey(row, idx)))
                        .map((row) => {
                          const key = getRowKey(row, displayData.indexOf(row));
                          return { ...row, copies: getCopies(key, row.copies) };
                        });
                      void worklistPrint.openPrintModal(batchParams, selectedItems);
                    }}
                  >
                    <i>{printIcon}</i>
                    <span>{`Print (${displayData.reduce((sum, row, idx) => selectedRows.has(getRowKey(row, idx)) ? sum + getCopies(getRowKey(row, idx), row.copies) : sum, 0)})`}</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {batchError && <ErrorMessage message={batchError} />}

          <div className={styles.tableWrap} ref={tableScrollRef} onScroll={handleTableScroll}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  {/* Select-all checkbox */}
                  <th className={styles.checkboxCell}>
                    <div className={styles.thContent}>
                      <div className={styles.filterWrap}>
                        <ThemeProvider theme={tableFilterTheme}>
                          <Checkbox
                            size="small"
                            checked={isAllSelected}
                            indeterminate={isIndeterminate}
                            onChange={handleSelectAll}
                          />
                        </ThemeProvider>
                      </div>
                    </div>
                  </th>

                  {/* Date column */}
                  <th className={styles.thDatePickerCell}>
                    <div className={styles.thContent}>
                      <div className={styles.labelWrap}>
                        <span>Date</span>
                      </div>
                      <div className={styles.filterWrap}>
                        <ThemeProvider theme={datePickerTheme}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              value={filters.date}
                              onChange={(newValue) => handleFilterChange({ date: newValue })}
                              format="MM/DD/YYYY"
                              minDate={dayjs().subtract(6, "day")}
                              maxDate={dayjs()}
                              slotProps={{
                                textField: { size: "small", fullWidth: true },
                                actionBar: { actions: ["clear", "today"] },
                              }}
                            />
                          </LocalizationProvider>
                        </ThemeProvider>
                      </div>
                    </div>
                  </th>

                  {/* Item # column */}
                  <th>
                    <div className={styles.thContent}>
                      <div className={styles.labelWrap}>
                        <span>Item #</span>
                        <i className={styles.sortIcon} onClick={() => handleSort("itemNumber")}>{getSortIcon("itemNumber")}</i>
                      </div>
                      <div className={styles.filterWrap}>
                        <ThemeProvider theme={tableFilterTheme}>
                          <Autocomplete
                            size="small"
                            options={["", ...uniqueItemNumbers]}
                            getOptionLabel={(o) => o === "" ? "All" : o}
                            value={filters.itemNumber}
                            onChange={(_, val) => handleFilterChange({ itemNumber: val ?? "" })}
                            renderInput={(params) => (
                              <TextField {...params} placeholder="All"
                                inputProps={{
                                  ...params.inputProps, maxLength: 9,
                                  onInput: (e: React.FormEvent<HTMLInputElement>) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                                  },
                                }}
                              />
                            )}
                            disableClearable={false}
                          />
                        </ThemeProvider>
                      </div>
                    </div>
                  </th>

                  {/* Item Name column */}
                  <th>
                    <div className={styles.thContent}>
                      <div className={styles.labelWrap}>
                        <span>Item Name</span>
                        <i className={styles.sortIcon} onClick={() => handleSort("description")}>{getSortIcon("description")}</i>
                      </div>
                      <div className={styles.filterWrap}>
                        <ThemeProvider theme={tableFilterTheme}>
                          <Autocomplete
                            size="small"
                            options={["", ...uniqueItemNames]}
                            getOptionLabel={(o) => o === "" ? "All" : o}
                            value={filters.itemName}
                            onChange={(_, val) => handleFilterChange({ itemName: val ?? "" })}
                            renderInput={(params) => (
                              <TextField {...params} placeholder="All"
                                inputProps={{
                                  ...params.inputProps, maxLength: 37,
                                  onInput: (e: React.FormEvent<HTMLInputElement>) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z\s]/g, "");
                                  },
                                }}
                              />
                            )}
                            disableClearable={false}
                          />
                        </ThemeProvider>
                      </div>
                    </div>
                  </th>

                  {/* Change Reason column */}
                  <th>
                    <div className={styles.thContent}>
                      <div className={styles.labelWrap}>
                        <span>Change Reason</span>
                        <i className={styles.sortIcon} onClick={() => handleSort("changeReason")}>{getSortIcon("changeReason")}</i>
                      </div>
                      <div className={styles.filterWrap}>
                        <ThemeProvider theme={tableFilterTheme}>
                          <Autocomplete
                            size="small"
                            options={["", ...uniqueChangeReasons]}
                            getOptionLabel={(o) => o === "" ? "All" : o}
                            value={filters.changeReason}
                            onChange={(_, val) => handleFilterChange({ changeReason: val ?? "" })}
                            renderInput={(params) => (
                              <TextField {...params} placeholder="All"
                                inputProps={{
                                  ...params.inputProps, maxLength: 2,
                                  onInput: (e: React.FormEvent<HTMLInputElement>) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                                  },
                                }}
                              />
                            )}
                            disableClearable={false}
                          />
                        </ThemeProvider>
                      </div>
                    </div>
                  </th>

                  {/* Sign Size column */}
                  <th>
                    <div className={styles.thContent}>
                      <div className={styles.labelWrap}>
                        <span>Sign Size</span>
                        <i className={styles.sortIcon} onClick={() => handleSort("signSize")}>{getSortIcon("signSize")}</i>
                      </div>
                      <div className={styles.filterWrap}>
                        <ThemeProvider theme={tableFilterTheme}>
                          <Autocomplete
                            size="small"
                            options={["", ...uniqueSignSizes]}
                            getOptionLabel={(o) => o === "" ? "All" : o}
                            value={filters.signSize}
                            onChange={(_, val) => handleFilterChange({ signSize: val ?? "" })}
                            renderInput={(params) => (
                              <TextField {...params} placeholder="All"
                                inputProps={{
                                  ...params.inputProps, maxLength: 6,
                                  onInput: (e: React.FormEvent<HTMLInputElement>) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z\s]/g, "");
                                  },
                                }}
                              />
                            )}
                            disableClearable={false}
                          />
                        </ThemeProvider>
                      </div>
                    </div>
                  </th>

                  {/* Copies column */}
                  <th className={styles.thCopies}>
                    <div className={styles.thContent}>
                      <div className={styles.labelWrap}>
                        <span>Copies</span>
                        <i className={styles.sortIcon} onClick={() => handleSort("copies")}>{getSortIcon("copies")}</i>
                      </div>
                    </div>
                  </th>

                  {/* Print Status column */}
                  <th>
                    <div className={styles.thContent}>
                      <div className={styles.labelWrap}>
                        <span>Print Status</span>
                        <i className={styles.sortIcon} onClick={() => handleSort("printStatus")}>{getSortIcon("printStatus")}</i>
                      </div>
                      <div className={styles.filterWrap}>
                        <ThemeProvider theme={tableFilterTheme}>
                          <Autocomplete
                            size="small"
                            options={["", ...uniquePrintStatuses]}
                            getOptionLabel={(o) => o === "" ? "All" : o}
                            value={filters.printStatus}
                            onChange={(_, val) => handleFilterChange({ printStatus: val ?? "" })}
                            renderInput={(params) => (
                              <TextField {...params} placeholder="All"
                                inputProps={{
                                  ...params.inputProps, maxLength: 8,
                                  onInput: (e: React.FormEvent<HTMLInputElement>) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z\s]/g, "");
                                  },
                                }}
                              />
                            )}
                            disableClearable={false}
                          />
                        </ThemeProvider>
                      </div>
                    </div>
                  </th>

                  {/* Print Preview column */}
                  <th>
                    <div className={styles.thContent}>
                      <span>Print Preview</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {isBatchLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`shimmer-${i}`}>
                      <td>
                        <div className="shimmer checkbox m-auto"></div>
                      </td>
                      <td>
                        <div className="shimmer md"></div>
                      </td>
                      <td>
                        <div className="shimmer md"></div>
                      </td>
                      <td>
                        <div className="shimmer lg"></div>
                      </td>
                      <td>
                        <div className="shimmer lg"></div>
                      </td>
                      <td>
                        <div className="shimmer sm"></div>
                      </td>
                      <td>
                        <div className="shimmer sm"></div>
                      </td>
                      <td>
                        <div className="shimmer lg"></div>
                      </td>
                      <td>
                        <div className="shimmer md"></div>
                      </td>
                    </tr>
                  ))
                ) : displayData.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className={`${styles.noDatafound} noDataContent`}>
                        <h4>No records found</h4>
                        <label>No items match the current filters.</label>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleData.map((row, index) => {
                    const rowKey = getRowKey(row, index);
                    const isSelected = selectedRows.has(rowKey);
                    return (
                      <tr key={rowKey} className={isSelected ? styles.selectedRow : ""}>
                        <td className={styles.checkboxCell}>
                          <ThemeProvider theme={tableFilterTheme}>
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleSelectRow(rowKey)}
                            />
                          </ThemeProvider>
                        </td>
                        <td><p>{row.effectiveDate}</p></td>
                        <td><p>{row.itemNumber}</p></td>
                        <td><p>{row.description}</p></td>
                        <td><p>{row.changeReason}</p></td>
                        <td><p>{row.signSize}</p></td>
                        <td className={styles.thCopies}>
                          <ThemeProvider theme={tableFilterTheme}>
                            <TextField
                              fullWidth
                              size="small"
                              value={getCopies(rowKey, row.copies)}
                              onChange={(e) => handleCopiesChange(rowKey, e.target.value)}
                              variant="outlined"
                              type="number"
                              inputProps={{ min: 0 }}
                            />
                          </ThemeProvider>
                        </td>
                        <td>
                          <div className={styles.printStatusTag}>
                            <span>{row.printStatus}</span>
                          </div>
                        </td>
                        <td>
                          <button type="button" className={styles.previewBtn} onClick={() => void handlePreview(row)}>
                            <i>{previewIcon}</i>
                            <span>Preview</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <p>
              Showing {visibleData.length} of {displayData.length} rows
            </p>
          </div>
        </div>
      </div>

      <Dialog open={previewOpen} onClose={handlePreviewClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <div className={styles.previewDialogTitleRow}>
            <span>Sign Preview</span>
            <button type="button" onClick={handlePreviewClose} className={styles.previewDialogCloseIcon}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="#79747E"/>
              </svg>
            </button>
          </div>
        </DialogTitle>
        <DialogContent>
          {isPreviewLoading && (
            <div className={styles.previewDialogLoading}>
              <CircularProgress size={40} />
              <p>Loading preview…</p>
            </div>
          )}
          {previewError && !isPreviewLoading && (
            <ErrorMessage message={previewError} />
          )}
          {previewImage && !isPreviewLoading && (
            <div className={styles.previewDialogImageWrap}>
              <Image
                src={`data:image/png;base64,${previewImage}`}
                alt="Sign preview"
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: "100%", height: "auto" }}
                unoptimized
              />
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: "16px", gap: "8px", justifyContent: "flex-end" }}>
          <button type="button" onClick={handlePreviewClose} className={styles.previewDialogOutlineBtn}>
            Close
          </button>
          <button
            type="button"
            onClick={handlePreviewPrint}
            disabled={!previewImage || isPreviewLoading}
            className={styles.previewDialogPrimaryBtn}
          >
            <i>{printIcon}</i>
            <span>Print</span>
          </button>
        </DialogActions>
      </Dialog>

      {/* ── Worklist Print Progress Modal ── */}
      <PrintProgressModal
        isOpen={worklistPrint.isOpen}
        batchName={batchParams?.batchName ?? ""}
        mode="print"
        steps={worklistPrint.steps}
        error={worklistPrint.error}
        isDone={worklistPrint.isDone}
        successInfo={worklistPrint.successInfo}
        onClose={worklistPrint.closeModal}
        printers={worklistPrint.printers}
        trays={worklistPrint.trays}
        selectedPrinter={worklistPrint.selectedPrinter}
        selectedTray={worklistPrint.selectedTray}
        isLoadingPrinters={worklistPrint.isLoadingPrinters}
        onPrinterChange={(p) => void worklistPrint.onPrinterChange(p)}
        onTrayChange={worklistPrint.onTrayChange}
        onStartPrint={() => void worklistPrint.startPrint()}
        isPrintStarted={worklistPrint.isPrintStarted}
      />
    </div>
  );
}
