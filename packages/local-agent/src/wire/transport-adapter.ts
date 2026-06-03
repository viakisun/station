import type { CommandAck, CommandEnvelope, Event, ModuleManifest, Signal } from "@station/contracts";
import type { NodeAdapter } from "@station/contracts/runtime";
import type { NodeTransport, WireMsg } from "@station/node-kit";

/**
 * 전송 기반 NodeAdapter — Agent측에서 원격 노드를 표준 NodeAdapter로 보이게 한다.
 * M1의 in-process 어댑터와 동일 인터페이스: agent.register(adapter)는 그대로,
 * backing만 in-process → wire(NodeTransport)로 교체(ADR-015 swap).
 */
export class TransportNodeAdapter implements NodeAdapter {
  #sig = new Set<(s: Signal) => void>();
  #evt = new Set<(e: Event) => void>();
  #ack = new Set<(a: CommandAck) => void>();
  #unsub: () => void;

  constructor(
    readonly manifest: ModuleManifest,
    private readonly transport: NodeTransport,
  ) {
    this.#unsub = transport.subscribe((m: WireMsg) => {
      if (m.t === "signal") for (const cb of this.#sig) cb(m.s);
      else if (m.t === "event") for (const cb of this.#evt) cb(m.e);
      else if (m.t === "ack") for (const cb of this.#ack) cb(m.a);
    });
  }

  async start(): Promise<void> {}
  async stop(): Promise<void> {
    this.#unsub();
  }
  onSignal(cb: (s: Signal) => void): () => void {
    this.#sig.add(cb);
    return () => this.#sig.delete(cb);
  }
  onEvent(cb: (e: Event) => void): () => void {
    this.#evt.add(cb);
    return () => this.#evt.delete(cb);
  }
  onAck(cb: (a: CommandAck) => void): () => void {
    this.#ack.add(cb);
    return () => this.#ack.delete(cb);
  }
  async send(cmd: CommandEnvelope): Promise<void> {
    this.transport.send({ t: "command", c: cmd });
  }
}
