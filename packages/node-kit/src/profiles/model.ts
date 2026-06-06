import type { ProtocolProfile } from "@station/contracts";
import type { WireMsg } from "../transport";

/* ============================================================
   프로토콜-정확 전송 시뮬레이션 — 코어 모델.
   각 매체(CAN·ROS2/DDS·MQTT·SERIAL·WS)의 *관측 가능한 와이어 의미*를
   충실히 재현한다: 프레이밍(프레임 수·MTU·단편화)·토픽/식별자·QoS·지연·손실·재시도.
   논리 메시지(WireMsg)는 그대로 전달되므로 Agent는 변경 없이 동작하고,
   대신 TransportTrace 로 매체 거동을 노출 — 개발자 레퍼런스의 핵심.
   실 드라이버(socketcan·rclcpp·mosquitto)는 동일 ProtocolModel 인터페이스로 교체.
   ============================================================ */

export type Transport = ProtocolProfile["transport"];

/** 매체 한 프레임(CAN 프레임 1개 / RTPS 샘플 / MQTT publish 1건). */
export interface TransportFrame {
  seq: number; // 메시지 내 프레임 순번 (0-base)
  total: number; // 이 메시지의 총 프레임 수
  bytes: number; // 이 프레임의 페이로드 바이트
}

/** 매체를 한 번 통과한 결과 — 관측치. 웹/콘솔이 이걸 그린다. */
export interface TransportTrace {
  ts: number; // 논리 타임스탬프(ms)
  profileId: string;
  transport: Transport;
  dir: "tx" | "rx";
  kind: WireMsg["t"]; // hello·signal·event·ack·command
  channel?: string; // signal 채널 / command verb (식별용)
  topic: string; // 매체 토픽 또는 CAN arbitration id
  qos: string; // 매체 QoS 라벨 (BEST_EFFORT·QoS1 등)
  appBytes: number; // 애플리케이션 페이로드 바이트(직렬화 후)
  frames: number; // 매체 프레임 수(단편화 결과)
  latencyMs: number; // 모델링된 매체 지연(재시도 포함)
  retries: number; // 전달까지 쓴 재시도 수
  delivered: boolean; // 최종 전달 여부(at_most_once 손실 시 false)
}

/**
 * ProtocolModel — 한 매체의 거동 모델. 상태 없음(rng 주입).
 * 실 드라이버는 frame/latency 대신 실제 소켓을 쓰되 동일 계약을 만족.
 */
export interface ProtocolModel {
  readonly profile: ProtocolProfile;
  /** 논리 메시지를 매체 프레임으로 단편화 + 토픽/QoS/바이트 산출. */
  encode(msg: WireMsg): { frames: TransportFrame[]; appBytes: number; topic: string; qos: string };
  /** 매체 지연(ms) — 바이트 크기 + 지터. rng 로 지터. */
  latencyMs(appBytes: number, rng: () => number): number;
  /** 단일 전달 시도가 손실될 확률 [0,1). */
  lossProb(): number;
  /** QoS 가 보장하는 최대 재전송 횟수(0 = fire-and-forget). */
  maxRetries(): number;
}

/** 직렬화 바이트 수(JSON 와이어 기준 — 실 노드의 payload 크기 근사). */
export function wireBytes(msg: WireMsg): number {
  return Buffer.byteLength(JSON.stringify(msg), "utf8");
}

/** WireMsg → 식별 채널/verb (트레이스 라벨용). */
export function msgChannel(msg: WireMsg): string | undefined {
  switch (msg.t) {
    case "signal":
      return msg.s.channel;
    case "command":
      return msg.c.verb;
    case "ack":
      return msg.a.stage;
    case "event":
      return msg.e.code;
    case "hello":
      return msg.manifest.moduleType;
  }
}
