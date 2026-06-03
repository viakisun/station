import type { NodeTransport, WireMsg } from "./transport";

/** in-process 양끝 전송 — 결정성 테스트용. 한쪽 send가 상대편 구독자에 즉시 전달. */
class LoopbackEnd implements NodeTransport {
  #subs = new Set<(m: WireMsg) => void>();
  #closeSubs = new Set<() => void>();
  peer!: LoopbackEnd;

  send(msg: WireMsg): void {
    for (const cb of this.peer.#subs) cb(msg);
  }
  subscribe(cb: (m: WireMsg) => void): () => void {
    this.#subs.add(cb);
    return () => this.#subs.delete(cb);
  }
  async start(): Promise<void> {}
  async stop(): Promise<void> {
    for (const cb of this.#closeSubs) cb();
  }
  onClose(cb: () => void): () => void {
    this.#closeSubs.add(cb);
    return () => this.#closeSubs.delete(cb);
  }
}

export function createLoopbackPair(): { nodeEnd: NodeTransport; agentEnd: NodeTransport } {
  const a = new LoopbackEnd();
  const b = new LoopbackEnd();
  a.peer = b;
  b.peer = a;
  return { nodeEnd: a, agentEnd: b };
}
