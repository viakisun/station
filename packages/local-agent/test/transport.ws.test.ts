import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { CommandEnvelope } from "@station/contracts";
import { NodeHost, WsNodeTransport } from "@station/node-kit";
import { McuSource } from "@station/node-mcu";
import { VpuSource } from "@station/node-vpu";
import { createLocalAgent, WsHub } from "../src/index";

const now = (): string => new Date().toISOString();
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

describe("M2 — multi-node over real WebSocket", () => {
  const agent = createLocalAgent();
  let hub: WsHub;
  const hosts: NodeHost[] = [];

  beforeAll(async () => {
    await agent.start();
    hub = new WsHub(agent, 0); // ephemeral port
    const port = await hub.start();
    const url = `ws://localhost:${port}`;
    for (const source of [new McuSource(), new VpuSource()]) {
      const host = new NodeHost(source, new WsNodeTransport(url));
      hosts.push(host);
      await host.start();
    }
    await sleep(250);
  });
  afterAll(async () => {
    for (const h of hosts) await h.stop();
    await hub.stop();
    await agent.stop();
  });

  it("실 WS로 두 노드 신호가 도착한다", () => {
    expect(agent.signals.latest("machine.motion.speed")).toBeDefined();
    expect(agent.signals.latest("machine.vision.fps")).toBeDefined();
    expect(agent.manifests().length).toBe(2);
  });

  it("실 WS로 명령이 왕복하고 executed 된다", async () => {
    const stages: string[] = [];
    const cmd: CommandEnvelope = {
      commandId: "CMD-WS-1",
      verb: "motion.stop",
      target: { node: "MCU" },
      issuedBy: { role: "operator" },
      issuedAt: now(),
      safety: "safety_critical",
    };
    await agent.commands.dispatch(cmd, (a) => stages.push(a.stage));
    await sleep(150);
    expect(stages[0]).toBe("received");
    expect(stages).toContain("accepted");
    expect(stages).toContain("executed");
    expect(agent.signals.latest("machine.motion.speed")?.value).toBe(0);
  });
});
