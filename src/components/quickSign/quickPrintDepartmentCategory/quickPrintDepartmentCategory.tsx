import { ThemeProvider } from "@emotion/react";
import styles from "./quickPrintDepartmentCategory.module.scss"
import theme from "@/theme/customizeTheme";
import { FormControl, MenuItem, Select, Switch, TextField } from "@mui/material";

export default function QuickPrintDepartmentCategory() {
  return (
    <div className={styles.departmentCategorySection}>

      <div className={styles.subTitle}>
        <p>Quick Print - Department & Category</p>
      </div>
      
      <div className={`d-flex ${styles.gridWrap} ${styles.deptCategory}`}>
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
  );
}
