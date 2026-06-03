import { NodeHost, WsNodeTransport } from "@station/node-kit";
import { AcuSource } from "./src/index";

const URL = process.env.HUB ?? "ws://localhost:7100";
const host = new NodeHost(new AcuSource(), new WsNodeTransport(URL));
await host.start();
console.log(`[acu] NODE-ACU-META connected → ${URL}`);
process.on("SIGINT", () => void host.stop().then(() => process.exit(0)));
