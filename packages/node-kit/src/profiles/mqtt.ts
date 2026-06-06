import type { ProtocolProfile } from "@station/contracts";
import type { WireMsg } from "../transport";
import { type ProtocolModel, type TransportFrame, msgChannel, wireBytes } from "./model";

/* ============================================================
   MQTT (Telemetry — LTE/5G 업링크 → 클라우드 브로커).
   · 브로커 매개. 토픽 계층 "station/<site>/<robot>/<dir>/<channel>".
   · QoS 0/1/2 ↔ at_most_once/at_least_once/exactly_once(profile.ack).
   · retain·LWT 는 메타로만 표기. TCP 라 단편화는 TCP 세그먼트(여기선 1 publish).
   · 지연 = LTE/5G 왕복 30~140ms(+지터) — 클라우드는 멀다는 핵심 교훈.
   ============================================================ */

const LTE_BASE_MS = 35;
const LTE_JITTER_MS = 90;

const QOS_LABEL: Record<NonNullable<ProtocolProfile["ack"]>, string> = {
  at_most_once: "QoS0",
  at_least_once: "QoS1",
  exactly_once: "QoS2",
};

function mqttTopic(profile: ProtocolProfile, msg: WireMsg): string {
  const dir = msg.t === "command" ? "cmd" : msg.t === "event" ? "evt" : "tlm";
  const ch = (msgChannel(msg) ?? msg.t).replace(/\./g, "/");
  const fromProfile = profile.topics?.find((t) => t.dir === (msg.t === "command" ? "cmd" : "telemetry"))?.topic;
  return fromProfile ?? `station/SITE/RBT/${dir}/${ch}`;
}

export class MqttModel implements ProtocolModel {
  constructor(readonly profile: ProtocolProfile) {}

  #qos(): NonNullable<ProtocolProfile["ack"]> {
    return this.profile.ack ?? "at_least_once";
  }

  encode(msg: WireMsg): { frames: TransportFrame[]; appBytes: number; topic: string; qos: string } {
    const appBytes = wireBytes(msg);
    // 1 MQTT PUBLISH (TCP). 큰 페이로드는 TCP 세그먼트화되나 앱 관점 1 publish.
    const frames: TransportFrame[] = [{ seq: 0, total: 1, bytes: appBytes }];
    return { frames, appBytes, topic: mqttTopic(this.profile, msg), qos: QOS_LABEL[this.#qos()] };
  }

  latencyMs(_appBytes: number, rng: () => number): number {
    return +(LTE_BASE_MS + rng() * LTE_JITTER_MS).toFixed(1);
  }

  lossProb(): number {
    return this.#qos() === "at_most_once" ? 0.02 : 0; // QoS0 만 손실 허용
  }

  maxRetries(): number {
    return this.#qos() === "at_most_once" ? 0 : 5; // QoS1/2 PUBACK/PUBREC 재전송
  }
}
