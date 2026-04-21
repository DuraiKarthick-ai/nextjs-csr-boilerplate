import { ThemeProvider } from "@emotion/react";
import { Checkbox, FormControl, MenuItem, Select } from "@mui/material";
import { useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import Link from "next/link";
import { datePickerTheme, tableFilterTheme } from "@/theme/customizeTheme";
import styles from "./signAudit.module.scss";

// Static table data
const initialData = [
  { id: 1, date: "07/05/2025", dept: "023", itemNo: "2345678", itemName: "Frozen Yogurt", upc: "16456", regularPrice: "$1.69", salePrice: "$0.69", operator: "232323" },
  { id: 2, date: "07/05/2025", dept: "023", itemNo: "1345678", itemName: "Yogurt Frozen Yogurt", upc: "16456", regularPrice: "$1.69", salePrice: "$0.69", operator: "232323" },
  { id: 3, date: "07/05/2025", dept: "023", itemNo: "3345678", itemName: "Frozen Strwberry Yogurt", upc: "16456", regularPrice: "$1.69", salePrice: "$0.69", operator: "232323" },
  { id: 4, date: "07/05/2025", dept: "023", itemNo: "4345678", itemName: "Frozen Mango Yogurt", upc: "16456", regularPrice: "$1.69", salePrice: "$0.69", operator: "232323" },
  { id: 5, date: "07/05/2025", dept: "023", itemNo: "1145678", itemName: "Frozen Apple Yogurt", upc: "16456", regularPrice: "$1.69", salePrice: "$0.69", operator: "232323" },
  { id: 6, date: "07/05/2025", dept: "023", itemNo: "2245678", itemName: "Frozen Orange Yogurt", upc: "16456", regularPrice: "$1.69", salePrice: "$0.69", operator: "232323" },
];

type SortKey = "itemNo" | "itemName";
type SortOrder = "asc" | "desc";

export default function SignAuditSection() {

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

   const [sortKey, setSortKey] = useState<SortKey | null>(null);
   const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
   const [data, setData] = useState(initialData);
   const [dateFilter, setDateFilter] = useState<Dayjs | null>(dayjs("2026-04-07"));

   const handleSort = (key: SortKey) => {
     const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
     setSortKey(key);
     setSortOrder(newOrder);

     const sortedData = [...initialData].sort((a, b) => {
       const valA = a[key];
       const valB = b[key];

       if (typeof valA === "number" && typeof valB === "number") {
         return newOrder === "asc" ? valA - valB : valB - valA;
       }

       const strA = String(valA).toLowerCase();
       const strB = String(valB).toLowerCase();
       if (newOrder === "asc") {
         return strA < strB ? -1 : strA > strB ? 1 : 0;
       }
       return strA > strB ? -1 : strA < strB ? 1 : 0;
     });

     setData(sortedData);
   };

   const getSortIcon = (key: SortKey) => {
     if (sortKey !== key) return sortArrowDown;
     return sortOrder === "asc" ? sortArrowUp : sortArrowDown;
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
                    <Select displayEmpty defaultValue="">
                        <MenuItem value="">Operator</MenuItem>
                        <MenuItem value="2345678">2345678</MenuItem>
                        <MenuItem value="3456278">3456278</MenuItem>
                        <MenuItem value="4562378">4562378</MenuItem>
                    </Select>
                    </FormControl>
                </ThemeProvider>
                </div>
            </li>
            <li>
                <Link href={"#"}>Reset Filters</Link>
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
                      <i className={styles.sortIcon} onClick={() => handleSort("itemNo")}>{getSortIcon("itemNo")}</i>
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
                {data.map((row) => (
                <tr key={row.id}>
                    <td className={styles.checkboxCell}>
                    <ThemeProvider theme={tableFilterTheme}>
                        <Checkbox size="small" />
                    </ThemeProvider>
                    </td>
                    <td><p>{row.date}</p></td>
                    <td><p>{row.itemNo}</p></td>
                    <td><p>{row.itemName}</p></td>
                    <td><p>{row.dept}</p></td>
                    <td><p>{row.upc}</p></td>
                    <td><p>{row.regularPrice}</p></td>
                    <td><p>{row.salePrice}</p></td>
                    <td><p>{row.operator}</p></td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        <div className={styles.pagination}>
            <p>Total Rows: {data.length}</p>
        </div>

        <div className={styles.buttonWrap}>
          <ul>
            <li>
              <button className="primaryButtonOutline">Preview</button>
            </li>
            <li>
              <button className="primaryButton">Print</button>
            </li>
          </ul>
        </div>

    </div>

  );
}
