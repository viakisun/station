import { WebSocketServer, type WebSocket } from "ws";
import type { TransportMonitor } from "./transport-monitor";

/* ============================================================
   TraceHub — 전송 시뮬 트레이스를 웹 콘솔에 push 하는 옵저버 WS.
   접속 시 즉시 snapshot, 이후 주기적으로 rollups+recent 를 broadcast.
   읽기 전용(관측). Build 앱 /transport 페이지가 구독.
   ============================================================ */

export interface TraceSnapshot {
  t: "transport";
  rollups: ReturnType<TransportMonitor["rollups"]>;
  recent: ReturnType<TransportMonitor["recent"]>;
  ts: number;
}

export class TraceHub {
  #wss: WebSocketServer | undefined;
  #timer: ReturnType<typeof setInterval> | undefined;

  constructor(
    private readonly monitor: TransportMonitor,
    private readonly port: number,
    private readonly intervalMs = 500,
  ) {}

  start(): Promise<number> {
    return new Promise((resolve, reject) => {
      const wss = new WebSocketServer({ port: this.port });
      this.#wss = wss;
      wss.on("connection", (ws: WebSocket) => this.#send(ws));
      wss.on("error", (err) => reject(err));
      wss.on("listening", () => {
        const addr = wss.address();
        resolve(typeof addr === "object" && addr ? addr.port : this.port);
      });
      this.#timer = setInterval(() => {
        for (const ws of wss.clients) this.#send(ws);
      }, this.intervalMs);
    });
  }

  async stop(): Promise<void> {
    if (this.#timer) clearInterval(this.#timer);
    await new Promise<void>((resolve) => {
      if (this.#wss) this.#wss.close(() => resolve());
      else resolve();
    });
  }

  #send(ws: WebSocket): void {
    if (ws.readyState !== ws.OPEN) return;
    const snap: TraceSnapshot = {
      t: "transport",
      rollups: this.monitor.rollups(),
      recent: this.monitor.recent(40),
      ts: Date.now(),
    };
    ws.send(JSON.stringify(snap));
  }
}
