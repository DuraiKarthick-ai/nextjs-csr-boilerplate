"use client";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import { ThemeProvider } from "@mui/material/styles";
import { Autocomplete, CircularProgress, FormControl, MenuItem, Select } from "@mui/material";
import theme from "@/theme/customizeTheme";
import SuccessToast from "../../shared/SuccessToast";
import { AddFieldIcon } from "../../shared/icons";
import { usePrint } from "@/hooks/usePrint";
import { DEFAULT_STORE_ID, DEFAULT_REQUESTED_BY } from "@/constants/print";
import type { ByItemEntry, ByDepartmentCategoryEntry, PrintRequestPayload } from "@/types/print";
import { useItemSearch } from "../hooks/useItemSearch";
import type { ItemRow, ItemSearchResult, QuickSignTab, DeptForm } from "../quickSign.types";
import {
  SIZE_MAP,
  MAX_ITEM_DIGITS,
  MIN_SEARCH_LENGTH,
  MAX_ROW_COUNT,
  INITIAL_ITEM_ROWS,
  INITIAL_DEPT_FORM,
} from "../quickSign.constants";
import styles from "./quickPrintItem.module.scss";

/** Regex pattern to validate numeric-only input up to MAX_ITEM_DIGITS. */
const ITEM_INPUT_PATTERN = new RegExp(`^\\d{0,${MAX_ITEM_DIGITS}}$`);

/**
 * QuickSign component — Quick Sign Print screen.
 *
 * Supports two modes: "By Item" and "By Department & Category".
 * Collects user input and submits a print request via the shared usePrint hook.
 *
 * @returns {JSX.Element} The rendered Quick Sign Print view.
 */
export default function QuickPrintItem(): JSX.Element {
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
   * Handles paste events on item input fields.
   * Parses clipboard data (tab-separated, comma-separated, or one-per-line)
   * and populates rows starting from the pasted row index.
   * Adds new rows as needed up to MAX_ROW_COUNT.
   *
   * @param {React.ClipboardEvent} e - The paste event.
   * @param {number} startIndex - The row index where paste was triggered.
   */
  const handlePaste = (e: React.ClipboardEvent, startIndex: number): void => {
    const text = e.clipboardData.getData("text/plain").trim();
    if (!text) return;

    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (lines.length <= 1 && !lines[0]?.includes("\t") && !lines[0]?.includes(",")) return;

    e.preventDefault();

    const parsed: { item: string; qty: string }[] = lines.map((line) => {
      const parts = line.includes("\t") ? line.split("\t") : line.split(",");
      const rawItem = (parts[0] || "").trim().replace(/\D/g, "").slice(0, MAX_ITEM_DIGITS);
      const rawQty = (parts[1] || "").trim();
      const qty = /^\d+$/.test(rawQty) && Number(rawQty) > 0 ? rawQty : "1";
      return { item: rawItem, qty };
    }).filter((p) => p.item.length > 0);

    if (parsed.length === 0) return;

    setItemRows((prev) => {
      const updated = [...prev];
      let rowIdx = startIndex;

      for (const { item, qty } of parsed) {
        if (rowIdx >= MAX_ROW_COUNT) break;

        if (rowIdx >= updated.length) {
          updated.push({ itemNumberOrUpc: "", quantity: "1", selectedItem: null });
        }

        updated[rowIdx] = { itemNumberOrUpc: item, quantity: qty, selectedItem: null };
        rowIdx++;
      }

      return updated;
    });

    // Trigger search for each pasted item that meets the minimum length
    parsed.forEach((p, i) => {
      const rowIdx = startIndex + i;
      if (rowIdx < MAX_ROW_COUNT && p.item.length >= MIN_SEARCH_LENGTH) {
        triggerSearch(rowIdx, p.item);
      }
    });
  };

  /**
   * Adds one blank item row when all current rows are filled, up to MAX_ROW_COUNT.
   */
  const addItemRow = (): void => {
    if (!allRowsFilled() || itemRows.length >= MAX_ROW_COUNT) return;
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
    if (invalidRows.has(index)) return "Item # / UPC not found";
    if (printedRows.has(index) && printedMessage) return printedMessage;
    return undefined;
  };

  const successMessage = printResult
    ? `${printResult.responseMessage} \u2014 ${printResult.printerName}`
    : "";

  return (
    <div className={styles.quickPrintItem}>

      <div className={styles.subTitle}>
        <p>Quick Print - Item</p>
      </div>

      <div className={`d-flex ${styles.gridWrap} ${styles.gridPrintItem}`}>
        <div className={`${styles.grid} ${styles.gridSize}`}>
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
        <div className={styles.grid}>
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
                          placeholder="Enter or Scan Item # / UPC"
                          variant="outlined"
                          error={invalidRows.has(index)}
                          helperText={getItemHelperText(index)}
                          color={printedRows.has(index) ? "success" : undefined}
                          FormHelperTextProps={printedRows.has(index) ? { sx: { color: "green" } } : undefined}
                          onPaste={(e) => handlePaste(e, index)}
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
                {index === itemRows.length - 1 && allRowsFilled() && itemRows.length < MAX_ROW_COUNT && (
                  <div className={styles.addField}>
                    <i onClick={addItemRow}><AddFieldIcon /></i>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

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

      <SuccessToast
        open={printResult !== null}
        onClose={resetPrint}
        message={successMessage}
        />

    </div>

  );
}