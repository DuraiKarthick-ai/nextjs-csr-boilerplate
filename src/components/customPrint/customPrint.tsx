import { useState } from "react";
import { ThemeProvider } from "@emotion/react";
import styles from "./customPrint.module.scss";
import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import theme from "@/theme/customizeTheme";

export default function CustomPrint() {
  const [isEdit, setIsEdit] = useState(false);
  const tabIcon = (
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
  );

  const refreshIcon = (
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
  )

  const minimizeIcon = (
    <svg
      width="16"
      height="2"
      viewBox="0 0 16 2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 0H0V2H16V0Z" fill="#79747E" />
    </svg>
  )

  const openNewTabIcon = (
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
  )

  const closeIcon = (
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
  )

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
    <div className={styles.contentWrap}>
      <div className={styles.topContentBar}>
        <div className={styles.leftActionWrap}>
          <ul>
            <li>
              <i>
                {tabIcon}
              </i>
            </li>
            <li>
              <i>
                {refreshIcon}
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
                {minimizeIcon}
              </i>
            </li>
            <li>
              <i>
                {openNewTabIcon}
              </i>
            </li>
            <li>
              <i>
                {closeIcon}
              </i>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <h2>Sign Management</h2>
        </div>

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
      </div>
    </div>
  );
}