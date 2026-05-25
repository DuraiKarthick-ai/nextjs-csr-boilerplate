/**
 * Quick-print preview proxy — runs the 5-step ECS API sequence server-to-server.
 *
 * Browser calls /api/print/quick-preview (same-origin → no CSP/CORS issues).
 * This handler then calls the ECS endpoints from Node.js where CSP doesn't apply.
 *
 * Sequence:
 *  1. create-session         → POST https://localhost.ecsglobalinc.com:8083/
 *  2. get-printers           → POST https://localhost.ecsglobalinc.com:8083/
 *  3. get-trays              → POST https://localhost.ecsglobalinc.com:8083/
 *  4. adhoc-preview-load     → POST https://localhost.ecsglobalinc.com:8083/
 *  5. adhoc-preview-show-data→ POST https://costcotest.ecsglobalinc.com/ecs/adhoc-preview-show-data
 */

import type { NextApiRequest, NextApiResponse } from "next";
import https from "node:https";
import type { PrintRequestPayload, PrintResponse, ByItemEntry } from "@/types/print";

const ECS_GATEWAY_URL = process.env.ECS_PRINT_GATEWAY_URL ?? "https://localhost.ecsglobalinc.com:8083";
const ECS_SERVER_URL = process.env.ECS_PRINT_SERVER_URL ?? "https://costcotest.ecsglobalinc.com/ecs/";
const ECS_PREVIEW_SHOW_URL = process.env.ECS_PRINT_PREVIEW_SHOW_URL ?? "https://costcotest.ecsglobalinc.com/ecs/adhoc-preview-show-data";
const ECS_TRAY_PRINTER = process.env.ECS_PRINT_TRAY_PRINTER ?? "OKI_C9600_F4EEEF";
const ECS_USERNAME = process.env.ECS_PRINT_USERNAME || "CostcoWS";
const ECS_PASSWORD = process.env.ECS_PRINT_PASSWORD || "dlm429t";
const ECS_API_TOKEN = process.env.ECS_PRINT_API_TOKEN || "57e1bc49ff598e7495f8b35739848ad2";

const ALLOWED_REQUEST_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://localhost:3001",
  "https://erp-portal.costco.com",
];

type EcsSessionResponse = {
  sessionID?: string;
};

function applyCors(req: NextApiRequest, res: NextApiResponse): void {
  const origin = req.headers.origin;
  if (origin && ALLOWED_REQUEST_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  }
}

/**
 * Posts JSON to an ECS endpoint using Node https (bypasses CSP/CORS).
 *
 * @param {string} url - ECS endpoint URL.
 * @param {unknown} body - Request body.
 * @returns {Promise<{ statusCode?: number; body: string }>} Raw response.
 */
function postJson(url: string, body: unknown): Promise<{ statusCode?: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const payload = JSON.stringify(body);

    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        method: "POST",
        rejectUnauthorized: false,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on("end", () => resolve({ statusCode: res.statusCode, body: Buffer.concat(chunks).toString("utf8") }));
      },
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function parseJson(raw: string): unknown {
  try { return JSON.parse(raw); } catch { return { rawBody: raw }; }
}

/**
 * Builds the previewArgs array matching the exact reference payload shape,
 * substituting productCode and qty from each UI item row.
 *
 * @param {PrintRequestPayload} payload - Print request from the UI.
 * @returns {unknown[]} ECS previewArgs array.
 */
function buildPreviewArgs(payload: PrintRequestPayload): unknown[] {
  const byItem = payload.printRequests.find((r) => r.type === "BY_ITEM");
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
 * Proxy handler: executes the 5-step ECS quick-preview flow server-to-server
 * and returns a PrintResponse-shaped result to the browser.
 *
 * @param {NextApiRequest} req - Incoming request from browser.
 * @param {NextApiResponse<PrintResponse | { error: string }>} res - Response to browser.
 */
export default async function quickPreviewHandler(
  req: NextApiRequest,
  res: NextApiResponse<PrintResponse | { error: string }>,
): Promise<void> {
  applyCors(req, res);

  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const payload = req.body as PrintRequestPayload;
  const previewArgs = buildPreviewArgs(payload);

  if (previewArgs.length === 0) {
    res.status(400).json({ error: "No BY_ITEM entries provided" });
    return;
  }

  try {
    // Step 1 — create-session
    const step1Result = await postJson(ECS_GATEWAY_URL, {
      method: "create-session",
      userName: ECS_USERNAME,
      password: ECS_PASSWORD,
      apiToken: ECS_API_TOKEN,
      serverURL: ECS_SERVER_URL,
    });
    const step1Data = parseJson(step1Result.body) as EcsSessionResponse;
    const sessionID = step1Data.sessionID;

    if (!sessionID) {
      res.status(502).json({ error: "create-session did not return a sessionID" });
      return;
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
    const step5Result = await postJson(ECS_PREVIEW_SHOW_URL, {
      method: "adhoc-preview",
      args: previewArgs,
      sessionID,
      serverURL: ECS_SERVER_URL,
    });

    const isSuccess = (step5Result.statusCode ?? 500) < 400;

    res.status(isSuccess ? 200 : 502).json({
      responseCode: isSuccess ? "200" : String(step5Result.statusCode ?? 502),
      responseMessage: isSuccess ? "Quick print preview completed" : "Quick print preview failed",
      printerName: ECS_TRAY_PRINTER,
      status: isSuccess ? "PRINTED" : "FAILED",
    });
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : "Quick print preview flow failed",
    });
  }
}
