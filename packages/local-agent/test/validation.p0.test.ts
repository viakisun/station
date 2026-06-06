import { validateCommand, validateManifest } from "@station/contracts/runtime";
import { COMMAND_VERBS } from "@station/contracts";
import type { CommandEnvelope } from "@station/contracts";
import { createLocalAgent } from "../src/index";
import { describe, expect, it } from "vitest";

describe("P0 — verb 레지스트리", () => {
  it("노드/앱 verb 가 무충돌 집계된다", () => {
    expect(COMMAND_VERBS["motion.stop"]).toMatchObject({ provider: "MCU", safety: true });
    expect(COMMAND_VERBS["scan.start"]).toMatchObject({ source: "app", provider: "station.app.growth-scan" });
    expect(COMMAND_VERBS["autonomy.slow_down"]?.safety).toBe(true);
  });
});

describe("P0 — 런타임 Ajv 검증기", () => {
  it("정상/불량 명령을 구분한다", () => {
    const good: CommandEnvelope = {
      commandId: "CMD-1", verb: "motion.stop", target: { node: "MCU" },
      issuedBy: { role: "operator" }, issuedAt: "2026-01-01T00:00:00Z",
    } as CommandEnvelope;
    expect(validateCommand(good).ok).toBe(true);
    expect(validateCommand({ verb: "motion.stop" }).ok).toBe(false); // commandId/target 누락
  });
  it("불량 manifest 를 거른다", () => {
    expect(validateManifest({ moduleType: "mcu" }).ok).toBe(false); // manifestId 등 누락
  });
});

describe("P0 — 주입 검증으로 malformed 명령 거부", () => {
  it("스키마 위반 명령은 SCHEMA-INVALID 로 rejected", async () => {
    const agent = createLocalAgent({ validate: { command: validateCommand, manifest: validateManifest } });
    const acks: string[] = [];
    // target 누락 → 스키마 위반.
    await agent.commands.dispatch({ commandId: "CMD-X", verb: "motion.stop" } as CommandEnvelope, (a) =>
      acks.push(`${a.stage}${a.code ? `:${a.code}` : ""}`),
    );
    expect(acks).toContain("received");
    expect(acks.some((a) => a.startsWith("rejected:SCHEMA-INVALID"))).toBe(true);
    expect(acks).not.toContain("accepted");
  });
});
