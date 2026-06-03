import { WebSocketServer, type WebSocket } from "ws";
import type { CommandAck } from "@station/contracts";
import type { ReferenceLocalAgent } from "../local-agent";
import type { HmiClientMsg, HmiServerMsg } from "./hmi-protocol";

/**
 * HmiHub — Agent측 HMI/관제 옵저버 엔드포인트(IF-L-HMI-AGG).
 * 원격 웹(Ops 콘솔)이 접속하면 현재 상태 snapshot 을 보낸 뒤 신호·이벤트·관측을
 * 실시간 forward 하고, 수신한 command 를 게이트 경유로 dispatch 해 ack 를 되돌린다.
 * 노드-facing WsHub 와 분리된 채널(방향이 반대).
 */
export class HmiHub {
  #wss: WebSocketServer | undefined;

  constructor(
    private readonly agent: ReferenceLocalAgent,
    private readonly port: number,
    private readonly agentId = "NODE-AGENT-VIA",
  ) {}

  start(): Promise<number> {
    return new Promise((resolve) => {
      const wss = new WebSocketServer({ port: this.port });
      this.#wss = wss;
      wss.on("connection", (ws: WebSocket) => this.#serve(ws));
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

  #serve(ws: WebSocket): void {
    const send = (m: HmiServerMsg): void => {
      if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(m));
    };

    // 1) snapshot — 현재 latest 신호·노드 manifest·최근 이벤트.
    const signals = this.agent.signals
      .channels()
      .map((c) => this.agent.signals.latest(c.channel))
      .filter((s): s is NonNullable<typeof s> => s !== undefined);
    send({
      t: "snapshot",
      nodes: this.agent.manifests(),
      signals,
      events: this.agent.events.recent(50),
      observations: [],
      agentId: this.agentId,
    });

    // 2) 실시간 구독 → forward.
    const unsubs = [
      this.agent.signals.subscribe((s) => send({ t: "signal", s })),
      this.agent.events.subscribe({}, (e) => send({ t: "event", e })),
      this.agent.observations.subscribe((o) => send({ t: "observation", o })),
    ];

    // 3) 수신 command → 게이트 경유 dispatch, ack 되돌림.
    ws.on("message", (data: Buffer | string) => {
      let msg: HmiClientMsg;
      try {
        msg = JSON.parse(String(data)) as HmiClientMsg;
      } catch {
        return;
      }
      if (msg.t === "command") {
        void this.agent.commands.dispatch(msg.c, (a: CommandAck) => send({ t: "ack", a }));
      }
    });

    ws.on("close", () => {
      for (const u of unsubs) u();
    });
  }
}
