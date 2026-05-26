#!/usr/bin/env node
/**
 * Store-Side Print Relay Client
 *
 * Run this script on a machine at the store that has network access to
 * the ECS Print Server (https://localhost.ecsglobalinc.com:8083/).
 *
 * It connects to the GKE WebSocket endpoint and forwards HTTP requests
 * to the local print server, sending responses back through the tunnel.
 *
 * Usage:
 *   node store-relay.js
 *
 * Environment variables:
 *   RELAY_WS_URL   - WebSocket URL of the GKE server (required)
 *                    e.g. wss://signs-app.costco.com/ws/print-relay?storeId=100&token=secret
 *   RELAY_TOKEN    - Authentication token (must match WS_RELAY_TOKEN on server)
 *   STORE_ID       - Store identifier (default: "default")
 *
 * Install dependencies:
 *   npm init -y && npm i ws
 */

const WebSocket = require("ws");
const https = require("https");
const http = require("http");

// ─── Configuration ──────────────────────────────────────────────────────────
const STORE_ID = process.env.STORE_ID || "default";
const RELAY_TOKEN = process.env.RELAY_TOKEN || "";
const BASE_WS_URL = process.env.RELAY_WS_URL || "";

if (!BASE_WS_URL) {
  console.error("ERROR: RELAY_WS_URL environment variable is required.");
  console.error("Example: wss://your-gke-app.com/ws/print-relay");
  process.exit(1);
}

// Build full URL with query params
const wsUrl = new URL(BASE_WS_URL);
wsUrl.searchParams.set("storeId", STORE_ID);
if (RELAY_TOKEN) wsUrl.searchParams.set("token", RELAY_TOKEN);

const RECONNECT_DELAY_MS = 5000;
const PING_INTERVAL_MS = 25000;

// ─── WebSocket Connection ───────────────────────────────────────────────────
let ws = null;
let pingTimer = null;
let reconnectTimer = null;

function connect() {
  console.log(`[Relay] Connecting to ${wsUrl.origin}${wsUrl.pathname}...`);

  ws = new WebSocket(wsUrl.toString(), {
    rejectUnauthorized: false, // Allow self-signed certs on GKE if needed
  });

  ws.on("open", () => {
    console.log(`[Relay] Connected! Store ID: ${STORE_ID}`);
    // Start ping to keep connection alive
    pingTimer = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
    }, PING_INTERVAL_MS);
  });

  ws.on("message", async (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.action === "http-request") {
        console.log(`[Relay] Request ${msg.id}: ${msg.method} ${msg.url}`);
        const response = await forwardRequest(msg);
        ws.send(JSON.stringify(response));
        console.log(`[Relay] Response ${msg.id}: ${response.statusCode}`);
      }
    } catch (err) {
      console.error("[Relay] Error processing message:", err.message);
    }
  });

  ws.on("close", (code, reason) => {
    console.log(`[Relay] Disconnected (code: ${code}, reason: ${reason || "none"})`);
    cleanup();
    scheduleReconnect();
  });

  ws.on("error", (err) => {
    console.error("[Relay] WebSocket error:", err.message);
    cleanup();
    scheduleReconnect();
  });

  ws.on("pong", () => {
    // Server is alive
  });
}

function cleanup() {
  if (pingTimer) {
    clearInterval(pingTimer);
    pingTimer = null;
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  console.log(`[Relay] Reconnecting in ${RECONNECT_DELAY_MS / 1000}s...`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, RECONNECT_DELAY_MS);
}

// ─── HTTP Forwarding ────────────────────────────────────────────────────────

/**
 * Forward an HTTP request to the target URL (ECS print server) and return the response.
 */
function forwardRequest(msg) {
  return new Promise((resolve) => {
    const url = new URL(msg.url);
    const isHttps = url.protocol === "https:";
    const transport = isHttps ? https : http;

    const payload = msg.body || "";

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      method: msg.method || "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        ...(msg.headers || {}),
      },
      rejectUnauthorized: false, // ECS uses self-signed cert
      timeout: 30000,
    };

    const req = transport.request(options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          id: msg.id,
          action: "http-response",
          statusCode: res.statusCode,
          body: Buffer.concat(chunks).toString("utf8"),
        });
      });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({
        id: msg.id,
        action: "http-response",
        statusCode: 504,
        body: JSON.stringify({ error: "Request to print server timed out" }),
      });
    });

    req.on("error", (err) => {
      resolve({
        id: msg.id,
        action: "http-response",
        statusCode: 502,
        body: JSON.stringify({ error: `Relay forward error: ${err.message}` }),
      });
    });

    req.write(payload);
    req.end();
  });
}

// ─── Start ──────────────────────────────────────────────────────────────────
console.log("╔══════════════════════════════════════════════════╗");
console.log("║       ECS Print Relay Client (Store-side)       ║");
console.log("╠══════════════════════════════════════════════════╣");
console.log(`║  Store ID:  ${STORE_ID.padEnd(37)}║`);
console.log(`║  Server:    ${wsUrl.origin.padEnd(37)}║`);
console.log("╚══════════════════════════════════════════════════╝");
connect();

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[Relay] Shutting down...");
  if (ws) ws.close(1000, "Client shutting down");
  process.exit(0);
});

process.on("SIGTERM", () => {
  if (ws) ws.close(1000, "Client shutting down");
  process.exit(0);
});
