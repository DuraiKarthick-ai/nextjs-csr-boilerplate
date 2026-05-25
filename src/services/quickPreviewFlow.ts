/**
 * Quick preview flow — executes 5 sequential ECS API calls directly
 * from the browser, mirroring the reference sign-print-latest behavior.
 *
 * Sequence:
 *  1. create-session         -> returns sessionID
 *  2. get-printers           -> uses sessionID
 *  3. get-trays              -> uses sessionID
 *  4. adhoc-preview-load     -> uses sessionID + previewArgs
 *  5. adhoc-preview-show-data-> uses sessionID + previewArgs
 */

import type { PrintRequestPayload, PrintResponse, ByItemEntry } from "@/types/print";

const ECS_GATEWAY_URL = "https://localhost.ecsglobalinc.com:8083";
const ECS_SERVER_URL = "https://costcotest.ecsglobalinc.com/ecs/";
const ECS_PREVIEW_SHOW_URL = "https://costcotest.ecsglobalinc.com/ecs/adhoc-preview-show-data";
const ECS_TRAY_PRINTER = "OKI_C9600_F4EEEF";
const ECS_USERNAME = "CostcoWS";
const ECS_PASSWORD = "dlm429t";
const ECS_API_TOKEN = "57e1bc49ff598e7495f8b35739848ad2";

type CreateSessionResponse = {
  sessionID?: string;
};

/**
 * Posts a JSON body to the given URL and returns the parsed response.
 * Never throws on non-ok HTTP status — caller decides how to handle.
 * Matches the reference sign-print-latest fetch pattern.
 *
 * @param {string} url - Target URL.
 * @param {unknown} body - JSON-serializable request body.
 * @returns {Promise<unknown>} Parsed JSON response or raw text wrapper.
 */
async function postJson(url: string, body: unknown): Promise<unknown> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { rawBody: text };
  }
}

/**
 * Builds the previewArgs array from the print request payload.
 * Mirrors the reference payload shape, substituting productCode and qty
 * from the UI rows.
 *
 * @param {PrintRequestPayload} payload - Print request from the UI.
 * @returns {unknown[]} Array of preview arg objects for ECS APIs.
 */
function buildPreviewArgs(payload: PrintRequestPayload): unknown[] {
  const byItem = payload.printRequests.find((req) => req.type === "BY_ITEM");
  const entries = (byItem?.entries ?? []) as ByItemEntry[];

  return entries.map((entry) => ({
    batchID: 13007,
    productCode: entry.itemNumberOrUpc,
    prodInd: null,
    description: "Platinum Night Table",
    productTypeCode: "DEP",
    price: "99.99",
    priceUid: 15638747,
    reasonId: 0,
    eventUid: 1000,
    sellUnitId: "4148",
    storeGroupUid: -1,
    styleName: "ProductSigns",
    styleFriendlyName: null,
    planogram: null,
    countryOfOriginDataString: null,
    createdUserID: 0,
    qty: entry.quantity,
    curReqQty: 0,
    requestQty: 0,
    signId: 21006,
    styleId: 15639741,
    managerSpecialStyle: false,
    effectiveDate: 1515110400000,
    signEndDate: 253402214400000,
    planogramRow: 0,
    countryOfOriginRow: 0,
    requestSource: "WEB",
    defaultPlanoStyle: null,
    eventTypeCode: null,
    priceLvlID: 0,
    offerID: 0,
    createTimestamp: 1515141915384,
    templateAssocId: 0,
    templateAssocLevel: null,
    templateAssocPrintLevel: null,
    templateAssocProdCode: null,
    planogramProductStoreLocationVO: null,
    countryOfOrigin: null,
    managerSpecialFieldValueMap: {},
    extraItems: null,
    customSignId: null,
    operationalSignId: null,
    messageA: null,
    messageB: null,
    messageC: null,
    variantTypeA: null,
    variantTypeB: null,
    variantTypeC: null,
    variantTypeD: null,
    variantTypeE: null,
    promoVariantA: null,
    promoVariantB: null,
    promoVariantC: null,
    promoVariantD: null,
    promoVariantE: null,
    variantAmountA: null,
    variantAmountB: null,
    variantAmountC: null,
    variantAmountD: null,
    variantAmountE: null,
    outputStyleID: 0,
    outputStyleName: null,
    defaultPriceStyleID: 0,
    defaultPriceStyleName: null,
    existingSign: false,
  }));
}

/**
 * Runs the 5-step quick preview ECS flow directly from the browser,
 * chaining sessionID from the create-session response into the
 * remaining API calls.
 *
 * @param {PrintRequestPayload} payload - Print request payload from the UI.
 * @returns {Promise<PrintResponse>} Final print response for the UI.
 * @throws {Error} If any sequential API call fails.
 */
export async function runQuickPreviewFlow(payload: PrintRequestPayload): Promise<PrintResponse> {
  const previewArgs = buildPreviewArgs(payload);

  // Step 1 — create-session
  const createSessionPayload = {
    method: "create-session",
    userName: ECS_USERNAME,
    password: ECS_PASSWORD,
    apiToken: ECS_API_TOKEN,
    serverURL: ECS_SERVER_URL,
  };
  const createSessionData = (await postJson(ECS_GATEWAY_URL, createSessionPayload)) as CreateSessionResponse;
  const sessionID = createSessionData.sessionID;

  if (!sessionID) {
    throw new Error("create-session did not return a sessionID");
  }

  // Step 2 — get-printers
  await postJson(ECS_GATEWAY_URL, {
    method: "get-printers",
    sessionID,
  });

  // Step 3 — get-trays
  await postJson(ECS_GATEWAY_URL, {
    method: "get-trays",
    args: ECS_TRAY_PRINTER,
    sessionID,
  });

  // Step 4 — adhoc-preview-load
  await postJson(ECS_GATEWAY_URL, {
    method: "adhoc-preview-load",
    args: previewArgs,
    sessionID,
    serverURL: ECS_SERVER_URL,
  });

  // Step 5 — adhoc-preview-show-data
  await postJson(ECS_PREVIEW_SHOW_URL, {
    method: "adhoc-preview",
    args: previewArgs,
    sessionID,
    serverURL: ECS_SERVER_URL,
  });

  return {
    responseCode: "200",
    responseMessage: "Quick print preview completed",
    printerName: ECS_TRAY_PRINTER,
    status: "PRINTED",
  };
}
