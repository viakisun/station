// Reference SDV Rig — 전 노드를 *각자의 실 전송 프로파일*(CAN·ROS2·DDS·MQTT)로
// Local Agent 에 합류시켜 end-to-end 로 돌리는 개발자 레퍼런스 런너.
// 실행: pnpm --filter @station/local-agent start:rig
//   · 노드 텔레메트리/명령이 프로토콜-정확 시뮬을 통과(단편화·QoS·지연·손실)
//   · 1Hz 로 매체별 전송 롤업 표 출력 + growth-scan 폐루프 동작
//   · 웹 콘솔은 ws://localhost:7101(HmiHub)로 접속해 동일 관측
import { createLoopbackPair, NodeHost, ProfiledTransport, type MockSource, type TransportTrace, type WireMsg } from "@station/node-kit";
import { McuSource } from "@station/node-mcu";
import { VpuSource } from "@station/node-vpu";
import { LpuSource } from "@station/node-lpu";
import { AcuSource } from "@station/node-acu";
import { validateCommand, validateManifest } from "@station/contracts/runtime";
import { AppRuntime, createLocalAgent, serveTransport, WsHub, HmiHub } from "./src/index";
import { NODE_PROFILES, TELEMETRY_PROFILE, ALL_PROFILES } from "./src/rig/profiles";
import { TransportMonitor } from "./src/rig/transport-monitor";
import { TraceHub } from "./src/rig/trace-hub";

const NODE_PORT = Number(process.env.NODE_WS_PORT ?? 7100);
const HMI_PORT = Number(process.env.HMI_WS_PORT ?? 7101);
const TRACE_PORT = Number(process.env.TRACE_WS_PORT ?? 7102);

const profileId2node = new Map(Object.entries(NODE_PROFILES).map(([k, p]) => [p.id, k]));
profileId2node.set(TELEMETRY_PROFILE.id, "Telemetry→cloud");
const monitor = new TransportMonitor({ nodeOf: (id) => profileId2node.get(id) ?? id });
const onTrace = (t: TransportTrace): void => monitor.record(t);

const agent = createLocalAgent({
  calibrations: ["CAL-VPU-NIR", "CAL-VPU-RGB"],
  validate: { command: validateCommand, manifest: validateManifest }, // P0 런타임 검증(node 전용)
});
agent.events.subscribe({}, (e) => console.log(`[rig] EVT ${e.severity} ${e.code} — ${e.message}`));
await agent.start();

// 각 노드를 *제 전송 프로파일*로 합류 — loopback 양끝을 ProfiledTransport 로 감싼다.
// node→agent(telemetry/ack/event) 와 agent→node(command) 양방향 모두 매체 모델 통과.
const sources: MockSource[] = [new McuSource(), new VpuSource(), new LpuSource(), new AcuSource()];
const hosts: NodeHost[] = [];
for (const source of sources) {
  const kind = source.manifest.attachesToNode; // MCU·VPU·LPU·ACU
  const profile = NODE_PROFILES[kind];
  if (!profile) throw new Error(`no ProtocolProfile for node ${kind}`);
  const { nodeEnd, agentEnd } = createLoopbackPair();
  const nodeTx = new ProfiledTransport(nodeEnd, profile, { onTrace, dir: "tx" }); // 업링크
  const agentTx = new ProfiledTransport(agentEnd, profile, { onTrace, dir: "rx" }); // 명령 다운링크
  serveTransport(agent, agentTx);
  const host = new NodeHost(source, nodeTx);
  hosts.push(host);
  await host.start();
  console.log(`[rig] node ${kind.padEnd(4)} ↔ ${profile.transport.padEnd(4)} (${profile.id})`);
}
await new Promise((r) => setTimeout(r, 200));

// growth-scan 앱 파생/활성.
const appIds = AppRuntime.deriveRequiredApps(agent.manifests());
await agent.apps.deriveAndLoad(appIds);
console.log(`[rig] apps: ${appIds.map((a) => `${a}=${agent.apps.state(a)}`).join(", ")}`);

// Telemetry(MQTT) 클라우드 업링크 — 흡수된 신호를 1Hz 로 클라우드에 publish(LTE 지연 대비).
const cloud = createLoopbackPair();
cloud.agentEnd.subscribe(() => {}); // 클라우드 싱크(폐기)
const cloudTx = new ProfiledTransport(cloud.nodeEnd, TELEMETRY_PROFILE, { onTrace, dir: "tx" });

// 노드-facing 허브(원격 실노드 합류) + HMI 옵저버 허브.
const wsHub = new WsHub(agent, NODE_PORT);
const nodePort = await wsHub.start().catch((e: Error) => (console.warn(`[rig] WsHub skip: ${e.message}`), -1));
const hmiHub = new HmiHub(agent, HMI_PORT);
const hmiPort = await hmiHub.start().catch((e: Error) => (console.warn(`[rig] HmiHub skip: ${e.message}`), -1));
const traceHub = new TraceHub(monitor, TRACE_PORT);
const tracePort = await traceHub.start().catch((e: Error) => (console.warn(`[rig] TraceHub skip: ${e.message}`), -1));

console.log(`\n[rig] Reference SDV Rig up — ${agent.manifests().length} nodes · growth-scan ${agent.apps.state("station.app.growth-scan")}`);
console.log(`[rig]  · nodes(WsHub)  ws://localhost:${nodePort}   ← 원격 실노드 합류(CAN→ws bridge 등)`);
console.log(`[rig]  · hmi(HmiHub)   ws://localhost:${hmiPort}   ← 웹 콘솔 접속`);
console.log(`[rig]  · trace(TraceHub) ws://localhost:${tracePort} ← Build /transport 시각화`);
console.log(`[rig]  · 전송: MCU=CAN · VPU=ROS2 · LPU=ROS2(best-effort) · ACU=DDS · Telemetry=MQTT/LTE\n`);

// 1Hz: 클라우드 업링크 1건 + 매체별 롤업 표.
const SAMPLE: WireMsg = { t: "signal", s: { channel: "telemetry.cloud_uplink", value: 1, unit: "batch", ts: "", quality: "good", source: { node: "Telemetry" } } };
setInterval(() => {
  cloudTx.send({ ...SAMPLE, s: { ...SAMPLE.s, ts: new Date().toISOString() } } as WireMsg);
  console.log(`\n[rig] transport rollup — t+${process.uptime().toFixed(0)}s`);
  console.log(monitor.table());
}, 1000);

const stop = async (): Promise<void> => {
  for (const h of hosts) await h.stop();
  await agent.stop();
  process.exit(0);
};
process.on("SIGINT", () => void stop());
void ALL_PROFILES; // 프로파일 카탈로그(문서/웹 노출용 export 보존)
