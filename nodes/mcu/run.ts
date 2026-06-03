// nodes/mcu 런너 — NodeHost + WsNodeTransport 로 허브에 접속.
// 실행: pnpm --filter @station/node-mcu start
import { NodeHost, WsNodeTransport } from "@station/node-kit";
import { McuSource } from "./src/index";

const URL = process.env.HUB ?? "ws://localhost:7100";
const host = new NodeHost(new McuSource(), new WsNodeTransport(URL));
await host.start();
console.log(`[mcu] NODE-MCU-AGE connected → ${URL}`);
process.on("SIGINT", () => void host.stop().then(() => process.exit(0)));
