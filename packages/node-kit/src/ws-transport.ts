import { WebSocket } from "ws";
import type { NodeTransport, WireMsg } from "./transport";

/** 이미 열린 ws 소켓을 NodeTransport로 감싼다(서버·클라이언트 공용). */
export function socketTransport(ws: WebSocket): NodeTransport {
  const subs = new Set<(m: WireMsg) => void>();
  const closeSubs = new Set<() => void>();
  ws.on("message", (data: unknown) => {
    try {
      const m = JSON.parse(String(data)) as WireMsg;
      for (const cb of subs) cb(m);
    } catch {
      /* ignore malformed frame */
    }
  });
  ws.on("close", () => {
    for (const cb of closeSubs) cb();
  });
  return {
    send(msg: WireMsg) {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
    },
    subscribe(cb: (m: WireMsg) => void) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    async start() {},
    async stop() {
      ws.close();
    },
    onClose(cb: () => void) {
      closeSubs.add(cb);
      return () => closeSubs.delete(cb);
    },
  };
}

/** 노드측 WS 클라이언트 전송 — hub URL에 접속 후 socketTransport로 위임. */
export class WsNodeTransport implements NodeTransport {
  #inner: NodeTransport | undefined;
  #ws: WebSocket | undefined;

  constructor(private readonly url: string) {}

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.url);
      this.#ws = ws;
      ws.once("open", () => {
        this.#inner = socketTransport(ws);
        resolve();
      });
      ws.once("error", (err: Error) => reject(err));
    });
  }
  send(msg: WireMsg): void {
    this.#inner?.send(msg);
  }
  subscribe(cb: (m: WireMsg) => void): () => void {
    if (!this.#inner) throw new Error("WsNodeTransport: subscribe before start()");
    return this.#inner.subscribe(cb);
  }
  async stop(): Promise<void> {
    this.#ws?.close();
  }
  onClose(cb: () => void): () => void {
    if (!this.#inner) throw new Error("WsNodeTransport: onClose before start()");
    return this.#inner.onClose(cb);
  }
}
