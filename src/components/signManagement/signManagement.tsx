"use client";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import { ThemeProvider } from "@mui/material/styles";
import { FormControl, MenuItem, Select, Switch } from "@mui/material";
import theme from "@/theme/customizeTheme";
import ContentWrapper from "../contentWrapper/contentWrapper";
import styles from "./signManagement.module.scss";

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
    <ContentWrapper title="Signs Management">
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
    </ContentWrapper>
  );
}
