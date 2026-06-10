import React from "react";
import { useRouter } from "next/router";
import PageContainer from "../../shared/layout/PageContainer";
import WorklistScreen from "../../features/worklist/component/worklist";
import { WorklistProvider } from "../../store/worklistStore";
import type { BatchQueryParams } from "../../types/batch.types";

/**
 * Worklist page — reads optional batch query parameters from the URL and
 * passes them to WorklistScreen so it can fetch the corresponding batch detail.
 *
 * URL shape when navigated from a dashboard batch hyperlink:
 *   /signs/worklist?batchId=17254&storeId=100&batchConfigId=237022&batchName=Emergency%20Batch
 *
 * @returns {JSX.Element}
 */
function WorklistPage(): JSX.Element {
  const router = useRouter();
  const { batchId, storeId, batchConfigId, batchName } = router.query;

  const batchParams: BatchQueryParams | null =
    batchId && storeId && batchConfigId && batchName
      ? {
          batchId: Number(batchId),
          storeId: String(storeId),
          batchConfigId: Number(batchConfigId),
          batchName: String(batchName),
        }
      : null;

  return (
    <PageContainer>
      <WorklistProvider>
        <WorklistScreen batchParams={batchParams} />
      </WorklistProvider>
    </PageContainer>
  );
}

export default WorklistPage;





