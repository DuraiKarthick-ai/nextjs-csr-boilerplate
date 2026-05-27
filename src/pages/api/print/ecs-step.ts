/**
 * Single-step ECS proxy — mirrors the exact API methods from signs-print.
 *
 * Accepted steps:
 *  logon                  POST https://costcotest.ecsglobalinc.com:443/ecs/logon.sws
 *  create-session         POST https://localhost.ecsglobalinc.com:8083/
 *  batchSign-preview      POST https://localhost.ecsglobalinc.com:8083/
 *  preview-first          POST https://localhost.ecsglobalinc.com:8083/
 *  preview-next           POST https://localhost.ecsglobalinc.com:8083/
 *  preview-last           POST https://localhost.ecsglobalinc.com:8083/
 *  get-layouts-from-sink  POST https://localhost.ecsglobalinc.com:8083/
 *  get-layouts-by-id      POST https://localhost.ecsglobalinc.com:8083/
 *  get-printers           POST https://localhost.ecsglobalinc.com:8083/
 *  get-trays              POST https://localhost.ecsglobalinc.com:8083/
 *  print-signs-for-layout POST https://localhost.ecsglobalinc.com:8083/
 */

import https from "node:https";
import http from "node:http";
import type { NextApiRequest, NextApiResponse } from "next";
import { printRelay } from "@/lib/ws-relay-server";

const WEB_SERVER_URL           = process.env.ECS_WEB_SERVER_URL           ?? "https://costcotest.ecsglobalinc.com:443";
const WEB_USERNAME             = process.env.ECS_WEB_USERNAME             ?? "CostcoWS";
const WEB_PASSWORD             = process.env.ECS_WEB_PASSWORD             ?? "dlm429t";
const WEB_API_TOKEN            = process.env.ECS_WEB_API_TOKEN            ?? "57e1bc49ff598e7495f8b35739848ad2";
const PRINT_SERVER_URL         = process.env.ECS_PRINT_GATEWAY_URL        ?? "https://localhost.ecsglobalinc.com:8083";
const PRINT_USERNAME           = process.env.ECS_PRINT_USERNAME           ?? "CostcoWS";
const PRINT_PASSWORD           = process.env.ECS_PRINT_PASSWORD           ?? "dlm429t";
const PRINT_API_TOKEN          = process.env.ECS_PRINT_API_TOKEN          ?? "57e1bc49ff598e7495f8b35739848ad2";
const PRINT_SERVER_CONNECT_URL = process.env.ECS_PRINT_SERVER_URL         ?? "https://costcotest.ecsglobalinc.com/ecs/";

const ALLOWED_REQUEST_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://localhost:3001",
  "https://erp-portal.costco.com",
];

function applyCors(req: NextApiRequest, res: NextApiResponse): void {
  const origin = req.headers.origin;
  if (origin && ALLOWED_REQUEST_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}

/**
 * Posts JSON to a URL using Node http/https, bypassing browser CORS/TLS.
 * In production (GKE), routes through WebSocket relay if a store relay is connected.
 * Falls back to direct HTTP for local development.
 * @param {string} url - Target URL.
 * @param {unknown} body - JSON-serializable payload.
 * @returns {Promise<{ statusCode?: number; body: string }>} Raw HTTP response.
 */
function postJson(url: string, body: unknown, storeId: string): Promise<{ statusCode?: number; body: string }> {
  const payload = JSON.stringify(body);

  // Route through WebSocket relay if connected (production/GKE)
  if (printRelay.isConnected(storeId)) {
    return printRelay.sendRequest(url, "POST", payload, storeId).then((res) => ({
      statusCode: res.statusCode,
      body: res.body,
    }));
  }

  // In production without relay, direct HTTP won't work — fail fast with clear message
  const isProduction = process.env.NODE_ENV === "production";
  const relayEnabled = process.env.WS_RELAY_ENABLED === "true";
  if (isProduction && relayEnabled) {
    const connectedStores = printRelay.getConnectedStoreIds();
    const connectedStoresText = connectedStores.length > 0 ? connectedStores.join(", ") : "none";
    return Promise.reject(
      new Error(
        `Print relay is not connected for storeId "${storeId}". Connected relay storeIds: ${connectedStoresText}. ` +
        "Ensure the store-side relay client is running and connected to this server via WebSocket at /ws/print-relay with the same storeId."
      )
    );
  }

  // Direct HTTP (local development only)
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps   = parsedUrl.protocol === "https:";
    const transport = isHttps ? https : http;

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port:     parsedUrl.port || (isHttps ? 443 : 80),
      path:     `${parsedUrl.pathname}${parsedUrl.search}`,
      method:   "POST",
      ...(isHttps ? { rejectUnauthorized: false } : {}),
      timeout:  30000,
      headers: {
        "Content-Type":   "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = transport.request(reqOptions as unknown as Parameters<typeof https.request>[0], (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      res.on("end",  () => resolve({ statusCode: res.statusCode, body: Buffer.concat(chunks).toString("utf8") }));
    });
    req.on("timeout", () => req.destroy(new Error("ECS request timed out after 30 s")));
    req.on("error",   reject);
    req.write(payload);
    req.end();
  });
}

function parseJson(raw: string): unknown {
  try { return JSON.parse(raw); } catch { return { rawBody: raw }; }
}

type StepRequest = {
  step:        string;
  storeId?:    string;
  sessionID?:  string;
  token?:      string;
  jobID?:      number;
  batchID?:    number;
  sellUnitId?: string;
  layoutId?:   string;
  printer?:    string;
  tray?:       string;
  pageFrom?:   string;
  pageTo?:     string;
};

type StepResponse = {
  step:         string;
  endpoint:     string;
  sentPayload:  unknown;
  statusCode?:  number;
  response:     unknown;
};

type ErrorResponse = { error: string };

/**
 * Resolves the relay store ID from request body/header with a safe default.
 * @param {NextApiRequest} req - API request.
 * @returns {string} Store ID used to route relay traffic.
 */
function resolveRelayStoreId(req: NextApiRequest): string {
  const bodyStoreId = req.body && typeof req.body.storeId === "string" ? req.body.storeId : "";
  const headerStoreId = typeof req.headers["x-store-id"] === "string" ? req.headers["x-store-id"] : "";
  return (bodyStoreId || headerStoreId || "default").trim() || "default";
}

/**
 * Runs one named ECS step and returns its request payload + response.
 * @param {NextApiRequest} req - Body: { step, ...step-specific fields }.
 * @param {NextApiResponse} res - JSON response.
 */
export default async function ecsStepHandler(
  req: NextApiRequest,
  res: NextApiResponse<StepResponse | ErrorResponse>,
): Promise<void> {
  applyCors(req, res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { step, sessionID, jobID, batchID, sellUnitId, layoutId, printer, tray, pageFrom, pageTo } =
    req.body as StepRequest;

  if (!step || typeof step !== "string") {
    res.status(400).json({ error: "Missing required field: step" });
    return;
  }

  const relayStoreId = resolveRelayStoreId(req);

  let endpoint: string;
  let payload: Record<string, unknown>;

  switch (step) {
    case "logon":
      endpoint = `${WEB_SERVER_URL}/ecs/logon.sws`;
      payload  = [{ userName: WEB_USERNAME, password: WEB_PASSWORD, apiToken: WEB_API_TOKEN }] as unknown as Record<string, unknown>;
      break;

    case "create-session":
      endpoint = `${PRINT_SERVER_URL}/`;
      payload  = { method: "create-session", userName: PRINT_USERNAME, password: PRINT_PASSWORD, apiToken: PRINT_API_TOKEN, serverURL: PRINT_SERVER_CONNECT_URL };
      break;

    case "batchSign-preview":
      if (!sessionID) { res.status(400).json({ error: "sessionID is required" }); return; }
      endpoint = `${PRINT_SERVER_URL}/`;
      payload  = {
        method: "batchSign-preview",
        sessionID,
        args: [{ drillDownLevel: 0, printStatus: "0", batchHeader: { jobID: jobID ?? 237022, batchID: batchID ?? 17254, sellUintId: sellUnitId ?? "100", hasPrintPermission: true, doNotReprint: false, printedQty: 0, qty: 1 } }],
      };
      break;

    case "preview-first":
    case "preview-next":
    case "preview-last":
      if (!sessionID) { res.status(400).json({ error: "sessionID is required" }); return; }
      endpoint = `${PRINT_SERVER_URL}/`;
      payload  = { method: step, sessionID };
      break;

    case "get-layouts-from-sink":
      if (!sessionID) { res.status(400).json({ error: "sessionID is required" }); return; }
      endpoint = `${PRINT_SERVER_URL}/`;
      payload  = { method: "get-layouts-from-sink", sessionID };
      break;

    case "get-layouts-by-id":
      if (!sessionID) { res.status(400).json({ error: "sessionID is required" }); return; }
      if (!layoutId)  { res.status(400).json({ error: "layoutId is required" });  return; }
      endpoint = `${PRINT_SERVER_URL}/`;
      payload  = { method: "get-layouts-by-id", args: { layout_id: layoutId }, sessionID };
      break;

    case "get-printers":
      if (!sessionID) { res.status(400).json({ error: "sessionID is required" }); return; }
      endpoint = `${PRINT_SERVER_URL}/`;
      payload  = { method: "get-printers", sessionID };
      break;

    case "get-trays":
      if (!sessionID) { res.status(400).json({ error: "sessionID is required" }); return; }
      if (!printer)   { res.status(400).json({ error: "printer is required" });   return; }
      endpoint = `${PRINT_SERVER_URL}/`;
      payload  = { method: "get-trays", args: printer, sessionID };
      break;

    case "print-signs-for-layout":
      if (!sessionID) { res.status(400).json({ error: "sessionID is required" }); return; }
      if (!layoutId)  { res.status(400).json({ error: "layoutId is required" });  return; }
      if (!printer)   { res.status(400).json({ error: "printer is required" });   return; }
      endpoint = `${PRINT_SERVER_URL}/`;
      payload  = { method: "print-signs-for-layout", args: { ID: layoutId, PRINTER: printer, daily: tray ?? "Tray1", PAGE_FROM: pageFrom ?? "1", PAGE_TO: pageTo ?? "9999" }, sessionID };
      break;

    default:
      res.status(400).json({ error: `Unknown step: "${step}"` });
      return;
  }

  try {
    const result = await postJson(endpoint, payload, relayStoreId);
    const parsedResponse = parseJson(result.body);

    let sentPayload: unknown = payload;
    if (step === "logon") {
      sentPayload = [{ ...(Array.isArray(payload) ? (payload as Record<string, unknown>[])[0] : {}), password: "***" }];
    } else if (step === "create-session") {
      sentPayload = { ...payload, password: "***" };
    }

    res.status(200).json({ step, endpoint, sentPayload, statusCode: result.statusCode, response: parsedResponse });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "ECS request failed" });
  }
}
