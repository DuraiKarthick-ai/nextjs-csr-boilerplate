import { useState } from "react";
import { ThemeProvider } from "@emotion/react";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
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
  const [initialLoad, setInitialLoad] = useState(true);
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
                        placeholder="Enter or Scan  Item # / UPC"
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
                  <div className={`inputLabelWrap ${styles.qtyField}`}>
                    <label className="label">Quantity</label>
                    <ThemeProvider theme={theme}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter Quantity"
                        variant="outlined"
                        value={quantity}
                        onBlur={() => setInitialLoad(!initialLoad)}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </ThemeProvider>
                  </div>
                </li>
                {/* <li>
                  <button className="primaryButton" onClick={() => setInitialLoad(!initialLoad)}>Load Data</button>
                </li>
                <li>
                  <button className="primaryButton" onClick={() => setIsEdit(!isEdit)}>Edit</button>
                </li> */}
              </ul>
            </div>
            <div className={`${styles.grid} ${styles.gridBig}`}>
              {/* Product Sign Preview Card */}
              <div className={styles.signEditPreviewWrapper}>
                <div className={styles.signTemplateCard}>
                  <div className={styles.signHeader}>
                    <ul>
                      <li>
                        {initialLoad ? (
                          <div className={styles.emptyItemField}></div>
                        ) : (
                          <h1>{itemNumber || "987677"}</h1>
                        )}
                      </li>
                      <li>
                        {initialLoad ? (
                          <div className={`${styles.emptyField} ${styles.emptyHeaderField}`}></div>
                        ) : isEdit ? (
                          <div className={styles.editableField}>
                            <input type="text" value={signContent.line1} onChange={(e) => handleContentChange("line1", e.target.value)} />
                          </div>
                        ) : (
                          <div className={styles.editableField}>
                            <h1>{signContent.line1}</h1>
                          </div>
                        )}
                      </li>
                      <li>
                        {initialLoad ? (
                          <div className={`${styles.emptyField} ${styles.emptyHeaderField}`}></div>
                        ) : isEdit ? (
                          <div className={styles.editableField}>
                            <input type="text" value={signContent.line2} onChange={(e) => handleContentChange("line2", e.target.value)} />
                          </div>
                        ) : (
                          <div className={styles.editableField}>
                            <h1>{signContent.line2}</h1>
                          </div>
                        )}
                      </li>
                      <li>
                        {initialLoad ? (
                          <div className={`${styles.emptyField} ${styles.emptyHeaderField}`}></div>
                        ) : isEdit ? (
                          <div className={styles.editableField}>
                            <input type="text" value={signContent.line3} onChange={(e) => handleContentChange("line3", e.target.value)} />
                          </div>
                        ) : (
                          <div className={styles.editableField}>
                            <h1>{signContent.line3}</h1>
                          </div>
                        )}
                      </li>
                    </ul>
                  </div>
                  
                  <div className={styles.productInfo}>
                    <ul>
                      {(["badge1", "badge2", "badge3", "badge4", "badge5", "badge6", "badge7"] as const).map((key) => (
                        <li key={key}>
                          {initialLoad ? (
                            <div className={`${styles.emptyField} ${styles.emptyInfoField}`}></div>
                          ) : isEdit ? (
                            <div className={styles.editableField}>
                              <input
                                type="text"
                                value={signContent[key]}
                                placeholder="Enter Here"
                                onChange={(e) => handleContentChange(key, e.target.value)}
                              />
                            </div>
                          ) : (
                            <div className={styles.editableField}>
                              <h2>{signContent[key] || "Enter Here"}</h2>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.priceDetails}>
                    <ul>
                      <li>
                        <div className={styles.pricePerEach}>
                          <div className={styles.priceLabel}>
                            <h2>PRICE PER EACH</h2>
                          </div>
                          <div className={styles.priceValue}>
                            {initialLoad ? (
                              <div className={`${styles.emptyField} ${styles.emptyPricePerField}`}></div>
                            ) : isEdit ? (
                              <input
                                type="text"
                                value={signContent.pricePerEach}
                                onChange={(e) => handleContentChange("pricePerEach", e.target.value)}
                              />
                            ) : (
                              <h2>{signContent.pricePerEach}</h2>
                            )}
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className={styles.sellPrice}>
                          <div className={styles.priceLabel}>
                            <h2>SELL PRICE</h2>
                          </div>
                          <div className={styles.priceValue}>
                            {initialLoad ? (
                              <div className={`${styles.emptyField} ${styles.emptySellPriceField}`}></div>
                            ) : isEdit ? (
                              <div className={styles.editableField}>
                                <input
                                  type="text"
                                  value={signContent.sellPrice}
                                  onChange={(e) => handleContentChange("sellPrice", e.target.value)}
                                />
                              </div>
                            ) : (
                              <div className={styles.editableField}>
                                <h1>{signContent.sellPrice}</h1>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>

              <div className={styles.actionsButtonWrap}>
                <ul>
                  <li>
                    {printError && <p className={styles.errorText}>{printError}</p>}
                  </li>
                  <li>
                    <button className="primaryButtonOutline" type="button" onClick={handleReset}>
                      Reset
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="primaryButton"
                      onClick={handlePrint}
                      disabled={isPrinting || !itemNumber || !size || !quantity}
                    >
                      {isPrinting ? "Printing…" : "Print"}
                    </button>
                  </li>
                </ul>
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