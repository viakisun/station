import type { CommandAck, CommandEnvelope, GateResult } from "@station/contracts";
import { isSafetyVerb } from "@station/contracts";
import type { CommandRouter } from "@station/contracts/runtime";
import type { NodeRegistry } from "./node-registry";

const now = (): string => new Date().toISOString();

interface Pending {
  onAck: (a: CommandAck) => void;
  timer: ReturnType<typeof setTimeout>;
  done: boolean;
}

/**
 * Step3 — CommandRouter. 기본 3단계 ACK(received→accepted→executed) + 예외(rejected·timeout).
 * 모든 명령은 evaluateGate(권한·상태·안전)를 통과해야 accepted 된다(REQ-A02·C02).
 * M1: 게이트는 등록·health 기반 최소 구현. 전체 PolicyEngine은 Step4.
 */
export class GatedCommandRouter implements CommandRouter {
  #pending = new Map<string, Pending>();

  constructor(private readonly registry: NodeRegistry) {}

  evaluateGate(cmd: CommandEnvelope): GateResult {
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
