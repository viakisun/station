import type { ProtocolProfile } from "@station/contracts";
import type { NodeTransport, WireMsg } from "../transport";
import { CanModel } from "./can";
import { type ProtocolModel, type TransportTrace, msgChannel } from "./model";
import { MqttModel } from "./mqtt";
import { Ros2Model } from "./ros2";
import { SerialModel, WsModel } from "./serial-ws";

/* ============================================================
   ProfiledTransport — 기존 NodeTransport(loopback·ws)를 감싸 매체 거동을
   덧입힌다. send 시: 매체 단편화/QoS 손실·재시도/지연을 모델링하고
   TransportTrace 를 발행한 뒤, 모델 지연 후 inbound 채널로 원 메시지를 전달.
   손실 확정(at_most_once)이면 전달하지 않는다 — 충실한 손실 재현.
   inbound 는 상대편 ProfiledTransport 가 모델링하므로 그대로 통과.
   실 드라이버 교체: ProtocolModel 또는 본 클래스를 Real* 로 대체(동일 계약).
   ============================================================ */

export function modelFor(profile: ProtocolProfile): ProtocolModel {
  switch (profile.transport) {
    case "CAN":
      return new CanModel(profile);
    case "ROS2":
    case "DDS":
      return new Ros2Model(profile);
    case "MQTT":
      return new MqttModel(profile);
    case "SERIAL":
      return new SerialModel(profile);
    case "WS":
      return new WsModel(profile);
  }
}

export interface ProfiledOpts {
  /** 트레이스 싱크 — 웹/콘솔이 구독. */
  onTrace?: (t: TransportTrace) => void;
  /** [0,1) 난수원(테스트 결정성 주입). 기본 Math.random. */
  rng?: () => number;
  /** 논리 시각(ms). 기본 Date.now. */
  clock?: () => number;
  /** 지연 스케줄러. 기본 setTimeout. 테스트는 즉시 실행 주입. */
  defer?: (fn: () => void, ms: number) => void;
  /** tx 방향 라벨(트레이스). 기본 노드측. */
  dir?: "tx" | "rx";
}

export class ProfiledTransport implements NodeTransport {
  readonly model: ProtocolModel;
  #rng: () => number;
  #clock: () => number;
  #defer: (fn: () => void, ms: number) => void;
  #onTrace?: (t: TransportTrace) => void;
  #dir: "tx" | "rx";

  constructor(
    private readonly inner: NodeTransport,
    profile: ProtocolProfile,
    opts: ProfiledOpts = {},
  ) {
    this.model = modelFor(profile);
    this.#rng = opts.rng ?? Math.random;
    this.#clock = opts.clock ?? (() => Date.now());
    this.#defer = opts.defer ?? ((fn, ms) => void setTimeout(fn, ms));
    this.#onTrace = opts.onTrace;
    this.#dir = opts.dir ?? "tx";
  }

  send(msg: WireMsg): void {
    const { frames, appBytes, topic, qos } = this.model.encode(msg);
    // hello(디스커버리)는 제어평면 — 매체와 무관하게 신뢰 전달(노드 재announce 의미).
    const loss = msg.t === "hello" ? 0 : this.model.lossProb();
    const maxRetries = this.model.maxRetries();
    let retries = 0;
    let delivered = true;
    // 손실 → 재시도(QoS). 재시도 소진 시 손실 확정.
    while (this.#rng() < loss) {
      if (retries >= maxRetries) {
        delivered = false;
        break;
      }
      retries++;
    }
    const latencyMs = this.model.latencyMs(appBytes, this.#rng) * (retries + 1);
    const trace: TransportTrace = {
      ts: this.#clock(),
      profileId: this.model.profile.id,
      transport: this.model.profile.transport,
      dir: this.#dir,
      kind: msg.t,
      channel: msgChannel(msg),
      topic,
      qos,
      appBytes,
      frames: frames.length,
      latencyMs: +latencyMs.toFixed(3),
      retries,
      delivered,
    };
    this.#onTrace?.(trace);
    if (delivered) this.#defer(() => this.inner.send(msg), latencyMs);
  }

  subscribe(cb: (m: WireMsg) => void): () => void {
    return this.inner.subscribe(cb);
  }
  start(): Promise<void> {
    return this.inner.start();
  }
  stop(): Promise<void> {
    return this.inner.stop();
  }
  onClose(cb: () => void): () => void {
    return this.inner.onClose(cb);
  }
}
