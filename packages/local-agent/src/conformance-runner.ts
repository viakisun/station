import type { CommandEnvelope, ConformanceSuite } from "@station/contracts";
import type { MockSource, SourceContext } from "@station/node-kit";

/* ============================================================
   ConformanceRunner (F7 실행 러너) — 정적 checkNodeConformance 를 넘어,
   노드를 실제로 부팅→선언 verb 주입→ACK(executed) 확인→선언 신호 emit 확인→리포트.
   loopback 없이 MockSource 를 직접 구동(SourceContext 수집)해 결정적·빠름.
   ============================================================ */

export interface ConformanceCheck {
  kind: "signal" | "command";
  name: string;
  pass: boolean;
  detail?: string;
}
export interface ConformanceReport {
  suiteId: string;
  node: string;
  pass: boolean;
  checks: ConformanceCheck[];
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const now = (): string => new Date().toISOString();

/** 한 노드(MockSource)를 스위트로 검사. */
export async function runConformance(source: MockSource, suite: ConformanceSuite): Promise<ConformanceReport> {
  const seenSignals = new Set<string>();
  const acks = new Map<string, string>(); // commandId → last stage
  const ctx: SourceContext = {
    emitSignal: (s) => seenSignals.add(s.channel),
    emitEvent: () => {},
    emitAck: (a) => acks.set(a.commandId, a.stage),
  };

  await source.start(ctx);
  await sleep(suite.windowMs ?? 1500); // 신호 관측 창

  const checks: ConformanceCheck[] = [];

  // 1) 선언 신호 emit 확인.
  for (const ch of suite.expectSignals) {
    checks.push({ kind: "signal", name: ch, pass: seenSignals.has(ch), detail: seenSignals.has(ch) ? undefined : "미관측" });
  }

  // 2) 선언 verb 주입 → executed ACK 확인.
  for (const verb of suite.expectCommands) {
    const id = `CONF-${verb}`;
    const cmd: CommandEnvelope = { commandId: id, verb, target: { node: suite.node }, issuedBy: { role: "system" }, issuedAt: now() } as CommandEnvelope;
    await source.onCommand(cmd, ctx);
    await sleep(60); // executed ACK 수신 대기(노드는 동기 처리 후 ack)
    const stage = acks.get(id);
    checks.push({ kind: "command", name: verb, pass: stage === "executed", detail: stage ? `ack=${stage}` : "no ack" });
  }

  await source.stop();
  return { suiteId: suite.id, node: suite.node, pass: checks.every((c) => c.pass), checks };
}

/** 리포트를 콘솔 표 문자열로. */
export function formatReport(r: ConformanceReport): string {
  const head = `[${r.pass ? "PASS" : "FAIL"}] ${r.suiteId} (${r.node})`;
  const rows = r.checks.map((c) => `  ${c.pass ? "✓" : "✗"} ${c.kind.padEnd(7)} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
  return [head, ...rows].join("\n");
}
