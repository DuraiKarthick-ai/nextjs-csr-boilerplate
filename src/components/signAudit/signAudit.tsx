import { ThemeProvider } from "@emotion/react";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import Link from "next/link";
import { datePickerTheme, tableFilterTheme } from "@/theme/customizeTheme";
import { signAuditService } from "@/services/signAuditService";
import type {
  SignAuditRequestPayload,
  SignAuditResponseItem,
  SignAuditSortField,
  SignAuditSortOrder,
} from "@/types/signAudit";
import ContentWrapper from "../contentWrapper/contentWrapper";
import styles from "./signAudit.module.scss";

const DEFAULT_DATE = "2026-04-07";
const DEFAULT_OPERATOR = "ALL";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_FIELD: SignAuditSortField = "itemNumber";
const DEFAULT_SORT_ORDER: SignAuditSortOrder = "ASC";

interface SignAuditTableRow {
  auditDate: string;
  itemNumber: string;
  itemName: string;
  department: string;
  upc: string;
  regularPrice: string;
  salePrice: string;
  operatorId: string;
}

/**
 * Converts a numeric price to display currency.
 * @param {number} value - Raw numeric price from API.
 * @returns {string} Display string like "$1.69".
 */
function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

/**
 * Maps API rows to table display rows.
 * @param {SignAuditResponseItem[]} items - Raw API response rows.
 * @returns {SignAuditTableRow[]} Display-ready rows.
 */
function mapSignAuditRows(items: SignAuditResponseItem[]): SignAuditTableRow[] {
  return items.map((item) => ({
    auditDate: dayjs(item.auditDate).format("MM/DD/YYYY"),
    itemNumber: item.itemNumber,
    itemName: item.itemName,
    department: item.department,
    upc: item.upc,
    regularPrice: formatPrice(item.regularPrice),
    salePrice: formatPrice(item.salePrice),
    operatorId: item.operatorId,
  }));
}

export default function SignAudit() {

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
   const [data, setData] = useState<SignAuditTableRow[]>([]);
   const [dateFilter, setDateFilter] = useState<Dayjs | null>(dayjs(DEFAULT_DATE));
   const [operatorFilter, setOperatorFilter] = useState<string>(DEFAULT_OPERATOR);
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const [errorMessage, setErrorMessage] = useState<string>("");

   const fetchSignAuditData = useCallback(async (): Promise<void> => {
     setIsLoading(true);
     setErrorMessage("");

     try {
       const payload: SignAuditRequestPayload = {
         filters: {
           date: (dateFilter ?? dayjs(DEFAULT_DATE)).format("YYYY-MM-DD"),
           operator: operatorFilter,
         },
         sort: {
           field: sortField,
           order: sortOrder,
         },
         pagination: {
           page: DEFAULT_PAGE,
           pageSize: DEFAULT_PAGE_SIZE,
         },
       };

       const response = await signAuditService.getSignAuditData(payload);
       setData(mapSignAuditRows(response));
     } catch {
       setData([]);
       setErrorMessage("Unable to load sign audit data. Please try again.");
     } finally {
       setIsLoading(false);
     }
   }, [dateFilter, operatorFilter, sortField, sortOrder]);

   useEffect(() => {
     void fetchSignAuditData();
   }, [fetchSignAuditData]);

   const operatorOptions = useMemo(() => {
     const uniqueOperators = Array.from(new Set(data.map((row) => row.operatorId))).sort();
     return [DEFAULT_OPERATOR, ...uniqueOperators];
   }, [data]);

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

   const handleResetFilters = (event: React.MouseEvent<HTMLAnchorElement>): void => {
     event.preventDefault();
     setDateFilter(dayjs(DEFAULT_DATE));
     setOperatorFilter(DEFAULT_OPERATOR);
     setSortField(DEFAULT_SORT_FIELD);
     setSortOrder(DEFAULT_SORT_ORDER);
   };

  return (
    <ContentWrapper title="Sign Management">
      <div className={styles.groupBox}>
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

        <div className={styles.tableWrap}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <div className={styles.thContent}>
                    <span>Select All</span>
                    <ThemeProvider theme={tableFilterTheme}>
                      <Checkbox size="small" />
                    </ThemeProvider>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>Date</span>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>Item #</span>
                    <i className={styles.sortIcon} onClick={() => handleSort("itemNumber")}>{getSortIcon("itemNumber")}</i>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>Item Name</span>
                    <i className={styles.sortIcon} onClick={() => handleSort("itemName")}>{getSortIcon("itemName")}</i>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>Dept</span>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>UPC</span>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>Regular Price</span>
                  </div>
                </th>
                
                <th>
                  <div className={styles.thContent}>
                    <span>Sale Price</span>
                  </div>
                </th>
                <th>
                  <div className={styles.thContent}>
                    <span>Operator</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={9}><p>Loading...</p></td>
                </tr>
              )}
              {!isLoading && errorMessage && (
                <tr>
                  <td colSpan={9}><p>{errorMessage}</p></td>
                </tr>
              )}
              {!isLoading && !errorMessage && data.map((row, index) => (
                <tr key={`${row.itemNumber}-${row.auditDate}-${index}`}>
                  <td className={styles.checkboxCell}>
                    <ThemeProvider theme={tableFilterTheme}>
                      <Checkbox size="small" />
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
            </tbody>
          </table>
        </div>
        <div className={styles.pagination}>
          <p>Total Rows: {data.length}</p>
        </div>


      </div>
    </ContentWrapper>
  );
}
