import { NodeHost, WsNodeTransport } from "@station/node-kit";
import { LpuSource } from "./src/index";

const URL = process.env.HUB ?? "ws://localhost:7100";
const host = new NodeHost(new LpuSource(), new WsNodeTransport(URL));
await host.start();
console.log(`[lpu] NODE-LPU-DAEDONG connected → ${URL}`);
process.on("SIGINT", () => void host.stop().then(() => process.exit(0)));
