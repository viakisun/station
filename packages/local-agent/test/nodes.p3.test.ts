import { McuSource } from "@station/node-mcu";
import { VpuSource } from "@station/node-vpu";
import { LpuSource } from "@station/node-lpu";
import { AcuSource } from "@station/node-acu";
import type { MockSource, SourceContext } from "@station/node-kit";
import type { CommandEnvelope, Signal } from "@station/contracts";
import { afterEach, describe, expect, it } from "vitest";

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** 신호를 채널별 최신값으로 모으는 ctx. */
function collector() {
  const latest = new Map<string, number | boolean>();
  const acks: string[] = [];
  const ctx: SourceContext = {
    emitSignal: (s: Signal) => latest.set(s.channel, s.value),
    emitEvent: () => {},
    emitAck: (a) => acks.push(`${a.stage}`),
  };
  return { ctx, latest, acks };
}
const cmd = (verb: string, args?: Record<string, number>): CommandEnvelope =>
  ({ commandId: `CMD-${verb}`, verb, target: { node: "X" }, issuedBy: { role: "operator" }, issuedAt: "t", args }) as CommandEnvelope;

let active: MockSource | undefined;
afterEach(() => active?.stop());
const run = async (s: MockSource, c: ReturnType<typeof collector>, ms: number) => {
  active = s;
  await s.start(c.ctx);
  await sleep(ms);
};

describe("P3 — 노드 명령이 거동을 바꾼다", () => {
  it("MCU set_speed_limit 가 속도를 clamp 한다", async () => {
    const c = collector();
    const mcu = new McuSource();
    await run(mcu, c, 400); // cruise 1.2 로 ramp
    void mcu.onCommand(cmd("motion.set_speed_limit", { limit: 0.4 }), c.ctx);
    await sleep(700); // 0.4 로 감속
    expect(Number(c.latest.get("machine.motion.speed"))).toBeLessThanOrEqual(0.45);
    expect(c.acks).toContain("executed");
  });

  it("MCU motion.stop 이 0 으로 감속한다", async () => {
    const c = collector();
    const mcu = new McuSource();
    await run(mcu, c, 400);
    const before = Number(c.latest.get("machine.motion.speed"));
    void mcu.onCommand(cmd("motion.stop"), c.ctx);
    await sleep(300);
    expect(Number(c.latest.get("machine.motion.speed"))).toBeLessThan(before);
  });

  it("ACU mission.start→running, slow_down→mode 변경, pause→paused", async () => {
    const c = collector();
    const acu = new AcuSource();
    await run(acu, c, 150);
    expect(c.latest.get("machine.autonomy.state")).toBe(0); // idle
    void acu.onCommand(cmd("autonomy.mission.start"), c.ctx);
    await sleep(150);
    expect(c.latest.get("machine.autonomy.state")).toBe(1); // running
    void acu.onCommand(cmd("autonomy.slow_down"), c.ctx);
    await sleep(150);
    expect(c.latest.get("machine.autonomy.mode")).toBe(2); // slow
    void acu.onCommand(cmd("autonomy.pause"), c.ctx);
    await sleep(150);
    expect(c.latest.get("machine.autonomy.state")).toBe(2); // paused
  });

  it("LPU relocalize 가 confidence 를 떨어뜨린다", async () => {
    const c = collector();
    const lpu = new LpuSource();
    await run(lpu, c, 200);
    void lpu.onCommand(cmd("localization.relocalize"), c.ctx);
    await sleep(150);
    expect(Number(c.latest.get("machine.localization.confidence"))).toBeLessThan(0.7);
  });

  it("VPU capture.start 가 crop 스캔을 시작한다", async () => {
    const c = collector();
    const vpu = new VpuSource();
    await run(vpu, c, 100);
    expect(c.latest.has("crop.growth.ndvi")).toBe(false);
    void vpu.onCommand(cmd("vision.capture.start"), c.ctx);
    await sleep(300);
    expect(typeof c.latest.get("crop.growth.ndvi")).toBe("number");
  });

  it("모든 노드가 heartbeat 를 emit 한다", async () => {
    for (const [S, ch] of [[McuSource, "machine.heartbeat.mcu"], [VpuSource, "machine.heartbeat.vpu"], [LpuSource, "machine.heartbeat.lpu"], [AcuSource, "machine.heartbeat.acu"]] as const) {
      const c = collector();
      const node = new S();
      await run(node, c, 1100);
      expect(c.latest.get(ch)).toBe(1);
      node.stop();
    }
  });
});
