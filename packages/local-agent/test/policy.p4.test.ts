import { McuSource } from "@station/node-mcu";
import { AcuSource } from "@station/node-acu";
import type { CommandEnvelope, PolicyRule } from "@station/contracts";
import workerSafety from "@station/contracts/profiles/policy/policy.worker-safety.json" with { type: "json" };
import estopMotion from "@station/contracts/profiles/policy/policy.estop-motion.json" with { type: "json" };
import lowbattConfirm from "@station/contracts/profiles/policy/policy.lowbatt-confirm.json" with { type: "json" };
import mcuSuite from "@station/contracts/profiles/conformance/conformance.mcu.json" with { type: "json" };
import acuSuite from "@station/contracts/profiles/conformance/conformance.acu.json" with { type: "json" };
import type { ConformanceSuite } from "@station/contracts";
import { PolicyEngine, runConformance } from "../src/index";
import { describe, expect, it } from "vitest";

const RULES = [workerSafety, estopMotion, lowbattConfirm] as PolicyRule[];
const cmd = (verb: string, args?: Record<string, unknown>): CommandEnvelope =>
  ({ commandId: `C-${verb}`, verb, target: { node: "ACU" }, issuedBy: { role: "operator" }, issuedAt: "t", args }) as CommandEnvelope;

describe("P4 — PolicyEngine", () => {
  it("worker_detected → autonomy.mission.start 차단", () => {
    const ctx: Record<string, number | boolean> = { "machine.vision.worker_detected": false };
    const pe = new PolicyEngine(RULES, (ch) => ctx[ch]);
    expect(pe.evaluate(cmd("autonomy.mission.start"))).toBeUndefined(); // 미감지 → 통과
    ctx["machine.vision.worker_detected"] = true;
    const v = pe.evaluate(cmd("autonomy.mission.start"));
    expect(v?.severity).toBe("blocked");
    expect(v?.gate).toBe("G-Safety");
  });

  it("estop 래치 → motion.set_speed_limit 차단", () => {
    const pe = new PolicyEngine(RULES, (ch) => (ch === "machine.safety.estop" ? true : undefined));
    expect(pe.evaluate(cmd("motion.set_speed_limit"))?.severity).toBe("blocked");
  });

  it("저전압 → confirm_required, __confirmed 면 통과", () => {
    const pe = new PolicyEngine(RULES, (ch) => (ch === "machine.power.battery_voltage" ? 21.0 : undefined));
    expect(pe.evaluate(cmd("autonomy.mission.start"))?.severity).toBe("confirm_required");
    expect(pe.evaluate(cmd("autonomy.mission.start", { __confirmed: true }))).toBeUndefined(); // 확인됨
  });
});

describe("P4 — Conformance 러너", () => {
  it("MCU/ACU 가 선언 신호·verb 를 충족(pass)", async () => {
    const mcu = await runConformance(new McuSource(), mcuSuite as ConformanceSuite);
    expect(mcu.pass).toBe(true);
    expect(mcu.checks.find((c) => c.name === "machine.heartbeat.mcu")?.pass).toBe(true);
    expect(mcu.checks.find((c) => c.name === "motion.stop")?.pass).toBe(true);

    const acu = await runConformance(new AcuSource(), acuSuite as ConformanceSuite);
    expect(acu.pass).toBe(true);
  });

  it("선언과 다른 스위트(없는 신호 기대)는 fail 검출", async () => {
    const bad: ConformanceSuite = { id: "TS-BAD", node: "MCU", expectSignals: ["machine.nonexistent.signal"], expectCommands: [], windowMs: 300 };
    const r = await runConformance(new McuSource(), bad);
    expect(r.pass).toBe(false);
  });
});
