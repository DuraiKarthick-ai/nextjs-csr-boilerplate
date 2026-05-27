"use client";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import { ThemeProvider } from "@mui/material/styles";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { theme } from "@/theme/customizeTheme";
import SuccessToast from "../../shared/SuccessToast";
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

const ECS_PRINT_SERVER  = process.env.NEXT_PUBLIC_ECS_PRINT_SERVER_URL ?? "https://localhost.ecsglobalinc.com:8083";
const ECS_WEB_SERVER    = process.env.NEXT_PUBLIC_ECS_WEB_SERVER_URL  ?? "https://costcotest.ecsglobalinc.com:443";

/** Steps matching signs-print routes exactly. */
const ECS_STEPS = [
  { step: "logon",                label: "Step 1 — Logon",                  method: "POST [userName,password,apiToken]",        endpoint: `${ECS_WEB_SERVER}/ecs/logon.sws`,    needsSession: false },
  { step: "create-session",      label: "Step 2 — Create Session",          method: "create-session",                          endpoint: `${ECS_PRINT_SERVER}/`,               needsSession: false },
  { step: "batchSign-preview",   label: "Step 3 — Load Batch Preview",      method: "batchSign-preview",                       endpoint: `${ECS_PRINT_SERVER}/`,               needsSession: true  },
  { step: "preview-first",       label: "Step 4a — Preview First",          method: "preview-first",                           endpoint: `${ECS_PRINT_SERVER}/`,               needsSession: true  },
  { step: "preview-next",        label: "Step 4b — Preview Next",           method: "preview-next",                            endpoint: `${ECS_PRINT_SERVER}/`,               needsSession: true  },
  { step: "preview-last",        label: "Step 4c — Preview Last",           method: "preview-last",                            endpoint: `${ECS_PRINT_SERVER}/`,               needsSession: true  },
  { step: "get-layouts-from-sink",label: "Step 5 — Get Layouts",           method: "get-layouts-from-sink",                   endpoint: `${ECS_PRINT_SERVER}/`,               needsSession: true  },
  { step: "get-printers",        label: "Step 6 — Get Printers",           method: "get-printers",                            endpoint: `${ECS_PRINT_SERVER}/`,               needsSession: true  },
  { step: "get-trays",           label: "Step 7 — Get Trays",              method: "get-trays",                               endpoint: `${ECS_PRINT_SERVER}/`,               needsSession: true  },
  { step: "print-signs-for-layout",label: "Step 8 — Print Layout",         method: "print-signs-for-layout",                  endpoint: `${ECS_PRINT_SERVER}/`,               needsSession: true  },
];

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
  const [itemSize, setItemSize] = useState<"" | "SMALL" | "MEDIUM" | "LARGE">("");
  const [itemRows, setItemRows] = useState<ItemRow[]>(INITIAL_ITEM_ROWS);
  const [deptForm, setDeptForm] = useState<DeptForm>({ ...INITIAL_DEPT_FORM });

  const { isPrinting, printResult, printError, submitPrint, resetPrint } = usePrint();

  /** Session ID captured from create-session, fed into all subsequent steps. */
  const [testSessionID, setTestSessionID] = useState<string>("");
  /** Token captured from logon, used if needed. */
  const [testToken, setTestToken] = useState<string>("");
  /** Printer name captured from get-printers. */
  const [testPrinter, setTestPrinter] = useState<string>("");
  /** First layout ID captured from get-layouts-from-sink. */
  const [testLayoutId, setTestLayoutId] = useState<string>("");
  /** Editable inputs for batchSign-preview. */
  const [batchJobID, setBatchJobID]       = useState<string>("237022");
  const [batchBatchID, setBatchBatchID]   = useState<string>("17254");
  const [batchSellUnit, setBatchSellUnit] = useState<string>("100");

  type StepState = { loading: boolean; sentPayload: unknown; response: unknown; error: string | null };
  const [stepStates, setStepStates] = useState<Record<string, StepState>>({});

  /**
   * Calls /api/print/ecs-step for the given step name, chaining
   * sessionID / token / printer / layoutId from previous step responses.
   *
   * @param {string} stepName - ECS step identifier matching signs-print route methods.
   */
  const runEcsStep = async (stepName: string): Promise<void> => {
    setStepStates((prev) => ({
      ...prev,
      [stepName]: { loading: true, sentPayload: null, response: null, error: null },
    }));

    const body: Record<string, unknown> = {
      step:      stepName,
      storeId:   DEFAULT_STORE_ID,
      sessionID: testSessionID || undefined,
      token:     testToken     || undefined,
      printer:   testPrinter   || undefined,
      layoutId:  testLayoutId  || undefined,
    };

    if (stepName === "batchSign-preview") {
      body.jobID      = Number(batchJobID);
      body.batchID    = Number(batchBatchID);
      body.sellUnitId = batchSellUnit;
    }

    try {
      const res  = await fetch("/api/print/ecs-step", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = (await res.json()) as {
        sentPayload?: unknown;
        response?:    unknown;
        statusCode?:  number;
        error?:       string;
      };

      const resp = data.response as Record<string, unknown> | undefined;

      if (stepName === "logon") {
        const raw = Array.isArray(resp) ? (resp[0] as Record<string, unknown>) : resp;
        const tok = raw?.token;
        if (typeof tok === "string" && tok) setTestToken(tok);
      }
      if (stepName === "create-session") {
        const sid = resp?.sessionID;
        if (typeof sid === "string" && sid) setTestSessionID(sid);
      }
      if (stepName === "get-printers") {
        const list = resp?.printers;
        if (Array.isArray(list) && list.length > 0) setTestPrinter(String(list[0]));
      }
      if (stepName === "get-layouts-from-sink") {
        const layouts = resp?.layouts ?? resp;
        const first = Array.isArray(layouts) ? (layouts[0] as Record<string, unknown>) : null;
        if (first?.layoutID_1) setTestLayoutId(String(first.layoutID_1));
      }

      setStepStates((prev) => ({
        ...prev,
        [stepName]: {
          loading:     false,
          sentPayload: data.sentPayload ?? null,
          response:    data.response    ?? data,
          error:       data.error       ?? null,
        },
      }));
    } catch (err) {
      setStepStates((prev) => ({
        ...prev,
        [stepName]: {
          loading:     false,
          sentPayload: null,
          response:    null,
          error:       err instanceof Error ? err.message : "Request failed",
        },
      }));
    }
  };
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
   * Returns the active lookup value for a row, preferring item number over UPC.
   *
   * @param {ItemRow} row - The row to inspect.
   * @returns {string} The lookup value used for search and print.
   */
  const getRowLookupValue = (row: ItemRow): string => row.itemNumber.trim() || row.upc.trim();

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
  const handleItemInputChange = (
    index: number,
    field: "upc" | "itemNumber",
    value: string,
  ): void => {
    if (value !== "" && !ITEM_INPUT_PATTERN.test(value)) return;

    setItemRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) {
          return r;
        }

        return {
          ...r,
          upc: field === "upc" ? value : "",
          itemNumber: field === "itemNumber" ? value : "",
          selectedItem: null,
        };
      })
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
          ? {
              ...r,
              upc: "",
              itemNumber: item ? String(item.itemNumber) : "",
              selectedItem: item,
            }
          : r
      )
    );
  };

  /**
   * Whether all existing item rows have been filled (item number entered).
   *
   * @returns {boolean} True when every row has a non-empty item number.
   */
  const allRowsFilled = (): boolean => itemRows.every((r) => getRowLookupValue(r) !== "");

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
          updated.push({ upc: "", itemNumber: "", quantity: "1", selectedItem: null });
        }

        updated[rowIdx] = { upc: item, itemNumber: "", quantity: qty, selectedItem: null };
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
    if (itemRows.length >= MAX_ROW_COUNT) return;
    setItemRows((prev) => [...prev, { upc: "", itemNumber: "", quantity: "1", selectedItem: null }]);
  };

  /**
   * Handles focus on the last item input field.
   * Automatically adds a new row when the user focuses on the last row.
   *
   * @param {number} index - Row index being focused.
   */
  const handleItemFocus = (index: number): void => {
    if (index === itemRows.length - 1 && itemRows.length < MAX_ROW_COUNT) {
      addItemRow();
    }
  };

  /**
   * Returns the count of valid (non-empty) items for the print button label.
   *
   * @returns {number} Count of valid entries.
   */
  const getPrintCount = (): number => {
    if (active === "item") {
      return itemRows.filter((r) => getRowLookupValue(r) !== "").length;
    }
    return deptForm.departmentNumber.trim() !== "" ? 1 : 0;
  };

  /**
   * Whether the Print button should be disabled based on mandatory field validation.
    * For "By Item": requires size, at least one filled row, and quantity for each
    * filled row. Item lookup uses entered item#/UPC directly during submission.
   * For "By Dept": requires department number.
   *
   * @returns {boolean} True when required fields are missing.
   */
  const isPrintDisabled = (): boolean => {
    if (isPrinting) return true;
    if (active === "item") {
      const hasSize = !!itemSize;
      const filledRows = itemRows.filter((r) => getRowLookupValue(r) !== "");
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
    resetSearch();
    resetPrint();
  };

  /**
   * Builds and submits a "By Item" print request.
   * Uses entered item#/UPC values from filled rows.
   * On success, marks submitted rows as printed with inline message.
   */
  const handleItemPrint = async (): Promise<void> => {
    const size = itemSize ? SIZE_MAP[itemSize] : undefined;
    if (!size) return;

    const validIndices: number[] = [];

    itemRows.forEach((r, i) => {
      if (getRowLookupValue(r) !== "") {
        validIndices.push(i);
      }
    });

    if (validIndices.length === 0) return;

    const entries: ByItemEntry[] = validIndices.map((i) => ({
      itemNumberOrUpc: getRowLookupValue(itemRows[i]!),
      size,
      quantity: Number(itemRows[i]!.quantity) || 1,
    }));

    const response = await submitPrint(
      {
        storeId: DEFAULT_STORE_ID,
        requestedBy: DEFAULT_REQUESTED_BY,
        printRequests: [{ type: "BY_ITEM", entries }],
      },
      { mode: "QUICK_PREVIEW" },
    );

    if (response) {
      markPrinted(validIndices, `${response.responseMessage} \u2014 ${response.printerName}`);
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
   * @param {"upc" | "itemNumber"} field - Active field for the row.
   * @returns {string | undefined} Helper text to display, or undefined.
   */
  const getItemHelperText = (index: number, field: "upc" | "itemNumber"): string | undefined => {
    if (invalidRows.has(index)) {
      return field === "upc" ? "UPC not found" : "Item # not found";
    }
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
                      onChange={(e) => setItemSize(e.target.value as "" | "SMALL" | "MEDIUM" | "LARGE")}
                      inputProps={{ "aria-label": "Select Size" }}
                    >
                      <MenuItem value="" disabled>Select Any</MenuItem>
                      <MenuItem value="SMALL">S-Small</MenuItem>
                      <MenuItem value="MEDIUM">M-Medium</MenuItem>
                      <MenuItem value="LARGE">L-Large</MenuItem>
                    </Select>
                  </FormControl>
                </ThemeProvider>
              </div>
            </li>
          </ul>
        </div>
        <div className={styles.grid}>
          <ul>
            {itemRows.map((row, index) => {
              const hasUpcValue = row.upc.trim() !== "";
              const hasItemNumberValue = row.itemNumber.trim() !== "";
              const showUpcStatus = hasUpcValue;
              const showItemStatus = hasItemNumberValue;
              const isItemNumberDisabled = hasUpcValue;

              return (
              <li key={`item-${index}`} className={styles.itemRow}>
                <div className={`inputLabelWrap ${styles.itemField}`}>
                  {index === 0 && <label className={`label ${invalidRows.has(index) && showItemStatus ? 'errorLabel' : ""}`}>Item #</label>}
                  <ThemeProvider theme={theme}>
                    <Autocomplete<ItemSearchResult>
                      options={searchOptions[index] || []}
                      loading={searchLoading[index] || false}
                      value={row.selectedItem}
                      inputValue={row.itemNumber}
                      disabled={isItemNumberDisabled}
                      forcePopupIcon={!isItemNumberDisabled}
                      onInputChange={(_e, value, reason) => {
                        if (reason !== "input") return;
                        handleItemInputChange(index, "itemNumber", value);
                      }}
                      onChange={(_e, newValue) => handleItemSelect(index, newValue)}
                      getOptionLabel={(option) => `${option.itemNumber} - ${option.itemName}`}
                      isOptionEqualToValue={(option, val) => option.itemNumber === val.itemNumber}
                      filterOptions={(x) => x}
                      open={row.itemNumber.length >= MIN_SEARCH_LENGTH && !row.selectedItem && (searchOptions[index] || []).length > 0}
                      noOptionsText=""
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          size="small"
                          placeholder="Enter or Scan Item #"
                          variant="outlined"
                          error={invalidRows.has(index) && showItemStatus}
                          helperText={showItemStatus ? getItemHelperText(index, "itemNumber") : undefined}
                          color={printedRows.has(index) && showItemStatus ? "success" : undefined}
                          FormHelperTextProps={printedRows.has(index) && showItemStatus ? { sx: { color: "green" } } : undefined}
                          onFocus={() => handleItemFocus(index)}
                          onPaste={(e) => handlePaste(e, index)}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: isItemNumberDisabled
                              ? null
                              : (
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
                <div className={`inputLabelWrap ${styles.upcField}`}>
                  {index === 0 && <label className={`label ${invalidRows.has(index) && showUpcStatus ? 'errorLabel' : ""}`}>UPC</label>}
                  <ThemeProvider theme={theme}>
                    <TextField
                      id={`upc-${index}`}
                      fullWidth
                      size="small"
                      placeholder="Enter or Scan UPC"
                      variant="outlined"
                      value={row.upc}
                      disabled={row.itemNumber.trim() !== ""}
                      error={invalidRows.has(index) && showUpcStatus}
                      helperText={showUpcStatus ? getItemHelperText(index, "upc") : undefined}
                      color={printedRows.has(index) && showUpcStatus ? "success" : undefined}
                      FormHelperTextProps={printedRows.has(index) && showUpcStatus ? { sx: { color: "green" } } : undefined}
                      onChange={(e) => handleItemInputChange(index, "upc", e.target.value)}
                      onFocus={() => handleItemFocus(index)}
                      onPaste={(e) => handlePaste(e, index)}
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
              </li>
              );
            })}
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

      <div className={styles.ecsStepsPanel}>
        <div className={styles.ecsStepsTitle}>
          <span>ECS API Test Panel</span>
          <span className={styles.ecsServerLabel}>
            Print: {ECS_PRINT_SERVER} &nbsp;|&nbsp; Web: {ECS_WEB_SERVER}
          </span>
          {testSessionID && <span className={styles.ecsSessionBadge}>sessionID: {testSessionID}</span>}
          {testToken     && <span className={styles.ecsTokenBadge}>token: {testToken.slice(0, 20)}&#8230;</span>}
        </div>

        {ECS_STEPS.map((s, i) => {
          const state       = stepStates[s.step];
          const hasResponse = state !== undefined && state.response !== null && !state.error;
          const hasError    = state !== undefined && !!state.error;
          return (
            <div key={s.step} className={styles.ecsStep}>
              <div className={styles.ecsStepHeader}>
                <span className={styles.ecsStepNumber}>{i + 1}</span>
                <div className={styles.ecsStepMeta}>
                  <span className={styles.ecsStepName}>{s.label}</span>
                  <span className={styles.ecsStepEndpoint}>{s.method} &rarr; {s.endpoint}</span>
                </div>
                <button
                  className={styles.ecsRunBtn}
                  disabled={state?.loading ?? false}
                  onClick={() => runEcsStep(s.step)}
                >
                  {state?.loading ? "Running…" : "Run"}
                </button>
              </div>

              {s.step === "batchSign-preview" && (
                <div className={styles.ecsInputRow}>
                  <label className={styles.ecsInputLabel}>Job ID
                    <input className={styles.ecsInput} value={batchJobID} onChange={(e) => setBatchJobID(e.target.value)} />
                  </label>
                  <label className={styles.ecsInputLabel}>Batch ID
                    <input className={styles.ecsInput} value={batchBatchID} onChange={(e) => setBatchBatchID(e.target.value)} />
                  </label>
                  <label className={styles.ecsInputLabel}>Sell Unit ID
                    <input className={styles.ecsInput} value={batchSellUnit} onChange={(e) => setBatchSellUnit(e.target.value)} />
                  </label>
                </div>
              )}
              {s.step === "get-trays" && (
                <div className={styles.ecsInputRow}>
                  <label className={styles.ecsInputLabel}>Printer
                    <input className={styles.ecsInput} value={testPrinter} onChange={(e) => setTestPrinter(e.target.value)} placeholder="auto-filled from get-printers" />
                  </label>
                </div>
              )}
              {s.step === "print-signs-for-layout" && (
                <div className={styles.ecsInputRow}>
                  <label className={styles.ecsInputLabel}>Layout ID
                    <input className={styles.ecsInput} value={testLayoutId} onChange={(e) => setTestLayoutId(e.target.value)} placeholder="auto-filled from get-layouts-from-sink" />
                  </label>
                  <label className={styles.ecsInputLabel}>Printer
                    <input className={styles.ecsInput} value={testPrinter} onChange={(e) => setTestPrinter(e.target.value)} placeholder="auto-filled from get-printers" />
                  </label>
                </div>
              )}

              <div className={styles.ecsStepBody}>
                <div className={styles.ecsStepCol}>
                  <div className={styles.ecsStepColLabel}>Request Payload</div>
                  <pre className={styles.ecsStepPayload}>
                    {JSON.stringify(state?.sentPayload ?? { note: "Click Run to call this step" }, null, 2)}
                  </pre>
                </div>
                <div className={styles.ecsStepCol}>
                  <div className={styles.ecsStepColLabel}>
                    Response
                    {hasResponse && <span className={styles.ecsStatusOk}>&#10003; OK</span>}
                    {hasError    && <span className={styles.ecsStatusErr}>&#10007; Error</span>}
                  </div>
                  {hasError    && <pre className={styles.ecsStepError}>{state!.error}</pre>}
                  {hasResponse && <pre className={styles.ecsStepResponse}>{JSON.stringify(state!.response, null, 2)}</pre>}
                  {!state      && <div className={styles.ecsStepEmpty}>Not run yet</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>

  );
}