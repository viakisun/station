/* ============================================================
   Local Agent / Robot Gateway — 런타임 인터페이스 (구현 0)
   STATION Field OS 2단계(packages/local-agent + apps/agent)가 구현한다.
   여기서는 시그니처만 정의: 표준 계약 타입만 참조, 외부 의존 0.
   ============================================================ */
import type { Signal } from "../src/generated/signal";
import type { SignalChannel } from "../src/generated/signal-channel";
import type { CommandEnvelope } from "../src/generated/command-envelope";
import type { CommandAck } from "../src/generated/command-ack";
import type { Event } from "../src/generated/event";
import type { GateResult } from "../src/generated/gate-result";
import type { ModuleManifest } from "../src/generated/module-manifest";

/** 노드(MCU/VPU/ACU/Telemetry/LPU) 프로토콜을 흡수하는 어댑터 */
export interface NodeAdapter {
  readonly manifest: ModuleManifest;
  start(): Promise<void>;
  stop(): Promise<void>;
  onSignal(cb: (s: Signal) => void): () => void;
  onEvent(cb: (e: Event) => void): () => void;
  send(cmd: CommandEnvelope): Promise<void>;
  onAck(cb: (a: CommandAck) => void): () => void;
}

export interface SignalStore {
  write(s: Signal): void;
  latest(channel: string): Signal | undefined;
  channels(): SignalChannel[];
  subscribe(cb: (s: Signal) => void): () => void;
}

export interface EventBus {
  publish(e: Event): void;
  subscribe(
    filter: Partial<Pick<Event, "source" | "code" | "severity">>,
    cb: (e: Event) => void,
  ): () => void;
  recent(n: number): Event[];
}

export interface CommandRouter {
  /** received 즉시 반환, accepted/executed/rejected 는 onAck 스트림 */
  dispatch(cmd: CommandEnvelope, onAck: (a: CommandAck) => void): Promise<CommandAck>;
  /** 권한·상태·안전(Policy) 게이트 평가 */
  evaluateGate(cmd: CommandEnvelope): GateResult;
}

/** 게이트웨이 오케스트레이터 — 노드 어댑터를 등록하고 표준 표면을 노출 */
export interface LocalAgent {
  register(adapter: NodeAdapter): void;
  readonly signals: SignalStore;
  readonly events: EventBus;
  readonly commands: CommandRouter;
  manifests(): ModuleManifest[];
  start(): Promise<void>;
  stop(): Promise<void>;
}
