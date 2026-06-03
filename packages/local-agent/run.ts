// 데모 진입점 — Reference Local Agent + WsHub 부팅(상주 허브).
// 실행: pnpm --filter @station/local-agent start   (tsx run.ts)
// 노드: pnpm --filter @station/node-mcu start  …   (별 터미널)
import { createLocalAgent, WsHub } from "./src/index";

const PORT = Number(process.env.PORT ?? 7100);

const agent = createLocalAgent();
agent.events.subscribe({}, (e) => console.log(`[agent] EVT ${e.severity} ${e.code} ${e.message}`));
await agent.start();

const hub = new WsHub(agent, PORT);
const port = await hub.start();
console.log(`[agent] Local Agent (NODE-AGENT-VIA) + WsHub on ws://localhost:${port}`);

// 1Hz 스냅샷 — 합류한 노드들의 최신 신호.
setInterval(() => {
  const chans = agent.signals.channels();
  const view = chans.map((c) => `${c.channel}=${agent.signals.latest(c.channel)?.value}`).join("  ");
  console.log(`[agent] ${chans.length} ch · ${view || "(no nodes yet)"}`);
}, 1000);
