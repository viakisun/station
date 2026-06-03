import type { CommandAck, CommandEnvelope, GateResult } from "@station/contracts";
import { isSafetyVerb } from "@station/contracts";
import type { CommandRouter } from "@station/contracts/runtime";
import type { CommandCatalog, CommandRole } from "./command-catalog";
import type { NodeRegistry } from "./node-registry";

const now = (): string => new Date().toISOString();

// requiredRole 최소 위계(operator ≤ manager ≤ maintainer; system 은 내부 호출자라 항상 허용).
const ROLE_RANK: Record<CommandRole, number> = { operator: 1, manager: 2, maintainer: 3, system: 9 };
function roleSatisfies(actual: CommandRole, required: CommandRole): boolean {
  return ROLE_RANK[actual] >= ROLE_RANK[required];
}

interface Pending {
  onAck: (a: CommandAck) => void;
  timer: ReturnType<typeof setTimeout>;
  done: boolean;
}

/**
 * Step3 — CommandRouter. 기본 3단계 ACK(received→accepted→executed) + 예외(rejected·timeout).
 * 모든 명령은 evaluateGate(권한·상태·안전)를 통과해야 accepted 된다(REQ-A02·C02).
 * M1: 게이트는 등록·health 기반 최소 구현. 전체 PolicyEngine은 Step4.
 * M3: 옵셔널 CommandCatalog 주입 시 앱 verb(Agent-hosted)를 노드 경로 *앞에서* 분기.
 *     catalog 미주입(M1/M2)은 기존 경로 그대로(바이트 동일, 하위호환).
 */
export class GatedCommandRouter implements CommandRouter {
  #pending = new Map<string, Pending>();

  constructor(
    private readonly registry: NodeRegistry,
    private readonly catalog?: CommandCatalog,
  ) {}

  evaluateGate(cmd: CommandEnvelope): GateResult {
    // M3 앱 경로 — catalog 가 verb 를 알면 노드 registry/health 를 요구하지 않는다(Agent-hosted).
    const entry = this.catalog?.lookup(cmd.verb);
    if (entry) {
      if (!this.catalog!.isActiveApp(entry.ownerAppId)) {
        return {
          gate: "G-App",
          severity: "blocked",
          reason: `app ${entry.ownerAppId} not active`,
          blocks: [cmd.verb],
        };
      }
      if (!roleSatisfies(cmd.issuedBy.role, entry.requiredRole)) {
        return {
          gate: "G-Role",
          severity: "blocked",
          reason: `role ${cmd.issuedBy.role} < required ${entry.requiredRole}`,
          blocks: [cmd.verb],
        };
      }
      if (!this.catalog!.gateRefsSatisfied(cmd.verb)) {
        return {
          gate: "G-Calibration",
          severity: "blocked",
          reason: `gateRefs not satisfied for ${cmd.verb}`,
          blocks: [cmd.verb],
        };
      }
      return {
        gate: entry.safetyClass === "none" ? "G-None" : `G-App(${entry.safetyClass})`,
        severity: "pass",
      };
    }

    const rn = this.registry.get(cmd.target.node);
    if (!rn) {
      return {
        gate: "G-Registry",
        severity: "blocked",
        reason: `node ${cmd.target.node} not registered`,
        blocks: [cmd.verb],
      };
    }
    if (!rn.healthy) {
      return {
        gate: "G-Health",
        severity: "blocked",
        reason: `node ${cmd.target.node} unhealthy`,
        blocks: [cmd.verb],
      };
    }
    // M1: 안전 verb 는 guarded 로 표기하되 통과(전체 정책은 Step4).
    return { gate: isSafetyVerb(cmd.verb) ? "G-Safety(guarded)" : "G-None", severity: "pass" };
  }

  dispatch(cmd: CommandEnvelope, onAck: (a: CommandAck) => void): Promise<CommandAck> {
    const received: CommandAck = { commandId: cmd.commandId, stage: "received", ts: now() };
    onAck(received);

    const gate = this.evaluateGate(cmd);
    if (gate.severity === "blocked" || gate.severity === "confirm_required") {
      onAck({ commandId: cmd.commandId, stage: "rejected", ts: now(), code: gate.gate, detail: gate.reason });
      return Promise.resolve(received);
    }
    onAck({ commandId: cmd.commandId, stage: "accepted", ts: now(), detail: gate.gate });

    const timeoutMs = cmd.timeoutMs ?? 1000;
    const timer = setTimeout(() => {
      const p = this.#pending.get(cmd.commandId);
      if (p && !p.done) {
        p.done = true;
        this.#pending.delete(cmd.commandId);
        onAck({ commandId: cmd.commandId, stage: "timeout", ts: now() });
      }
    }, timeoutMs);
    this.#pending.set(cmd.commandId, { onAck, timer, done: false });

    // M3 앱 경로 — 등록된 핸들러가 있으면 노드 대신 핸들러가 실행(Agent-hosted program).
    // 핸들러는 routeAck 면으로 executed/rejected 를 흘려 #pending·timeout 을 동일하게 정리.
    const entry = this.catalog?.lookup(cmd.verb);
    if (entry) {
      void Promise.resolve(entry.handler(cmd, (a) => this.routeAck(a))).catch((err: unknown) => {
        this.routeAck({
          commandId: cmd.commandId,
          stage: "rejected",
          ts: now(),
          code: "APP-ERROR",
          detail: String(err),
        });
      });
      return Promise.resolve(received);
    }

    const rn = this.registry.get(cmd.target.node);
    void rn?.adapter.send(cmd);
    return Promise.resolve(received);
  }

  /** LocalAgent가 노드의 ACK(executed/rejected/timeout)를 commandId로 라우팅. */
  routeAck(a: CommandAck): void {
    const p = this.#pending.get(a.commandId);
    if (!p || p.done) return;
    if (a.stage === "executed" || a.stage === "rejected" || a.stage === "timeout") {
      p.done = true;
      clearTimeout(p.timer);
      this.#pending.delete(a.commandId);
    }
    p.onAck(a);
  }
}
