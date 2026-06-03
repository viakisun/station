import type { CommandAck, CommandEnvelope, Event, ModuleManifest, Signal } from "@station/contracts";

/**
 * 와이어 메시지 — 노드↔Agent 사이를 흐르는 봉투.
 * hello/signal/event/ack = node→agent · command = agent→node.
 */
export type WireMsg =
  | { t: "hello"; manifest: ModuleManifest }
  | { t: "signal"; s: Signal }
  | { t: "event"; e: Event }
  | { t: "ack"; a: CommandAck }
  | { t: "command"; c: CommandEnvelope };

/**
 * NodeTransport — 노드와 Agent를 잇는 양방향 메시지 채널(stand-in).
 * Loopback(in-proc)·WebSocket·(후속) MQTT/DDS 가 같은 인터페이스 뒤에서 교체된다.
 * MockSource ⟂ NodeTransport 분리(ADR-015): 데이터 생성과 전송을 분리.
 */
export interface NodeTransport {
  send(msg: WireMsg): void;
  subscribe(cb: (msg: WireMsg) => void): () => void;
  start(): Promise<void>;
  stop(): Promise<void>;
  onClose(cb: () => void): () => void;
}
