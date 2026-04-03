"use client";
import { useState } from "react";
import styles from "./signManagement.module.scss";
import TextField from "@mui/material/TextField";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme/customizeTheme";
import { FormControl, MenuItem, Select, Switch } from "@mui/material";

export default function SignManagement() {
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
    <div className={styles.contentWrap}>
      <div className={styles.topContentBar}>
        <div className={styles.leftActionWrap}>
          <ul>
            <li>
              <i>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 8C4.9 8 4 8.9 4 10C4 11.1 4.9 12 6 12C7.1 12 8 11.1 8 10C8 8.9 7.1 8 6 8ZM2 4C0.9 4 0 4.9 0 6C0 7.1 0.9 8 2 8C3.1 8 4 7.1 4 6C4 4.9 3.1 4 2 4ZM2 12C0.9 12 0 12.9 0 14C0 15.1 0.9 16 2 16C3.1 16 4 15.1 4 14C4 12.9 3.1 12 2 12ZM14 4C15.1 4 16 3.1 16 2C16 0.9 15.1 0 14 0C12.9 0 12 0.9 12 2C12 3.1 12.9 4 14 4ZM10 12C8.9 12 8 12.9 8 14C8 15.1 8.9 16 10 16C11.1 16 12 15.1 12 14C12 12.9 11.1 12 10 12ZM14 8C12.9 8 12 8.9 12 10C12 11.1 12.9 12 14 12C15.1 12 16 11.1 16 10C16 8.9 15.1 8 14 8ZM10 4C8.9 4 8 4.9 8 6C8 7.1 8.9 8 10 8C11.1 8 12 7.1 12 6C12 4.9 11.1 4 10 4ZM6 0C4.9 0 4 0.9 4 2C4 3.1 4.9 4 6 4C7.1 4 8 3.1 8 2C8 0.9 7.1 0 6 0Z"
                    fill="#A3A3A3"
                  />
                </svg>
              </i>
            </li>
            <li>
              <i>
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.2083 2.44792C12.6979 0.9375 10.625 0 8.32292 0C3.71875 0 0 3.72917 0 8.33333C0 12.9375 3.71875 16.6667 8.32292 16.6667C12.2083 16.6667 15.4479 14.0104 16.375 10.4167H14.2083C13.3542 12.8437 11.0417 14.5833 8.32292 14.5833C4.875 14.5833 2.07292 11.7812 2.07292 8.33333C2.07292 4.88542 4.875 2.08333 8.32292 2.08333C10.0521 2.08333 11.5937 2.80208 12.7187 3.9375L9.36458 7.29167H16.6562V0L14.2083 2.44792Z"
                    fill="#79747E"
                  />
                </svg>
              </i>
            </li>
            <li>
              <p>Last Updated 10:31am - 08/02/25</p>
            </li>
          </ul>
        </div>
        <div className={styles.rightActionWrap}>
          <ul>
            <li>
              <i>
                <svg
                  width="16"
                  height="2"
                  viewBox="0 0 16 2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16 0H0V2H16V0Z" fill="#79747E" />
                </svg>
              </i>
            </li>
            <li>
              <i>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 6.66667V0H8.33333L11.075 2.74167L2.74167 11.075L0 8.33333V15H6.66667L3.925 12.2583L12.2583 3.925L15 6.66667Z"
                    fill="#79747E"
                  />
                </svg>
              </i>
            </li>
            <li>
              <i>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                    fill="#79747E"
                  />
                </svg>
              </i>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <h2>Signs Management </h2>
        </div>
        <div className={styles.groupBox}>
          <div className={styles.subTitle}>
            {false && (
              <p>Quick Print - Item</p>
            )}
            <p>Quick Print - Department & Category</p>
          </div>

          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${active === "item" ? styles.active : ""}`}
              onClick={() => setActive("item")}
            >
              By Item
            </button>
            <button
              className={`${styles.tab} ${active === "dept" ? styles.active : ""}`}
              onClick={() => setActive("dept")}
            >
              By Department & Category
            </button>
            <button
              className={`${styles.tab} ${active === "endcap" ? styles.active : ""}`}
              onClick={() => setActive("endcap")}
            >
              By Endcap
            </button>
          </div>

          {/* Ouick Print Item */}
          {false && (
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
                            <MenuItem value={10}>S-Small</MenuItem>
                            <MenuItem value={20}>M-Medium</MenuItem>
                            <MenuItem value={30}>L-Large</MenuItem>
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
          {true && (
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
                            <MenuItem value={10}>S-Small</MenuItem>
                            <MenuItem value={20}>M-Medium</MenuItem>
                            <MenuItem value={30}>L-Large</MenuItem>
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
      </div>
    </div>
  );
}
