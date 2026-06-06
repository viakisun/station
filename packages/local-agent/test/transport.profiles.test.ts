import {
  CanModel,
  MqttModel,
  ProfiledTransport,
  Ros2Model,
  createLoopbackPair,
  type TransportTrace,
  type WireMsg,
} from "@station/node-kit";
import type { ProtocolProfile } from "@station/contracts";
import { describe, expect, it } from "vitest";

const sig = (channel: string, value: number): WireMsg => ({
  t: "signal",
  s: { channel, value, unit: "x", ts: "2026-01-01T00:00:00Z", quality: "good", source: { node: "MCU" } },
});

const P = (transport: ProtocolProfile["transport"], ack?: ProtocolProfile["ack"]): ProtocolProfile => ({
  id: `PRT-${transport}-test`,
  transport,
  ack,
});

describe("CAN model (MCU)", () => {
  it("8바이트 프레임으로 큰 JSON 을 멀티프레임 단편화한다", () => {
    const m = new CanModel(P("CAN"));
    const small = m.encode({ t: "ack", a: { commandId: "C1", stage: "received", ts: "t" } });
    const big = m.encode(sig("machine.motion.speed", 1.2));
    expect(small.frames.length).toBeGreaterThanOrEqual(1);
    // signal JSON(>60B) 은 8B 프레임 여러 개로 쪼개진다 — "MCU는 바이너리" 교훈
    expect(big.frames.length).toBeGreaterThan(5);
    expect(big.frames.every((f) => f.bytes <= 8)).toBe(true);
    expect(big.topic).toMatch(/^0x18FF/);
    expect(big.qos).toContain("at_most_once");
  });
  it("종단 ACK 없음 → 재시도 0", () => {
    expect(new CanModel(P("CAN")).maxRetries()).toBe(0);
  });
});

describe("ROS2/DDS model (VPU·ACU·LPU)", () => {
  it("RELIABLE vs BEST_EFFORT 를 ack 로 가른다", () => {
    const reliable = new Ros2Model(P("ROS2", "at_least_once"));
    const best = new Ros2Model(P("ROS2", "at_most_once"));
    expect(reliable.encode(sig("a", 1)).qos).toContain("RELIABLE");
    expect(best.encode(sig("a", 1)).qos).toContain("BEST_EFFORT");
    expect(reliable.lossProb()).toBe(0);
    expect(best.lossProb()).toBeGreaterThan(0);
    expect(reliable.encode(sig("localization.pose.x", 1)).topic).toMatch(/^rt\//);
  });
});

describe("MQTT model (Telemetry → cloud)", () => {
  it("QoS0 만 손실 허용, LTE 지연은 크다", () => {
    const q0 = new MqttModel(P("MQTT", "at_most_once"));
    const q1 = new MqttModel(P("MQTT", "at_least_once"));
    expect(q0.encode(sig("a", 1)).qos).toBe("QoS0");
    expect(q1.encode(sig("a", 1)).qos).toBe("QoS1");
    expect(q0.lossProb()).toBeGreaterThan(0);
    expect(q1.lossProb()).toBe(0);
    // LTE 지연 35ms+ — CAN(<1ms)과 자릿수 다름
    expect(q0.latencyMs(100, () => 0.5)).toBeGreaterThan(30);
  });
});

describe("ProfiledTransport — 손실/지연/트레이스", () => {
  it("결정성 rng 로 at_most_once 손실을 재현하고 트레이스를 낸다", () => {
    const traces: TransportTrace[] = [];
    const { nodeEnd, agentEnd } = createLoopbackPair();
    const received: WireMsg[] = [];
    agentEnd.subscribe((m) => received.push(m));
    // rng=0 → 항상 loss(<lossProb) 트리거, CAN maxRetries=0 → 손실 확정
    const tx = new ProfiledTransport(nodeEnd, P("CAN"), {
      rng: () => 0,
      clock: () => 1,
      defer: (fn) => fn(), // 즉시
      onTrace: (t) => traces.push(t),
    });
    tx.send(sig("machine.motion.speed", 1.2));
    expect(traces).toHaveLength(1);
    expect(traces[0]!.delivered).toBe(false); // 손실 확정
    expect(received).toHaveLength(0); // Agent 미수신(충실한 손실)
    expect(traces[0]!.transport).toBe("CAN");
    expect(traces[0]!.frames).toBeGreaterThan(1);
  });

  it("무손실 매체(WS reliable)는 전달되고 inner 로 흐른다", () => {
    const { nodeEnd, agentEnd } = createLoopbackPair();
    const received: WireMsg[] = [];
    agentEnd.subscribe((m) => received.push(m));
    const tx = new ProfiledTransport(nodeEnd, P("ROS2", "at_least_once"), {
      rng: () => 0.99,
      defer: (fn) => fn(),
    });
    tx.send(sig("crop.growth.lai", 3.1));
    expect(received).toHaveLength(1);
    expect((received[0] as Extract<WireMsg, { t: "signal" }>).s.channel).toBe("crop.growth.lai");
  });
});
