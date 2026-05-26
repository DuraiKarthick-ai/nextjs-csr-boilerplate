/**
 * Custom Next.js server with WebSocket support for the Print Relay tunnel.
 *
 * In production (GKE), this replaces `next start` to add the /ws/print-relay
 * WebSocket upgrade handler. Store relay clients connect here.
 *
 * Usage:
 *   node server.js          (production)
 *   npm run dev             (development — uses standard next dev, relay not needed locally)
 */

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3002", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Attach WebSocket relay in production (or when WS_RELAY_ENABLED=true)
  if (process.env.WS_RELAY_ENABLED === "true" || !dev) {
    try {
      const { printRelay } = require("./lib/ws-relay-server");
      printRelay.attach(server);
      console.log("[Server] Print relay WebSocket enabled");
    } catch (err) {
      console.warn("[Server] Could not load ws-relay-server:", err.message);
      console.warn("[Server] Ensure 'ws' package is installed: npm i ws");
    }
  }

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> WebSocket relay: ws://localhost:${port}/ws/print-relay`);
  });
});
