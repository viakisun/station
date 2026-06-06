import { CanModel, Ros2Model, type WireMsg } from "@station/node-kit";
import type { ProtocolProfile, WireBinding } from "@station/contracts";
import mcuWire from "@station/contracts/profiles/wire/wire.mcu.can.json" with { type: "json" };
import lpuWire from "@station/contracts/profiles/wire/wire.lpu.dds.json" with { type: "json" };
import { describe, expect, it } from "vitest";

const sig = (channel: string): WireMsg => ({
  t: "signal",
  s: { channel, value: 1.2, unit: "x", ts: "t", quality: "good", source: { node: "MCU" } },
});
const P = (t: ProtocolProfile["transport"]): ProtocolProfile => ({ id: `PRT-${t}`, transport: t });

describe("P1 — WireBinding 으로 실 프레이밍", () => {
  it("CAN: 바인딩 있으면 선언 frameId + 바이너리 단일 프레임(JSON 수십 프레임 아님)", () => {
    const withBinding = new CanModel(P("CAN"), mcuWire as WireBinding);
    const noBinding = new CanModel(P("CAN"));
    const bound = withBinding.encode(sig("machine.motion.speed"));
    const heuristic = noBinding.encode(sig("machine.motion.speed"));
    expect(bound.topic).toBe("0x18FF5001"); // 선언값
    expect(bound.frames.length).toBe(1); // 2바이트 i16 → 단일 프레임
    expect(heuristic.frames.length).toBeGreaterThan(5); // JSON 폴백은 수십 프레임
  });

  it("DDS: 바인딩 topic 을 따른다", () => {
    const m = new Ros2Model(P("DDS"), lpuWire as WireBinding);
    expect(m.encode(sig("machine.localization.pose")).topic).toBe("rt/localization/pose");
  });
});
