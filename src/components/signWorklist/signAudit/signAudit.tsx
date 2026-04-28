import { ThemeProvider } from "@emotion/react";
import theme from "@/theme/customizeTheme";
import { Checkbox, FormControl, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type UIEvent,
} from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import Link from "next/link";
import { DEFAULT_REQUESTED_BY, DEFAULT_STORE_ID } from "@/constants/print";
import { usePrint } from "@/hooks/usePrint";
import { signAuditService } from "@/services/signAuditService";
import { datePickerTheme, tableFilterTheme } from "@/theme/customizeTheme";
import type { PrintRequestPayload } from "@/types/print";
import type {
  SignAuditRequestPayload,
  SignAuditResponseItem,
  SignAuditSortField,
  SignAuditSortOrder,
} from "@/types/signAudit";
import SuccessToast from "@/components/shared/SuccessToast";
import styles from "./signAudit.module.scss";

const DEFAULT_DATE = "2026-04-07";
const DEFAULT_OPERATOR = "ALL";
const FIRST_PAGE = 1;
const PAGE_SIZE = 10;
const MIN_ROWS_BEFORE_SCROLL_FETCH = 6;
const SCROLL_FETCH_THRESHOLD_PX = 24;
const DEFAULT_SORT_FIELD: SignAuditSortField = "itemNumber";
const DEFAULT_SORT_ORDER: SignAuditSortOrder = "ASC";

interface SignAuditTableRow {
  auditDate: string;
  auditDateRaw: string;
  itemNumber: string;
  itemName: string;
  department: string;
  upc: string;
  regularPrice: string;
  salePrice: string;
  operatorId: string;
}

type RowSelectionMap = Record<string, boolean>;

/**
 * Converts numeric price values from API to UI display format.
 * @param {number} value - Raw API price.
 * @returns {string} Display string in currency format.
 */
function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

/**
 * Maps Sign Audit API rows to table rows used by this component.
 * @param {SignAuditResponseItem[]} items - Raw rows from API.
 * @returns {SignAuditTableRow[]} Rows formatted for display.
 */
function mapSignAuditRows(items: SignAuditResponseItem[]): SignAuditTableRow[] {
  return items.map((item) => ({
    auditDate: dayjs(item.auditDate).format("MM/DD/YYYY"),
    auditDateRaw: item.auditDate,
    itemNumber: item.itemNumber,
    itemName: item.itemName,
    department: item.department,
    upc: item.upc,
    regularPrice: formatPrice(item.regularPrice),
    salePrice: formatPrice(item.salePrice),
    operatorId: item.operatorId,
  }));
}

/**
 * Builds a stable row identifier for selection and print actions.
 *
 * @param {SignAuditTableRow} row - Row value from the Sign Audit table.
 * @returns {string} Stable key for selection state.
 */
function getRowKey(row: SignAuditTableRow): string {
  return `${row.itemNumber}-${row.auditDateRaw}-${row.operatorId}`;
}

export default function SignAuditSection() {

  const rows = [1, 2, 3, 4, 5];

   const sortArrowUp = (
     <svg
       width="10"
       height="10"
       viewBox="0 0 12 12"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
     >
       <path
         d="M0 6L1.0575 7.0575L5.25 2.8725V12H6.75V2.8725L10.935 7.065L12 6L6 0L0 6Z"
         fill="#313335"
       />
     </svg>
   );

   const sortArrowDown = (
     <svg
       width="10"
       height="10"
       viewBox="0 0 12 12"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
     >
       <path
         d="M12 6L10.9425 4.9425L6.75 9.1275V0H5.25V9.1275L1.065 4.935L0 6L6 12L12 6Z"
         fill="#313335"
       />
     </svg>
   );

   const [sortField, setSortField] = useState<SignAuditSortField>(DEFAULT_SORT_FIELD);
   const [sortOrder, setSortOrder] = useState<SignAuditSortOrder>(DEFAULT_SORT_ORDER);
   const [allRows, setAllRows] = useState<SignAuditTableRow[]>([]);
   const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);
   const [operatorFilter, setOperatorFilter] = useState<string>(DEFAULT_OPERATOR);
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const [hasMore, setHasMore] = useState<boolean>(true);
   const [errorMessage, setErrorMessage] = useState<string>("");
   const [selectedRows, setSelectedRows] = useState<RowSelectionMap>({});
   const [printSelectionError, setPrintSelectionError] = useState<string>("");
   const [lastPrintedCount, setLastPrintedCount] = useState<number>(0);
   const currentPageRef = useRef<number>(0);
   const isFetchingRef = useRef<boolean>(false);
   const hasMoreRef = useRef<boolean>(true);
   const { isPrinting, printResult, printError, submitPrint, resetPrint } = usePrint();
   const [hasMaxHeight, setHasMaxHeight] = useState(false);

   /**
    * Loads a single API page and appends it to the existing table dataset.
    * Filter/sort states are intentionally excluded to keep API calls minimal.
    *
    * @param {number} pageToLoad - 1-based page number to fetch.
    * @returns {Promise<void>} Promise resolved when loading completes.
    */
   const loadPage = useCallback(async (pageToLoad: number): Promise<void> => {
    if (isFetchingRef.current || !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const payload: SignAuditRequestPayload = {
        filters: {
          date: DEFAULT_DATE,
          operator: DEFAULT_OPERATOR,
        },
        sort: {
          field: DEFAULT_SORT_FIELD,
          order: DEFAULT_SORT_ORDER,
        },
        pagination: {
          page: pageToLoad,
          pageSize: PAGE_SIZE,
        },
      };

      const response = await signAuditService.getSignAuditData(payload);
      const mappedRows = mapSignAuditRows(response);
      const hasNextPage = response.length === PAGE_SIZE;

      currentPageRef.current = pageToLoad;
      hasMoreRef.current = hasNextPage;
      setHasMore(hasNextPage);
      setAllRows((prev) => (pageToLoad === FIRST_PAGE ? mappedRows : [...prev, ...mappedRows]));
    } catch {
      setErrorMessage("Unable to load sign audit data. Please try again.");
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
   }, []);

   useEffect(() => {
    void loadPage(FIRST_PAGE);
    
    const element = document.getElementById("tableBody");
    if (!element) return;

    const checkHeight = () => {
      // max-height = 326px
      setHasMaxHeight(element.scrollHeight > 326);
    };

    checkHeight();

    const observer = new ResizeObserver(checkHeight);
    observer.observe(element);

    return () => observer.disconnect();

   }, [loadPage]);

   /**
    * Fetches the next page when table scroll is near bottom.
    *
    * @param {UIEvent<HTMLDivElement>} event - Scroll event from table container.
    */
   const handleTableScroll = (event: UIEvent<HTMLDivElement>): void => {
    if (isFetchingRef.current || !hasMoreRef.current || allRows.length < MIN_ROWS_BEFORE_SCROLL_FETCH) {
      return;
    }

    const target = event.currentTarget;
    const isNearBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - SCROLL_FETCH_THRESHOLD_PX;

    if (isNearBottom) {
      void loadPage(currentPageRef.current + 1);
    }
   };

   /**
    * Applies client-side date/operator filters and sorting on loaded rows.
    */
   const visibleRows = useMemo(() => {
    const selectedDate = dateFilter?.format("YYYY-MM-DD");

    const filteredRows = allRows.filter((row) => {
      const dateMatches = selectedDate ? row.auditDateRaw === selectedDate : true;
      const operatorMatches = operatorFilter === DEFAULT_OPERATOR || row.operatorId === operatorFilter;
      return dateMatches && operatorMatches;
    });

    return filteredRows.sort((a, b) => {
      const valueA = sortField === "itemNumber" ? a.itemNumber : a.itemName;
      const valueB = sortField === "itemNumber" ? b.itemNumber : b.itemName;
      const sortResult = valueA.localeCompare(valueB, undefined, { numeric: true, sensitivity: "base" });
      return sortOrder === "ASC" ? sortResult : sortResult * -1;
    });
   }, [allRows, dateFilter, operatorFilter, sortField, sortOrder]);

   const operatorOptions = useMemo(() => {
    const uniqueOperators = Array.from(new Set(allRows.map((row) => row.operatorId))).sort();
    return [DEFAULT_OPERATOR, ...uniqueOperators];
   }, [allRows]);

  const isAllVisibleSelected = useMemo(() => {
   if (visibleRows.length === 0) return false;
   return visibleRows.every((row) => selectedRows[getRowKey(row)] === true);
  }, [selectedRows, visibleRows]);

  const selectedCount = useMemo(() => {
   return allRows.filter((row) => selectedRows[getRowKey(row)] === true).length;
  }, [allRows, selectedRows]);

   const handleSort = (field: SignAuditSortField): void => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
      return;
    }
    setSortField(field);
    setSortOrder("ASC");
   };

   const getSortIcon = (field: SignAuditSortField) => {
    if (sortField !== field) return sortArrowDown;
    return sortOrder === "ASC" ? sortArrowUp : sortArrowDown;
   };

   const handleResetFilters = (event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    setDateFilter(null);
    setOperatorFilter(DEFAULT_OPERATOR);
    setSortField(DEFAULT_SORT_FIELD);
    setSortOrder(DEFAULT_SORT_ORDER);
   };

   /**
    * Toggles selection for all currently visible rows.
    *
    * @param {boolean} checked - Whether rows should be selected.
    */
   const handleSelectAllVisible = (checked: boolean): void => {
    if (checked) {
      setPrintSelectionError("");
    }
    setSelectedRows((prev) => {
      const next = { ...prev };
      visibleRows.forEach((row) => {
        const key = getRowKey(row);
        if (checked) {
          next[key] = true;
        } else {
          delete next[key];
        }
      });
      return next;
    });
   };

   /**
    * Toggles selection for a single table row.
    *
    * @param {SignAuditTableRow} row - The row to update.
    * @param {boolean} checked - Whether the row should be selected.
    */
   const handleRowSelection = (row: SignAuditTableRow, checked: boolean): void => {
    if (checked) {
      setPrintSelectionError("");
    }
    const key = getRowKey(row);
    setSelectedRows((prev) => {
      if (checked) {
        return { ...prev, [key]: true };
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
   };

   /**
    * Builds and submits a print request for selected Sign Audit rows.
    *
    * @returns {Promise<void>} Promise resolved after print submission.
    */
   const handlePrint = async (): Promise<void> => {
    const selectedRowsToPrint = allRows.filter((row) => selectedRows[getRowKey(row)] === true);

    if (selectedRowsToPrint.length === 0) {
      setPrintSelectionError("Select at least one row to print.");
      return;
    }

    setPrintSelectionError("");
  setLastPrintedCount(selectedRowsToPrint.length);

    const payload: PrintRequestPayload = {
      storeId: DEFAULT_STORE_ID,
      requestedBy: DEFAULT_REQUESTED_BY,
      printRequests: [
        {
          type: "BY_ITEM",
          entries: selectedRowsToPrint.map((row) => ({
            itemNumberOrUpc: row.itemNumber,
            size: "SMALL",
            quantity: 1,
          })),
        },
      ],
    };

    const result = await submitPrint(payload);
    if (result) {
      setSelectedRows({});
    }
   };

  return (
    <div className={styles.signAuditSection}>

        <div className={styles.subTitle}>
          <p>Sign Audit</p>
        </div>

        <div className={styles.filterBar}>
            <label>Filter:</label>
            <ul>
            <li>
                <div className={styles.dropdownWrap}>
                <ThemeProvider theme={datePickerTheme}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        value={dateFilter}
                        onChange={(newValue) => setDateFilter(newValue)}
                        format="MM/DD/YYYY"
                        slotProps={{
                        textField: {
                            size: "small",
                            fullWidth: true,
                        },
                        actionBar: {
                            actions: ["clear", "today"],
                        },
                        }}
                    />
                    </LocalizationProvider>
                </ThemeProvider>
                </div>
            </li>
            <li>
                <div className={styles.dropdownWrap}>
                <ThemeProvider theme={tableFilterTheme}>
                    <FormControl fullWidth size="small">
                    <Select
                      displayEmpty
                      value={operatorFilter}
                      onChange={(event) => setOperatorFilter(event.target.value)}
                    >
                      {operatorOptions.map((operator) => (
                        <MenuItem key={operator} value={operator}>
                          {operator === DEFAULT_OPERATOR ? "Operator (ALL)" : operator}
                        </MenuItem>
                      ))}
                    </Select>
                    </FormControl>
                </ThemeProvider>
                </div>
            </li>
            <li>
                <Link href={"#"} onClick={handleResetFilters}>Reset Filters</Link>
            </li>
            </ul>
        </div>

        <div className={`${styles.tableWrap} ${hasMaxHeight ? styles.activeScroll : ""}`} onScroll={handleTableScroll}>
          <div className={styles.auditTable}>
            <div className={styles.tableWrap}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th className={styles.checkboxCell}>
                      <div className={styles.thContent}>
                        <div className={styles.labelWrap}>
                          <span>Select All</span>
                          <ThemeProvider theme={tableFilterTheme}>
                              <Checkbox
                                size="small"
                                checked={isAllVisibleSelected}
                                onChange={(event) => handleSelectAllVisible(event.target.checked)}
                              />
                          </ThemeProvider>
                        </div>
                      </div>
                    </th>
                    <th>
                      <div className={styles.thContent}>
                        <div className={styles.labelWrap}>
                          <span>Date</span>
                        </div>
                      </div>
                    </th>
                    <th>
                      <div className={styles.thContent}>
                        <div className={styles.labelWrap}>
                          <span>Item #</span>
                          <i className={styles.sortIcon} onClick={() => handleSort("itemNumber")}>{getSortIcon("itemNumber")}</i>
                        </div>
                      </div>
                    </th>
                    <th>
                      <div className={styles.thContent}>
                        <div className={styles.labelWrap}>
                          <span>Item Name</span>
                          <i className={styles.sortIcon} onClick={() => handleSort("itemName")}>{getSortIcon("itemName")}</i>
                        </div>
                      </div>
                    </th>
                    <th>
                      <div className={styles.thContent}>
                        <div className={styles.labelWrap}>
                          <span>Dept</span>
                        </div>
                      </div>
                    </th>
                    <th>
                      <div className={styles.thContent}>
                        <div className={styles.labelWrap}>
                          <span>UPC</span>
                        </div>
                      </div>
                    </th>
                    <th>
                      <div className={styles.thContent}>
                        <div className={styles.labelWrap}>
                          <span>Regular Price</span>
                        </div>
                      </div>
                    </th>
                    
                    <th>
                      <div className={styles.thContent}>
                        <div className={styles.labelWrap}>
                          <span>Sale Price</span>
                        </div>
                      </div>
                    </th>
                    <th>
                      <div className={styles.thContent}>
                        <div className={styles.labelWrap}>
                          <span>Operator</span>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading  && allRows.length === 0 && rows.map((row) => (
                    <tr key={row}>
                      <td className={styles.checkboxCell}>
                        <div className="shimmer checkbox m-auto"></div>
                      </td>
                      <td>
                        <div className="shimmer lg"></div>
                      </td>
                      <td>
                        <div className="shimmer md"></div>
                      </td>
                      <td>
                        <div className="shimmer md"></div>
                      </td>
                      <td>
                        <div className="shimmer sm"></div>
                      </td>
                      <td>
                        <div className="shimmer sm"></div>
                      </td>
                      <td>
                        <div className="shimmer sm"></div>
                      </td>
                      <td>
                        <div className="shimmer sm"></div>
                      </td>
                      <td>
                        <div className="shimmer md"></div>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && errorMessage && allRows.length === 0 && (
                    <tr>
                      <td colSpan={9}>
                        <div className={`${styles.noDatafound} noDataContent`}>
                          <h4>Error</h4>
                          <label>{errorMessage}</label>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!isLoading && !errorMessage && visibleRows.length === 0 && (
                    <tr>
                      <td colSpan={9}>
                        <div className={`${styles.noDatafound} noDataContent`}>
                          <h4>No records found</h4>
                          <label>No rows found for selected filters.</label>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!errorMessage && visibleRows.map((row, index) => (
                    <tr key={`${row.itemNumber}-${row.auditDate}-${index}`}>
                        <td className={styles.checkboxCell}>
                        <ThemeProvider theme={tableFilterTheme}>
                            <Checkbox
                              size="small"
                              checked={selectedRows[getRowKey(row)] === true}
                              onChange={(event) => handleRowSelection(row, event.target.checked)}
                            />
                        </ThemeProvider>
                        </td>
                        <td><p>{row.auditDate}</p></td>
                        <td><p>{row.itemNumber}</p></td>
                        <td><p>{row.itemName}</p></td>
                        <td><p>{row.department}</p></td>
                        <td><p>{row.upc}</p></td>
                        <td><p>{row.regularPrice}</p></td>
                        <td><p>{row.salePrice}</p></td>
                        <td><p>{row.operatorId}</p></td>
                    </tr>
                  ))}
                  {isLoading && allRows.length > 0 && (
                    <tr>
                      <td colSpan={9}><p>Loading more...</p></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
        <div className={styles.pagination}>
          <p>Total Rows: {visibleRows.length}</p>
          <p>Selected: {selectedCount}</p>
        </div>

        <ThemeProvider theme={theme}>
          <div className={styles.UItable}>
            <TableContainer sx={{ maxHeight: 368 }}>

              <Table stickyHeader sx={{ minWidth: 1440 }} aria-label="sticky table">

                <TableHead>
                  <TableRow>
                    <TableCell align="center">
                      <div className={`${styles.labelWrap} ${styles.checkboxCellWrap}`}>
                        <span>Select All</span>
                        <ThemeProvider theme={tableFilterTheme}>
                            <Checkbox
                              size="small"
                              checked={isAllVisibleSelected}
                              onChange={(event) => handleSelectAllVisible(event.target.checked)}
                            />
                        </ThemeProvider>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={styles.labelWrap}>
                        <span>Date</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={styles.labelWrap}>
                        <span>Item #</span>
                        <i className={styles.sortIcon} onClick={() => handleSort("itemNumber")}>{getSortIcon("itemNumber")}</i>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={styles.labelWrap}>
                          <span>Item Name</span>
                          <i className={styles.sortIcon} onClick={() => handleSort("itemName")}>{getSortIcon("itemName")}</i>
                        </div>
                    </TableCell>
                    <TableCell>
                      <div className={styles.labelWrap}>
                        <span>Dept</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={styles.labelWrap}>
                        <span>UPC</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={styles.labelWrap}>
                        <span>Regular Price</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={styles.labelWrap}>
                        <span>Sale Price</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={styles.labelWrap}>
                        <span>Operator</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {!errorMessage && visibleRows.map((row, index) => (
                    <TableRow key={`${row.itemNumber}-${row.auditDate}-${index}`}>
                      <TableCell align="center" component="th" scope="row">
                        <ThemeProvider theme={tableFilterTheme}>
                          <Checkbox
                            size="small"
                            checked={selectedRows[getRowKey(row)] === true}
                            onChange={(event) => handleRowSelection(row, event.target.checked)}
                          />
                        </ThemeProvider>
                      </TableCell>
                      <TableCell><p>{row.auditDate}</p></TableCell>
                      <TableCell><p>{row.itemNumber}</p></TableCell>
                      <TableCell><p>{row.itemName}</p></TableCell>
                      <TableCell><p>{row.department}</p></TableCell>
                      <TableCell><p>{row.upc}</p></TableCell>
                      <TableCell><p>{row.regularPrice}</p></TableCell>
                      <TableCell><p>{row.salePrice}</p></TableCell>
                      <TableCell><p>{row.operatorId}</p></TableCell>
                    </TableRow>
                  ))}
                </TableBody>

              </Table>

            </TableContainer>
            <div className={styles.pagination}>
              <p>Total Rows: {visibleRows.length}</p>
              <p>Selected: {selectedCount}</p>
            </div>
          </div>
        </ThemeProvider>


        <div className={styles.buttonWrap}>
          <ul>
            <li>
              <button className="primaryButtonOutline">Preview</button>
            </li>
            <li>
              <button
                className="primaryButton"
                onClick={() => void handlePrint()}
                disabled={isPrinting || selectedCount === 0}
              >
                {isPrinting ? "Printing..." : "Print"}
              </button>
            </li>
          </ul>
          {(printSelectionError || printError) && (
            <p className="validationMsg error">{printSelectionError || printError}</p>
          )}
        </div>

      <SuccessToast
        open={printResult !== null}
        onClose={resetPrint}
        message={
          printResult
            ? `${lastPrintedCount} pages Printed successfully in ${printResult.printerName}`
            : ""
        }
      />

    </div>

  );
}
