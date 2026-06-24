import React, { useState } from "react";
import styles from "./printByDept.module.scss";
import { ThemeProvider } from "@emotion/react";
import { FormControl, MenuItem, Select, Switch, TextField } from "@mui/material";
import { theme } from "@/theme/customizeTheme";
import { useTranslation } from "react-i18next";

function PrintByDept(): JSX.Element {
  const { t } = useTranslation("signs");
  const [deptNumber, setDeptNumber] = useState<string>("");
  const [catCode, setCatCode] = useState<string>("");
  const [deptQuantity, setDeptQuantity] = useState<string>("1");
  const [deptSize, setDeptSize] = useState<string>("");
  const [printOnlyOnHand, setPrintOnlyOnHand] = useState<boolean>(true);

  const printIcon = (
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 5H3C1.34 5 0 6.34 0 8V14H4V18H16V14H20V8C20 6.34 18.66 5 17 5ZM14 16H6V11H14V16ZM17 9C16.45 9 16 8.55 16 8C16 7.45 16.45 7 17 7C17.55 7 18 7.45 18 8C18 8.55 17.55 9 17 9ZM16 0H4V4H16V0Z" fill="white"/>
    </svg>
  );

  return (
    <div className={styles.deptCategory}>
      <div className={styles.selectDeptCategory}>
        <ul>
          <li>
            <div className="inputLabelWrap">
              <label className="label">{t("quickPrint.form.department")}<span className="mandatoryStar">*</span></label>
              <ThemeProvider theme={theme}>
                <TextField
                  id="dept-number"
                  fullWidth
                  size="small"
                  placeholder={t("quickPrint.form.departmentPlaceholder")}
                  variant="outlined"
                  value={deptNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    if (val.length <= 3) setDeptNumber(val);
                  }}
                  inputProps={{ minLength: 1, maxLength: 3 }}
                />
              </ThemeProvider>
            </div>
          </li>
          <li>
            <div className="inputLabelWrap">
              <label className="label">{t("quickPrint.form.catCode")}</label>
              <ThemeProvider theme={theme}>
                <TextField
                  id="cat-code"
                  fullWidth
                  size="small"
                  placeholder={t("quickPrint.form.catCodePlaceholder")}
                  variant="outlined"
                  value={catCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    if (val.length <= 3) setCatCode(val);
                  }}
                  inputProps={{ minLength: 1, maxLength: 3 }}
                />
              </ThemeProvider>
              <span className="validationMsg info">{t("quickPrint.form.leaveBlankForAll")}</span>
            </div>
          </li>
          <li>
            <div className="inputLabelWrap">
              <label className="label">{t("quickPrint.form.quantity")}</label>
              <ThemeProvider theme={theme}>
                <TextField
                  id="dept-quantity"
                  fullWidth
                  size="small"
                  placeholder={t("quickPrint.form.quantityPlaceholder")}
                  variant="outlined"
                  type="number"
                  inputProps={{ min: 1, max: 9999, maxLength: 4 }}
                  value={deptQuantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || (parseInt(val) >= 1 && val.length <= 4)) {
                      setDeptQuantity(val);
                    }
                  }}
                />
              </ThemeProvider>
            </div>
          </li>
          <li>
            <div className="inputLabelWrap">
              <label className="label">{t("quickPrint.form.size")}</label>
              <ThemeProvider theme={theme}>
                <FormControl fullWidth size="small">
                  <Select
                    displayEmpty
                    value={deptSize}
                    onChange={(e) => setDeptSize(e.target.value as string)}
                    inputProps={{ 'aria-label': t("sizes.selectPrompt") }}
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
        </ul>
      </div>
      <div className={styles.buttonWrap}>
        <ul>
          {/* <li>
            <div className={styles.toggleWrap}>
              <label className="label">{t("quickPrint.form.printOnlyOnHand")}</label>
              <ThemeProvider theme={theme}>
                <Switch
                  checked={printOnlyOnHand}
                  onChange={(e) => setPrintOnlyOnHand(e.target.checked)}
                />
              </ThemeProvider>
            </div>
          </li> */}
          <li>
            <button
              className="primaryButton"
              type="button"
              disabled={deptNumber.trim().length < 1 || !deptSize}
            >
              <i>{printIcon}</i>
              <span>{t("quickPrint.controls.printAll")}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default PrintByDept;
