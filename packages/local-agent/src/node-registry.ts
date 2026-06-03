import type { NodeAdapter } from "@station/contracts/runtime";

export interface RegisteredNode {
  readonly adapter: NodeAdapter;
  /** 노드 kind ("MCU"·"VPU"…) — CommandEnvelope.target.node 와 매칭되는 키. */
  readonly node: string;
  healthy: boolean;
}

/**
 * Step2 — NodeRegistry + Health. 등록된 NodeAdapter를 node-kind로 색인하고
 * liveness(healthy)를 추적한다. CommandRouter의 게이트가 이 상태를 참조한다.
 */
export class NodeRegistry {
  #byNode = new Map<string, RegisteredNode>();

  register(adapter: NodeAdapter, node: string): RegisteredNode {
    const rn: RegisteredNode = { adapter, node, healthy: false };
    this.#byNode.set(node, rn);
    return rn;
  }

  get(node: string): RegisteredNode | undefined {
    return this.#byNode.get(node);
  }

  setHealthy(node: string, healthy: boolean): void {
    const rn = this.#byNode.get(node);
    if (rn) rn.healthy = healthy;
  }

  nodes(): RegisteredNode[] {
    return [...this.#byNode.values()];
  }
}
