import type { AppManifest, CommandAck, CommandEnvelope, Event } from "@station/contracts";
import type { EventBus, SignalStore } from "@station/contracts/runtime";
import type { CommandCatalog, CommandCatalogEntry } from "./command-catalog";
import type { ObservationStore } from "./observation-store";

const now = (): string => new Date().toISOString();

/** 앱이 가산하는 verb 1개(ownerAppId 는 런타임이 manifest.appId 로 채움). */
export type AppCommand = Omit<CommandCatalogEntry, "ownerAppId">;

/**
 * AppContext — 앱이 플랫폼에 닿는 좁은 면(샌드박스). 플랫폼 권한은 없다.
 * dispatch 는 반드시 게이트(CommandRouter)를 경유 → 앱이 노드를 직결하지 못한다(REQ-A02).
 */
export interface AppContext {
  readonly signals: SignalStore;
  readonly events: EventBus;
  readonly observations: ObservationStore;
  /** 게이트 경유 디스패치(노드 직결 0). */
  dispatch(cmd: CommandEnvelope, onAck?: (a: CommandAck) => void): Promise<CommandAck>;
  /** 보정 집합(시드 주입) — gating 입력. 비우면 gate_blocked. */
  readonly calibrations: Set<string>;
}

/** WorkApp — 작업 로직 단위. manifest 선언 + 생명주기 + 가산 명령. */
export interface WorkApp {
  readonly manifest: AppManifest;
  onLoad(ctx: AppContext): void | Promise<void>;
  onUnload(): void | Promise<void>;
  /** CommandCatalog 에 등록할 verb 핸들러(loaded 단계에서 runtime 이 등록). */
  commands(): AppCommand[];
}

/** AppRegistry — appId→factory 정적 맵(실 OTA 는 범위 밖, static 유지). */
export class AppRegistry {
  #factories = new Map<string, () => WorkApp>();

  register(appId: string, factory: () => WorkApp): void {
    this.#factories.set(appId, factory);
  }

  resolve(appId: string): WorkApp | undefined {
    return this.#factories.get(appId)?.();
  }

  has(appId: string): boolean {
    return this.#factories.has(appId);
  }
}

export type AppLifecycleState =
  | "derived"
  | "resolving"
  | "loaded"
  | "gating"
  | "active"
  | "gate_blocked"
  | "rejected"
  | "unloaded";

export interface AppStatus {
  appId: string;
  state: AppLifecycleState;
  reason?: string;
}

/**
 * AppRuntime — 5층 실현 서비스. derive→resolving→loaded→gating→active/gate_blocked→unload.
 * 로드 트리거 = 명시 deriveAndLoad()(노드 안정 후 호출 — 결정적).
 * production 은 blueprint 부팅 + node hello 재평가지만, 여기선 명시 호출로 단순화(노트).
 */
export class AppRuntime {
  #status = new Map<string, AppStatus>();
  #apps = new Map<string, WorkApp>();

  constructor(
    private readonly registry: AppRegistry,
    private readonly catalog: CommandCatalog,
    private readonly ctx: AppContext,
    /** 요구 노드 존재 검증기(NodeRegistry.get 으로 연결). */
    private readonly hasNode: (kind: string) => boolean,
  ) {}

  /**
   * 모듈/노드 매니페스트에서 requiredApps 를 derive(중복제거)한다.
   * Module ∪ Node 의 requiredApps[].id 합집합.
   */
  static deriveRequiredApps(manifests: { requiredApps?: { id: string }[] }[]): string[] {
    const ids = new Set<string>();
    for (const m of manifests) for (const r of m.requiredApps ?? []) ids.add(r.id);
    return [...ids];
  }

  /** 파이프라인 진입점 — appId 목록을 derive→…→active 까지 흘린다. */
  async deriveAndLoad(appIds: string[]): Promise<void> {
    for (const appId of appIds) await this.#load(appId);
  }

  async #load(appId: string): Promise<void> {
    this.#set(appId, "derived");

    // resolving — factory 해소 + 요구 노드 존재 + verb 충돌 검사.
    this.#set(appId, "resolving");
    const app = this.registry.resolve(appId);
    if (!app) return this.#set(appId, "rejected", `app ${appId} not in registry`);

    const requiredNodes = app.manifest.requires?.nodes ?? [];
    const missing = requiredNodes.filter((n) => !this.hasNode(n));
    if (missing.length > 0) {
      return this.#set(appId, "rejected", `required nodes missing: ${missing.join(",")}`);
    }
    // verb 충돌(1앱이라 경검증) — 이미 다른 앱이 점유한 verb 면 거부.
    const conflict = app.commands().find((c) => this.catalog.has(c.verb));
    if (conflict) {
      return this.#set(appId, "rejected", `verb conflict: ${conflict.verb}`);
    }

    // loaded — onLoad(ctx) 후 provided.commands 를 CommandCatalog 등록.
    await app.onLoad(this.ctx);
    this.#apps.set(appId, app);
    const entries: CommandCatalogEntry[] = app.commands().map((c) => ({ ...c, ownerAppId: appId }));
    this.catalog.register(entries);
    this.#set(appId, "loaded");

    // gating — requires.calibration ⊆ ctx.calibrations ?
    this.#set(appId, "gating");
    const requiredCal = app.manifest.requires?.calibration ?? [];
    const missingCal = requiredCal.filter((c) => !this.ctx.calibrations.has(c));
    if (missingCal.length > 0) {
      // gate_blocked — 로드는 됐으나 비활성(catalog 에 verb 는 있되 isActiveApp=false → 디스패치 reject).
      this.catalog.setAppActive(appId, false);
      this.#publishEvent("warning", "APP-GATE-BLOCKED", `${appId} gate_blocked: missing ${missingCal.join(",")}`);
      return this.#set(appId, "gate_blocked", `missing calibration: ${missingCal.join(",")}`);
    }

    // active.
    this.catalog.setAppActive(appId, true);
    this.#publishEvent("info", "APP-ACTIVE", `${appId} active`);
    this.#set(appId, "active");
  }

  /** 모듈 교체 = 앱 언로드: verb deregister + onUnload + 상태 unloaded. */
  async unload(appId: string): Promise<void> {
    const app = this.#apps.get(appId);
    if (!app) return;
    await app.onUnload();
    this.catalog.deregisterApp(appId); // scan.* verb 제거 → 이후 dispatch rejected(verb 없음)
    this.#apps.delete(appId);
    this.#publishEvent("info", "APP-UNLOADED", `${appId} unloaded`);
    this.#set(appId, "unloaded");
  }

  state(appId: string): AppLifecycleState | undefined {
    return this.#status.get(appId)?.state;
  }

  status(appId: string): AppStatus | undefined {
    return this.#status.get(appId);
  }

  apps(): AppStatus[] {
    return [...this.#status.values()];
  }

  #set(appId: string, state: AppLifecycleState, reason?: string): void {
    this.#status.set(appId, { appId, state, reason });
  }

  #publishEvent(severity: Event["severity"], code: string, message: string): void {
    this.ctx.events.publish({ ts: now(), severity, source: "NODE-AGENT", code, message });
  }
}
