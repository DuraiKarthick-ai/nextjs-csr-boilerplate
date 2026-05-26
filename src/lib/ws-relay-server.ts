/**
 * WebSocket Relay Server — manages connections from store-side relay clients.
 *
 * Protocol:
 *   GKE → Relay: { id, action: "http-request", url, method, headers, body }
 *   Relay → GKE: { id, action: "http-response", statusCode, headers, body }
 *
 * Multiple stores can connect simultaneously, identified by a storeId query param.
 *
 * IMPORTANT: This re-exports the singleton from /lib/ws-relay-server.js so that
 * both server.js (which attaches the WebSocket) and API routes (which call sendRequest)
 * share the same instance within the same process.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
// Use require to ensure we get the exact same singleton as server.js
const relay = require("../../lib/ws-relay-server");

export interface RelayRequest {
  id: string;
  action: "http-request";
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface RelayResponse {
  id: string;
  action: "http-response";
  statusCode: number;
  body: string;
}

interface PrintRelayInterface {
  attach(server: unknown): void;
  isConnected(storeId?: string): boolean;
  sendRequest(url: string, method: string, body?: string, storeId?: string): Promise<{ statusCode: number; body: string }>;
  close(): void;
}

export const printRelay: PrintRelayInterface = relay.printRelay;
