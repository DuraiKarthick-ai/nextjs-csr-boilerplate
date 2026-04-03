"use client";
import { useState } from "react";
import styles from "./signManagement.module.scss";
import TextField from "@mui/material/TextField";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme/customizeTheme";
import { FormControl, MenuItem, Select, Switch } from "@mui/material";

/**
 * OWASP A03/A04 Fix: Input validation added to all user-facing fields.
 *
 * Uses a lightweight inline validation approach (no extra dep needed).
 * For production, integrate react-hook-form + zod:
 *   npm install react-hook-form zod @hookform/resolvers
 *
 * Validation rules applied:
 *  - Department #: required, numeric only, max 10 digits
 *  - Cat Code #:   optional, alphanumeric, max 20 chars
 *  - Quantity:     optional, positive integer, max 9999
 */

// ── Validation schemas ───────────────────────────────────────────

type ValidationResult = { valid: boolean; message: string };

const validators = {
  departmentNumber: (v: string): ValidationResult => {
    if (!v.trim()) return { valid: false, message: "Department # is required" };
    if (!/^\d+$/.test(v)) return { valid: false, message: "Must be numeric only" };
    if (v.length > 10) return { valid: false, message: "Max 10 digits" };
    return { valid: true, message: "" };
  },
  catCode: (v: string): ValidationResult => {
    if (!v.trim()) return { valid: true, message: "" }; // optional
    if (!/^[a-zA-Z0-9-]+$/.test(v)) return { valid: false, message: "Alphanumeric only" };
    if (v.length > 20) return { valid: false, message: "Max 20 characters" };
    return { valid: true, message: "" };
  },
  quantity: (v: string): ValidationResult => {
    if (!v.trim()) return { valid: true, message: "" }; // optional
    if (!/^\d+$/.test(v)) return { valid: false, message: "Must be a positive number" };
    if (parseInt(v, 10) > 9999) return { valid: false, message: "Max quantity is 9999" };
    return { valid: true, message: "" };
  },
};

// ── Icons ────────────────────────────────────────────────────────

const dropdownIcon = (
  <svg width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0L5 5L10 0H0Z" fill="#005DAB" />
  </svg>
);

const clearIcon = (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0C4.47 0 0 4.47 0 10C0 15.53 4.47 20 10 20C15.53 20 20 15.53 20 10C20 4.47 15.53 0 10 0ZM15 13.59L13.59 15L10 11.41L6.41 15L5 13.59L8.59 10L5 6.41L6.41 5L10 8.59L13.59 5L15 6.41L11.41 10L15 13.59Z" fill="#64686C" />
  </svg>
);

const addFieldIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="#64686C" />
  </svg>
);

// ── Component ────────────────────────────────────────────────────

export default function SignManagement() {
  const [active, setActive] = useState("item");

  // OWASP A03 Fix: Track field values with validation state
  const [deptNumber, setDeptNumber] = useState("");
  const [deptError, setDeptError] = useState("");

  const [catCode, setCatCode] = useState("");
  const [catCodeError, setCatCodeError] = useState("");

  const [quantity, setQuantity] = useState("");
  const [quantityError, setQuantityError] = useState("");

  const [size, setSize] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────

  function handleDeptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setDeptNumber(v);
    const result = validators.departmentNumber(v);
    setDeptError(result.valid ? "" : result.message);
  }

  function handleCatCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setCatCode(v);
    const result = validators.catCode(v);
    setCatCodeError(result.valid ? "" : result.message);
  }

  function handleQuantityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuantity(v);
    const result = validators.quantity(v);
    setQuantityError(result.valid ? "" : result.message);
  }

  function handleReset() {
    setDeptNumber("");
    setDeptError("");
    setCatCode("");
    setCatCodeError("");
    setQuantity("");
    setQuantityError("");
    setSize("");
    setFormSubmitted(false);
  }

  function handlePrint() {
    // Re-validate all fields before submitting
    const deptResult = validators.departmentNumber(deptNumber);
    const catResult = validators.catCode(catCode);
    const qtyResult = validators.quantity(quantity);

    setDeptError(deptResult.valid ? "" : deptResult.message);
    setCatCodeError(catResult.valid ? "" : catResult.message);
    setQuantityError(qtyResult.valid ? "" : qtyResult.message);
    setFormSubmitted(true);

    if (!deptResult.valid || !catResult.valid || !qtyResult.valid) return;

    // TODO: call signsService.printSigns({ deptNumber, catCode, quantity, size })
    console.info("[SignManagement] Print triggered", { deptNumber, catCode, quantity, size });
  }

  return (
    <div className={styles.contentWrap}>
      <div className={styles.topContentBar}>
        <div className={styles.leftActionWrap}>
          <ul>
            <li>
              <i>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8C4.9 8 4 8.9 4 10C4 11.1 4.9 12 6 12C7.1 12 8 11.1 8 10C8 8.9 7.1 8 6 8ZM2 4C0.9 4 0 4.9 0 6C0 7.1 0.9 8 2 8C3.1 8 4 7.1 4 6C4 4.9 3.1 4 2 4ZM2 12C0.9 12 0 12.9 0 14C0 15.1 0.9 16 2 16C3.1 16 4 15.1 4 14C4 12.9 3.1 12 2 12ZM14 4C15.1 4 16 3.1 16 2C16 0.9 15.1 0 14 0C12.9 0 12 0.9 12 2C12 3.1 12.9 4 14 4ZM10 12C8.9 12 8 12.9 8 14C8 15.1 8.9 16 10 16C11.1 16 12 15.1 12 14C12 12.9 11.1 12 10 12ZM14 8C12.9 8 12 8.9 12 10C12 11.1 12.9 12 14 12C15.1 12 16 11.1 16 10C16 8.9 15.1 8 14 8ZM10 4C8.9 4 8 4.9 8 6C8 7.1 8.9 8 10 8C11.1 8 12 7.1 12 6C12 4.9 11.1 4 10 4ZM6 0C4.9 0 4 0.9 4 2C4 3.1 4.9 4 6 4C7.1 4 8 3.1 8 2C8 0.9 7.1 0 6 0Z" fill="#A3A3A3" />
                </svg>
              </i>
            </li>
            <li>
              <i>
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.2083 2.44792C12.6979 0.9375 10.625 0 8.32292 0C3.71875 0 0 3.72917 0 8.33333C0 12.9375 3.71875 16.6667 8.32292 16.6667C12.2083 16.6667 15.4479 14.0104 16.375 10.4167H14.2083C13.3542 12.8437 11.0417 14.5833 8.32292 14.5833C4.875 14.5833 2.07292 11.7812 2.07292 8.33333C2.07292 4.88542 4.875 2.08333 8.32292 2.08333C10.0521 2.08333 11.5937 2.80208 12.7187 3.9375L9.36458 7.29167H16.6562V0L14.2083 2.44792Z" fill="#79747E" />
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
                <svg width="16" height="2" viewBox="0 0 16 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 0H0V2H16V0Z" fill="#79747E" />
                </svg>
              </i>
            </li>
            <li>
              <i>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 6.66667V0H8.33333L11.075 2.74167L2.74167 11.075L0 8.33333V15H6.66667L3.925 12.2583L12.2583 3.925L15 6.66667Z" fill="#79747E" />
                </svg>
              </i>
            </li>
            <li>
              <i>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="#79747E" />
                </svg>
              </i>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <h2>Signs Management</h2>
        </div>
        <div className={styles.groupBox}>
          <div className={styles.subTitle}>
            <p>Quick Print - Department &amp; Category</p>
          </div>

          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${active === "item" ? styles.active : ""}`}
              onClick={() => setActive("item")}
              type="button"
            >
              By Item
            </button>
            <button
              className={`${styles.tab} ${active === "dept" ? styles.active : ""}`}
              onClick={() => setActive("dept")}
              type="button"
            >
              By Department &amp; Category
            </button>
            <button
              className={`${styles.tab} ${active === "endcap" ? styles.active : ""}`}
              onClick={() => setActive("endcap")}
              type="button"
            >
              By Endcap
            </button>
          </div>

          {/* Quick Print — Department & Category */}
          <div className={`d-flex ${styles.gridWrap}`}>
            <div className={styles.grid}>
              <ul>
                <li>
                  {/* OWASP A03 Fix: validated controlled input */}
                  <div className="inputLabelWrap">
                    <label className="label" htmlFor="dept-number">
                      Department #<span className="mandatoryStar">*</span>
                    </label>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="dept-number"
                        fullWidth
                        size="small"
                        placeholder="Enter Department #"
                        variant="outlined"
                        value={deptNumber}
                        onChange={handleDeptChange}
                        error={formSubmitted && !!deptError}
                        helperText={formSubmitted ? deptError : ""}
                        inputProps={{
                          maxLength: 10,
                          "aria-label": "Department number",
                          "aria-required": "true",
                        }}
                      />
                    </ThemeProvider>
                    {deptNumber && (
                      <i
                        className="iconClose"
                        onClick={() => { setDeptNumber(""); setDeptError(""); }}
                        role="button"
                        aria-label="Clear department number"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setDeptNumber("")}
                      >
                        {clearIcon}
                      </i>
                    )}
                  </div>
                </li>

                <li>
                  <div className="inputLabelWrap">
                    <label className="label" htmlFor="cat-code">Cat Code #</label>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="cat-code"
                        fullWidth
                        size="small"
                        placeholder="Enter Category Code"
                        variant="outlined"
                        value={catCode}
                        onChange={handleCatCodeChange}
                        error={!!catCodeError}
                        helperText={catCodeError || ""}
                        inputProps={{
                          maxLength: 20,
                          "aria-label": "Category code",
                        }}
                      />
                    </ThemeProvider>
                    {!catCodeError && (
                      <span className="validationMsg info">Leave Blank for All</span>
                    )}
                  </div>
                </li>

                <li>
                  <div className={styles.toggleWrap}>
                    <label className="label" htmlFor="print-on-hand">
                      PRINT ONLY ITEMS WITH ON HAND
                    </label>
                    <ThemeProvider theme={theme}>
                      <Switch id="print-on-hand" defaultChecked inputProps={{ "aria-label": "Print only items with on hand" }} />
                    </ThemeProvider>
                  </div>
                </li>
              </ul>
            </div>

            <div className={styles.grid}>
              <ul>
                <li>
                  <div className="inputLabelWrap">
                    <label className="label" htmlFor="sign-size">Size</label>
                    <ThemeProvider theme={theme}>
                      <FormControl fullWidth size="small">
                        <Select
                          id="sign-size"
                          displayEmpty
                          value={size}
                          onChange={(e) => setSize(e.target.value)}
                          inputProps={{ "aria-label": "Select sign size" }}
                          IconComponent={() => dropdownIcon}
                        >
                          <MenuItem value="" disabled>Select Size</MenuItem>
                          <MenuItem value="small">Small</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="large">Large</MenuItem>
                        </Select>
                      </FormControl>
                    </ThemeProvider>
                  </div>
                </li>

                <li>
                  <div className="inputLabelWrap">
                    <label className="label" htmlFor="quantity">Quantity</label>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="quantity"
                        fullWidth
                        size="small"
                        placeholder="Enter Quantity"
                        variant="outlined"
                        value={quantity}
                        onChange={handleQuantityChange}
                        error={!!quantityError}
                        helperText={quantityError || ""}
                        inputProps={{
                          maxLength: 4,
                          "aria-label": "Quantity",
                          inputMode: "numeric",
                        }}
                      />
                    </ThemeProvider>
                  </div>
                </li>

                <li>
                  <div className={styles.addField}>
                    <i role="button" aria-label="Add field" tabIndex={0}>
                      {addFieldIcon}
                    </i>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.buttonWrap}>
            <ul>
              <li>
                <button className="primaryButtonOutline" type="button" onClick={handleReset}>
                  Reset
                </button>
              </li>
              <li>
                <button className="primaryButton" type="button" onClick={handlePrint}>
                  Print (3)
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
