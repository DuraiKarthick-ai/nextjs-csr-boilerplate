import { useState } from "react";
import { ThemeProvider } from "@emotion/react";
import styles from "./customPrint.module.scss";
import ContentWrapper from "../contentWrapper/contentWrapper";
import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import theme from "@/theme/customizeTheme";

export default function CustomPrint() {
  const [isEdit, setIsEdit] = useState(false);

      const zoomInIcon = (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.6667 14.6667H15.6133L15.24 14.3067C16.5467 12.7867 17.3333 10.8133 17.3333 8.66667C17.3333 3.88 13.4533 0 8.66667 0C3.88 0 0 3.88 0 8.66667C0 13.4533 3.88 17.3333 8.66667 17.3333C10.8133 17.3333 12.7867 16.5467 14.3067 15.24L14.6667 15.6133V16.6667L21.3333 23.32L23.32 21.3333L16.6667 14.6667ZM8.66667 14.6667C5.34667 14.6667 2.66667 11.9867 2.66667 8.66667C2.66667 5.34667 5.34667 2.66667 8.66667 2.66667C11.9867 2.66667 14.6667 5.34667 14.6667 8.66667C14.6667 11.9867 11.9867 14.6667 8.66667 14.6667Z"
            fill="#323232"
          />
        </svg>
      );

      const zoomOutIcon = (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.6667 14.6667H15.6133L15.24 14.3067C16.5467 12.7867 17.3333 10.8133 17.3333 8.66667C17.3333 3.88 13.4533 0 8.66667 0C3.88 0 0 3.88 0 8.66667C0 13.4533 3.88 17.3333 8.66667 17.3333C10.8133 17.3333 12.7867 16.5467 14.3067 15.24L14.6667 15.6133V16.6667L21.3333 23.32L23.32 21.3333L16.6667 14.6667ZM8.66667 14.6667C5.34667 14.6667 2.66667 11.9867 2.66667 8.66667C2.66667 5.34667 5.34667 2.66667 8.66667 2.66667C11.9867 2.66667 14.6667 5.34667 14.6667 8.66667C14.6667 11.9867 11.9867 14.6667 8.66667 14.6667ZM5.33333 8H12V9.33333H5.33333V8Z"
            fill="#323232"
          />
        </svg>
      );

      const fullscreeIcon = (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 0L19.0667 3.06667L15.2133 6.89333L17.1067 8.78667L20.9333 4.93333L24 8V0H16ZM0 8L3.06667 4.93333L6.89333 8.78667L8.78667 6.89333L4.93333 3.06667L8 0H0V8ZM8 24L4.93333 20.9333L8.78667 17.1067L6.89333 15.2133L3.06667 19.0667L0 16V24H8ZM24 16L20.9333 19.0667L17.1067 15.2133L15.2133 17.1067L19.0667 20.9333L16 24H24V16Z"
            fill="#323232"
          />
        </svg>
      );

      const preiviewIcon = (
        <svg
          width="30"
          height="20"
          viewBox="0 0 30 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.6667 0C8 0 2.30667 4.14667 0 10C2.30667 15.8533 8 20 14.6667 20C21.3333 20 27.0267 15.8533 29.3333 10C27.0267 4.14667 21.3333 0 14.6667 0ZM14.6667 16.6667C10.9867 16.6667 8 13.68 8 10C8 6.32 10.9867 3.33333 14.6667 3.33333C18.3467 3.33333 21.3333 6.32 21.3333 10C21.3333 13.68 18.3467 16.6667 14.6667 16.6667ZM14.6667 6C12.4533 6 10.6667 7.78667 10.6667 10C10.6667 12.2133 12.4533 14 14.6667 14C16.88 14 18.6667 12.2133 18.6667 10C18.6667 7.78667 16.88 6 14.6667 6Z"
            fill="#323232"
          />
        </svg>
      );


  return (
    <ContentWrapper title="Sign Management">
        <div className={styles.groupBox}>
          <div className={styles.subTitle}>
            <p>Custom Signs</p>
          </div>
          <div className={`d-flex ${styles.gridWrap}`}>
            <div className={`${styles.grid} ${styles.gridSmall}`}>
              <ul>
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
                <li>
                  <button className="primaryButton" onClick={() => setIsEdit(!isEdit)}>Edit</button>
                </li>
              </ul>
            </div>
            <div className={`${styles.grid} ${styles.gridBig}`}>
              {/* Product Sign Preview Card */}
              <div className={styles.signEditPreviewWrapper}>
                <div className={styles.signTemplateCard}>
                  <div className={styles.signHeader}>
                    <ul>
                      <li>
                        <h1>987677</h1>
                      </li>
                      <li>
                        {!isEdit && (
                          <div className={styles.editableField}>
                            <h1>KIRKLAND SIGNATURE</h1>
                          </div>
                        )}
                        {isEdit && (
                          <div className={styles.editableField}>
                            <input type="text" defaultValue="KIRKLAND SIGNATURE" />
                          </div>
                        )}
                      </li>
                      <li>
                        {!isEdit && (
                          <div className={styles.editableField}>
                            <h1>ALLER-FEX 180MG TABLET</h1>
                          </div>
                        )}
                        {isEdit && (
                          <div className={styles.editableField}>
                            <input type="text" defaultValue="ALLER-FEX 180MG TABLET" />
                          </div>
                        )}
                      </li>
                      <li>
                        {!isEdit && (
                          <div className={styles.editableField}>
                            <h1>180 COUNT</h1>
                          </div>
                        )}
                        {isEdit && (
                          <div className={styles.editableField}>
                            <input type="text" defaultValue="180 COUNT" />
                          </div>
                        )}
                      </li>
                    </ul>
                  </div>
                  
                  <div className={styles.productInfo}>
                    <ul>
                      <li>
                        {!isEdit && (
                          <div className={styles.editableField}>
                            <h2>COMPARE TO ALLEGRA</h2>
                          </div>
                        )}
                        {isEdit && (
                          <div className={styles.editableField}>
                            <input type="text" defaultValue="COMPARE TO ALLEGRA" />
                          </div>
                        )}
                      </li>
                      <li>
                        {!isEdit && (
                          <div className={styles.editableField}>
                            <h2>FSA ELIGIBLE</h2>
                          </div>
                        )}
                        {isEdit && (
                          <div className={styles.editableField}>
                            <input type="text" defaultValue="FSA ELIGIBLE" />
                          </div>
                        )}
                      </li>
                      <li>
                        {!isEdit && (
                          <div className={styles.editableField}>
                            <h2>Enter Here</h2>
                          </div>
                        )}
                        {isEdit && (
                          <div className={styles.editableField}>
                            <input type="text" defaultValue="Enter Here" />
                          </div>
                        )}
                      </li>
                      <li>
                        {!isEdit && (
                          <div className={styles.editableField}>
                            <h2>Enter Here</h2>
                          </div>
                        )}
                        {isEdit && (
                          <div className={styles.editableField}>
                            <input type="text" defaultValue="Enter Here" />
                          </div>
                        )}
                      </li>
                      <li>
                        {!isEdit && (
                          <div className={styles.editableField}>
                            <h2>Enter Here</h2>
                          </div>
                        )}
                        {isEdit && (
                          <div className={styles.editableField}>
                            <input type="text" defaultValue="Enter Here" />
                          </div>
                        )}
                      </li>
                      <li>
                        {!isEdit && (
                          <div className={styles.editableField}>
                            <h2>Enter Here</h2>
                          </div>
                        )}
                        {isEdit && (
                          <div className={styles.editableField}>
                            <input type="text" defaultValue="Enter Here" />
                          </div>
                        )}
                      </li>
                      <li>
                        {!isEdit && (
                          <div className={styles.editableField}>
                            <h2>Enter Here</h2>
                          </div>
                        )}
                        {isEdit && (
                          <div className={styles.editableField}>
                            <input type="text" defaultValue="Enter Here" />
                          </div>
                        )}
                      </li>
                    </ul>
                  </div>

                  <div className={styles.priceDetails}>
                    <div className={`${styles.grid} ${styles.pricePerEach}`}>
                      <div className={styles.priceLabel}>
                        <h2>PRICE PER EACH</h2>
                      </div>
                      <div className={styles.priceValue}>
                        <h2>0.186</h2>
                      </div>
                    </div>
                    <div className={`${styles.grid} ${styles.sellPrice}`}>
                      <div className={styles.priceLabel}>
                        <h2>SELL PRICE</h2>
                      </div>
                      <div className={styles.priceValue}>
                        
                        {!isEdit && (
                          <div className={styles.editableField}>
                            <h1>33.49</h1>
                          </div>
                        )}
                        {isEdit && (
                          <div className={styles.editableField}>
                            <input type="text" defaultValue="33.49" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.signActions}>
                  <ul>
                    <li>
                        <button className={styles.actionBtn}>
                          <i>
                            {fullscreeIcon}
                          </i>
                          <span>Move</span>
                        </button>
                    </li>
                    <li>
                      <button className={styles.actionBtn}>
                        <i>
                          {preiviewIcon}
                        </i>
                        <span>Preview</span>
                      </button>
                    </li>
                    <li>
                      <button className={styles.actionBtn}>
                        <i>
                          {zoomOutIcon}
                        </i>
                        <span>Zoom Out</span>
                      </button>
                    </li>
                    <li>
                      <button className={styles.actionBtn}>
                        <i>
                          {zoomInIcon}
                        </i>
                        <span>Zoom in</span>
                      </button>
                    </li>
                  </ul>        
                </div>
              </div>
            </div>
          </div>
        </div>
    </ContentWrapper>
  );
}