"use client";
/* ============================================================
   RemoteAgentClient — 원격 Local Agent app 의 HMI 옵저버(IF-L-HMI-AGG) WS
   클라이언트. 네이티브 WebSocket(ws 의존 0). snapshot 으로 로컬 미러를 시드한
   뒤 델타(signal/event/observation/ack)로 갱신하고, dispatch 는 command 를
   송신해 commandId 로 ack 를 라우팅한다. AgentFacade 를 구현 → hooks 불변.
   ============================================================ */
import type {
  CommandAck,
  CommandEnvelope,
  Event,
  ModuleManifest,
  Signal,
  SignalChannel,
} from "@station/contracts";
import type { GrowthObservation, HmiServerMsg } from "@station/local-agent/browser";
import type { AgentFacade, ConnectionState } from "./agent-facade";

export class RemoteAgentClient implements AgentFacade {
  #ws: WebSocket | undefined;
  #state: ConnectionState = "connecting";
  #agentId = "";
  #closed = false;
  #reconnectTimer: ReturnType<typeof setTimeout> | undefined;

  #latest = new Map<string, Signal>();
  #manifests: ModuleManifest[] = [];
  #recentEvents: Event[] = [];

  #sigSubs = new Set<(s: Signal) => void>();
  #evtSubs = new Set<(e: Event) => void>();
  #obsSubs = new Set<(o: GrowthObservation) => void>();
  #stateSubs = new Set<(s: ConnectionState) => void>();
  #pending = new Map<string, (a: CommandAck) => void>();

  constructor(private readonly url: string) {
    this.#connect();
  }

  // ---- AgentFacade ----
  manifests(): ModuleManifest[] {
    return this.#manifests;
  }

  readonly signals = {
    latest: (channel: string): Signal | undefined => this.#latest.get(channel),
    channels: (): SignalChannel[] =>
      [...this.#latest.values()].map((s) => ({
        channel: s.channel,
        label: s.channel,
        unit: s.unit ?? "",
        node: s.source?.node,
      })),
    subscribe: (cb: (s: Signal) => void): (() => void) => {
      this.#sigSubs.add(cb);
      return () => this.#sigSubs.delete(cb);
    },
  };

  readonly events = {
    recent: (n: number): Event[] => this.#recentEvents.slice(-n),
    subscribe: (
      _filter: Partial<Pick<Event, "source" | "code" | "severity">>,
      cb: (e: Event) => void,
    ): (() => void) => {
      this.#evtSubs.add(cb);
      return () => this.#evtSubs.delete(cb);
    },
  };

  readonly observations = {
    subscribe: (cb: (o: GrowthObservation) => void): (() => void) => {
      this.#obsSubs.add(cb);
      return () => this.#obsSubs.delete(cb);
    },
  };

  readonly commands = {
    dispatch: (cmd: CommandEnvelope, onAck: (a: CommandAck) => void): void => {
      this.#pending.set(cmd.commandId, onAck);
      this.#send({ t: "command", c: cmd });
    },
  };

  // ---- 연결 상태 ----
  get state(): ConnectionState {
    return this.#state;
  }
  get agentId(): string {
    return this.#agentId;
  }
  get endpoint(): string {
    return this.url;
  }
  subscribeState(cb: (s: ConnectionState) => void): () => void {
    this.#stateSubs.add(cb);
    return () => this.#stateSubs.delete(cb);
  }

  close(): void {
    this.#closed = true;
    if (this.#reconnectTimer) clearTimeout(this.#reconnectTimer);
    this.#ws?.close();
  }

  // ---- 내부 ----
  #setState(s: ConnectionState): void {
    if (this.#state === s) return;
    this.#state = s;
    for (const cb of this.#stateSubs) cb(s);
  }

  #connect(): void {
    if (this.#closed) return;
    this.#setState(this.#latest.size > 0 ? "connecting" : "connecting");
    let ws: WebSocket;
    try {
      ws = new WebSocket(this.url);
    } catch {
      this.#scheduleReconnect();
      return;
    }
    this.#ws = ws;
    ws.onopen = () => this.#setState("connected");
    ws.onmessage = (ev: MessageEvent) => this.#onMessage(String(ev.data));
    ws.onclose = () => {
      this.#setState("disconnected");
      this.#scheduleReconnect();
    };
    ws.onerror = () => ws.close();
  }

  #scheduleReconnect(): void {
    if (this.#closed || this.#reconnectTimer) return;
    this.#reconnectTimer = setTimeout(() => {
      this.#reconnectTimer = undefined;
      this.#connect();
    }, 1500);
  }

  #send(msg: { t: "command"; c: CommandEnvelope }): void {
    if (this.#ws && this.#ws.readyState === WebSocket.OPEN) this.#ws.send(JSON.stringify(msg));
  }

  #onMessage(raw: string): void {
    let msg: HmiServerMsg;
    try {
      msg = JSON.parse(raw) as HmiServerMsg;
    } catch {
      return;
    }
    switch (msg.t) {
      case "snapshot":
        this.#manifests = msg.nodes;
        this.#agentId = msg.agentId;
        this.#latest.clear();
        for (const s of msg.signals) this.#latest.set(s.channel, s);
        this.#recentEvents = msg.events.slice();
        // 재연결 시 UI 가 최신 상태를 받도록 시드 신호를 fan-out.
        for (const s of msg.signals) for (const cb of this.#sigSubs) cb(s);
        // snapshot 으로 agentId 가 채워졌으니 상태 구독자(헤더 등) 재통지.
        for (const cb of this.#stateSubs) cb(this.#state);
        break;
      case "signal":
        this.#latest.set(msg.s.channel, msg.s);
        for (const cb of this.#sigSubs) cb(msg.s);
        break;
      case "event":
        this.#recentEvents.push(msg.e);
        if (this.#recentEvents.length > 200) this.#recentEvents.shift();
        for (const cb of this.#evtSubs) cb(msg.e);
        break;
      case "observation":
        for (const cb of this.#obsSubs) cb(msg.o);
        break;
      case "ack": {
        const onAck = this.#pending.get(msg.a.commandId);
        if (onAck) {
          onAck(msg.a);
          if (msg.a.stage === "executed" || msg.a.stage === "rejected" || msg.a.stage === "timeout") {
            this.#pending.delete(msg.a.commandId);
          }
        }
        break;
      }
    }
  }
}
