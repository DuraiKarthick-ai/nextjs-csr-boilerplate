"use client";
import { useState, useRef } from "react";
import TextField from "@mui/material/TextField";
import { ThemeProvider } from "@mui/material/styles";
import { Autocomplete, CircularProgress, FormControl, MenuItem, Select, Switch } from "@mui/material";
import theme from "@/theme/customizeTheme";
import ContentWrapper from "../contentWrapper/contentWrapper";
import PrintSuccessDialog from "../printSuccessDialog/printSuccessDialog";
import { usePrint } from "@/hooks/usePrint";
import type { SignSize, ByItemEntry, ByDepartmentCategoryEntry, PrintRequestPayload } from "@/types/print";
import styles from "./quickSign.module.scss";

/** Default store and user — replace with real context values when available. */
const DEFAULT_STORE_ID = "1234";
const DEFAULT_REQUESTED_BY = "g197511";

/** Maps select option values to API sign sizes. */
const SIZE_MAP: Record<number, SignSize> = {
  10: "SMALL",
  20: "MEDIUM",
  30: "LARGE",
};

/** Shape of an item returned by the item-search API. */
interface ItemSearchResult {
  date: string;
  itemNumber: number;
  itemName: string;
  dept: string;
  upc: string;
  regularPrice: number;
  salePrice: number;
}

/** Item search mock API URL. */
const ITEM_SEARCH_URL = "https://69ce482633a09f831b7d3ab9.mockapi.io/api/v1/dashboard/itemSearch";

/** State shape for a single "By Item" row. */
interface ItemRow {
  itemNumberOrUpc: string;
  quantity: string;
  selectedItem: ItemSearchResult | null;
}

/** State shape for the "By Department & Category" form. */
interface DeptForm {
  departmentNumber: string;
  categoryCode: string;
  size: number | "";
  quantity: string;
  printOnlyItemsWithOnHand: boolean;
}

/** Number of item rows shown by default. */
const DEFAULT_ROW_COUNT = 6;

const INITIAL_ITEM_ROWS: ItemRow[] = Array.from({ length: DEFAULT_ROW_COUNT }, () => ({
  itemNumberOrUpc: "",
  quantity: "1",
  selectedItem: null,
}));

const INITIAL_DEPT_FORM: DeptForm = {
  departmentNumber: "",
  categoryCode: "",
  size: "",
  quantity: "",
  printOnlyItemsWithOnHand: true,
};

/**
 * QuickSign component — Quick Sign Print screen.
 *
 * Supports two modes: "By Item" and "By Department & Category".
 * Collects user input and submits a print request via the shared usePrint hook.
 *
 * @returns {JSX.Element} The rendered Quick Sign Print view.
 */
export default function QuickSign(): JSX.Element {
  const [active, setActive] = useState("item");
  const [itemSize, setItemSize] = useState<number | "">("");
  const [itemRows, setItemRows] = useState<ItemRow[]>(INITIAL_ITEM_ROWS);
  const [deptForm, setDeptForm] = useState<DeptForm>({ ...INITIAL_DEPT_FORM });
  const { isPrinting, printResult, printError, submitPrint, resetPrint } = usePrint();

  const [searchOptions, setSearchOptions] = useState<Record<number, ItemSearchResult[]>>({});
  const [searchLoading, setSearchLoading] = useState<Record<number, boolean>>({});
  const searchTimerRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  /**
   * Fetches item search results for a given row after a 300ms debounce.
   * Only triggers when the query is at least 5 numeric digits.
   */
  const handleItemSearch = (index: number, query: string): void => {
    if (searchTimerRef.current[index]) clearTimeout(searchTimerRef.current[index]);
    if (query.length < 5) {
      setSearchOptions((prev) => ({ ...prev, [index]: [] }));
      return;
    }
    searchTimerRef.current[index] = setTimeout(async () => {
      setSearchLoading((prev) => ({ ...prev, [index]: true }));
      try {
        const res = await fetch(`${ITEM_SEARCH_URL}?search=${encodeURIComponent(query)}`);
        const data: ItemSearchResult[] = res.ok ? await res.json() : [];
        setSearchOptions((prev) => ({ ...prev, [index]: data }));
      } catch {
        setSearchOptions((prev) => ({ ...prev, [index]: [] }));
      } finally {
        setSearchLoading((prev) => ({ ...prev, [index]: false }));
      }
    }, 300);
  };

  const clearIcon = (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 0C4.47 0 0 4.47 0 10C0 15.53 4.47 20 10 20C15.53 20 20 15.53 20 10C20 4.47 15.53 0 10 0ZM15 13.59L13.59 15L10 11.41L6.41 15L5 13.59L8.59 10L5 6.41L6.41 5L10 8.59L13.59 5L15 6.41L11.41 10L15 13.59Z" fill="#64686C" />
    </svg>
  );

  const addFieldIcon = (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="#64686C" />
    </svg>
  );

  /**
   * Updates a single field in an item row by index.
   *
   * @param {number} index - Row index.
   * @param {keyof ItemRow} field - Field name to update.
   * @param {string} value - New value.
   */
  const updateItemRow = (index: number, field: keyof ItemRow, value: string): void => {
    setItemRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  /**
   * Whether all existing item rows have been filled (item number entered).
   *
   * @returns {boolean} True when every row has a non-empty item number.
   */
  const allRowsFilled = (): boolean => {
    return itemRows.every((r) => r.itemNumberOrUpc.trim() !== "");
  };

  /**
   * Adds a new blank item row.
   */
  const addItemRow = (): void => {
    setItemRows((prev) => [...prev, { itemNumberOrUpc: "", quantity: "1", selectedItem: null }]);
  };

  /**
   * Removes an item row by index.
   *
   * @param {number} index - Row index to remove.
   */
  const removeItemRow = (index: number): void => {
    setItemRows((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Returns the count of valid (non-empty) items for the print button label.
   *
   * @returns {number} Count of valid entries.
   */
  const getPrintCount = (): number => {
    if (active === "item") {
      return itemRows.filter((r) => r.itemNumberOrUpc.trim() !== "").length;
    }
    return deptForm.departmentNumber.trim() !== "" ? 1 : 0;
  };

  /**
   * Whether the Print button should be disabled based on mandatory field validation.
   *
   * @returns {boolean} True when required fields are missing.
   */
  const isPrintDisabled = (): boolean => {
    if (isPrinting) return true;
    if (active === "item") {
      const hasSize = !!itemSize;
      const filledRows = itemRows.filter((r) => r.itemNumberOrUpc.trim() !== "");
      const allHaveQuantity = filledRows.every((r) => r.quantity.trim() !== "");
      return !hasSize || filledRows.length === 0 || !allHaveQuantity;
    }
    return !deptForm.departmentNumber.trim();
  };

  /**
   * Resets all form state back to defaults.
   */
  const handleReset = (): void => {
    setItemSize("");
    setItemRows([...INITIAL_ITEM_ROWS]);
    setDeptForm({ ...INITIAL_DEPT_FORM });
    setSearchOptions({});
    setSearchLoading({});
    resetPrint();
  };

  /**
   * Builds and submits the print request payload from current form state.
   */
  const handlePrint = async (): Promise<void> => {
    let payload: PrintRequestPayload;

    if (active === "item") {
      const size = itemSize ? SIZE_MAP[itemSize] : undefined;
      if (!size) return;

      const entries: ByItemEntry[] = itemRows
        .filter((r) => r.itemNumberOrUpc.trim() !== "")
        .map((r) => ({
          itemNumberOrUpc: r.itemNumberOrUpc.trim(),
          size,
          quantity: Number(r.quantity) || 1,
        }));

      if (entries.length === 0) return;

      payload = {
        storeId: DEFAULT_STORE_ID,
        requestedBy: DEFAULT_REQUESTED_BY,
        printRequests: [{ type: "BY_ITEM", entries }],
      };
    } else {
      if (!deptForm.departmentNumber.trim()) return;
      const size = deptForm.size ? SIZE_MAP[deptForm.size] : undefined;
      if (!size) return;

      const entries: ByDepartmentCategoryEntry[] = [
        {
          departmentNumber: deptForm.departmentNumber.trim(),
          categoryCode: deptForm.categoryCode.trim() || null,
          size,
          quantity: Number(deptForm.quantity) || 1,
          printOnlyItemsWithOnHand: deptForm.printOnlyItemsWithOnHand,
        },
      ];

      payload = {
        storeId: DEFAULT_STORE_ID,
        requestedBy: DEFAULT_REQUESTED_BY,
        printRequests: [{ type: "BY_DEPARTMENT_CATEGORY", entries }],
      };
    }

    await submitPrint(payload);
  };

  const successMessage =
    printResult
      ? `${printResult.responseMessage} — ${printResult.printerName}`
      : "";

  return (
    <ContentWrapper title="Signs Management">
        <div className={styles.groupBox}>

          <div className={styles.tabsHeading}>
            <ul>
              <li>
                <button
                  className={`${styles.tab} ${active === "item" ? styles.active : ""}`}
                  onClick={() => setActive("item")}
                >
                  By Item
                </button>
              </li>
              <li>
                <button
                  className={`${styles.tab} ${active === "dept" ? styles.active : ""}`}
                  onClick={() => setActive("dept")}
                >
                  By Department & Category
                </button>
              </li>
            </ul>
          </div>

          <div className={styles.subTitle}>
            {active === "item" && <p>Quick Print - Item</p>}
            {active === "dept" && <p>Quick Print - Department & Category</p>}
          </div>

          {/* By Item Tab */}
          {active === "item" && (
            <div className={`d-flex ${styles.gridWrap}`}>
              <div className={styles.grid}>
                <ul>
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">Size</label>
                      <ThemeProvider theme={theme}>
                        <FormControl fullWidth size="small">
                          <Select
                            displayEmpty
                            value={itemSize}
                            onChange={(e) => setItemSize(e.target.value as number | "")}
                            inputProps={{ "aria-label": "Select Size" }}
                          >
                            <MenuItem value="" disabled>Select Any</MenuItem>
                            <MenuItem value={10}>Small</MenuItem>
                            <MenuItem value={20}>Medium</MenuItem>
                            <MenuItem value={30}>Large</MenuItem>
                          </Select>
                        </FormControl>
                      </ThemeProvider>
                    </div>
                  </li>
                </ul>
              </div>
              <div className={`${styles.grid} ${styles.gridItemRows}`}>
                <ul>
                  {itemRows.map((row, index) => (
                    <li key={`item-${index}`} className={styles.itemRow}>
                      <div className={`inputLabelWrap ${styles.itemField}`}>
                        {index === 0 && <label className="label">Item # / UPC</label>}
                        <ThemeProvider theme={theme}>
                          <Autocomplete<ItemSearchResult>
                            options={searchOptions[index] || []}
                            loading={searchLoading[index] || false}
                            value={row.selectedItem}
                            inputValue={row.itemNumberOrUpc}
                            onInputChange={(_e, value, reason) => {
                              if (reason !== "input") return;
                              // Only allow numeric, max 7 digits
                              if (value !== "" && !/^\d{0,7}$/.test(value)) return;
                              setItemRows((prev) => prev.map((r, i) => i === index ? { ...r, itemNumberOrUpc: value, selectedItem: null } : r));
                              handleItemSearch(index, value);
                            }}
                            onChange={(_e, newValue) => {
                              setItemRows((prev) => prev.map((r, i) => i === index ? {
                                ...r,
                                itemNumberOrUpc: newValue ? String(newValue.itemNumber) : "",
                                selectedItem: newValue,
                              } : r));
                              if (newValue) setSearchOptions((prev) => ({ ...prev, [index]: [] }));
                            }}
                            getOptionLabel={(option) => `${option.itemNumber} - ${option.itemName}`}
                            isOptionEqualToValue={(option, val) => option.itemNumber === val.itemNumber}
                            filterOptions={(x) => x}
                            noOptionsText="Type at least 5 digits to search"
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                fullWidth
                                size="small"
                                placeholder="Enter Item # (min 5 digits)"
                                variant="outlined"
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {searchLoading[index] ? <CircularProgress size={18} /> : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                          />
                        </ThemeProvider>
                      </div>
                      <div className={`inputLabelWrap ${styles.qtyField}`}>
                        {index === 0 && <label className="label">Quantity</label>}
                        <ThemeProvider theme={theme}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="1"
                            variant="outlined"
                            type="number"
                            value={row.quantity}
                            onChange={(e) => updateItemRow(index, "quantity", e.target.value)}
                          />
                        </ThemeProvider>
                      </div>
                      {index === itemRows.length - 1 && allRowsFilled() && (
                        <div className={styles.addField}>
                          <i onClick={addItemRow}>{addFieldIcon}</i>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* By Department & Category Tab */}
          {active === "dept" && (
            <div className={`d-flex ${styles.gridWrap}`}>
              <div className={styles.grid}>
                <ul>
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">Department #<span className="mandatoryStar">*</span></label>
                      <ThemeProvider theme={theme}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Enter Department #"
                          variant="outlined"
                          value={deptForm.departmentNumber}
                          onChange={(e) => setDeptForm((prev) => ({ ...prev, departmentNumber: e.target.value }))}
                        />
                      </ThemeProvider>
                    </div>
                  </li>
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">Cat Code #</label>
                      <ThemeProvider theme={theme}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Enter Category Code"
                          variant="outlined"
                          value={deptForm.categoryCode}
                          onChange={(e) => setDeptForm((prev) => ({ ...prev, categoryCode: e.target.value }))}
                        />
                      </ThemeProvider>
                      <span className="validationMsg info">Leave Blank for All</span>
                    </div>
                  </li>
                  <li>
                    <div className={styles.toggleWrap}>
                      <label className="label">PRINT ONLY ITEMS WITH ON HAND</label>
                      <ThemeProvider theme={theme}>
                        <Switch
                          checked={deptForm.printOnlyItemsWithOnHand}
                          onChange={(e) => setDeptForm((prev) => ({ ...prev, printOnlyItemsWithOnHand: e.target.checked }))}
                        />
                      </ThemeProvider>
                    </div>
                  </li>
                </ul>
              </div>
              <div className={styles.grid}>
                <ul>
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">Size</label>
                      <ThemeProvider theme={theme}>
                        <FormControl fullWidth size="small">
                          <Select
                            displayEmpty
                            value={deptForm.size}
                            onChange={(e) => setDeptForm((prev) => ({ ...prev, size: e.target.value as number | "" }))}
                            inputProps={{ "aria-label": "Select Size" }}
                          >
                            <MenuItem value="" disabled>Select Size</MenuItem>
                            <MenuItem value={10}>Small</MenuItem>
                            <MenuItem value={20}>Medium</MenuItem>
                            <MenuItem value={30}>Large</MenuItem>
                          </Select>
                        </FormControl>
                      </ThemeProvider>
                    </div>
                  </li>
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">Quantity</label>
                      <ThemeProvider theme={theme}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Enter Quantity"
                          variant="outlined"
                          type="number"
                          value={deptForm.quantity}
                          onChange={(e) => setDeptForm((prev) => ({ ...prev, quantity: e.target.value }))}
                        />
                      </ThemeProvider>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {printError && <p className="errorMsg">{printError}</p>}
          
          <div className={styles.buttonWrap}>
            <ul>
              <li>
                <button className="primaryButtonOutline" onClick={handleReset}>Reset</button>
              </li>
              <li>
                <button className="primaryButton" disabled={isPrintDisabled()} onClick={handlePrint}>
                  {isPrinting ? "Printing…" : `Print (${getPrintCount()})`}
                </button>
              </li>
            </ul>
          </div>

        </div>

        <PrintSuccessDialog
          open={printResult !== null}
          onClose={resetPrint}
          title="Printed Successfully"
          message={successMessage}
        />

    </ContentWrapper>
  );
}