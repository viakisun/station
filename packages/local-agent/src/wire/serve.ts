import type { NodeTransport, WireMsg } from "@station/node-kit";
import type { ReferenceLocalAgent } from "../local-agent";
import { TransportNodeAdapter } from "./transport-adapter";

/**
 * 한 전송 연결을 Agent에 서비스. 노드가 hello(매니페스트)를 보내면
 * TransportNodeAdapter를 만들어 register(동적 디스커버리). 연결 종료 시 unhealthy.
 */
export function serveTransport(agent: ReferenceLocalAgent, transport: NodeTransport): void {
  let node: string | undefined;
  const unsub = transport.subscribe((m: WireMsg) => {
    if (m.t === "hello" && node === undefined) {
      node = m.manifest.attachesToNode;
      agent.register(new TransportNodeAdapter(m.manifest, transport));
    }
  });
  transport.onClose(() => {
    unsub();
    if (node) agent.markNodeUnhealthy(node);
  });
}
