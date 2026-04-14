"use client";
import { useState } from "react";

import styles from "./emergencyPriceChange.module.scss";
import { Checkbox, FormControl, MenuItem, Select, ThemeProvider } from "@mui/material";
import { tableFilterTheme, datePickerTheme } from "@/theme/customizeTheme";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

// Static table data
const initialData = [
  { id: 1, date: "07/05/2025", itemNo: "2345678", itemName: "Frozen Yogurt", dept: "023", category: "OBD", upc: "16456", oh: "Y", quantity: 12, changeReason: "Rebate change", signSize: "M" },
  { id: 2, date: "07/05/2025", itemNo: "3456278", itemName: "Potato Fish Sticks", dept: "112", category: "OSS", upc: "29996", oh: "Y", quantity: 34, changeReason: "Price change", signSize: "L" },
  { id: 3, date: "07/05/2025", itemNo: "4562378", itemName: "Smoked Black Pepper Jerky...", dept: "1234", category: "AAE", upc: "23765", oh: "Y", quantity: 543, changeReason: "Rebate change", signSize: "S" },
  { id: 4, date: "07/05/2025", itemNo: "2567834", itemName: "Ladies Jogger", dept: "1111", category: "CHA", upc: "34556", oh: "Y", quantity: 222, changeReason: "Price change", signSize: "M" },
  { id: 5, date: "07/05/2025", itemNo: "2567834", itemName: "Whole Young Turkey", dept: "234", category: "AMB", upc: "90856", oh: "Y", quantity: 987, changeReason: "Price change", signSize: "L" },
  { id: 6, date: "07/05/2025", itemNo: "7681204", itemName: "Frozen Yogurt", dept: "234", category: "AMB", upc: "90856", oh: "Y", quantity: 34, changeReason: "Price change", signSize: "S" },
];

type SortKey = "date" | "itemNo" | "itemName" | "dept" | "category" | "upc" | "oh" | "quantity" | "changeReason" | "size" | "printStatus";
type SortOrder = "asc" | "desc";

/**
 * Placeholder component for the Sign Worklist screen.
 *
 * @returns {JSX.Element} The rendered Sign Worklist view.
 */
export default function EmergencyPriceChange(): JSX.Element {
  const [active, setActive] = useState("price");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [data, setData] = useState(initialData);
  const [dateFilter, setDateFilter] = useState<Dayjs | null>(dayjs("2026-04-07"));

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
    /* EMERGENCY PRICE CHANGE */
    <div className={styles.emergencyPriceChangeSection}>

      <div className={styles.subTitle}>
        <p>Worklist - Emergency Price Change</p>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th className={styles.checkboxCell}>
                <div className={styles.thContent}>
                  <span>Select All</span>
                </div>
                <ThemeProvider theme={tableFilterTheme}>
                  <Checkbox size="small" />
                </ThemeProvider>
              </th>
              <th>
                <div className={styles.thContent}>
                  <span>Date</span>
                  <i className={styles.sortIcon} onClick={() => handleSort("date")}>{getSortIcon("date")}</i>
                </div>
                <div className={`${styles.filterWrap} ${styles.dateFilter}`}>
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
              </th>
              <th>
                <div className={styles.thContent}>
                  <span>Item #</span>
                  <i className={styles.sortIcon} onClick={() => handleSort("itemNo")}>{getSortIcon("itemNo")}</i>
                </div>
                <div className={styles.filterWrap}>
                  <ThemeProvider theme={tableFilterTheme}>
                    <FormControl fullWidth size="small">
                      <Select displayEmpty defaultValue="">
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="2345678">2345678</MenuItem>
                        <MenuItem value="3456278">3456278</MenuItem>
                        <MenuItem value="4562378">4562378</MenuItem>
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
                      <Select displayEmpty defaultValue="">
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="frozen">Frozen Yogurt</MenuItem>
                        <MenuItem value="potato">Potato Fish Sticks</MenuItem>
                        <MenuItem value="smoked">Smoked Black Pepper Jerky</MenuItem>
                      </Select>
                    </FormControl>
                  </ThemeProvider>
                </div>
              </th>
              <th>
                <div className={styles.thContent}>
                  <span>Dept</span>
                  <i className={styles.sortIcon} onClick={() => handleSort("dept")}>{getSortIcon("dept")}</i>
                </div>
                <div className={styles.filterWrap}>
                  <ThemeProvider theme={tableFilterTheme}>
                    <FormControl fullWidth size="small">
                      <Select displayEmpty defaultValue="">
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="023">023</MenuItem>
                        <MenuItem value="112">112</MenuItem>
                        <MenuItem value="234">234</MenuItem>
                        <MenuItem value="1234">1234</MenuItem>
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
                      <Select displayEmpty defaultValue="">
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="OBD">OBD</MenuItem>
                        <MenuItem value="OSS">OSS</MenuItem>
                        <MenuItem value="AAE">AAE</MenuItem>
                        <MenuItem value="CHA">CHA</MenuItem>
                        <MenuItem value="AMB">AMB</MenuItem>
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
                      <Select displayEmpty defaultValue="">
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="16456">16456</MenuItem>
                        <MenuItem value="29996">29996</MenuItem>
                        <MenuItem value="23765">23765</MenuItem>
                      </Select>
                    </FormControl>
                  </ThemeProvider>
                </div>
              </th>
              <th>
                <div className={styles.thContent}>
                  <span>O/H</span>
                  <i className={styles.sortIcon} onClick={() => handleSort("oh")}>{getSortIcon("oh")}</i>
                </div>
                <div className={styles.filterWrap}>
                  <ThemeProvider theme={tableFilterTheme}>
                    <FormControl fullWidth size="small">
                      <Select displayEmpty defaultValue="">
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Y">Y</MenuItem>
                        <MenuItem value="N">N</MenuItem>
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
                      <Select displayEmpty defaultValue="">
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="12">12</MenuItem>
                        <MenuItem value="34">34</MenuItem>
                        <MenuItem value="222">222</MenuItem>
                        <MenuItem value="543">543</MenuItem>
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
                      <Select displayEmpty defaultValue="">
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="rebate">Rebate change</MenuItem>
                        <MenuItem value="price">Price change</MenuItem>
                      </Select>
                    </FormControl>
                  </ThemeProvider>
                </div>
              </th>
              <th>
                <div className={styles.thContent}>
                  <span>Sign Size</span>
                  <i className={styles.sortIcon} onClick={() => handleSort("size")}>{getSortIcon("size")}</i>
                </div>
                <div className={styles.filterWrap}>
                  <ThemeProvider theme={tableFilterTheme}>
                    <FormControl fullWidth size="small">
                      <Select displayEmpty defaultValue="">
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="12">12</MenuItem>
                        <MenuItem value="34">34</MenuItem>
                        <MenuItem value="222">222</MenuItem>
                        <MenuItem value="543">543</MenuItem>
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
                      <Select displayEmpty defaultValue="">
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="12">12</MenuItem>
                        <MenuItem value="34">34</MenuItem>
                        <MenuItem value="222">222</MenuItem>
                        <MenuItem value="543">543</MenuItem>
                      </Select>
                    </FormControl>
                  </ThemeProvider>
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
                <td><p>{row.category}</p></td>
                <td><p>{row.upc}</p></td>
                <td><p>{row.oh}</p></td>
                <td><p>{row.quantity}</p></td>
                <td><p>{row.changeReason}</p></td>
                <td>
                  <ThemeProvider theme={tableFilterTheme}>
                      <FormControl fullWidth size="small">
                        <Select
                          displayEmpty
                          defaultValue=""
                          inputProps={{ 'aria-label': 'Select Size' }}
                        >
                          <MenuItem value="" disabled>
                            Select Size
                          </MenuItem>
                          <MenuItem value={10}>S-Small</MenuItem>
                          <MenuItem value={20}>M-Medium</MenuItem>
                          <MenuItem value={30}>L-Large</MenuItem>
                        </Select>
                      </FormControl>
                    </ThemeProvider>
                </td>
                <td><span className={styles.printStatusTag}></span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.pagination}>
        <p>Total Rows: {data.length}</p>
      </div>
    </div>
  );
}