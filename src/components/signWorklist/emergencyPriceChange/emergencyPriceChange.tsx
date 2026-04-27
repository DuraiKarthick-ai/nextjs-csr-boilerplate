"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type UIEvent,
} from "react";
import theme from "@/theme/customizeTheme";
import { TextField, Checkbox, FormControl, MenuItem, Select, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { DEFAULT_REQUESTED_BY, DEFAULT_STORE_ID } from "@/constants/print";
import { usePrint } from "@/hooks/usePrint";
import { emergencyPriceChangeService } from "@/services/emergencyPriceChangeService";
import { datePickerTheme, tableFilterTheme } from "@/theme/customizeTheme";
import type { PrintRequestPayload } from "@/types/print";
import type {
  EmergencyPriceChangeRequestPayload,
  EmergencyPriceChangeResponseItem,
} from "@/types/emergencyPriceChange";
import SuccessToast from "@/components/shared/SuccessToast";
import styles from "./emergencyPriceChange.module.scss";

const FIRST_PAGE = 1;
const PAGE_SIZE = 10;
const DEFAULT_DATE = "2026-04-07";
const MIN_ROWS_BEFORE_SCROLL_FETCH = 6;
const SCROLL_FETCH_THRESHOLD_PX = 24;

interface EmergencyPriceChangeTableRow {
  auditDate: string;
  auditDateRaw: string;
  itemNumber: string;
  itemName: string;
  department: string;
  category: string;
  upc: string;
  onHand: string;
  quantity: number;
  changeReason: string;
  signSize: string | null;
  copies: number;
  printStatus: string;
}

type SortKey =
  | "auditDate"
  | "itemNumber"
  | "itemName"
  | "department"
  | "category"
  | "upc"
  | "onHand"
  | "quantity"
  | "changeReason"
  | "signSize"
  | "printStatus";
type SortOrder = "ASC" | "DESC";
type RowSelectionMap = Record<string, boolean>;

/**
 * Builds stable row key for selection tracking.
 */
function getRowKey(row: EmergencyPriceChangeTableRow): string {
  return `${row.itemNumber}-${row.auditDateRaw}-${row.upc}-${row.department}-${row.category}-${row.quantity}`;
}

/**
 * Maps API response to table display rows.
 */
function mapEmergencyPriceChangeRows(
  items: EmergencyPriceChangeResponseItem[]
): EmergencyPriceChangeTableRow[] {
  return items.map((item) => ({
    auditDate: dayjs(item.auditDate).format("MM/DD/YYYY"),
    auditDateRaw: item.auditDate,
    itemNumber: item.itemNumber,
    itemName: item.itemName,
    department: item.department,
    category: item.category,
    upc: item.upc,
    onHand: item.onHand,
    quantity: item.quantity,
    changeReason: item.changeReason,
    signSize: item.signSize,
    copies: 1,
    printStatus: item.printStatus,
  }));
}

export default function EmergencyPriceChange(): JSX.Element {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("ASC");
  const [allRows, setAllRows] = useState<EmergencyPriceChangeTableRow[]>([]);
  const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);
  const [itemNumberFilter, setItemNumberFilter] = useState<string>("");
  const [itemNameFilter, setItemNameFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [printStatusFilter, setPrintStatusFilter] = useState<string>("");
  const [upcFilter, setUpcFilter] = useState<string>("");
  const [onHandFilter, setOnHandFilter] = useState<string>("");
  const [quantityFilter, setQuantityFilter] = useState<string>("");
  const [changeReasonFilter, setChangeReasonFilter] = useState<string>("");
  const [signSizeFilter, setSignSizeFilter] = useState<string>("");
  const [rowSignSizes, setRowSignSizes] = useState<Record<string, string>>({});
  const [rowCopies, setRowCopies] = useState<Record<string, number>>({});
  const [copiesFilter, setCopiesFilter] = useState<string>("");
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

  const rows = [1, 2, 3, 4, 5];

  const sortArrowUp = (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 6L1.0575 7.0575L5.25 2.8725V12H6.75V2.8725L10.935 7.065L12 6L6 0L0 6Z"
        fill="#313335"
      />
    </svg>
  );

  const sortArrowDown = (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 6L10.9425 4.9425L6.75 9.1275V0H5.25V9.1275L1.065 4.935L0 6L6 12L12 6Z"
        fill="#313335"
      />
    </svg>
  );

  /**
   * Loads a single API page and appends it to the dataset.
   */
  const loadPage = useCallback(async (pageToLoad: number): Promise<void> => {
    if (isFetchingRef.current || !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const payload: EmergencyPriceChangeRequestPayload = {
        storeId: DEFAULT_STORE_ID,
        requestDate: DEFAULT_DATE,
        filters: {
          itemNumber: null,
          itemName: null,
          department: null,
          category: null,
          upc: null,
          quantity: null,
          changeReason: null,
          signSize: null,
          printStatus: null,
        },
      };

      const response = await emergencyPriceChangeService.getEmergencyPriceChangeData(payload);
      const mappedRows = mapEmergencyPriceChangeRows(response);
      const hasNextPage = response.length === PAGE_SIZE;

      currentPageRef.current = pageToLoad;
      hasMoreRef.current = hasNextPage;
      setHasMore(hasNextPage);
      setAllRows((prev) => (pageToLoad === FIRST_PAGE ? mappedRows : [...prev, ...mappedRows]));
    } catch {
      setErrorMessage("Unable to load emergency price change data. Please try again.");
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
      // max-height = 348px
      setHasMaxHeight(element.scrollHeight > 348);
    };

    checkHeight();

    const observer = new ResizeObserver(checkHeight);
    observer.observe(element);

    return () => observer.disconnect();

  }, [loadPage]);

  /**
   * Fetches next page on table scroll near bottom.
   */
  const handleTableScroll = (event: UIEvent<HTMLDivElement>): void => {
    if (
      isFetchingRef.current ||
      !hasMoreRef.current ||
      allRows.length < MIN_ROWS_BEFORE_SCROLL_FETCH
    ) {
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
   * Applies client-side filters and sorting.
   */
  const visibleRows = useMemo(() => {
    const selectedDate = dateFilter?.format("YYYY-MM-DD");

    const filteredRows = allRows.filter((row) => {
      const dateMatches = selectedDate ? row.auditDateRaw === selectedDate : true;
      const itemMatches = itemNumberFilter ? row.itemNumber === itemNumberFilter : true;
      const itemNameMatches = itemNameFilter ? row.itemName === itemNameFilter : true;
      const deptMatches = departmentFilter ? row.department === departmentFilter : true;
      const catMatches = categoryFilter ? row.category === categoryFilter : true;
      const printMatches = printStatusFilter ? row.printStatus === printStatusFilter : true;
      const upcMatches = upcFilter ? row.upc === upcFilter : true;
      const onHandMatches = onHandFilter ? row.onHand === onHandFilter : true;
      const quantityMatches = quantityFilter ? String(row.quantity) === quantityFilter : true;
      const changeReasonMatches = changeReasonFilter ? row.changeReason === changeReasonFilter : true;
      const signSizeMatches = signSizeFilter ? (row.signSize ?? "") === signSizeFilter : true;
      const effectiveCopies = rowCopies[getRowKey(row)] ?? row.copies;
      const copiesMatches = copiesFilter ? String(effectiveCopies) === copiesFilter : true;
      return dateMatches && itemMatches && itemNameMatches && deptMatches && catMatches && printMatches && upcMatches && onHandMatches && quantityMatches && changeReasonMatches && signSizeMatches && copiesMatches;
    });

    if (sortKey) {
      return filteredRows.sort((a, b) => {
        const valueA = a[sortKey];
        const valueB = b[sortKey];

        if (typeof valueA === "number" && typeof valueB === "number") {
          return sortOrder === "ASC" ? valueA - valueB : valueB - valueA;
        }

        const strA = String(valueA).toLowerCase();
        const strB = String(valueB).toLowerCase();
        const cmp = strA.localeCompare(strB, undefined, { numeric: true });
        return sortOrder === "ASC" ? cmp : cmp * -1;
      });
    }

    return filteredRows;
  }, [allRows, dateFilter, itemNumberFilter, itemNameFilter, departmentFilter, categoryFilter, printStatusFilter, upcFilter, onHandFilter, quantityFilter, changeReasonFilter, signSizeFilter, copiesFilter, rowCopies, sortKey, sortOrder]);

  const itemNumberOptions = useMemo(() => {
    const unique = Array.from(new Set(allRows.map((row) => row.itemNumber))).sort();
    return unique;
  }, [allRows]);

  const itemNameOptions = useMemo(() => {
    const unique = Array.from(new Set(allRows.map((row) => row.itemName))).sort();
    return unique;
  }, [allRows]);

  const departmentOptions = useMemo(() => {
    const unique = Array.from(new Set(allRows.map((row) => row.department))).sort();
    return unique;
  }, [allRows]);

  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(allRows.map((row) => row.category))).sort();
    return unique;
  }, [allRows]);

  const printStatusOptions = useMemo(() => {
    const unique = Array.from(new Set(allRows.map((row) => row.printStatus))).sort();
    return unique;
  }, [allRows]);

  const upcOptions = useMemo(() => {
    return Array.from(new Set(allRows.map((row) => row.upc))).sort();
  }, [allRows]);

  const onHandOptions = useMemo(() => {
    return Array.from(new Set(allRows.map((row) => row.onHand))).sort();
  }, [allRows]);

  const quantityOptions = useMemo(() => {
    return Array.from(new Set(allRows.map((row) => String(row.quantity)))).sort((a, b) => Number(a) - Number(b));
  }, [allRows]);

  const changeReasonOptions = useMemo(() => {
    return Array.from(new Set(allRows.map((row) => row.changeReason))).sort();
  }, [allRows]);

  const signSizeOptions = useMemo(() => {
    return Array.from(new Set(allRows.map((row) => row.signSize ?? "").filter(Boolean))).sort();
  }, [allRows]);

  const copiesOptions = useMemo(() => {
    const vals = Array.from(
      new Set([...allRows.map((row) => String(row.copies)), ...Object.values(rowCopies).map(String)])
    );
    return ["1", ...vals.filter((v) => v !== "1")].sort((a, b) => Number(a) - Number(b));
  }, [allRows, rowCopies]);

  const isAllVisibleSelected = useMemo(() => {
    if (visibleRows.length === 0) return false;
    return visibleRows.every((row) => selectedRows[getRowKey(row)] === true);
  }, [selectedRows, visibleRows]);

  const selectedCount = useMemo(() => {
    return allRows.filter((row) => selectedRows[getRowKey(row)] === true).length;
  }, [allRows, selectedRows]);

  const handleSort = (key: SortKey): void => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
      return;
    }
    setSortKey(key);
    setSortOrder("ASC");
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return sortArrowDown;
    return sortOrder === "ASC" ? sortArrowUp : sortArrowDown;
  };

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

  const handleRowSelection = (row: EmergencyPriceChangeTableRow, checked: boolean): void => {
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
            size:
              (rowSignSizes[getRowKey(row)] ?? row.signSize ?? "S") === "S"
                ? "SMALL"
                : (rowSignSizes[getRowKey(row)] ?? row.signSize) === "M"
                  ? "MEDIUM"
                  : "LARGE",
            quantity: rowCopies[getRowKey(row)] ?? row.copies,
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={styles.emergencyPriceChangeSection}>
        <div className={styles.subTitle}>
          <p>Worklist - Emergency Price Change</p>
        </div>
      <div className={`${styles.tableWrap} ${hasMaxHeight ? styles.activeScroll : ""}`} onScroll={handleTableScroll}>
        <div className={styles.tableHeader}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <div className={styles.thContent}>
                    <span>Select All</span>
                  </div>
                  <div className={styles.filterWrap}>
                    <ThemeProvider theme={tableFilterTheme}>
                      <Checkbox
                        size="small"
                        checked={isAllVisibleSelected}
                        onChange={(e) => handleSelectAllVisible(e.target.checked)}
                      />
                    </ThemeProvider>
                  </div>
                </th>
                <th className={styles.thDatePicker}>
                  <div className={styles.thContent}>
                    <span>Date</span>
                    <i className={styles.sortIcon} onClick={() => handleSort("auditDate")}>{getSortIcon("auditDate")}</i>
                  </div>
                  <div className={styles.filterWrap}>
                    <ThemeProvider theme={datePickerTheme}>
                      <DatePicker
                        value={dateFilter}
                        onChange={setDateFilter}
                        slotProps={{
                          textField: {
                            size: "small",
                            placeholder: "Date",
                            fullWidth: true,
                          },
                        }}
                      />
                    </ThemeProvider>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>Item #</span>
                    <i className={styles.sortIcon} onClick={() => handleSort("itemNumber")}>{getSortIcon("itemNumber")}</i>
                  </div>
                  <div className={styles.filterWrap}>
                    <ThemeProvider theme={tableFilterTheme}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={itemNumberFilter}
                          onChange={(e) => setItemNumberFilter(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">All</MenuItem>
                          {itemNumberOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </ThemeProvider>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>Item Name</span>
                    <i className={styles.sortIcon} onClick={() => handleSort("itemName")}>{getSortIcon("itemName")}</i>
                  </div>
                  <div className={styles.filterWrap}>
                    <ThemeProvider theme={tableFilterTheme}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={itemNameFilter}
                          onChange={(e) => setItemNameFilter(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">All</MenuItem>
                          {itemNameOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </ThemeProvider>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>Dept</span>
                    <i className={styles.sortIcon} onClick={() => handleSort("department")}>{getSortIcon("department")}</i>
                  </div>
                  <div className={styles.filterWrap}>
                    <ThemeProvider theme={tableFilterTheme}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={departmentFilter}
                          onChange={(e) => setDepartmentFilter(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">All</MenuItem>
                          {departmentOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </ThemeProvider>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>Category</span>
                    <i className={styles.sortIcon} onClick={() => handleSort("category")}>{getSortIcon("category")}</i>
                  </div>
                  <div className={styles.filterWrap}>
                    <ThemeProvider theme={tableFilterTheme}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">All</MenuItem>
                          {categoryOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </ThemeProvider>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>UPC</span>
                    <i className={styles.sortIcon} onClick={() => handleSort("upc")}>{getSortIcon("upc")}</i>
                  </div>
                  <div className={styles.filterWrap}>
                    <ThemeProvider theme={tableFilterTheme}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={upcFilter}
                          onChange={(e) => setUpcFilter(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">All</MenuItem>
                          {upcOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </ThemeProvider>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>O/H</span>
                    <i className={styles.sortIcon} onClick={() => handleSort("onHand")}>{getSortIcon("onHand")}</i>
                  </div>
                  <div className={styles.filterWrap}>
                    <ThemeProvider theme={tableFilterTheme}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={onHandFilter}
                          onChange={(e) => setOnHandFilter(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">All</MenuItem>
                          {onHandOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </ThemeProvider>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>Quantity</span>
                    <i className={styles.sortIcon} onClick={() => handleSort("quantity")}>{getSortIcon("quantity")}</i>
                  </div>
                  <div className={styles.filterWrap}>
                    <ThemeProvider theme={tableFilterTheme}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={quantityFilter}
                          onChange={(e) => setQuantityFilter(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">All</MenuItem>
                          {quantityOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </ThemeProvider>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>Change Reason</span>
                    <i className={styles.sortIcon} onClick={() => handleSort("changeReason")}>{getSortIcon("changeReason")}</i>
                  </div>
                  <div className={styles.filterWrap}>
                    <ThemeProvider theme={tableFilterTheme}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={changeReasonFilter}
                          onChange={(e) => setChangeReasonFilter(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">All</MenuItem>
                          {changeReasonOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </ThemeProvider>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>Sign Size</span>
                    <i className={styles.sortIcon} onClick={() => handleSort("signSize")}>{getSortIcon("signSize")}</i>
                  </div>
                  <div className={styles.filterWrap}>
                    <ThemeProvider theme={tableFilterTheme}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={signSizeFilter}
                          onChange={(e) => setSignSizeFilter(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">All</MenuItem>
                          {signSizeOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </ThemeProvider>
                  </div>
                </th>
                <th className={styles.thCopies}>
                  <div className={styles.thContent}>
                    <span>Copies</span>
                  </div>
                  <div className={styles.filterWrap}>
                    <ThemeProvider theme={tableFilterTheme}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={copiesFilter}
                          onChange={(e) => setCopiesFilter(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">All</MenuItem>
                          {copiesOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </ThemeProvider>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>Print Status</span>
                    <i className={styles.sortIcon} onClick={() => handleSort("printStatus")}>{getSortIcon("printStatus")}</i>
                  </div>
                  <div className={styles.filterWrap}>
                    <ThemeProvider theme={tableFilterTheme}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={printStatusFilter}
                          onChange={(e) => setPrintStatusFilter(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">All</MenuItem>
                          {printStatusOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </ThemeProvider>
                  </div>
                </th>
              </tr>
            </thead>
          </table>
        </div>

        <div className={hasMaxHeight ? "tableData" : ""} id="tableBody">
          <table className={styles.dataTable}>
            <tbody>

              {isLoading  && visibleRows.length === 0 && rows.map((row) => (
                <tr key={row}>
                  <td>
                    <div className="shimmer checkbox m-auto"></div>
                  </td>
                  <td className={styles.tdDatePicker}>
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
                  <td>
                    <div className="shimmer md"></div>
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
                </tr>
              ))}

              {!isLoading && !errorMessage && visibleRows.length === 0 && (
                <tr>
                  <td colSpan={13}>
                    <div className={`${styles.noDatafound} noDataContent`}>
                      <h4>No records found</h4>
                      <label>No rows found for selected filters.</label>
                    </div>
                  </td>
                </tr>
              )}

              {!errorMessage && visibleRows.map((row) => (
                <tr key={getRowKey(row)}>
                  <td className="text-center">
                    <ThemeProvider theme={tableFilterTheme}>
                      <Checkbox
                        size="small"
                        checked={selectedRows[getRowKey(row)] === true}
                        onChange={(e) => handleRowSelection(row, e.target.checked)}
                      />
                    </ThemeProvider>
                  </td>
                  <td className={styles.tdDatePicker}><p>{row.auditDate}</p></td>
                  <td><p>{row.itemNumber}</p></td>
                  <td><p>{row.itemName}</p></td>
                  <td><p>{row.department}</p></td>
                  <td><p>{row.category}</p></td>
                  <td><p>{row.upc}</p></td>
                  <td><p>{row.onHand}</p></td>
                  <td><p>{row.quantity}</p></td>
                  <td><p>{row.changeReason}</p></td>
                  <td>
                    <ThemeProvider theme={tableFilterTheme}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={rowSignSizes[getRowKey(row)] ?? row.signSize ?? ""}
                          onChange={(e) =>
                            setRowSignSizes((prev) => ({
                              ...prev,
                              [getRowKey(row)]: e.target.value,
                            }))
                          }
                          displayEmpty
                          inputProps={{ "aria-label": "Select Size" }}
                        >
                          <MenuItem value="" disabled>Select Size</MenuItem>
                          <MenuItem value="S">S-Small</MenuItem>
                          <MenuItem value="M">M-Medium</MenuItem>
                          <MenuItem value="L">L-Large</MenuItem>
                        </Select>
                      </FormControl>
                    </ThemeProvider>
                  </td>
                  <td className={styles.tdCopies}>
                    <ThemeProvider theme={tableFilterTheme}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="1"
                        variant="outlined"
                        type="number"
                        value={rowCopies[getRowKey(row)] ?? 1}
                        onChange={(e) =>
                          setRowCopies((prev) => ({
                            ...prev,
                            [getRowKey(row)]: Math.max(1, Number(e.target.value)),
                          }))
                        }
                      />
                    </ThemeProvider>
                  </td>
                  <td>
                    <div className="statusTag">
                      <span>{row.printStatus}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      <div className={styles.pagination}>
        <p>Total Rows: {visibleRows.length}</p>
        <p>Selected: {selectedCount}</p>
      </div>

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

      {printResult && (
        <SuccessToast
          open={printResult !== null}
          onClose={resetPrint}
          message={`Successfully printed ${lastPrintedCount} emergency price change ${lastPrintedCount === 1 ? "item" : "items"}.`}
        />
      )}
      </div>
    </LocalizationProvider>
  );
}