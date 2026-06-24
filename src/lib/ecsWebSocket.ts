/**
 * ECS Print Server WebSocket client.
 *
 * Provides a promise-based wrapper around the ECS WebSocket interface
 * (wss://localhost.ecsglobalinc.com:8082). Each call opens a fresh WSS
 * connection, sends one JSON-RPC message, and resolves on the first response.
 *
 * Binary responses (preview images) are converted to a base64 string and
 * returned as { data: "<base64>" } to match the REST response shape consumed
 * by load-preview.ts.
 *
 * Security: self-signed TLS certificates on the local ECS host are accepted
 * via rejectUnauthorized: false — this is intentional and expected for a
 * store-local service that never leaves the LAN.
 */

import WebSocket from "ws";

const ECS_WS_DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Sends a single JSON-RPC message over WSS to the ECS print service and
 * resolves with the parsed JSON response. Binary frames (preview images)
 * are returned as { data: "<base64 string>" }.
 *
 * @param {string} url - WSS endpoint, e.g. wss://localhost.ecsglobalinc.com:8082.
 * @param {Record<string, unknown>} payload - JSON-RPC payload to send.
 * @param {number} timeoutMs - Milliseconds before the call is rejected with a timeout error.
 * @returns {Promise<Record<string, unknown>>} Parsed response, or { data: base64 } for binary frames.
 * @throws {Error} On connection error, timeout, or ECS-level error field in the response.
 */
export function ecsWsCall(
  url: string,
  payload: Record<string, unknown>,
  timeoutMs: number = ECS_WS_DEFAULT_TIMEOUT_MS
): Promise<Record<string, unknown>> {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const ws = new WebSocket(url, { rejectUnauthorized: false });
    let settled = false;

    /**
     * Guards against resolving/rejecting the promise more than once
     * (e.g. both timeout and close fire on termination).
     * @param {() => void} fn - The resolve/reject call to make.
     */
    function settle(fn: () => void): void {
      if (!settled) {
        settled = true;
        fn();
      }
    }

    const timer = setTimeout(() => {
      ws.terminate();
      settle(() =>
        reject(
          new Error(
            `ECS WebSocket timeout after ${timeoutMs}ms — method: ${String(payload.method)}`
          )
        )
      );
    }, timeoutMs);

    ws.on("open", () => {
      // TODO: remove console logging before production
      const logPayload = {
        ...payload,
        sessionID: payload.sessionID ? "(sessionID)" : undefined,
      };
      console.log(`\n[ECS WS REQUEST] ───────────────────────────`);
      console.log(`  URL    : ${url}`);
      console.log(`  Payload: ${JSON.stringify(logPayload, null, 2)}`);
      ws.send(JSON.stringify(payload));
    });

    ws.on("message", (data: WebSocket.RawData) => {
      // Server-initiated close signal
      if (typeof data === "string" && data === "CLOSE") {
        clearTimeout(timer);
        ws.close();
        settle(() => reject(new Error("ECS WebSocket: server requested close")));
        return;
      }

      let json: Record<string, unknown> = {};

      // Binary frame — check whether it is a real image or a text error
      // PNG magic bytes: 0x89 0x50 0x4E 0x47 (\x89PNG)
      if (Buffer.isBuffer(data)) {
        const isPng = data.length > 4 && data[0] === 0x89 && data[1] === 0x50;
        if (isPng) {
          clearTimeout(timer);
          ws.close();
          // TODO: remove console logging before production
          console.log(`  [ECS WS] binary PNG image — ${data.length} bytes`);
          console.log(`[ECS WS REQUEST END] ───────────────────────\n`);
          settle(() => resolve({ data: data.toString("base64") }));
          return;
        }

        // Binary frame is text (e.g. {bad-request}) — decode and handle as error
        const asText = data.toString("utf8");
        // TODO: remove console logging before production
        console.log(`  [ECS WS] binary-frame text: ${asText}`);

        // Skip progress update frames — ECS sends these before the real response
        if (asText.startsWith("PROGRESS_UPDATE:")) {
          console.log(`  [ECS WS] skipping progress frame`);
          return;
        }
        clearTimeout(timer);
        ws.close();
        console.log(`[ECS WS REQUEST END] ───────────────────────\n`);
        if (asText.startsWith("{bad") || asText.startsWith("{error")) {
          settle(() => reject(new Error(`ECS rejected request: ${asText}`)));
          return;
        }
        try { json = JSON.parse(asText) as Record<string, unknown>; }
        catch { json = { rawText: asText }; }
        settle(() => resolve(json));
        return;
      }

      const text = String(data);

      // TODO: remove console logging before production
      console.log(`  [ECS WS] raw response text: ${text}`);

      // Skip progress update frames — ECS sends these before the real response
      if (text.startsWith("PROGRESS_UPDATE:")) {
        console.log(`  [ECS WS] skipping progress frame`);
        return;
      }

      clearTimeout(timer);
      ws.close();

      try {
        json = JSON.parse(text) as Record<string, unknown>;
      } catch {
        json = { rawText: text };
      }

      // TODO: remove console logging before production
      console.log(`  [ECS WS] parsed keys: ${Object.keys(json).join(", ")}`);
      console.log(`[ECS WS REQUEST END] ───────────────────────\n`);

      if (json.error ?? json.Error) {
        settle(() =>
          reject(
            new Error(
              `ECS error [${String(payload.method)}]: ${String(json.error ?? json.Error)}`
            )
          )
        );
        return;
      }

      settle(() => resolve(json));
    });

    ws.on("error", (err: Error) => {
      clearTimeout(timer);
      settle(() =>
        reject(new Error(`ECS WebSocket connection error: ${err.message}`))
      );
    });

    ws.on("close", () => {
      clearTimeout(timer);
      // Reject if the connection closed before any response was received
      settle(() =>
        reject(
          new Error(
            `ECS WebSocket closed without response — method: ${String(payload.method)}`
          )
        )
      );
    });
  });
}
