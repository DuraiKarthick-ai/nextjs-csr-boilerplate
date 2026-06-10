/**
 * API route: POST /api/print/session
 * Creates an authenticated session on the ECS Print Server.
 * Returns a sessionID used in all subsequent print server calls.
 *
 * Uses Node.js https.request with rejectUnauthorized: false so the call works
 * whether the ECS host is addressed as localhost.ecsglobalinc.com or by LAN IP
 * (the self-signed cert is issued for the hostname, not the IP, so standard
 * fetch would throw CERT_COMMON_NAME_INVALID when a raw IP is used).
 *
 * Security: credentials are read from server-side env vars only.
 */

import https from "node:https";
import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_STATUS } from "../../../lib/constants";
import {
  ECS_PRINT_SERVER_URL,
  ECS_WEB_USERNAME,
  ECS_WEB_PASSWORD,
  ECS_WEB_API_TOKEN,
  ECS_WEB_SERVER_URL,
} from "../../../services/config";

/**
 * Sends a JSON POST to a URL via Node.js https.request with TLS validation
 * disabled. Used for ECS print server calls where the self-signed cert may not
 * match the target hostname/IP.
 *
 * @param url - Full HTTPS URL to POST to.
 * @param body - JSON body to send.
 * @param timeoutMs - Milliseconds before the request is aborted.
 * @returns Parsed JSON response.
 * @throws On network error, timeout, or non-2xx status.
 */
function httpsPost(
  url: string,
  body: Record<string, unknown>,
  timeoutMs = 15_000
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const parsed = new URL(url);

    const req = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname || "/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(bodyStr),
        },
        rejectUnauthorized: false,
        timeout: timeoutMs,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk: Buffer) => { raw += chunk.toString(); });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 300) {
            reject(new Error(`ECS session HTTP ${res.statusCode}: ${raw.slice(0, 200)}`));
            return;
          }
          try {
            resolve(JSON.parse(raw) as Record<string, unknown>);
          } catch {
            reject(new Error(`ECS session response not JSON: ${raw.slice(0, 200)}`));
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`ECS session request timed out after ${timeoutMs}ms`));
    });

    req.on("error", (err: Error) => reject(err));
    req.write(bodyStr);
    req.end();
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ success: false, message: "Method not allowed." });
    return;
  }

  try {
    const url = `${ECS_PRINT_SERVER_URL}/`;
    const payload = {
      method: "create-session",
      userName: ECS_WEB_USERNAME,
      password: ECS_WEB_PASSWORD,
      apiToken: ECS_WEB_API_TOKEN,
      serverURL: `${ECS_WEB_SERVER_URL.replace(/:443$/, "")}/ecs/`,
    };

    const data = await httpsPost(url, payload);

    if (!data.sessionID) throw new Error("No sessionID returned by print server");

    res.status(HTTP_STATUS.OK).json({
      success: true,
      sessionID: data.sessionID,
      _sentToECS: { url, payload },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create print session.";
    console.error("[/api/print/session]", message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message,
      debug: {
        targetUrl: `${ECS_PRINT_SERVER_URL}/`,
        userName: ECS_WEB_USERNAME,
        serverURL: `${ECS_WEB_SERVER_URL.replace(/:443$/, "")}/ecs/`,
        hasApiToken: !!ECS_WEB_API_TOKEN,
      },
    });
  }
}
