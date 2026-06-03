// M3 데모 — App Runtime + growth-scan 수직 슬라이스(인프로세스 loopback).
// 실행: pnpm --filter @station/local-agent start:scan   (tsx run-scan.ts)
// 흐름: 노드 register → growth-scan active → scan.start → ObservationStore OBS-* 콘솔 출력.
import { createLoopbackPair, NodeHost, type MockSource } from "@station/node-kit";
import { VpuSource } from "@station/node-vpu";
import { LpuSource } from "@station/node-lpu";
import { AcuSource } from "@station/node-acu";
import { AppRuntime, createLocalAgent, serveTransport } from "./src/index";

const now = (): string => new Date().toISOString();
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const agent = createLocalAgent({ calibrations: ["CAL-VPU-NIR", "CAL-VPU-RGB"] });
agent.events.subscribe({}, (e) => console.log(`[evt] ${e.severity} ${e.code} — ${e.message}`));
agent.observations.subscribe((o) =>
  console.log(`[OBS] ${o.observationId} ndvi=${o.crop.ndvi} h=${o.crop.plant_height} pose=${JSON.stringify(o.pose)} q=${o.quality}`),
);

await agent.start();

// 노드 합류(VPU·LPU·ACU) — loopback 전송.
const hosts: NodeHost[] = [];
for (const source of [new VpuSource(), new LpuSource(), new AcuSource()] as MockSource[]) {
  const { nodeEnd, agentEnd } = createLoopbackPair();
  serveTransport(agent, agentEnd);
  const host = new NodeHost(source, nodeEnd);
  hosts.push(host);
  await host.start();
}
await sleep(150);

// 모듈/노드 requiredApps → growth-scan derive → 로드.
const appIds = AppRuntime.deriveRequiredApps(agent.manifests());
console.log(`[run] derived apps: ${appIds.join(", ")}`);
await agent.apps.deriveAndLoad(appIds);
console.log(`[run] station.app.growth-scan state = ${agent.apps.state("station.app.growth-scan")}`);

// scan.start → ACU 미션 + VPU capture + OBS 합성.
await agent.commands.dispatch(
  {
    commandId: "CMD-SCAN-DEMO",
    verb: "scan.start",
    target: { node: "AGENT" },
    issuedBy: { role: "operator" },
    issuedAt: now(),
  },
  (a) => console.log(`[ack] scan.start ${a.stage} ${a.detail ?? a.code ?? ""}`),
);

await sleep(600); // 몇 프레임의 OBS 합성.

await agent.commands.dispatch(
  {
    commandId: "CMD-SCAN-DEMO-STOP",
    verb: "scan.stop",
    target: { node: "AGENT" },
    issuedBy: { role: "operator" },
    issuedAt: now(),
  },
  (a) => console.log(`[ack] scan.stop ${a.stage}`),
);

await sleep(50);
const scn = agent.observations.latest()?.scanSessionId;
console.log(`[run] done — ${scn ? agent.observations.bySession(scn).length : 0} observations for ${scn}`);

for (const h of hosts) await h.stop();
await agent.stop();
process.exit(0);
