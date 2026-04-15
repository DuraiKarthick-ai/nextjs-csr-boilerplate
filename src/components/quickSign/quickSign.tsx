"use client";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import { ThemeProvider } from "@mui/material/styles";
import { FormControl, MenuItem, Select, Switch } from "@mui/material";
import theme from "@/theme/customizeTheme";
import ContentWrapper from "../contentWrapper/contentWrapper";
import styles from "./quickSign.module.scss";

export default function QuickSign() {
  const [active, setActive] = useState("item");

  const [value, setValue] = useState("");

  // const [printOnlyOnHand, setPrintOnlyOnHand] = useState(true);

  const dropdownIcon = (
    <svg
      width="10"
      height="5"
      viewBox="0 0 10 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 0L5 5L10 0H0Z" fill="#005DAB" />
    </svg>
  );

  const clearIcon = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 0C4.47 0 0 4.47 0 10C0 15.53 4.47 20 10 20C15.53 20 20 15.53 20 10C20 4.47 15.53 0 10 0ZM15 13.59L13.59 15L10 11.41L6.41 15L5 13.59L8.59 10L5 6.41L6.41 5L10 8.59L13.59 5L15 6.41L11.41 10L15 13.59Z"
        fill="#64686C"
      />
    </svg>
  );

  const addFieldIcon = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="#64686C" />
    </svg>
  )

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
            
            {/* Ouick Print Item */}
            {active === "item" && (
              <p>Quick Print - Item</p>
            )}

            {/* Quick Print Department & Category */}
            {active === "dept" && (
              <p>Quick Print - Department & Category</p>
            )}

          </div>

          {/* Ouick Print Item */}
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
                            defaultValue=""
                            inputProps={{ 'aria-label': 'Select Size' }}
                          >
                            <MenuItem value="" disabled>
                              Select Size
                            </MenuItem>
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
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">Item # / UPC</label>
                      {/* <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Enter or Scan Item # / UPC"
                      ></input> */}
                      <ThemeProvider theme={theme}>
                        <TextField id="filled-basic" fullWidth size="small" placeholder="Enter Department #" variant="outlined" />
                      </ThemeProvider>
                      {value && (
                        <i className="iconClose" onClick={() => setValue("")}>{clearIcon}</i>
                      )}
                    </div>
                  </li>
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">Item # / UPC</label>
                      <ThemeProvider theme={theme}>
                        <TextField id="filled-basic" fullWidth size="small" placeholder="Enter Department #" variant="outlined" />
                      </ThemeProvider>
                    </div>
                  </li>
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">Item # / UPC</label>
                      <ThemeProvider theme={theme}>
                        <TextField id="filled-basic" fullWidth size="small" placeholder="Enter Department #" variant="outlined" />
                      </ThemeProvider>
                    </div>
                  </li>
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">Item # / UPC</label>
                      <ThemeProvider theme={theme}>
                        <TextField id="filled-basic" fullWidth size="small" placeholder="Enter Department #" variant="outlined" />
                      </ThemeProvider>
                    </div>
                  </li>
                </ul>
              </div>
              <div className={styles.grid}>
                <ul>
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">Quantity</label>
                      <ThemeProvider theme={theme}>
                        <TextField id="filled-basic" fullWidth size="small" placeholder="Enter Department #" variant="outlined" />
                      </ThemeProvider>
                    </div>
                  </li>
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">Quantity</label>
                      <ThemeProvider theme={theme}>
                        <TextField id="filled-basic" fullWidth size="small" placeholder="Enter Department #" variant="outlined" />
                      </ThemeProvider>
                    </div>
                  </li>
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">Quantity</label>
                      <ThemeProvider theme={theme}>
                        <TextField id="filled-basic" fullWidth size="small" placeholder="Enter Department #" variant="outlined" />
                      </ThemeProvider>
                    </div>
                  </li>
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">Quantity</label>
                      <ThemeProvider theme={theme}>
                        <TextField id="filled-basic" fullWidth size="small" placeholder="Enter Department #" variant="outlined" />
                      </ThemeProvider>
                    </div>
                    <div className={styles.addField}>
                      <i>
                        {addFieldIcon}
                      </i>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Ouick Print Department & Category */}
          {active === "dept" && (
            <div className={`d-flex ${styles.gridWrap}`}>
              <div className={styles.grid}>
                <ul>
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">Department #<span className="mandatoryStar">*</span></label>
                      <ThemeProvider theme={theme}>
                        <TextField id="filled-basic" fullWidth size="small" placeholder="Enter Department #" variant="outlined" />
                      </ThemeProvider>
                    </div>
                  </li>
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">Cat Code #</label>
                      <ThemeProvider theme={theme}>
                        <TextField id="filled-basic" fullWidth size="small" placeholder="Enter Category Code" variant="outlined" />
                      </ThemeProvider>
                      <span className="validationMsg info">Leave Blank for All</span>
                    </div>
                  </li>
                  <li>
                    <div className={styles.toggleWrap}>
                      <label className="label">PRINT ONLY ITEMS WITH ON HAND</label>
                      <ThemeProvider theme={theme}>
                        <Switch defaultChecked />
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
                            defaultValue=""
                            inputProps={{ 'aria-label': 'Select Size' }}
                          >
                            <MenuItem value="" disabled>
                              Select Size
                            </MenuItem>
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
                        <TextField id="filled-basic" fullWidth size="small" placeholder="Enter Quantity" variant="outlined" />
                      </ThemeProvider>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}
          
          <div className={styles.buttonWrap}>
            <ul>
              <li>
                <button className="primaryButtonOutline">Reset</button>
              </li>
              <li>
                <button className="primaryButton">Print (3)</button>
              </li>
            </ul>
          </div>

        </div>
    </ContentWrapper>
  );
}