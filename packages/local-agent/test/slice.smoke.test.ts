import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { CommandAck, CommandEnvelope, Node } from "@station/contracts";
import { checkNodeConformance, createLocalAgent, MockMcuNode } from "../src/index";

const now = (): string => new Date().toISOString();
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

describe("M1 vertical slice — Reference Local Agent", () => {
  const agent = createLocalAgent();

  beforeAll(async () => {
    agent.register(new MockMcuNode());
    await agent.start();
  });
  afterAll(async () => {
    await agent.stop();
  });

  it("Signal up: MCU 신호가 SignalStore에 흡수된다", async () => {
    await sleep(120);
    const s = agent.signals.latest("machine.motion.speed");
    expect(s).toBeDefined();
    expect(s?.channel).toBe("machine.motion.speed");
    expect(typeof s?.value).toBe("number");
    console.log("SIG", s?.channel, s?.value, s?.quality);
  });

  it("Command/ACK down: motion.stop → received→accepted→executed", async () => {
    const stages: string[] = [];
    const cmd: CommandEnvelope = {
      commandId: "CMD-DEMO-1",
      verb: "motion.stop",
      target: { node: "MCU" },
      issuedBy: { role: "operator" },
      issuedAt: now(),
      ack: "at_least_once",
      safety: "safety_critical",
    };
    await agent.commands.dispatch(cmd, (a: CommandAck) => {
      stages.push(a.stage);
      console.log("ACK", a.stage, a.detail ?? a.code ?? "");
    });
    await sleep(50);
    expect(stages).toEqual(["received", "accepted", "executed"]);
    expect(agent.signals.latest("machine.motion.speed")?.value).toBe(0);
  });

  it("Gate reject: 미등록 노드는 received→rejected", async () => {
    const stages: string[] = [];
    const cmd: CommandEnvelope = {
      commandId: "CMD-DEMO-2",
      verb: "vision.capture.start",
      target: { node: "VPU" },
      issuedBy: { role: "operator" },
      issuedAt: now(),
    };
    await agent.commands.dispatch(cmd, (a) => stages.push(a.stage));
    await sleep(20);
    expect(stages).toEqual(["received", "rejected"]);
  });

  it("Conformance: node.mcu.age.json protocolRef가 Annex E 불일치", () => {
    const p = fileURLToPath(new URL("../../contracts/examples/node.mcu.age.json", import.meta.url));
    const node = JSON.parse(readFileSync(p, "utf8")) as Node;
    const issues = checkNodeConformance(node);
    const proto = issues.filter((i) => i.kind === "protocol");
    expect(proto).toHaveLength(1);
    console.log("CONFORMANCE", proto[0]?.detail);
  });
});
