import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { CommandAck, CommandEnvelope } from "@station/contracts";
import { isId } from "@station/contracts";
import { createLoopbackPair, NodeHost, type MockSource } from "@station/node-kit";
import { VpuSource } from "@station/node-vpu";
import { LpuSource } from "@station/node-lpu";
import { AcuSource } from "@station/node-acu";
import { AppRuntime, createLocalAgent, serveTransport, type ReferenceLocalAgent } from "../src/index";

const now = (): string => new Date().toISOString();
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const APP = "station.app.growth-scan";
const CAL = ["CAL-VPU-NIR", "CAL-VPU-RGB"];

/** VPU+LPU+ACU 를 loopback 으로 붙인 agent 부팅(M2 스타일). */
async function bootAgent(agent: ReferenceLocalAgent, hosts: NodeHost[]): Promise<void> {
  await agent.start();
  const sources: MockSource[] = [new VpuSource(), new LpuSource(), new AcuSource()];
  for (const source of sources) {
    const { nodeEnd, agentEnd } = createLoopbackPair();
    serveTransport(agent, agentEnd);
    const host = new NodeHost(source, nodeEnd);
    hosts.push(host);
    await host.start();
  }
  await sleep(120); // 노드 hello → register → healthy 안정.
}

function scanStart(commandId: string): CommandEnvelope {
  return {
    commandId,
    verb: "scan.start",
    target: { node: "AGENT" }, // 앱 호스트 명령 관례
    issuedBy: { role: "operator" },
    issuedAt: now(),
  };
}

describe("M3 — App Runtime: derive→active + scan vertical slice (CAL 충족)", () => {
  const agent = createLocalAgent({ calibrations: CAL });
  const hosts: NodeHost[] = [];

  beforeAll(async () => {
    await bootAgent(agent, hosts);
    // VPU.requiredApps → growth-scan derive → load.
    const appIds = AppRuntime.deriveRequiredApps(agent.manifests());
    await agent.apps.deriveAndLoad(appIds);
  });
  afterAll(async () => {
    for (const h of hosts) await h.stop();
    await agent.stop();
  });

  it("VPU.requiredApps 가 growth-scan 으로 derive 된다", () => {
    expect(AppRuntime.deriveRequiredApps(agent.manifests())).toContain(APP);
  });

  it("로드 파이프라인 종착 = active (CAL 충족)", () => {
    expect(agent.apps.state(APP)).toBe("active");
  });

  it("scan.start → received→accepted→executed · SCN 오픈", async () => {
    const stages: string[] = [];
    let detail: string | undefined;
    await agent.commands.dispatch(scanStart("CMD-SCAN-1"), (a: CommandAck) => {
      stages.push(a.stage);
      if (a.stage === "executed") detail = a.detail;
    });
    await sleep(40);
    expect(stages).toEqual(["received", "accepted", "executed"]);
    expect(detail && isId("scanSession", detail)).toBe(true);
    console.log("SCAN open", detail);
  });

  it("VPU crop 흐름 → ObservationStore 에 OBS-* 합성(pose⊕crop⊕state)", async () => {
    await sleep(360); // ndvi(120ms 주기) 다수 프레임.
    const obs = agent.observations.latest();
    expect(obs).toBeDefined();
    expect(isId("observation", obs!.observationId)).toBe(true);
    expect(isId("scanSession", obs!.scanSessionId)).toBe(true);
    expect(typeof obs!.crop.ndvi).toBe("number");
    expect(obs!.pose).toBeDefined(); // LPU pose 결합
    expect(obs!.quality).toBe("good"); // autonomy running ⊕ good signal
    console.log("OBS", obs!.observationId, "crop.ndvi=", obs!.crop.ndvi, "pose=", obs!.pose);
  });

  it("앱 dispatch 도 evaluateGate 경유(앱 active 게이트 pass)", () => {
    const gate = agent.commands.evaluateGate(scanStart("CMD-GATE-CHECK"));
    expect(gate.severity).toBe("pass");
    expect(gate.gate).toContain("G-App");
  });
});

describe("M3 — gate_blocked (CAL 누락)", () => {
  const agent = createLocalAgent(); // calibrations 비움
  const hosts: NodeHost[] = [];

  beforeAll(async () => {
    await bootAgent(agent, hosts);
    await agent.apps.deriveAndLoad([APP]);
  });
  afterAll(async () => {
    for (const h of hosts) await h.stop();
    await agent.stop();
  });

  it("보정 누락 → 종착 = gate_blocked", () => {
    expect(agent.apps.state(APP)).toBe("gate_blocked");
  });

  it("gate_blocked 앱의 scan.start → received→rejected", async () => {
    const stages: string[] = [];
    await agent.commands.dispatch(scanStart("CMD-BLOCKED-1"), (a) => stages.push(a.stage));
    await sleep(20);
    expect(stages).toEqual(["received", "rejected"]);
  });
});

describe("M3 — 의존 노드 게이트 + 모듈 교체(unload) + 미등록 verb", () => {
  const agent = createLocalAgent({ calibrations: CAL });
  const hosts: NodeHost[] = [];

  beforeAll(async () => {
    await bootAgent(agent, hosts);
    await agent.apps.deriveAndLoad([APP]);
  });
  afterAll(async () => {
    for (const h of hosts) await h.stop();
    await agent.stop();
  });

  it("VPU unhealthy → scan.start 가 의존 게이트로 차단(received→accepted→rejected)", async () => {
    agent.markNodeUnhealthy("VPU");
    const stages: string[] = [];
    await agent.commands.dispatch(scanStart("CMD-DEP-1"), (a) => stages.push(a.stage));
    await sleep(40);
    expect(stages).toEqual(["received", "accepted", "rejected"]);
    agent.markNodeUnhealthy("VPU"); // 원복 불필요(이 describe 종료) — 명시만.
  });

  it("모듈 교체 증명: unload → scan.* deregister → scan.start rejected(verb 없음)", async () => {
    await agent.apps.unload(APP);
    expect(agent.apps.state(APP)).toBe("unloaded");
    const stages: string[] = [];
    await agent.commands.dispatch(scanStart("CMD-UNLOAD-1"), (a) => stages.push(a.stage));
    await sleep(20);
    expect(stages).toEqual(["received", "rejected"]); // catalog 미보유 → 노드 경로 → AGENT 미등록
  });

  it("미등록 앱 verb → rejected", async () => {
    const stages: string[] = [];
    await agent.commands.dispatch(
      {
        commandId: "CMD-UNKNOWN-1",
        verb: "thin.start",
        target: { node: "AGENT" },
        issuedBy: { role: "operator" },
        issuedAt: now(),
      },
      (a) => stages.push(a.stage),
    );
    await sleep(20);
    expect(stages).toEqual(["received", "rejected"]);
  });
});
