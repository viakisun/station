import type { ModuleManifest } from "@station/contracts";
import type {
  CommandRouter,
  EventBus,
  LocalAgent,
  NodeAdapter,
  SignalStore,
} from "@station/contracts/runtime";
import { InMemorySignalStore } from "./signal-store";
import { InMemoryEventBus } from "./event-bus";
import { NodeRegistry } from "./node-registry";
import { GatedCommandRouter } from "./command-router";

/**
 * Reference Local Agent (ADR-015) — 허브.
 * 노드(NodeAdapter)를 흡수해 표준 Signal/Event/Command 면을 노출한다.
 * register 시 노드의 Signal→SignalStore, Event→EventBus, Ack→CommandRouter 로 연결.
 */
export class ReferenceLocalAgent implements LocalAgent {
  readonly signals: SignalStore = new InMemorySignalStore();
  readonly events: EventBus = new InMemoryEventBus();
  readonly #registry = new NodeRegistry();
  readonly #router = new GatedCommandRouter(this.#registry);
  readonly commands: CommandRouter = this.#router;

  #adapters: NodeAdapter[] = [];
  #unsub: Array<() => void> = [];

  register(adapter: NodeAdapter): void {
    const node = adapter.manifest.attachesToNode; // M1: 노드 kind 식별자
    this.#registry.register(adapter, node);
    this.#adapters.push(adapter);
    this.#unsub.push(adapter.onSignal((s) => this.signals.write(s)));
    this.#unsub.push(adapter.onEvent((e) => this.events.publish(e)));
    this.#unsub.push(adapter.onAck((a) => this.#router.routeAck(a)));
  }

  manifests(): ModuleManifest[] {
    return this.#adapters.map((a) => a.manifest);
  }

  async start(): Promise<void> {
    for (const a of this.#adapters) {
      await a.start();
      this.#registry.setHealthy(a.manifest.attachesToNode, true);
    }
  }

  async stop(): Promise<void> {
    for (const u of this.#unsub) u();
    this.#unsub = [];
    for (const a of this.#adapters) {
      await a.stop();
      this.#registry.setHealthy(a.manifest.attachesToNode, false);
    }
  }
}

export function createLocalAgent(): ReferenceLocalAgent {
  return new ReferenceLocalAgent();
}
