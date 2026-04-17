import { useState } from "react";
import { ThemeProvider } from "@emotion/react";
import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import theme from "@/theme/customizeTheme";
import ContentWrapper from "../contentWrapper/contentWrapper";
import SuccessToast from "../shared/SuccessToast";
import { usePrint } from "@/hooks/usePrint";
import { DEFAULT_STORE_ID, DEFAULT_REQUESTED_BY } from "@/constants/print";
import type { SignSize } from "@/types/print";
import styles from "./customPrint.module.scss";

const INITIAL_SIGN_CONTENT = {
  line1: "KIRKLAND SIGNATURE",
  line2: "ALLER-FEX 180MG TABLET",
  line3: "180 COUNT",
  badge1: "COMPARE TO ALLEGRA",
  badge2: "FSA ELIGIBLE",
  badge3: "",
  badge4: "",
  badge5: "",
  badge6: "",
  badge7: "",
  pricePerEach: "0.186",
  sellPrice: "33.49",
};

/**
 * CustomPrint — Custom Sign creation screen.
 *
 * Allows users to enter item details, edit sign content inline,
 * preview the sign, and submit a CUSTOM_SIGN print request.
 *
 * @returns {JSX.Element} The rendered Custom Sign view.
 */
export default function CustomPrint(): JSX.Element {
  const [isEdit, setIsEdit] = useState(false);
  const [itemNumber, setItemNumber] = useState("");
  const [size, setSize] = useState<SignSize | "">("");
  const [quantity, setQuantity] = useState("");
  const [signContent, setSignContent] = useState({ ...INITIAL_SIGN_CONTENT });
  const { isPrinting, printResult, printError, submitPrint, resetPrint } = usePrint();

  /**
   * Updates a single field in the sign content state.
   *
   * @param {string} field - The field key to update.
   * @param {string} value - The new value for the field.
   */
  const handleContentChange = (field: string, value: string): void => {
    setSignContent((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Resets all form fields and sign content to initial values.
   */
  const handleReset = (): void => {
    setItemNumber("");
    setSize("");
    setQuantity("");
    setSignContent({ ...INITIAL_SIGN_CONTENT });
    setIsEdit(false);
  };

  /**
   * Builds the CUSTOM_SIGN payload and submits the print request.
   */
  const handlePrint = async (): Promise<void> => {
    if (!itemNumber || !size || !quantity) return;

    const badges = [
      signContent.badge1,
      signContent.badge2,
      signContent.badge3,
      signContent.badge4,
      signContent.badge5,
      signContent.badge6,
      signContent.badge7,
    ].filter(Boolean);

    const success = await submitPrint({
      storeId: DEFAULT_STORE_ID,
      requestedBy: DEFAULT_REQUESTED_BY,
      printRequests: [
        {
          type: "CUSTOM_SIGN",
          entries: [
            {
              itemNumberOrUpc: itemNumber,
              size: size as SignSize,
              quantity: Number(quantity),
              signContent: {
                line1: signContent.line1,
                line2: signContent.line2,
                line3: signContent.line3,
                badges,
                pricePerEach: signContent.pricePerEach,
                sellPrice: signContent.sellPrice,
              },
            },
          ],
        },
      ],
    });
    if (success) {
      handleReset();
    }
  };

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
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter Item # / UPC"
                        variant="outlined"
                        value={itemNumber}
                        onChange={(e) => setItemNumber(e.target.value)}
                        error={!!printError}
                      />
                    </ThemeProvider>
                    {printError && <span className="validationMsg error">{printError}</span>}
                  </div>
                </li>
                <li>
                  <div className="inputLabelWrap">
                      <label className="label">Size</label>
                      <ThemeProvider theme={theme}>
                        <FormControl fullWidth size="small">
                          <Select
                            displayEmpty
                            value={size}
                            onChange={(e: SelectChangeEvent) => setSize(e.target.value as SignSize | "")}
                            inputProps={{ 'aria-label': 'Select Size' }}
                          >
                            <MenuItem value="" disabled>
                              Select Size
                            </MenuItem>
                            <MenuItem value="SMALL">S-Small</MenuItem>
                            <MenuItem value="MEDIUM">M-Medium</MenuItem>
                            <MenuItem value="LARGE">L-Large</MenuItem>
                          </Select>
                        </FormControl>
                      </ThemeProvider>
                    </div>
                </li>
                <li>
                  <div className="inputLabelWrap">
                    <label className="label">Quantity</label>
                    <ThemeProvider theme={theme}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter Quantity"
                        variant="outlined"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
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
                        <h1>{itemNumber || "987677"}</h1>
                      </li>
                      <li>
                        {!isEdit && (
                          <div className={styles.editableField}>
                            <h1>{signContent.line1}</h1>
                          </div>
                        )}
                        {isEdit && (
                          <div className={styles.editableField}>
                            <input type="text" value={signContent.line1} onChange={(e) => handleContentChange("line1", e.target.value)} />
                          </div>
                        )}
                      </li>
                      <li>
                        {!isEdit && (
                          <div className={styles.editableField}>
                            <h1>{signContent.line2}</h1>
                          </div>
                        )}
                        {isEdit && (
                          <div className={styles.editableField}>
                            <input type="text" value={signContent.line2} onChange={(e) => handleContentChange("line2", e.target.value)} />
                          </div>
                        )}
                      </li>
                      <li>
                        {!isEdit && (
                          <div className={styles.editableField}>
                            <h1>{signContent.line3}</h1>
                          </div>
                        )}
                        {isEdit && (
                          <div className={styles.editableField}>
                            <input type="text" value={signContent.line3} onChange={(e) => handleContentChange("line3", e.target.value)} />
                          </div>
                        )}
                      </li>
                    </ul>
                  </div>
                  
                  <div className={styles.productInfo}>
                    <ul>
                      {(["badge1", "badge2", "badge3", "badge4", "badge5", "badge6", "badge7"] as const).map((key) => (
                        <li key={key}>
                          {!isEdit && (
                            <div className={styles.editableField}>
                              <h2>{signContent[key] || "Enter Here"}</h2>
                            </div>
                          )}
                          {isEdit && (
                            <div className={styles.editableField}>
                              <input
                                type="text"
                                value={signContent[key]}
                                placeholder="Enter Here"
                                onChange={(e) => handleContentChange(key, e.target.value)}
                              />
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.priceDetails}>
                    <div className={`${styles.grid} ${styles.pricePerEach}`}>
                      <div className={styles.priceLabel}>
                        <h2>PRICE PER EACH</h2>
                      </div>
                      <div className={styles.priceValue}>
                        {!isEdit && <h2>{signContent.pricePerEach}</h2>}
                        {isEdit && (
                          <input
                            type="text"
                            value={signContent.pricePerEach}
                            onChange={(e) => handleContentChange("pricePerEach", e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                    <div className={`${styles.grid} ${styles.sellPrice}`}>
                      <div className={styles.priceLabel}>
                        <h2>SELL PRICE</h2>
                      </div>
                      <div className={styles.priceValue}>
                        
                        {!isEdit && (
                          <div className={styles.editableField}>
                            <h1>{signContent.sellPrice}</h1>
                          </div>
                        )}
                        {isEdit && (
                          <div className={styles.editableField}>
                            <input
                              type="text"
                              value={signContent.sellPrice}
                              onChange={(e) => handleContentChange("sellPrice", e.target.value)}
                            />
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

                <div className={styles.formActions}>
                  {printError && <p className={styles.errorText}>{printError}</p>}
                  <button type="button" className="secondaryButton" onClick={handleReset}>
                    Reset
                  </button>
                  <button
                    type="button"
                    className="primaryButton"
                    onClick={handlePrint}
                    disabled={isPrinting || !itemNumber || !size || !quantity}
                  >
                    {isPrinting ? "Printing…" : "Print"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SuccessToast
          open={printResult !== null}
          onClose={resetPrint}
          message={
            printResult
              ? `Printed successfully in ${printResult.printerName}`
              : ""
          }
        />

    </ContentWrapper>
  );
}