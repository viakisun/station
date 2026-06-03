import type { CommandAck, CommandEnvelope } from "@station/contracts";

export type SafetyClass = "none" | "guarded" | "safety_critical";
export type CommandRole = CommandEnvelope["issuedBy"]["role"];

/** 앱 호스트 핸들러 — 게이트 통과 후 호출. emitAck 로 executed/rejected 를 routeAck 면에 흘린다. */
export type CommandHandler = (
  cmd: CommandEnvelope,
  emitAck: (a: CommandAck) => void,
) => void | Promise<void>;

/**
 * CommandCatalogEntry — 앱이 가산한 verb 1개의 런타임 등록 레코드.
 * 계약(AppManifest)에 선언된 commands 가 로드 시 이 레코드로 구체화된다(G3.5).
 */
export interface CommandCatalogEntry {
  verb: string;
  ownerAppId: string;
  targetNodeKind?: string; // 앱 호스트 명령은 관례상 "AGENT"
  safetyClass: SafetyClass;
  requiredRole: CommandRole;
  gateRefs: string[]; // 예 보정 CAL-VPU-NIR (evaluateGate 가 calibrations 와 대조)
  handler: CommandHandler;
}

/**
 * CommandCatalog — verb→앱 등록 레코드 색인(런타임 전용, 계약 미변경).
 * 게이트(GatedCommandRouter)는 catalog 만 보고 앱 경로를 판정한다:
 *   has(verb) → 앱 verb · isActiveApp(owner) · gateRefsSatisfied(verb) · requiredRole.
 * active 상태와 calibrations 는 AppRuntime 이 주입(setAppActive / bindCalibrations).
 */
export interface CommandCatalog {
  register(entries: CommandCatalogEntry[]): void;
  lookup(verb: string): CommandCatalogEntry | undefined;
  has(verb: string): boolean;
  deregisterApp(appId: string): void;
  /** 앱 활성/비활성 토글(active 면 verb 디스패치 허용). */
  setAppActive(appId: string, active: boolean): void;
  isActiveApp(appId: string): boolean;
  /** 게이트가 참조할 보정 집합을 바인딩(AppContext 의 calibrations 와 동일 인스턴스). */
  bindCalibrations(calibrations: ReadonlySet<string>): void;
  /** verb 의 gateRefs ⊆ calibrations 인지. */
  gateRefsSatisfied(verb: string): boolean;
}

export class InMemoryCommandCatalog implements CommandCatalog {
  #byVerb = new Map<string, CommandCatalogEntry>();
  #activeApps = new Set<string>();
  #calibrations: ReadonlySet<string> = new Set();

  register(entries: CommandCatalogEntry[]): void {
    for (const e of entries) {
      if (this.#byVerb.has(e.verb)) {
        // resolving 충돌(다른 앱이 같은 verb) — 1앱이라 경검증, 2nd 앱에서 본검증.
        throw new Error(
          `CommandCatalog: verb conflict on "${e.verb}" (already owned by ${this.#byVerb.get(e.verb)?.ownerAppId})`,
        );
      }
      this.#byVerb.set(e.verb, e);
    }
  }

  lookup(verb: string): CommandCatalogEntry | undefined {
    return this.#byVerb.get(verb);
  }

  has(verb: string): boolean {
    return this.#byVerb.has(verb);
  }

  deregisterApp(appId: string): void {
    for (const [verb, e] of this.#byVerb) {
      if (e.ownerAppId === appId) this.#byVerb.delete(verb);
    }
    this.#activeApps.delete(appId);
  }

  setAppActive(appId: string, active: boolean): void {
    if (active) this.#activeApps.add(appId);
    else this.#activeApps.delete(appId);
  }

  isActiveApp(appId: string): boolean {
    return this.#activeApps.has(appId);
  }

  bindCalibrations(calibrations: ReadonlySet<string>): void {
    this.#calibrations = calibrations;
  }

  gateRefsSatisfied(verb: string): boolean {
    const e = this.#byVerb.get(verb);
    if (!e) return false;
    return e.gateRefs.every((ref) => this.#calibrations.has(ref));
  }
}
