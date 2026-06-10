import React, { useState, useCallback, useRef } from "react";
import styles from "./printByItem.module.scss";
import { ThemeProvider } from "@emotion/react";
import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import { theme } from "@/theme/customizeTheme";
import { useTranslation } from "react-i18next";

export interface PrintItem {
  itemUpc: string;
  size: string;
  quantity: string;
}

function PrintByItem(): JSX.Element {
  const { t } = useTranslation("signs");
  const [size, setSize] = useState<string>("");
  const [itemUpc, setItemUpc] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");

  const [printItems, setPrintItems] = useState<PrintItem[]>([]);
  const [undoHistory, setUndoHistory] = useState<PrintItem[][]>([]);
  const [redoHistory, setRedoHistory] = useState<PrintItem[][]>([]);

  // Ref for programmatic focus — used after Clear Fields and Add to List.
  const itemUpcRef = useRef<HTMLInputElement>(null);

  const focusItemUpc = useCallback((): void => {
    setTimeout(() => itemUpcRef.current?.focus(), 0);
  }, []);

  // Clears Item # and Quantity but keeps the previously selected Size.
  // Cursor returns to the Item # field so the user can scan the next item immediately.
  const handleClearFields = useCallback((): void => {
    setItemUpc("");
    setQuantity("");
    focusItemUpc();
  }, [focusItemUpc]);

  // Validates both Size and Item # before adding. After adding:
  // — Size is preserved (auto-populated for the next item)
  // — Item # and Quantity are cleared
  // — Cursor returns to Item #
  const handleAddToList = useCallback((): void => {
    if (!size || !itemUpc.trim()) return;
    const newItem: PrintItem = {
      itemUpc: itemUpc.trim(),
      size,
      quantity: quantity.trim() || "1",
    };
    setUndoHistory((prev) => [...prev, printItems]);
    setRedoHistory([]);
    setPrintItems((prev) => [...prev, newItem]);
    setItemUpc("");
    setQuantity("");
    focusItemUpc();
  }, [itemUpc, size, quantity, printItems, focusItemUpc]);

  const handleUndo = useCallback((): void => {
    if (undoHistory.length === 0) return;
    const previous = undoHistory[undoHistory.length - 1] ?? [];
    setRedoHistory((r) => [...r, printItems]);
    setPrintItems(previous);
    setUndoHistory((h) => h.slice(0, -1));
  }, [undoHistory, printItems]);

  const handleRedo = useCallback((): void => {
    if (redoHistory.length === 0) return;
    const next = redoHistory[redoHistory.length - 1] ?? [];
    setUndoHistory((h) => [...h, printItems]);
    setPrintItems(next);
    setRedoHistory((r) => r.slice(0, -1));
  }, [redoHistory, printItems]);

  const handleClearList = useCallback((): void => {
    if (printItems.length === 0) return;
    setUndoHistory((prev) => [...prev, printItems]);
    setRedoHistory([]);
    setPrintItems([]);
  }, [printItems]);

  const getTableItems = (colIndex: number): (PrintItem | null)[] => {
    const start = colIndex * 12;
    const colItems = printItems.slice(start, start + 12);
    return Array.from({ length: 12 }, (_, i) => colItems[i] ?? null);
  };

  const isAddDisabled =
    !size ||
    itemUpc.trim().length < 5 ||
    itemUpc.trim().length > 8 ||
    !quantity.trim() ||
    parseInt(quantity) < 1;

  const printIcon = (
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 5H3C1.34 5 0 6.34 0 8V14H4V18H16V14H20V8C20 6.34 18.66 5 17 5ZM14 16H6V11H14V16ZM17 9C16.45 9 16 8.55 16 8C16 7.45 16.45 7 17 7C17.55 7 18 7.45 18 8C18 8.55 17.55 9 17 9ZM16 0H4V4H16V0Z" fill="white"/>
    </svg>
  );

  const undoIcon = (
    <svg width="21" height="9" viewBox="0 0 21 9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.5 1C7.85 1 5.45 1.99 3.6 3.6L0 0V9H9L5.38 5.38C6.77 4.22 8.54 3.5 10.5 3.5C14.04 3.5 17.05 5.81 18.1 9L20.47 8.22C19.08 4.03 15.15 1 10.5 1Z" fill="currentColor"/>
    </svg>
  );

  const redoIcon = (
    <svg width="21" height="9" viewBox="0 0 21 9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.86 3.6C15.01 1.99 12.61 1 9.96 1C5.31 1 1.38 4.03 0 8.22L2.36 9C3.41 5.81 6.41 3.5 9.96 3.5C11.91 3.5 13.69 4.22 15.08 5.38L11.46 9H20.46V0L16.86 3.6Z" fill="currentColor"/>
    </svg>
  );

  return (
    <div className={styles.quickPrintItem}>
      <div className={styles.selectItem}>
        <ul>
          {/* Size — tabIndex={-1}: stays selected between items, user doesn't need to tab through it */}
          <li>
            <div className="inputLabelWrap">
              <label className="label">{t("quickPrint.form.size")}<span className="mandatoryStar">*</span></label>
              <ThemeProvider theme={theme}>
                <FormControl fullWidth size="small">
                  <Select
                    displayEmpty
                    value={size}
                    onChange={(e) => setSize(e.target.value as string)}
                    inputProps={{ "aria-label": t("sizes.selectPrompt"), tabIndex: -1 }}
                  >
                    <MenuItem value="" disabled>{t("sizes.selectPrompt")}</MenuItem>
                    <MenuItem value="Small">{t("sizes.small")}</MenuItem>
                    <MenuItem value="Medium">{t("sizes.medium")}</MenuItem>
                    <MenuItem value="Large">{t("sizes.large")}</MenuItem>
                  </Select>
                </FormControl>
              </ThemeProvider>
            </div>
          </li>

          {/* Item # — first in tab order; receives focus after Clear Fields / Add to List */}
          <li>
            <div className="inputLabelWrap">
              <label className="label">{t("quickPrint.form.itemUpc")}<span className="mandatoryStar">*</span></label>
              <ThemeProvider theme={theme}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("quickPrint.form.itemUpcPlaceholder")}
                  variant="outlined"
                  value={itemUpc}
                  onChange={(e) => setItemUpc(e.target.value)}
                  inputRef={itemUpcRef}
                  inputProps={{ minLength: 5, maxLength: 8, "aria-label": "Item number or UPC" }}
                />
              </ThemeProvider>
            </div>
          </li>

          {/* Quantity — second in tab order */}
          <li>
            <div className="inputLabelWrap">
              <label className="label">{t("quickPrint.form.quantity")}<span className="mandatoryStar">*</span></label>
              <ThemeProvider theme={theme}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("quickPrint.form.quantityPlaceholder")}
                  variant="outlined"
                  type="number"
                  inputProps={{ min: 1, max: 9999, maxLength: 4, "aria-label": "Quantity" }}
                  value={quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || (parseInt(val) >= 1 && val.length <= 4)) {
                      setQuantity(val);
                    }
                  }}
                />
              </ThemeProvider>
            </div>
          </li>

          <li className={styles.buttonRow}>
            {/* Clear Fields — tabIndex={-1}: not part of the keyboard flow */}
            <button
              className="clearButton"
              type="button"
              onClick={handleClearFields}
              tabIndex={-1}
            >
              <span>{t("quickPrint.form.clearFields")}</span>
            </button>

            {/* Add to List — third in tab order (after Item # → Quantity) */}
            <button
              className="primaryButton"
              type="button"
              onClick={handleAddToList}
              disabled={isAddDisabled}
            >
              <span>{t("quickPrint.form.addToList")}</span>
            </button>
          </li>
        </ul>
      </div>

      <div className={styles.quickPrintList}>
        <div className={styles.listHeader}>
          <h4>{t("quickPrint.list.title")}</h4>
          <div className={styles.listActionWrap}>
            <ul>
              <li>
                <div className={styles.undoRedoLink}>
                  <button type="button" className={styles.undoLink} aria-label={t("quickPrint.controls.undo")} onClick={handleUndo} disabled={undoHistory.length === 0}>
                    <i>{undoIcon}</i>
                    <span>{t("quickPrint.controls.undo")}</span>
                  </button>
                  <button type="button" className={styles.redoLink} aria-label={t("quickPrint.controls.redo")} onClick={handleRedo} disabled={redoHistory.length === 0}>
                    <i>{redoIcon}</i>
                    <span>{t("quickPrint.controls.redo")}</span>
                  </button>
                </div>
              </li>
              <li>
                <button className="primaryButtonOutline" type="button" onClick={handleClearList} disabled={printItems.length === 0}>
                  <span>{t("quickPrint.controls.clearList")}</span>
                </button>
              </li>
              <li>
                <button className="primaryButton" type="button" disabled={printItems.length === 0}>
                  <i>{printIcon}</i>
                  <span>{t("quickPrint.controls.print", { count: printItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0) })}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.listContent}>
          {[0, 1, 2, 3].map((colIndex) => (
            <div key={colIndex} className={styles.listGrid}>
              <table className={styles.quickPrintTable}>
                <thead>
                  <tr>
                    <th>{t("quickPrint.form.itemUpc")}</th>
                    <th>{t("quickPrint.form.size")}</th>
                    <th>{t("quickPrint.form.quantity")}</th>
                  </tr>
                </thead>
                <tbody>
                  {getTableItems(colIndex).map((item, idx) => (
                    <tr key={idx}>
                      <td>{item ? item.itemUpc : "-"}</td>
                      <td>{item ? (item.size || "-") : "-"}</td>
                      <td>{item ? item.quantity : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PrintByItem;
