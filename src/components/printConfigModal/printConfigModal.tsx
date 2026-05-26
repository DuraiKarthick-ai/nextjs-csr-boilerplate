import React, { useEffect } from "react";
import { usePrintFlow, PrintFlowParams } from "@/hooks/usePrintFlow";
import styles from "./printConfigModal.module.scss";

interface PrintConfigModalProps {
  open: boolean;
  onClose: () => void;
  jobID: number;
  batchID: number;
  sellUnitId: string;
  batchName?: string;
}

export default function PrintConfigModal({
  open,
  onClose,
  jobID,
  batchID,
  sellUnitId,
  batchName,
}: PrintConfigModalProps) {
  const {
    sessionID,
    sessionLoading,
    sessionError,
    printerInfo,
    printersLoading,
    trays,
    selectedTray,
    traysLoading,
    traysError,
    preview,
    previewError,
    printing,
    printError,
    printSuccess,
    initSession,
    selectPrinter,
    selectTray,
    loadPreview,
    printSigns,
    reset,
  } = usePrintFlow();

  useEffect(() => {
    if (open) {
      const params: PrintFlowParams = { jobID, batchID, sellUnitId };
      initSession(params);
    }
    return () => { reset(); };
  }, [open, jobID, batchID, sellUnitId]);

  if (!open) return null;

  const canPrint = !!sessionID && !!printerInfo.selectedPrinter && !!selectedTray && !printing;
  const canPreview = !!sessionID && !preview.loading;
  const showPrinterDropdown = printerInfo.printers.length > 1;

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Print Configuration</h2>
          <button className={styles.closeBtn} onClick={handleClose}>✕</button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Batch Info */}
          <div className={styles.batchInfo}>
            {batchName && <span>Batch: {batchName}</span>}
            <span>Job ID: {jobID}</span>
            <span>Batch ID: {batchID}</span>
            <span>Store: {sellUnitId}</span>
          </div>

          {/* Session Loading */}
          {sessionLoading && (
            <div className={styles.loadingSpinner}>⏳ Creating session &amp; loading batch…</div>
          )}

          {/* Session Error */}
          {sessionError && (
            <div className={styles.errorMsg}>{sessionError}</div>
          )}

          {/* Session Active */}
          {sessionID && (
            <>
              <div className={styles.sessionBadge}>Session: {sessionID}</div>

              {/* Printers Loading */}
              {printersLoading && (
                <div className={styles.loadingSpinner}>Loading printers…</div>
              )}

              {/* Printer & Tray Config */}
              {!printersLoading && printerInfo.printers.length > 0 && (
                <div className={styles.configSection}>
                  {/* Printer */}
                  <div className={styles.fieldGroup}>
                    <label>Printer</label>
                    {showPrinterDropdown ? (
                      <select
                        value={printerInfo.selectedPrinter}
                        onChange={(e) => selectPrinter(e.target.value)}
                        disabled={traysLoading}
                      >
                        <option value="">Select printer…</option>
                        {printerInfo.printers.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    ) : (
                      <div className={styles.autoSelected}>
                        {printerInfo.selectedPrinter} (auto-selected)
                      </div>
                    )}
                  </div>

                  {/* Tray */}
                  <div className={styles.fieldGroup}>
                    <label>Tray (required)</label>
                    {traysLoading ? (
                      <div className={styles.autoSelected}>Loading trays…</div>
                    ) : (
                      <select
                        value={selectedTray}
                        onChange={(e) => selectTray(e.target.value)}
                        disabled={trays.length === 0}
                      >
                        {trays.length === 0 && (
                          <option value="">No trays available</option>
                        )}
                        {trays.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    )}
                    {traysError && <div className={styles.errorMsg}>{traysError}</div>}
                  </div>
                </div>
              )}

              {/* Preview Section */}
              <div className={styles.previewSection}>
                <div className={styles.previewHeader}>
                  <h3>Preview (Optional)</h3>
                  <div className={styles.previewNav}>
                    <button
                      className={styles.navBtn}
                      disabled={!canPreview}
                      onClick={() => loadPreview("preview-first")}
                    >
                      ⏮ First
                    </button>
                    <button
                      className={styles.navBtn}
                      disabled={!canPreview}
                      onClick={() => loadPreview("preview-next")}
                    >
                      ▶ Next
                    </button>
                    <button
                      className={styles.navBtn}
                      disabled={!canPreview}
                      onClick={() => loadPreview("preview-last")}
                    >
                      ⏭ Last
                    </button>
                  </div>
                </div>

                <div className={styles.previewImage}>
                  {preview.loading && (
                    <div className={styles.previewPlaceholder}>Loading preview…</div>
                  )}
                  {!preview.loading && preview.imageData && (
                    <img
                      src={`data:image/png;base64,${preview.imageData}`}
                      alt={`Preview - ${preview.label}`}
                    />
                  )}
                  {!preview.loading && !preview.imageData && (
                    <div className={styles.previewPlaceholder}>
                      Click First / Next / Last to load a sign preview
                    </div>
                  )}
                </div>
                {preview.label && (
                  <div className={styles.previewLabel}>Showing: {preview.label}</div>
                )}
                {previewError && <div className={styles.errorMsg}>{previewError}</div>}
              </div>

              {/* Print Error */}
              {printError && <div className={styles.errorMsg}>{printError}</div>}

              {/* Print Success */}
              {printSuccess && (
                <div className={styles.successMsg}>
                  ✓ Print job sent successfully to {printerInfo.selectedPrinter}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={handleClose}>
            Cancel
          </button>
          <button
            className={styles.printBtn}
            disabled={!canPrint}
            onClick={printSigns}
          >
            {printing ? "Printing…" : "Print"}
          </button>
        </div>
      </div>
    </div>
  );
}
