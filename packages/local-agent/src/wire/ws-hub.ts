import { WebSocketServer, type WebSocket } from "ws";
import { socketTransport } from "@station/node-kit";
import type { ReferenceLocalAgent } from "../local-agent";
import { serveTransport } from "./serve";

/**
 * WsHub — Agent측 WebSocket 리스너. 노드가 접속할 때마다 소켓당 전송을 만들어
 * serveTransport로 Agent에 합류시킨다(허브-스포크의 허브 엔드포인트).
 */
export class WsHub {
  #wss: WebSocketServer | undefined;

  constructor(
    private readonly agent: ReferenceLocalAgent,
    private readonly port: number,
  ) {}

  /** 리스닝 시작. 실제 바인딩된 포트를 반환(port 0 = ephemeral). */
  start(): Promise<number> {
    return new Promise((resolve, reject) => {
      const wss = new WebSocketServer({ port: this.port });
      this.#wss = wss;
      wss.on("connection", (ws: WebSocket) => {
        serveTransport(this.agent, socketTransport(ws));
      });
      wss.on("error", (err) => reject(err)); // EADDRINUSE 등 → .catch 로 graceful degrade
      wss.on("listening", () => {
        const addr = wss.address();
        resolve(typeof addr === "object" && addr ? addr.port : this.port);
      });
    });
  }

  async stop(): Promise<void> {
    await new Promise<void>((resolve) => {
      if (this.#wss) this.#wss.close(() => resolve());
      else resolve();
    });
  }
}
