"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { batchService } from "@/services/batchService";
import type { BatchDetailItem, BatchItem } from "@/types/batch";
import ContentWrapper from "../contentWrapper/contentWrapper";
import styles from "./signWorklist.module.scss";
import SignAuditSection from "./signAudit/signAudit";
import EmergencyPriceChange from "./emergencyPriceChange/emergencyPriceChange";
import Endcap from "./endcap/endcap";
import ItemNameChange from "./itemNameChange/itemNameChange";

/**
 * Placeholder component for the Sign Worklist screen.
 *
 * @returns {JSX.Element} The rendered Sign Worklist view.
 */
const BATCH_STORE_ID = process.env.NEXT_PUBLIC_BATCH_STORE_ID ?? "100";
type WorklistViewKey = "price" | "endcap" | "item" | "audit";

/** Maps API batch names to existing Sign Worklist content sections. */
function mapBatchNameToViewKey(batchName: string): WorklistViewKey {
  const normalized = batchName.toLowerCase();

  if (normalized.includes("emergency") || normalized.includes("price")) {
    return "price";
  }

  if (normalized.includes("endcap") || normalized.includes("daily")) {
    return "endcap";
  }

  if (normalized.includes("item") || normalized.includes("content")) {
    return "item";
  }

  if (normalized.includes("audit")) {
    return "audit";
  }

  return "price";
}

/** Returns the selected batch from query params, with first-batch fallback. */
function findSelectedBatch(
  queryBatchId: string | undefined,
  queryBatchConfigId: string | undefined,
  batches: BatchItem[],
): BatchItem | null {
  const parsedBatchId = Number(queryBatchId);
  const parsedBatchConfigId = Number(queryBatchConfigId);

  if (!Number.isNaN(parsedBatchId) && !Number.isNaN(parsedBatchConfigId)) {
    const matchedBatch = batches.find(
      (batch) => batch.batchId === parsedBatchId && batch.configId === parsedBatchConfigId,
    );
    if (matchedBatch) {
      return matchedBatch;
    }
  }

  return batches[0] ?? null;
}

export default function SignWorklist(): JSX.Element {
  const router = useRouter();
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [activeBatchId, setActiveBatchId] = useState<number | null>(null);
  const [batchDetailRows, setBatchDetailRows] = useState<BatchDetailItem[]>([]);
  const [activeView, setActiveView] = useState<WorklistViewKey>("price");
  const [isLoadingBatches, setIsLoadingBatches] = useState<boolean>(false);
  const [isLoadingBatchDetail, setIsLoadingBatchDetail] = useState<boolean>(false);

  const activeBatch = useMemo(
    () => batches.find((batch) => batch.batchId === activeBatchId) ?? null,
    [batches, activeBatchId],
  );

  /**
   * Loads item-level details for a selected batch tab.
   *
   * @param batch - Selected batch from get-all-batches response.
   * @returns Promise resolved when detail state is updated.
   */
  const loadBatchDetail = useCallback(async (batch: BatchItem): Promise<void> => {
    setIsLoadingBatchDetail(true);

    try {
      const rows = await batchService.getBatchDetail({
        batchId: batch.batchId,
        storeId: BATCH_STORE_ID,
        batchConfigId: batch.configId,
      });
      setBatchDetailRows(rows);
    } catch {
      // Keep current UI intact if batch-detail endpoint fails.
      setBatchDetailRows([]);
    } finally {
      setIsLoadingBatchDetail(false);
    }
  }, []);

  /** Loads batches to build dynamic tabs and fetches initial tab detail. */
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const loadBatches = async (): Promise<void> => {
      setIsLoadingBatches(true);

      try {
        const apiBatches = await batchService.getAllBatches({ storeId: BATCH_STORE_ID });
        setBatches(apiBatches);

        if (apiBatches.length === 0) {
          setActiveBatchId(null);
          setBatchDetailRows([]);
          return;
        }

        const queryBatchId =
          typeof router.query.batchId === "string" ? router.query.batchId : undefined;
        const queryBatchConfigId =
          typeof router.query.batchConfigId === "string" ? router.query.batchConfigId : undefined;
        const selectedBatch = findSelectedBatch(queryBatchId, queryBatchConfigId, apiBatches);

        if (!selectedBatch) {
          return;
        }

        setActiveBatchId(selectedBatch.batchId);
        setActiveView(mapBatchNameToViewKey(selectedBatch.batchName));
        await loadBatchDetail(selectedBatch);
      } catch {
        setBatches([]);
      } finally {
        setIsLoadingBatches(false);
      }
    };

    void loadBatches();
  }, [router.isReady, router.query.batchId, router.query.batchConfigId, loadBatchDetail]);

  /**
   * Handles dynamic batch tab click and triggers detail API call.
   *
   * @param batch - Batch selected by the user.
   * @returns Promise resolved when selected batch detail is loaded.
   */
  // Tabs UI removed: navigation from the dashboard now passes the selected
  // batch directly via query params, so the click handler is no longer needed.
  // const handleDynamicTabClick = useCallback(async (batch: BatchItem): Promise<void> => {
  //   setActiveBatchId(batch.batchId);
  //   setActiveView(mapBatchNameToViewKey(batch.batchName));
  //   await loadBatchDetail(batch);
  // }, [loadBatchDetail]);

  return (
    <ContentWrapper title={activeBatch?.batchName ?? "Signs Management"}>
      <div className={styles.signManagement}>
        <div className={styles.tabsContent}>
          <div className={styles.contentWrap}>
            {(activeView === "price" || batchDetailRows.length > 0 || isLoadingBatches || isLoadingBatchDetail) && (
              <EmergencyPriceChange
                batchDetailRows={batchDetailRows}
                isLoading={isLoadingBatches || isLoadingBatchDetail}
              />
            )}

            {!isLoadingBatches && !isLoadingBatchDetail && batchDetailRows.length === 0 && activeView === "endcap" && <Endcap />}

            {!isLoadingBatches && !isLoadingBatchDetail && batchDetailRows.length === 0 && activeView === "item" && <ItemNameChange />}

            {!isLoadingBatches && !isLoadingBatchDetail && batchDetailRows.length === 0 && activeView === "audit" && <SignAuditSection />}
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
}