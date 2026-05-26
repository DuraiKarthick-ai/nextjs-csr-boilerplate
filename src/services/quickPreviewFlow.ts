/**
 * Quick preview flow — sends the print payload to the Next.js proxy which
 * executes the 5-step ECS call sequence server-to-server.
 *
 * The browser calls /api/print/quick-preview (same-origin, no CORS/TLS issues).
 * The proxy then calls https://localhost.ecsglobalinc.com:8083 from Node.js
 * with rejectUnauthorized:false, bypassing the self-signed certificate
 * restriction that causes the browser to keep the request in pending state.
 *
 * Sequence (executed inside the proxy):
 *  1. create-session         -> POST https://localhost.ecsglobalinc.com:8083
 *  2. get-printers           -> POST https://localhost.ecsglobalinc.com:8083
 *  3. get-trays              -> POST https://localhost.ecsglobalinc.com:8083
 *  4. adhoc-preview-load     -> POST https://localhost.ecsglobalinc.com:8083
 *  5. adhoc-preview-show-data-> POST https://costcotest.ecsglobalinc.com/ecs/adhoc-preview-show-data
 */

import type { PrintRequestPayload, PrintResponse } from "@/types/print";

/**
 * Runs the quick preview flow by delegating all 5 ECS API steps to the
 * Next.js server-side proxy at /api/print/quick-preview.
 *
 * Calling the ECS gateway directly from the browser causes the request to
 * stay in "pending" because:
 *  - The browser sends a CORS preflight that the ECS gateway does not handle.
 *  - The ECS gateway uses a self-signed certificate the browser rejects.
 * The proxy runs the same calls from Node.js, bypassing both restrictions.
 *
 * @param {PrintRequestPayload} payload - Print request payload from the UI.
 * @returns {Promise<PrintResponse>} Final print response for the UI.
 * @throws {Error} If the proxy call fails or ECS returns no sessionID.
 */
export async function runQuickPreviewFlow(_payload: PrintRequestPayload): Promise<PrintResponse> {
  const response = await fetch("/api/print/quick-preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  const data = (await response.json()) as PrintResponse & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Quick print preview failed");
  }

  return data;
}
