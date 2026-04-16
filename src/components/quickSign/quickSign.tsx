"use client";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import { ThemeProvider } from "@mui/material/styles";
import { Autocomplete, CircularProgress, FormControl, MenuItem, Select, Switch, Snackbar, Alert } from "@mui/material";
import theme from "@/theme/customizeTheme";
import ContentWrapper from "../contentWrapper/contentWrapper";
import { usePrint } from "@/hooks/usePrint";
import type { ByItemEntry, ByDepartmentCategoryEntry, PrintRequestPayload } from "@/types/print";
import { useItemSearch } from "./hooks/useItemSearch";
import type { ItemRow, ItemSearchResult, QuickSignTab, DeptForm } from "./quickSign.types";
import {
  DEFAULT_STORE_ID,
  DEFAULT_REQUESTED_BY,
  SIZE_MAP,
  MAX_ITEM_DIGITS,
  MIN_SEARCH_LENGTH,
  INITIAL_ITEM_ROWS,
  INITIAL_DEPT_FORM,
} from "./quickSign.constants";
import styles from "./quickSign.module.scss";

/** Regex pattern to validate numeric-only input up to MAX_ITEM_DIGITS. */
const ITEM_INPUT_PATTERN = new RegExp(`^\\d{0,${MAX_ITEM_DIGITS}}$`);

/** SVG icon for the "add row" button. */
const AddFieldIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="#64686C" />
  </svg>
);

/**
 * QuickSign component — Quick Sign Print screen.
 *
 * Supports two modes: "By Item" and "By Department & Category".
 * Collects user input and submits a print request via the shared usePrint hook.
 *
 * @returns {JSX.Element} The rendered Quick Sign Print view.
 */
export default function QuickSign(): JSX.Element {
  const [active, setActive] = useState<QuickSignTab>("item");
  const [itemSize, setItemSize] = useState<number | "">("");
  const [itemRows, setItemRows] = useState<ItemRow[]>(INITIAL_ITEM_ROWS);
  const [deptForm, setDeptForm] = useState<DeptForm>({ ...INITIAL_DEPT_FORM });

  const { isPrinting, printResult, printError, submitPrint, resetPrint } = usePrint();
  const {
    searchOptions,
    searchLoading,
    invalidRows,
    printedRows,
    printedMessage,
    triggerSearch,
    clearInvalid,
    clearPrinted,
    markPrinted,
    resetSearch,
  } = useItemSearch();

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
   * Handles text input changes in the item Autocomplete field.
   * Validates numeric-only input, clears row status flags, and triggers search.
   *
   * @param {number} index - Row index.
   * @param {string} value - The new input value.
   */
  const handleItemInputChange = (index: number, value: string): void => {
    if (value !== "" && !ITEM_INPUT_PATTERN.test(value)) return;

    setItemRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, itemNumberOrUpc: value, selectedItem: null } : r))
    );

    if (invalidRows.has(index)) clearInvalid(index);
    if (printedRows.has(index)) clearPrinted(index);

    triggerSearch(index, value);
  };

  /**
   * Handles selection of an item from the Autocomplete dropdown.
   *
   * @param {number} index - Row index.
   * @param {ItemSearchResult | null} item - The selected item, or null if cleared.
   */
  const handleItemSelect = (index: number, item: ItemSearchResult | null): void => {
    setItemRows((prev) =>
      prev.map((r, i) =>
        i === index
          ? { ...r, itemNumberOrUpc: item ? String(item.itemNumber) : "", selectedItem: item }
          : r
      )
    );
  };

  /**
   * Whether all existing item rows have been filled (item number entered).
   *
   * @returns {boolean} True when every row has a non-empty item number.
   */
  const allRowsFilled = (): boolean => itemRows.every((r) => r.itemNumberOrUpc.trim() !== "");

  /**
   * Adds a new blank item row if the last row is filled.
   */
  const addItemRow = (): void => {
    const lastRow = itemRows[itemRows.length - 1];
    if (lastRow && lastRow.itemNumberOrUpc.trim() === "") return;
    setItemRows((prev) => [...prev, { itemNumberOrUpc: "", quantity: "1", selectedItem: null }]);
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
   * For "By Item": requires size, at least one filled row, all filled rows must have
   * a quantity and a valid selectedItem from the search API.
   * For "By Dept": requires department number.
   *
   * @returns {boolean} True when required fields are missing.
   */
  const isPrintDisabled = (): boolean => {
    if (isPrinting) return true;
    if (active === "item") {
      const hasSize = !!itemSize;
      const filledRows = itemRows.filter((r) => r.itemNumberOrUpc.trim() !== "");
      const allHaveQuantity = filledRows.every((r) => r.quantity.trim() !== "");
      const allHaveSelection = filledRows.every((r) => r.selectedItem !== null);
      return !hasSize || filledRows.length === 0 || !allHaveQuantity || !allHaveSelection;
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
    resetSearch();
    resetPrint();
  };

  /**
   * Builds and submits a "By Item" print request.
   * Validates that filled rows have a selectedItem; flags invalid rows.
   * On success, marks valid rows as printed with inline message.
   * Suppresses the popup dialog when there are also invalid rows.
   */
  const handleItemPrint = async (): Promise<void> => {
    const size = itemSize ? SIZE_MAP[itemSize] : undefined;
    if (!size) return;

    const validIndices: number[] = [];
    const invalid = new Set<number>();

    itemRows.forEach((r, i) => {
      if (r.itemNumberOrUpc.trim() !== "") {
        if (r.selectedItem) {
          validIndices.push(i);
        } else {
          invalid.add(i);
        }
      }
    });

    if (invalid.size > 0) {
      // handled by isPrintDisabled but kept as safety check
      return;
    }

    if (validIndices.length === 0) return;

    const entries: ByItemEntry[] = validIndices.map((i) => ({
      itemNumberOrUpc: itemRows[i]!.itemNumberOrUpc.trim(),
      size,
      quantity: Number(itemRows[i]!.quantity) || 1,
    }));

    const response = await submitPrint({
      storeId: DEFAULT_STORE_ID,
      requestedBy: DEFAULT_REQUESTED_BY,
      printRequests: [{ type: "BY_ITEM", entries }],
    });

    if (response) {
      markPrinted(validIndices, `${response.responseMessage} \u2014 ${response.printerName}`);
      if (invalid.size > 0) {
        resetPrint();
      }
    }
  };

  /**
   * Builds and submits a "By Department & Category" print request.
   * On success, resets the entire form.
   */
  const handleDeptPrint = async (): Promise<void> => {
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

    const result = await submitPrint({
      storeId: DEFAULT_STORE_ID,
      requestedBy: DEFAULT_REQUESTED_BY,
      printRequests: [{ type: "BY_DEPARTMENT_CATEGORY", entries }],
    });

    if (result) {
      setItemSize("");
      setItemRows([...INITIAL_ITEM_ROWS]);
      setDeptForm({ ...INITIAL_DEPT_FORM });
      resetSearch();
    }
  };

  /**
   * Dispatches the print action based on the active tab.
   */
  const handlePrint = async (): Promise<void> => {
    if (active === "item") {
      await handleItemPrint();
    } else {
      await handleDeptPrint();
    }
  };

  /**
   * Computes the helper text for a given item row based on its status.
   *
   * @param {number} index - Row index.
   * @returns {string | undefined} Helper text to display, or undefined.
   */
  const getItemHelperText = (index: number): string | undefined => {
    if (invalidRows.has(index)) return "Item not available";
    if (printedRows.has(index) && printedMessage) return printedMessage;
    return undefined;
  };

  const successMessage = printResult
    ? `${printResult.responseMessage} \u2014 ${printResult.printerName}`
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
                              handleItemInputChange(index, value);
                            }}
                            onChange={(_e, newValue) => handleItemSelect(index, newValue)}
                            getOptionLabel={(option) => `${option.itemNumber} - ${option.itemName}`}
                            isOptionEqualToValue={(option, val) => option.itemNumber === val.itemNumber}
                            filterOptions={(x) => x}
                            open={row.itemNumberOrUpc.length >= MIN_SEARCH_LENGTH && !row.selectedItem && (searchOptions[index] || []).length > 0}
                            noOptionsText=""
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                fullWidth
                                size="small"
                                placeholder="Enter Item # (min 5 digits)"
                                variant="outlined"
                                error={invalidRows.has(index)}
                                helperText={getItemHelperText(index)}
                                color={printedRows.has(index) ? "success" : undefined}
                                FormHelperTextProps={printedRows.has(index) ? { sx: { color: "green" } } : undefined}
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
                      {index === itemRows.length - 1 && (
                        <div className={styles.addField}>
                          <i onClick={addItemRow}><AddFieldIcon /></i>
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

          {printError && (
            <div className={styles.printError}>
              <p>{printError}</p>
            </div>
          )}
          
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

        <Snackbar
          open={printResult !== null}
          autoHideDuration={5000}
          onClose={resetPrint}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ position: "absolute", top: "10px", right: "10px" }}
        >
          <Alert
            onClose={resetPrint}
            severity="success"
            variant="standard"
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="#2e7d32"/>
              </svg>
            }
            sx={{
              backgroundColor: "#edf7ed",
              color: "#1e4620",
              border: "1px solid #c6e6c6",
              borderRadius: "4px",
              fontSize: "14px",
              maxWidth: "320px",
              "& .MuiAlert-message": { whiteSpace: "normal", wordBreak: "break-word" },
            }}
          >
            {successMessage}
          </Alert>
        </Snackbar>

    </ContentWrapper>
  );
}