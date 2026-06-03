import type { CommandAck, CommandEnvelope, Event, ModuleManifest, Signal } from "@station/contracts";
import type { NodeTransport, WireMsg } from "./transport";

export interface SourceContext {
  emitSignal(s: Signal): void;
  emitEvent(e: Event): void;
  emitAck(a: CommandAck): void;
}

/**
 * MockSource — 노드의 동작/데이터(전송과 분리). 후속에 Real*(RealCanSource 등)로 스왑.
 */
export interface MockSource {
  readonly manifest: ModuleManifest;
  start(ctx: SourceContext): void | Promise<void>;
  stop(): void | Promise<void>;
  onCommand(cmd: CommandEnvelope, ctx: SourceContext): void | Promise<void>;
}

/**
 * NodeHost — 노드측 런너. MockSource를 NodeTransport 위에서 구동한다.
 * start: 전송 연결 → 명령 구독 → hello(매니페스트 announce) → source.start.
 */
export class NodeHost {
  #unsub: (() => void) | undefined;

  constructor(
    private readonly source: MockSource,
    private readonly transport: NodeTransport,
  ) {}

  async start(): Promise<void> {
    await this.transport.start();
    const ctx: SourceContext = {
      emitSignal: (s) => this.transport.send({ t: "signal", s }),
      emitEvent: (e) => this.transport.send({ t: "event", e }),
      emitAck: (a) => this.transport.send({ t: "ack", a }),
    };
    this.#unsub = this.transport.subscribe((m: WireMsg) => {
      if (m.t === "command") void this.source.onCommand(m.c, ctx);
    });
    this.transport.send({ t: "hello", manifest: this.source.manifest });
    await this.source.start(ctx);
  }

  async stop(): Promise<void> {
    this.#unsub?.();
    await this.source.stop();
    await this.transport.stop();
  }
}
