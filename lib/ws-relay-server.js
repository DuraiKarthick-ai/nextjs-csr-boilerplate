/**
 * WebSocket Relay Server (compiled JS for server.js)
 *
 * This is the production-ready version used by server.js directly.
 * The TypeScript source is at src/lib/ws-relay-server.ts (used by API routes via Next.js).
 */

const { WebSocketServer, WebSocket } = require("ws");
const { randomUUID } = require("crypto");

const RELAY_TIMEOUT_MS = 30000;
const HEARTBEAT_INTERVAL_MS = 30000;

class PrintRelayServer {
  constructor() {
    this.wss = null;
    this.relays = new Map();   // storeId → ws
    this.pending = new Map();  // requestId → { resolve, reject, timer }
    this.heartbeatTimer = null;
  }

  /** Attach to an existing HTTP server */
  attach(server) {
    this.wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (req, socket, head) => {
      const url = new URL(req.url || "/", `http://${req.headers.host}`);
      if (url.pathname !== "/ws/print-relay") return;

      const storeId = url.searchParams.get("storeId") || "default";
      const token = url.searchParams.get("token");

      const expectedToken = process.env.WS_RELAY_TOKEN;
      if (expectedToken && token !== expectedToken) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      this.wss.handleUpgrade(req, socket, head, (ws) => {
        this._registerRelay(storeId, ws);
      });
    });

    this.heartbeatTimer = setInterval(() => {
      for (const [storeId, ws] of this.relays.entries()) {
        if (ws.readyState !== WebSocket.OPEN) {
          this.relays.delete(storeId);
          continue;
        }
        ws.ping();
      }
    }, HEARTBEAT_INTERVAL_MS);

    console.log("[PrintRelay] WebSocket relay server attached at /ws/print-relay");
  }

  _registerRelay(storeId, ws) {
    const existing = this.relays.get(storeId);
    if (existing && existing.readyState === WebSocket.OPEN) {
      existing.close(1000, "Replaced by new connection");
    }

    this.relays.set(storeId, ws);
    console.log(`[PrintRelay] Store "${storeId}" connected`);

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.action === "http-response" && msg.id) {
          const pending = this.pending.get(msg.id);
          if (pending) {
            clearTimeout(pending.timer);
            this.pending.delete(msg.id);
            pending.resolve(msg);
          }
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on("close", () => {
      if (this.relays.get(storeId) === ws) {
        this.relays.delete(storeId);
        console.log(`[PrintRelay] Store "${storeId}" disconnected`);
      }
    });

    ws.on("error", () => {
      ws.terminate();
      if (this.relays.get(storeId) === ws) {
        this.relays.delete(storeId);
      }
    });
  }

  isConnected(storeId = "default") {
    const ws = this.relays.get(storeId);
    return ws !== undefined && ws.readyState === WebSocket.OPEN;
  }

  async sendRequest(url, method, body, storeId = "default") {
    const ws = this.relays.get(storeId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      throw new Error(`No relay connected for store "${storeId}"`);
    }

    const id = randomUUID();
    const request = {
      id,
      action: "http-request",
      url,
      method,
      headers: { "Content-Type": "application/json" },
      body,
    };

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("Relay request timed out after 30s"));
      }, RELAY_TIMEOUT_MS);

      this.pending.set(id, {
        resolve: (res) => resolve({ statusCode: res.statusCode, body: res.body }),
        reject,
        timer,
      });

      ws.send(JSON.stringify(request));
    });
  }

  close() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    for (const ws of this.relays.values()) {
      ws.close(1001, "Server shutting down");
    }
    this.relays.clear();
    if (this.wss) this.wss.close();
  }
}

// Singleton — shared between server.js and API routes in the same process
const printRelay = new PrintRelayServer();

module.exports = { printRelay, PrintRelayServer };
