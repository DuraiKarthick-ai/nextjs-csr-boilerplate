"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import ErrorMessage from "../../../shared/common/ErrorMessage";
import { ROUTES, ENABLE_DOWNLOAD } from "../../../lib/constants";
import type { BatchItem } from "../../../types/batch.types";
import { BatchStatus } from "../../../types/batch.types";
import useBatches from "../hooks/useBatches";
import { useDashboardPrint } from "../hooks/useDashboardPrint";
import { usePrinterSetup } from "../hooks/usePrinterSetup";
import PrintProgressModal from "./PrintProgressModal";
import styles from "./dashboard.module.scss";
import { ThemeProvider } from "@emotion/react";
import { tableFilterTheme } from "@/theme/customizeTheme";
import { FormControl, MenuItem, Select } from "@mui/material";

function toTwoDigits(value: number): string {
  return value.toString().padStart(2, "0");
}

export const QuickPrintIcon = (): JSX.Element => (
  <svg width="24" height="21" viewBox="0 0 24 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.8333 5.83333H3.5C1.56333 5.83333 0 7.39667 0 9.33333V16.3333H4.66667V21H18.6667V16.3333H23.3333V9.33333C23.3333 7.39667 21.77 5.83333 19.8333 5.83333ZM16.3333 18.6667H7V12.8333H16.3333V18.6667ZM19.8333 10.5C19.1917 10.5 18.6667 9.975 18.6667 9.33333C18.6667 8.69167 19.1917 8.16667 19.8333 8.16667C20.475 8.16667 21 8.69167 21 9.33333C21 9.975 20.475 10.5 19.8333 10.5ZM18.6667 0H4.66667V4.66667H18.6667V0Z" fill="#FFFFFF" />
  </svg>
);

export const CustomPrintIcon = (): JSX.Element => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.24 8.50895L14.81 6.93894L11.06 3.18895L9.49 4.75895L5.35 0.628945C4.57 -0.151055 3.3 -0.151055 2.52 0.628945L0.62 2.52895C-0.16 3.30895 -0.16 4.57895 0.62 5.35894L4.75 9.48895L0 14.2489V17.9989H3.75L8.51 13.2389L12.64 17.3689C13.59 18.3189 14.87 17.9689 15.47 17.3689L17.37 15.4689C18.15 14.6889 18.15 13.4189 17.37 12.6389L13.24 8.50895ZM6.18 8.06894L2.04 3.93895L3.93 2.03895L5.2 3.30895L4.02 4.49895L5.43 5.90895L6.62 4.71895L8.07 6.16895L6.18 8.06894ZM14.06 15.9589L9.93 11.8289L11.83 9.92895L13.28 11.3789L12.09 12.5689L13.5 13.9789L14.69 12.7889L15.96 14.0589L14.06 15.9589Z" fill="white"/>
    <path d="M17.71 4.03889C18.1 3.64889 18.1 3.01889 17.71 2.62889L15.37 0.288891C14.9 -0.181109 14.25 -0.00110886 13.96 0.288891L12.13 2.11889L15.88 5.86889L17.71 4.03889Z" fill="white"/>
  </svg>
);

const downloadIcon = (
  <svg width="20" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
  </svg>
);

const printIcon = (
  <svg width="16" height="14" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 5H3C1.34 5 0 6.34 0 8V14H4V18H16V14H20V8C20 6.34 18.66 5 17 5ZM14 16H6V11H14V16ZM17 9C16.45 9 16 8.55 16 8C16 7.45 16.45 7 17 7C17.55 7 18 7.45 18 8C18 8.55 17.55 9 17 9ZM16 0H4V4H16V0Z" fill="white"/>
  </svg>
);


interface DashboardNavProps {
  onNavigateHref?: (href: string) => void;
}

function QuickLinks({ onNavigateHref }: DashboardNavProps): JSX.Element {
  const { t } = useTranslation("dashboard");
  return (
    <div className={styles.quickLinks}>
      <div className={styles.subTitle}>
        <h3>Quick Links</h3>
      </div>
      <ul>
        <li>
          <Link
            href={ROUTES.QUICK_PRINT}
            onClick={(event) => {
              if (!onNavigateHref) return;
              event.preventDefault();
              onNavigateHref(ROUTES.QUICK_PRINT);
            }}
          >
            <div className={styles.quickLinksWrap}>
              <div className={styles.icons}>
                <i><QuickPrintIcon /></i>
              </div>
              <label>{t("quickLinks.quickPrint")}</label>
            </div>
          </Link>
        </li>
        <li>
          <Link
            href={ROUTES.CUSTOM_SIGN}
            onClick={(event) => {
              if (!onNavigateHref) return;
              event.preventDefault();
              onNavigateHref(ROUTES.CUSTOM_SIGN);
            }}
          >
            <div className={styles.quickLinksWrap}>
              <div className={styles.icons}>
                <i><CustomPrintIcon /></i>
              </div>
              <label>{t("quickLinks.customSign")}</label>
            </div>
          </Link>
        </li>
      </ul>
    </div>
  );
}

interface BatchJobsSectionProps {
  batches: BatchItem[];
  isLoading: boolean;
  error: string | null;
  onNavigateHref?: (href: string) => void;
}

function BatchJobsSection({
  batches,
  isLoading,
  error,
  onNavigateHref,
}: BatchJobsSectionProps): JSX.Element | null {
  const { t } = useTranslation("dashboard");
  const { isOpen, mode, steps, error: printError, isDone, activeBatchName, successInfo, startPrint, startDownload, closeModal } = useDashboardPrint();
  const {
    printers,
    isLoadingPrinters,
    printerError,
    getSelectedPrinter,
    getSelectedTray,
    getTraysForBatch,
    isLoadingTrays,
    setSelectedPrinter,
    setSelectedTray,
  } = usePrinterSetup();

  // Track which batches have already had defaults applied so we don't overwrite
  // a user's manual selection if printers/batches re-render.
  const appliedDefaults = useRef(new Set<number>());

  useEffect(() => {
    if (printers.length === 0 || batches.length === 0) return;
    const defaultPrinter = printers[0]!;
    batches.forEach((batch) => {
      if (!appliedDefaults.current.has(batch.batchId)) {
        appliedDefaults.current.add(batch.batchId);
        void setSelectedPrinter(batch.batchId, defaultPrinter);
      }
    });
  }, [printers, batches, setSelectedPrinter]);

  if (error) return <ErrorMessage message={error} />;
  if (!isLoading && batches.length === 0) return null;

  return (
    <div className={styles.batchActivity}>
      <div className={styles.subTitle}>
        <h3>{t("worklistSummary.heading")}</h3>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th className={styles.columnJobs}><p>{t("worklistSummary.columnBatchJob")}</p></th>
              <th><p>{t("worklistSummary.columnStatus")}</p></th>
              <th><p>Printer Selection</p></th>
              <th><p>Select Tray</p></th>
              <th><p>{t("worklistSummary.columnActions")}</p></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`shimmer-${i}`}>
                  <td><div className="shimmer md"></div></td>
                  <td><div className="shimmer sm"></div></td>
                  <td><div className="shimmer md"></div></td>
                  <td><div className="shimmer md"></div></td>
                  <td>
                    <div className={styles.shimmerBtnWrap}>
                      <div className="shimmer sm mr-16"></div>
                      <div className="shimmer sm"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              batches.map((batch) => {
                const printProgress = `${toTwoDigits(batch.printedQuantity ?? 0)}/${toTwoDigits(batch.signQuantity ?? 0)}`;
                const worklistHref = `${ROUTES.WORKLIST}?batchId=${batch.batchId}&storeId=${encodeURIComponent(batch.storeId)}&batchConfigId=${batch.batchConfigId}&batchName=${encodeURIComponent(batch.batchName)}`;
                const isCompleted = batch.status === BatchStatus.COMPLETED;
                const selectedPrinter = getSelectedPrinter(batch.batchId);
                const selectedTray = getSelectedTray(batch.batchId);
                const trays = getTraysForBatch(batch.batchId);
                const loadingTrays = isLoadingTrays(batch.batchId);
                const canPrint = !isCompleted && !!selectedPrinter && !!selectedTray;

                return (
                  <tr key={batch.batchId}>
                    <td>
                      <Link
                        href={worklistHref}
                        onClick={(event) => {
                          if (!onNavigateHref) return;
                          event.preventDefault();
                          onNavigateHref(worklistHref);
                        }}
                      >
                        <p className={styles.batchLink}>{batch.batchName}</p>
                      </Link>
                    </td>
                    <td className={styles.statusCell}>
                      <div className={styles.printStatusTag}>
                        <span>{batch.status}</span>
                      </div>
                    </td>
                    <td>
                      <ThemeProvider theme={tableFilterTheme}>
                        <FormControl fullWidth size="small">
                          <Select
                            displayEmpty
                            value={selectedPrinter}
                            onChange={(e) => void setSelectedPrinter(batch.batchId, e.target.value)}
                          >
                            {isLoadingPrinters ? (
                              <MenuItem>Loading…</MenuItem>
                            ) : printers.length === 0 ? (
                              <MenuItem>No printers found</MenuItem>
                            ) : (
                              printers.map((p) => (
                                <MenuItem key={p} value={p}>{p}</MenuItem>
                              ))
                            )}
                          </Select>
                        </FormControl>
                      </ThemeProvider>
                    </td>
                    <td>
                      <ThemeProvider theme={tableFilterTheme}>
                        <FormControl fullWidth size="small">
                          <Select
                            displayEmpty
                            value={selectedTray}
                            disabled={loadingTrays || !selectedPrinter || isCompleted}
                            onChange={(e) => setSelectedTray(batch.batchId, e.target.value)}
                          >
                            {loadingTrays ? (
                              <MenuItem>Loading…</MenuItem>
                            ) : printers.length === 0 ? (
                              <MenuItem>-</MenuItem>
                            ) : (
                              trays.map((tray) => (
                                <MenuItem key={tray} value={tray}>{tray}</MenuItem>
                              ))
                            )}
                          </Select>
                        </FormControl>
                      </ThemeProvider>
                    </td>
                    <td>
                      <ul>
                        <li>
                          <button
                            className={`primaryButton ${styles.printButton}`}
                            disabled={!canPrint}
                            aria-label={t("worklistSummary.printAria", { progress: printProgress })}
                            onClick={() => void startPrint(batch, selectedPrinter, selectedTray)}
                          >
                            <i>{printIcon}</i>
                            <span>{t("worklistSummary.print", { progress: printProgress })}</span>
                          </button>
                        </li>
                        {ENABLE_DOWNLOAD && (
                        <li>
                          <button
                            className="primaryButtonOutline"
                            disabled={isCompleted}
                            aria-label={`Download ${batch.batchName}`}
                            onClick={() => void startDownload(batch)}
                          >
                            <i>{downloadIcon}</i>
                            <span>Download</span>
                          </button>
                        </li>
                        )}
                      </ul>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {printerError && <ErrorMessage message={`Printer setup failed: ${printerError}`} />}

      <PrintProgressModal
        isOpen={isOpen}
        batchName={activeBatchName}
        mode={mode}
        steps={steps}
        error={printError}
        isDone={isDone}
        successInfo={successInfo}
        onClose={closeModal}
      />
    </div>
  );
}

function DashboardScreen({ onNavigateHref }: DashboardNavProps): JSX.Element {
  const { batches, isLoading: isBatchesLoading, error: batchesError, refresh } = useBatches();
  const [updatedTime, setUpdatedTime] = useState("");

  function updateTimestamp(): void {
    setUpdatedTime(
      new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    );
  }

  useEffect(() => {
    updateTimestamp();
  }, []);

  function handleRefresh(): void {
    refresh();
    updateTimestamp();
  }

  return (
    <div className={styles.contentWrap}>
      <div className={styles.topContentBar}>
        <div className={styles.topTitle}>
          <h2>Signs Dashboard</h2>
        </div>
        <div className={styles.actionWrap}>
          <ul>
            <li>
              <button
                type="button"
                className={`d-flex flex-align-center ${styles.lastUpdated}`}
                onClick={handleRefresh}
                aria-label="Refresh dashboard"
              >
                <i>
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.2083 2.44792C12.6979 0.9375 10.625 0 8.32292 0C3.71875 0 0 3.72917 0 8.33333C0 12.9375 3.71875 16.6667 8.32292 16.6667C12.2083 16.6667 15.4479 14.0104 16.375 10.4167H14.2083C13.3542 12.8437 11.0417 14.5833 8.32292 14.5833C4.875 14.5833 2.07292 11.7812 2.07292 8.33333C2.07292 4.88542 4.875 2.08333 8.32292 2.08333C10.0521 2.08333 11.5937 2.80208 12.7187 3.9375L9.36458 7.29167H16.6562V0L14.2083 2.44792Z" fill="#79747E" />
                  </svg>
                </i>
                <p>Updated {updatedTime}</p>
              </button>
            </li>
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
      <div className={styles.contentSection}>
        <div className={styles.contentWrap}>
          <QuickLinks onNavigateHref={onNavigateHref} />
          <BatchJobsSection
            batches={batches}
            isLoading={isBatchesLoading}
            error={batchesError}
            onNavigateHref={onNavigateHref}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardScreen;
