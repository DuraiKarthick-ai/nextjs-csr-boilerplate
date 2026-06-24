/**
 * Unit tests for ecsWsCall.
 * The `ws` module is replaced with a fake EventEmitter-based socket so we can
 * drive open/message/error/close events deterministically without a network.
 */

// Defined inside the factory so it is available to the hoisted jest.mock call.
jest.mock("ws", () => {
  const { EventEmitter } = require("events") as typeof import("events");
  class FakeWebSocket extends EventEmitter {
    static last: FakeWebSocket | null = null;
    url: string;
    send = jest.fn();
    close = jest.fn();
    terminate = jest.fn();
    constructor(url: string) {
      super();
      this.url = url;
      FakeWebSocket.last = this;
    }
  }
  return { __esModule: true, default: FakeWebSocket };
});

import WebSocket from "ws";
import { ecsWsCall } from "./ecsWebSocket";

interface FakeWS extends WebSocket {
  send: jest.Mock;
  close: jest.Mock;
  terminate: jest.Mock;
  emit(event: string, ...args: unknown[]): boolean;
}

/** Returns the most recently constructed fake socket. */
function lastSocket(): FakeWS {
  return (WebSocket as unknown as { last: FakeWS }).last;
}

const URL = "wss://localhost.ecsglobalinc.com:8082";

describe("ecsWsCall", () => {
  beforeEach(() => {
    (WebSocket as unknown as { last: FakeWS | null }).last = null;
    jest.spyOn(console, "log").mockImplementation(() => undefined);
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("sends the payload on open and resolves with parsed JSON", async () => {
    const promise = ecsWsCall(URL, { method: "get-printers", sessionID: "s1" });
    const ws = lastSocket();
    ws.emit("open");
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ method: "get-printers", sessionID: "s1" }));
    ws.emit("message", JSON.stringify({ printers: ["P1"] }));
    await expect(promise).resolves.toEqual({ printers: ["P1"] });
  });

  it("resolves a PNG binary frame as base64 data", async () => {
    const promise = ecsWsCall(URL, { method: "preview-first" });
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x01, 0x02]);
    lastSocket().emit("message", png);
    await expect(promise).resolves.toEqual({ data: png.toString("base64") });
  });

  it("rejects when the response carries an ECS error field", async () => {
    const promise = ecsWsCall(URL, { method: "bad" });
    lastSocket().emit("message", JSON.stringify({ error: "boom" }));
    await expect(promise).rejects.toThrow(/ECS error/);
  });

  it("rejects on a server CLOSE signal", async () => {
    const promise = ecsWsCall(URL, { method: "m" });
    lastSocket().emit("message", "CLOSE");
    await expect(promise).rejects.toThrow(/server requested close/);
  });

  it("rejects on a connection error", async () => {
    const promise = ecsWsCall(URL, { method: "m" });
    lastSocket().emit("error", new Error("refused"));
    await expect(promise).rejects.toThrow(/connection error/);
  });

  it("skips PROGRESS_UPDATE frames and resolves on the real response", async () => {
    const promise = ecsWsCall(URL, { method: "m" });
    const ws = lastSocket();
    ws.emit("message", "PROGRESS_UPDATE: 50%");
    ws.emit("message", JSON.stringify({ done: true }));
    await expect(promise).resolves.toEqual({ done: true });
  });

  it("rejects with a timeout error when no response arrives", async () => {
    jest.useFakeTimers();
    const promise = ecsWsCall(URL, { method: "slow" }, 1000);
    const assertion = expect(promise).rejects.toThrow(/timeout/i);
    jest.advanceTimersByTime(1000);
    await assertion;
    expect(lastSocket().terminate).toHaveBeenCalled();
  });
});
