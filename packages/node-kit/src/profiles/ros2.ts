import type { ProtocolProfile, WireBinding } from "@station/contracts";
import type { WireMsg } from "../transport";
import { type ProtocolModel, type TransportFrame, msgChannel, wireBytes } from "./model";
import { entryFor } from "./binding";

/* ============================================================
   ROS2 / DDS (VPU·ACU·LPU — Jetson·Linux, RTPS over UDP).
   · 브로커 없음(peer 디스커버리). 토픽 기반 pub/sub, DDS 규약 "rt/<topic>".
   · MTU ~1500B → RTPS 단편화는 ~64KB 부터. 우리 메시지는 대개 1 프레임.
   · QoS: telemetry=BEST_EFFORT(at_most_once), cmd/event=RELIABLE(at_least_once).
     profile.ack 로 결정. RELIABLE 은 ACKNACK 재전송으로 사실상 무손실.
   · 지연 = LAN 0.2~1.5ms + 지터.
   ============================================================ */

const MTU = 1500; // UDP MTU
const RTPS_OVERHEAD = 56; // RTPS+UDP+IP 헤더 근사
const LAN_BASE_MS = 0.25;

function ddsTopic(profile: ProtocolProfile, msg: WireMsg): string {
  const ch = msgChannel(msg) ?? msg.t;
  const fromProfile = profile.topics?.find((t) => (msg.t === "command" ? t.dir === "cmd" : t.dir === "telemetry"))?.topic;
  if (fromProfile) return fromProfile; // 프로파일 토픽은 이미 완전한 DDS 토픽(rt/…)
  return `rt/${ch.replace(/\./g, "/")}`;
}

export class Ros2Model implements ProtocolModel {
  constructor(
    readonly profile: ProtocolProfile,
    private readonly binding?: WireBinding,
  ) {}

  #reliable(msg?: WireMsg): boolean {
    // 바인딩 엔트리 QoS 우선(토픽별 QoS), 없으면 프로파일 ack.
    const e = msg && entryFor(this.binding, msg);
    if (e?.qos) return e.qos.includes("RELIABLE");
    return this.profile.ack === "at_least_once" || this.profile.ack === "exactly_once";
  }

  encode(msg: WireMsg): { frames: TransportFrame[]; appBytes: number; topic: string; qos: string } {
    const appBytes = wireBytes(msg);
    const perFrame = MTU - RTPS_OVERHEAD;
    const total = Math.max(1, Math.ceil(appBytes / perFrame));
    const frames: TransportFrame[] = [];
    let left = appBytes;
    for (let i = 0; i < total; i++) {
      const b = Math.min(perFrame, left);
      frames.push({ seq: i, total, bytes: b });
      left -= b;
    }
    const entry = entryFor(this.binding, msg);
    const qos = this.#reliable(msg) ? "RELIABLE/VOLATILE" : "BEST_EFFORT/VOLATILE";
    return { frames, appBytes, topic: entry?.topic ?? ddsTopic(this.profile, msg), qos };
  }

  latencyMs(appBytes: number, rng: () => number): number {
    const frames = Math.max(1, Math.ceil(appBytes / (MTU - RTPS_OVERHEAD)));
    const jitter = rng() * 0.8;
    return +(LAN_BASE_MS * frames + jitter).toFixed(3);
  }

  lossProb(): number {
    return this.#reliable() ? 0 : 0.01; // BEST_EFFORT 1% UDP 손실
  }

  maxRetries(): number {
    return this.#reliable() ? 4 : 0; // RELIABLE ACKNACK 재전송
  }
}
