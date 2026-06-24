"use client";

import React, { useRef, useCallback } from "react";
import Image from "next/image";
import styles from "./customSign.module.scss";
import { ThemeProvider } from "@emotion/react";
import { CircularProgress, FormControl, MenuItem, Select, TextField } from "@mui/material";
import { theme } from "@/theme/customizeTheme";
import { useTranslation } from "react-i18next";
import { ENABLE_DOWNLOAD } from "../../../lib/constants";
import useCustomSign from "../hooks/useCustomSign";
import PrintProgressModal from "../../dashboard/component/PrintProgressModal";

const printIcon = (
  <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 5H3C1.34 5 0 6.34 0 8V14H4V18H16V14H20V8C20 6.34 18.66 5 17 5ZM14 16H6V11H14V16ZM17 9C16.45 9 16 8.55 16 8C16 7.45 16.45 7 17 7C17.55 7 18 7.45 18 8C18 8.55 17.55 9 17 9ZM16 0H4V4H16V0Z" fill="white"/>
  </svg>
);

const clearIcon = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0C4.47 0 0 4.47 0 10C0 15.53 4.47 20 10 20C15.53 20 20 15.53 20 10C20 4.47 15.53 0 10 0ZM15 13.59L13.59 15L10 11.41L6.41 15L5 13.59L8.59 10L5 6.41L6.41 5L10 8.59L13.59 5L15 6.41L11.41 10L15 13.59Z" fill="#64686C"/>
  </svg>
);

function CustomSignScreen(): JSX.Element {
  const {
    productCode,
    size,
    quantity,
    titleLine1,
    titleLine2,
    previewBase64,
    isLoaded,
    isLookingUp,
    isRerendering,
    isOpen,
    error,
    setProductCode,
    setSize,
    setQuantity,
    setTitleLine1,
    setTitleLine2,
    handleLookup,
    handleFieldBlur,
    handleReset,
    openPrintModal,
    startPrint,
    startDownload,
    mode,
    onPrinterChange,
    onTrayChange,
    closeModal,
    isPrintStarted,
    steps,
    printError,
    isDone,
    successInfo,
    printers,
    trays,
    selectedPrinter,
    selectedTray,
    isLoadingPrinters,
  } = useCustomSign();

  const { t } = useTranslation("signs");

  // Ref for programmatic focus — cursor returns to Item # after Reset.
  const productCodeRef = useRef<HTMLInputElement>(null);

  const handleResetWithFocus = useCallback((): void => {
    handleReset();
    setTimeout(() => productCodeRef.current?.focus(), 0);
  }, [handleReset]);

  const isLookupDisabled = isLookingUp || !productCode.trim() || !size;

  return (
    <div className={styles.contentWrap}>
      <div className={styles.topContentBar}>
        <div className={styles.topTitle}>
          <h2>{t("customSign.title")}</h2>
        </div>
        <div className={styles.actionWrap}>
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
        <div className={styles.gridWrap}>

          {/* ── Left panel: item lookup + editable text fields ── */}
          <div className={styles.signDetails}>

            <div className={styles.selectSignDetails}>
              <ul>
                <li>
                  <div className="inputLabelWrap">
                    <label className="label">{t("customSign.form.itemUpc")}<span className="mandatoryStar">*</span></label>
                    <ThemeProvider theme={theme}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={t("customSign.form.itemUpcPlaceholder")}
                        variant="outlined"
                        value={productCode}
                        onChange={(e) => setProductCode(e.target.value.replace(/[^0-9]/g, ""))}
                        inputRef={productCodeRef}
                        inputProps={{ minLength: 1, maxLength: 9, "aria-label": "Item number or UPC" }}
                      />
                    </ThemeProvider>
                    {productCode && (
                      <i
                        className="clearIcon"
                        role="button"
                        aria-label="Clear item number"
                        onClick={handleResetWithFocus}
                        style={{ cursor: "pointer" }}
                      >
                        {clearIcon}
                      </i>
                    )}
                  </div>
                </li>
                <li>
                  <div className="inputLabelWrap">
                    <label className="label">{t("customSign.form.size")}<span className="mandatoryStar">*</span></label>
                    <ThemeProvider theme={theme}>
                      <FormControl fullWidth size="small">
                        <Select
                          displayEmpty
                          value={size}
                          onChange={(e) => setSize(e.target.value as string)}
                          inputProps={{ "aria-label": t("sizes.selectPrompt") }}
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

            {error && (
              <p className={styles.errorMessage} role="alert">{error}</p>
            )}

            <div className={styles.buttonsWrap}>
              <ul>
                <li>
                  <button
                    className="primaryButtonOutline"
                    onClick={handleResetWithFocus}
                    disabled={isLookingUp}
                  >
                    {t("customSign.actions.reset")}
                  </button>
                </li>
                <li>
                  <button
                    className="primaryButton"
                    onClick={() => void handleLookup()}
                    disabled={isLookupDisabled}
                    aria-busy={isLookingUp}
                  >
                    {isLookingUp ? t("customSign.form.lookingUp") : t("customSign.form.lookup")}
                  </button>
                </li>
              </ul>
            </div>

            {/* Editable sign text fields — shown only after a successful lookup */}
            {isLoaded && (
              <div className={styles.loadSignDetails}>
                <ul>
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">{t("customSign.form.title1")}</label>
                      <ThemeProvider theme={theme}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder={t("customSign.form.title1")}
                          variant="outlined"
                          value={titleLine1}
                          onChange={(e) => setTitleLine1(e.target.value)}
                          onBlur={() => void handleFieldBlur()}
                          inputProps={{ "aria-label": "Title Line 1" }}
                        />
                      </ThemeProvider>
                    </div>
                  </li>
                  <li>
                    <div className="inputLabelWrap">
                      <label className="label">{t("customSign.form.title2")}</label>
                      <ThemeProvider theme={theme}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder={t("customSign.form.title2")}
                          variant="outlined"
                          value={titleLine2}
                          onChange={(e) => setTitleLine2(e.target.value)}
                          onBlur={() => void handleFieldBlur()}
                          inputProps={{ "aria-label": "Title Line 2" }}
                        />
                      </ThemeProvider>
                      <i
                        className="clearIcon"
                        role="button"
                        aria-label="Clear Title Line 2"
                        onClick={() => setTitleLine2("")}
                        style={{ cursor: "pointer" }}
                      >
                        {clearIcon}
                      </i>
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* ── Right panel: quantity (copies) selector + sign preview ── */}
          <div className={styles.signPreviewWrapper}>
            <div className={styles.selectQty}>
              <ul>
                <li>
                  <div className="inputLabelWrap">
                    <label className="label">{t("customSign.form.quantity")}</label>
                    <ThemeProvider theme={theme}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="1"
                        variant="outlined"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        inputProps={{ min: 1, max: 99, "aria-label": "Print quantity" }}
                      />
                    </ThemeProvider>
                  </div>
                </li>
                <li>
                  <button
                    className="primaryButton"
                    onClick={() => void openPrintModal()}
                    disabled={!isLoaded || isOpen}
                    aria-busy={isOpen && !isPrintStarted}
                  >
                    <i>{printIcon}</i>
                    <span>{t("customSign.actions.print")}</span>
                  </button>
                </li>
              </ul>
            </div>

            {isLookingUp && (
              <div className={styles.templateViewEmpty} aria-live="polite" aria-busy="true">
                <CircularProgress size={40} aria-label="Loading sign preview" />
              </div>
            )}

            {!isLookingUp && !isLoaded && (
              <div className={styles.templateViewEmpty}>
                <h2>Sign preview will be shown here</h2>
              </div>
            )}

            {!isLookingUp && isLoaded && previewBase64 && (
              <div className={styles.signTemplateCard}>
                {isRerendering && (
                  <div className={styles.rerenderOverlay} aria-live="polite" aria-busy="true">
                    <CircularProgress size={32} aria-label="Updating sign preview" />
                  </div>
                )}
                <div className={styles.previewImageWrap} style={{ opacity: isRerendering ? 0.4 : 1, transition: "opacity 0.2s" }}>
                  <Image
                    src={`data:image/png;base64,${previewBase64}`}
                    alt="Custom sign preview"
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                    unoptimized
                  />
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      <PrintProgressModal
        isOpen={isOpen}
        batchName={productCode}
        mode={mode}
        steps={steps}
        error={printError}
        isDone={isDone}
        successInfo={successInfo}
        onClose={closeModal}
        printers={printers}
        trays={trays}
        selectedPrinter={selectedPrinter}
        selectedTray={selectedTray}
        isLoadingPrinters={isLoadingPrinters}
        onPrinterChange={(p) => void onPrinterChange(p)}
        onTrayChange={onTrayChange}
        onStartPrint={() => void startPrint()}
        onStartDownload={ENABLE_DOWNLOAD ? () => void startDownload() : undefined}
        isPrintStarted={isPrintStarted}
      />
    </div>
  );
}

export default CustomSignScreen;
