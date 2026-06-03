// Local Agent app (로컬/엣지 상주) — 노드 흡수 + growth-scan + HMI 옵저버 면 노출.
// 실행: pnpm --filter @station/local-agent start:agent
// 원격 웹(Ops 콘솔)은 ws://localhost:7101 (HMI uplink)로 접속해 모니터링·명령한다.
import { createLoopbackPair, NodeHost, type MockSource } from "@station/node-kit";
import { McuSource } from "@station/node-mcu";
import { VpuSource } from "@station/node-vpu";
import { LpuSource } from "@station/node-lpu";
import { AcuSource } from "@station/node-acu";
import { AppRuntime, createLocalAgent, serveTransport, WsHub, HmiHub } from "./src/index";

const NODE_PORT = Number(process.env.NODE_WS_PORT ?? 7100); // 노드 합류(WsHub)
const HMI_PORT = Number(process.env.HMI_WS_PORT ?? 7101); // HMI/관제 옵저버(HmiHub)

const agent = createLocalAgent({ calibrations: ["CAL-VPU-NIR", "CAL-VPU-RGB"] });
agent.events.subscribe({}, (e) => console.log(`[agent] EVT ${e.severity} ${e.code} — ${e.message}`));
await agent.start();

// mock 노드 in-process 합류(데모) — 후속에 Real* 또는 WsHub(7100) 원격 노드로 교체.
const hosts: NodeHost[] = [];
for (const source of [new McuSource(), new VpuSource(), new LpuSource(), new AcuSource()] as MockSource[]) {
  const { nodeEnd, agentEnd } = createLoopbackPair();
  serveTransport(agent, agentEnd);
  const host = new NodeHost(source, nodeEnd);
  hosts.push(host);
  await host.start();
}
await new Promise((r) => setTimeout(r, 150));

const appIds = AppRuntime.deriveRequiredApps(agent.manifests());
await agent.apps.deriveAndLoad(appIds);
console.log(`[agent] apps: ${appIds.map((a) => `${a}=${agent.apps.state(a)}`).join(", ")}`);

// 노드-facing 허브(원격 노드 합류용) + HMI-facing 옵저버 허브(원격 웹 모니터링용).
const wsHub = new WsHub(agent, NODE_PORT);
const nodePort = await wsHub.start();
const hmiHub = new HmiHub(agent, HMI_PORT);
const hmiPort = await hmiHub.start();

console.log(`[agent] Local Agent app (NODE-AGENT-VIA) up`);
console.log(`[agent]  · nodes(WsHub)  ws://localhost:${nodePort}`);
console.log(`[agent]  · hmi(HmiHub)   ws://localhost:${hmiPort}   ← 웹 콘솔 접속`);
console.log(`[agent]  · ${agent.manifests().length} nodes · growth-scan ${agent.apps.state("station.app.growth-scan")}`);

// 1Hz 스냅샷.
setInterval(() => {
  const chans = agent.signals.channels();
  console.log(`[agent] ${chans.length} ch live`);
}, 5000);
