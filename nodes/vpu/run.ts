import { NodeHost, WsNodeTransport } from "@station/node-kit";
import { VpuSource } from "./src/index";

const URL = process.env.HUB ?? "ws://localhost:7100";
const host = new NodeHost(new VpuSource(), new WsNodeTransport(URL));
await host.start();
console.log(`[vpu] NODE-VPU-META connected → ${URL}`);
process.on("SIGINT", () => void host.stop().then(() => process.exit(0)));
