import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { CommandEnvelope } from "@station/contracts";
import { createLoopbackPair, NodeHost, type MockSource } from "@station/node-kit";
import { McuSource } from "@station/node-mcu";
import { VpuSource } from "@station/node-vpu";
import { LpuSource } from "@station/node-lpu";
import { AcuSource } from "@station/node-acu";
import { createLocalAgent, serveTransport } from "../src/index";

const now = (): string => new Date().toISOString();
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

describe("M2 — multi-node over Loopback transport", () => {
  const agent = createLocalAgent();
  const hosts: NodeHost[] = [];

  beforeAll(async () => {
    await agent.start(); // 허브 먼저 기동 → 노드는 동적 합류
    const sources: MockSource[] = [new McuSource(), new VpuSource(), new LpuSource(), new AcuSource()];
    for (const source of sources) {
      const { nodeEnd, agentEnd } = createLoopbackPair();
      serveTransport(agent, agentEnd); // hello → 자동 register
      const host = new NodeHost(source, nodeEnd);
      hosts.push(host);
      await host.start();
    }
    await sleep(280); // VPU 200ms 주기 ≥ 1회 보장
  });
  afterAll(async () => {
    for (const h of hosts) await h.stop();
    await agent.stop();
  });

  it("4 노드 신호가 모두 SignalStore에 흡수된다", () => {
    expect(agent.signals.latest("machine.motion.speed")).toBeDefined();
    expect(agent.signals.latest("machine.vision.fps")).toBeDefined();
    expect(agent.signals.latest("machine.localization.confidence")).toBeDefined();
    expect(agent.signals.latest("machine.navigation.deviation")).toBeDefined();
    expect(agent.signals.channels().length).toBeGreaterThanOrEqual(4);
    expect(agent.manifests().length).toBe(4);
  });

  it("motion.stop이 전송 왕복으로 received→accepted→executed", async () => {
    const stages: string[] = [];
    const cmd: CommandEnvelope = {
      commandId: "CMD-M2-1",
      verb: "motion.stop",
      target: { node: "MCU" },
      issuedBy: { role: "operator" },
      issuedAt: now(),
      safety: "safety_critical",
    };
    await agent.commands.dispatch(cmd, (a) => stages.push(a.stage));
    await sleep(80);
    expect(stages).toEqual(["received", "accepted", "executed"]);
    expect(agent.signals.latest("machine.motion.speed")?.value).toBe(0);
  });

  it("미등록 노드(Telemetry)는 received→rejected", async () => {
    const stages: string[] = [];
    await agent.commands.dispatch(
      {
        commandId: "CMD-M2-2",
        verb: "telemetry.uplink.flush",
        target: { node: "Telemetry" },
        issuedBy: { role: "system" },
        issuedAt: now(),
      },
      (a) => stages.push(a.stage),
    );
    await sleep(20);
    expect(stages).toEqual(["received", "rejected"]);
  });
});
