import type { CommandEnvelope, GateResult, PolicyRule } from "@station/contracts";

/* ============================================================
   PolicyEngine — 안전·운영 룰 평가(command-router 의 Step4 stub 대체).
   PolicyRule.when(구조화 조건)을 SignalStore latest + state 컨텍스트로 평가(eval 없음).
   applies(verb glob) 매칭 + when 참 → effect(Gate severity) 적용.
   confirm_required 인데 명령이 confirmed(args.__confirmed=true) 면 통과(확인 플로).
   예: worker_detected → autonomy 차단 · estop → motion 차단 · 저전압 → 시작 confirm.
   ============================================================ */

type Condition = NonNullable<PolicyRule["when"]>;
export type SignalGetter = (channel: string) => number | boolean | undefined;
export type StateGetter = (key: string) => number | boolean | undefined;

const globMatch = (pattern: string, value: string): boolean =>
  pattern.endsWith("*") ? value.startsWith(pattern.slice(0, -1)) : value === pattern;

function compare(op: string, a: unknown, b: unknown): boolean {
  switch (op) {
    case "==": return a === b;
    case "!=": return a !== b;
    case "<": return Number(a) < Number(b);
    case ">": return Number(a) > Number(b);
    case "<=": return Number(a) <= Number(b);
    case ">=": return Number(a) >= Number(b);
    default: return false;
  }
}

export class PolicyEngine {
  constructor(
    private readonly rules: PolicyRule[],
    private readonly signals: SignalGetter,
    private readonly state: StateGetter = () => undefined,
  ) {}

  /** 명령에 적용되는 첫 비-pass 룰의 GateResult(없으면 undefined). */
  evaluate(cmd: CommandEnvelope): GateResult | undefined {
    for (const r of this.rules) {
      if (!(r.applies ?? []).some((p) => globMatch(p, cmd.verb))) continue;
      if (!this.#holds(r.when)) continue;
      if (r.effect === "confirm_required" && cmd.args?.["__confirmed"] === true) continue; // 확인됨 → 통과
      if (r.effect === "pass") continue;
      return { gate: r.gate ?? "G-Policy", severity: r.effect, reason: r.reason ?? r.id, blocks: [cmd.verb] };
    }
    return undefined;
  }

  #holds(c: Condition | undefined): boolean {
    if (!c) return false;
    if (c.all) return c.all.every((x) => this.#holds(x));
    if (c.any) return c.any.some((x) => this.#holds(x));
    const lhs = c.signal !== undefined ? this.signals(c.signal) : c.state !== undefined ? this.state(c.state) : undefined;
    if (lhs === undefined) return false; // 데이터 없음 → 미충족(안전: 모르면 트리거 안 함)
    return compare(c.op ?? "==", lhs, c.value);
  }
}
