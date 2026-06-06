import type { CommandAck, CommandEnvelope, ModuleManifest } from "@station/contracts";
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
import { InMemoryCommandCatalog, type CommandCatalog } from "./command-catalog";
import { InMemoryObservationStore, type ObservationStore } from "./observation-store";
import { AppRegistry, AppRuntime, type AppContext, type WorkApp } from "./app-runtime";
import { GrowthScanApp } from "./apps/growth-scan";

export type SchemaValidator<T> = (x: T) => { ok: boolean; errors?: string[] };

export interface LocalAgentOptions {
  /** 시드 보정(gating 입력). 비우면 앱이 gate_blocked. */
  calibrations?: Iterable<string>;
  /** AppRegistry 사전 등록(미지정 시 기본 = growth-scan). */
  apps?: Array<{ appId: string; factory: () => WorkApp }>;
  /** (P0) 런타임 스키마 검증 주입 — node 진입점만(브라우저 인프로세스는 미주입해 Ajv 미유입).
      @station/contracts/runtime 의 validateCommand/validateManifest 를 넣는다. */
  validate?: {
    command?: SchemaValidator<CommandEnvelope>;
    manifest?: SchemaValidator<ModuleManifest>;
  };
}

/**
 * Reference Local Agent (ADR-015) — 허브.
 * 노드(NodeAdapter)를 흡수해 표준 Signal/Event/Command 면을 노출한다.
 * register 시 노드의 Signal→SignalStore, Event→EventBus, Ack→CommandRouter 로 연결.
 * M3: observations(ObservationStore) + apps(AppRuntime) 가산. 코어 비파괴 — catalog 미주입 경로 불변.
 */
export class ReferenceLocalAgent implements LocalAgent {
  readonly signals: SignalStore = new InMemorySignalStore();
  readonly events: EventBus = new InMemoryEventBus();
  readonly observations: ObservationStore = new InMemoryObservationStore();
  /** 시드 보정 집합 — 테스트/데모가 주입(CAL-VPU-NIR·RGB). gating 입력. */
  readonly calibrations = new Set<string>();

  readonly #registry = new NodeRegistry();
  readonly #catalog: CommandCatalog = new InMemoryCommandCatalog();
  readonly #router: GatedCommandRouter;
  readonly commands: CommandRouter;
  readonly apps: AppRuntime;

  readonly #validateManifest?: SchemaValidator<ModuleManifest>;

  #adapters: NodeAdapter[] = [];
  #unsub: Array<() => void> = [];
  #started = false;

  constructor(options: LocalAgentOptions = {}) {
    for (const c of options.calibrations ?? []) this.calibrations.add(c);
    this.#catalog.bindCalibrations(this.calibrations);
    this.#validateManifest = options.validate?.manifest;
    this.#router = new GatedCommandRouter(this.#registry, this.#catalog, options.validate?.command);
    this.commands = this.#router;

    const ctx: AppContext = {
      signals: this.signals,
      events: this.events,
      observations: this.observations,
      calibrations: this.calibrations,
      dispatch: (cmd: CommandEnvelope, onAck?: (a: CommandAck) => void) =>
        this.#router.dispatch(cmd, onAck ?? (() => {})),
    };

    const registry = new AppRegistry();
    const entries = options.apps ?? [
      { appId: "station.app.growth-scan", factory: () => new GrowthScanApp() },
    ];
    for (const e of entries) registry.register(e.appId, e.factory);

    this.apps = new AppRuntime(registry, this.#catalog, ctx, (kind) => this.#registry.get(kind) !== undefined);
  }

  register(adapter: NodeAdapter): void {
    const node = adapter.manifest.attachesToNode; // M1: 노드 kind 식별자
    // P0: manifest 런타임 검증(주입 시) — 불량 manifest 는 등록 거부 + 이벤트.
    if (this.#validateManifest) {
      const v = this.#validateManifest(adapter.manifest);
      if (!v.ok) {
        this.events.publish({
          ts: new Date().toISOString(),
          severity: "warning",
          source: adapter.manifest.manifestId ?? node,
          code: "MANIFEST-INVALID",
          message: `node ${node} manifest 검증 실패: ${(v.errors ?? []).join("; ")}`,
        });
        return;
      }
    }
    this.#registry.register(adapter, node);
    this.#adapters.push(adapter);
    this.#unsub.push(adapter.onSignal((s) => this.signals.write(s)));
    this.#unsub.push(adapter.onEvent((e) => this.events.publish(e)));
    this.#unsub.push(adapter.onAck((a) => this.#router.routeAck(a)));
    if (this.#started) {
      // 이미 가동 중에 합류한 노드(동적 디스커버리, A4) — 즉시 start·healthy.
      void adapter.start();
      this.#registry.setHealthy(node, true);
    }
  }

  /** 노드 연결 종료 시 unhealthy 처리(HealthMonitor) — 게이트가 차단. */
  markNodeUnhealthy(node: string): void {
    this.#registry.setHealthy(node, false);
  }

  manifests(): ModuleManifest[] {
    return this.#adapters.map((a) => a.manifest);
  }

  async start(): Promise<void> {
    for (const a of this.#adapters) {
      await a.start();
      this.#registry.setHealthy(a.manifest.attachesToNode, true);
    }
    this.#started = true;
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

export function createLocalAgent(options?: LocalAgentOptions): ReferenceLocalAgent {
  return new ReferenceLocalAgent(options);
}
