"use client";
/* ============================================================
   [SWC-PRODUCT-BUILD] Audit 워크벤치 — runAudit(target) 를 브라우저에서 실제 실행.
   7단계가 라이브로 흐르고, 정적분석은 실 소스, conformance 는 실 FSM 부팅.
   결과(state·gate)는 실행 결과에서 도출(하드코딩 아님).
   ============================================================ */
import { useMemo, useState } from "react";
import Link from "next/link";
import { getAuditPackage, getProjects } from "@station/domain";
import {
  runAudit, finalizeReport, getTarget, sourceOf,
  STAGE_ORDER, STAGE_LABEL,
  type StageResult, type AuditReport, type Stage, type Severity,
} from "@station/audit-kit";
import { StatusBadge, type Sev } from "@station/design-system";

const STATUS_MARK: Record<string, { m: string; c: string }> = {
  pass: { m: "✓", c: "var(--state-normal)" },
  warn: { m: "!", c: "var(--state-warning)" },
  fail: { m: "✗", c: "var(--state-critical)" },
  na: { m: "–", c: "var(--text-disabled)" },
  running: { m: "◌", c: "var(--state-notice)" },
  pending: { m: "○", c: "var(--text-disabled)" },
};
const SEV_SEV: Record<Severity, Sev> = { critical: "critical", warning: "warning", low: "notice", info: "disabled" };
const GATE_SEV: Record<string, Sev> = { pass: "normal", warn: "warning", confirm_required: "notice", blocked: "critical" };

export function Workbench({ projectId, audId }: { projectId: string; audId: string }) {
  const pkg = getAuditPackage(audId);
  const project = getProjects().find((p) => p.id === projectId);
  const target = pkg ? getTarget(pkg.targetId) : undefined;

  const [stages, setStages] = useState<StageResult[]>([]);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [running, setRunning] = useState(false);
  const [sel, setSel] = useState<Stage>("static");
  const [log, setLog] = useState<string[]>([]);

  const byStage = useMemo(() => Object.fromEntries(stages.map((s) => [s.stage, s])) as Record<Stage, StageResult | undefined>, [stages]);

  if (!pkg || !target) return <div style={{ padding: 24, color: "var(--text-muted)" }}>Audit Package 를 찾을 수 없습니다: {audId}</div>;

  async function run() {
    if (running || !target) return;
    setRunning(true); setStages([]); setReport(null);
    setLog([`$ audit run --target ${target.id}  (${target.files.length} files, ${target.lang})`]);
    const collected: StageResult[] = [];
    for await (const s of runAudit(target)) {
      collected.push(s);
      setStages([...collected]);
      setLog((l) => [...l, `[${s.status.toUpperCase().padEnd(4)}] ${STAGE_LABEL[s.stage]} — ${s.summary}  (${Math.round(s.ms)}ms)`]);
      if (s.evidence.findings?.length || s.evidence.checks?.length) setSel(s.stage);
    }
    const r = finalizeReport(target, collected);
    setReport(r);
    setLog((l) => [...l, `→ score ${r.score} · state ${r.state} · gate ${r.gate.severity}${r.gate.reason ? " — " + r.gate.reason : ""}`]);
    setRunning(false);
  }

  const selResult = byStage[sel];

  return (
    <div style={{ padding: 16 }}>
      {/* 브레드크럼 + 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
        <Link href="/projects" className="linkish" style={{ textDecoration: "none" }}>Projects</Link><span>/</span>
        <Link href={`/projects/${projectId}`} className="linkish" style={{ textDecoration: "none" }}>{project?.id ?? projectId}</Link><span>/</span>
        <span className="mono">{pkg.id}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{pkg.label}</h1>
          <div className="mono" style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{pkg.vendorName} · {pkg.robotId} · target {target.id} · {target.lang.toUpperCase()}</div>
        </div>
        <span style={{ flex: 1 }} />
        {report && (
          <>
            <div style={{ textAlign: "right" }}>
              <div className="mono" style={{ fontSize: 26, fontWeight: 800, color: report.score >= 90 ? "var(--state-normal)" : report.score >= 60 ? "var(--state-warning)" : "var(--state-critical)" }}>{report.score}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>audit score</div>
            </div>
            <StatusBadge sev={GATE_SEV[report.gate.severity]} label={report.gate.gate} />
          </>
        )}
        <button className="btn primary" onClick={run} disabled={running} style={{ cursor: running ? "default" : "pointer", opacity: running ? 0.6 : 1 }}>
          {running ? "감사 실행 중…" : report ? "다시 실행" : "감사 실행"}
        </button>
      </div>

      {report && report.gate.reason && (
        <div style={{ padding: "10px 14px", background: report.gate.severity === "blocked" ? "var(--state-critical-bg)" : "var(--state-warning-bg)", border: "1px solid var(--line-default)", borderRadius: 8, fontSize: 12.5, marginBottom: 14 }}>
          <strong>{report.state}</strong> — {report.gate.reason}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 14, alignItems: "start" }}>
        {/* 파이프라인 단계 */}
        <div className="card" style={{ padding: 6 }}>
          {STAGE_ORDER.map((st) => {
            const r = byStage[st];
            const status = r?.status ?? (running ? "pending" : "pending");
            const mk = STATUS_MARK[status];
            const active = sel === st;
            return (
              <button key={st} onClick={() => setSel(st)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", border: "none", borderRadius: 6, background: active ? "var(--surface-muted)" : "transparent", cursor: "pointer", textAlign: "left" }}>
                <span style={{ width: 16, textAlign: "center", color: mk.c, fontWeight: 800 }}>{mk.m}</span>
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: active ? 700 : 500 }}>{STAGE_LABEL[st]}</span>
                {r && <span className="mono" style={{ fontSize: 9.5, color: "var(--text-muted)" }}>{Math.round(r.ms)}ms</span>}
              </button>
            );
          })}
        </div>

        {/* 선택 단계 evidence */}
        <div className="card" style={{ padding: 14, minHeight: 260 }}>
          {!selResult ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "24px 8px", textAlign: "center" }}>
              [감사 실행]을 누르면 {STAGE_LABEL[sel]} 단계가 실제로 실행되어 증거가 표시됩니다.
            </div>
          ) : (
            <StageEvidence r={selResult} target={target} />
          )}
        </div>
      </div>

      {/* 라이브 터미널 로그 */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>실행 로그</div>
        <pre className="mono" style={{ margin: 0, padding: 12, background: "var(--surface-base)", border: "1px solid var(--line-default)", borderRadius: 8, fontSize: 11, lineHeight: 1.6, maxHeight: 180, overflow: "auto", color: "var(--text-secondary)" }}>
          {log.length ? log.join("\n") : "감사 대기 중…"}
        </pre>
      </div>
    </div>
  );
}

function StageEvidence({ r, target }: { r: StageResult; target: { files: string[] } }) {
  const sevSev: Record<Severity, Sev> = SEV_SEV;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <strong style={{ fontSize: 13 }}>{STAGE_LABEL[r.stage]}</strong>
        <StatusBadge sev={r.status === "pass" ? "normal" : r.status === "warn" ? "warning" : r.status === "fail" ? "critical" : "disabled"} label={r.status} />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.summary}</span>
      </div>

      {/* findings (정적분석) */}
      {r.evidence.findings && r.evidence.findings.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {r.evidence.findings.map((f, i) => (
            <div key={i} style={{ border: "1px solid var(--line-subtle)", borderRadius: 6, padding: "8px 10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <StatusBadge sev={sevSev[f.severity]} label={f.severity} />
                <span className="mono" style={{ fontSize: 11, fontWeight: 700 }}>{f.rule}</span>
                <span style={{ fontSize: 12.5 }}>{f.title}</span>
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 3 }}>{f.file}:{f.line}{f.fn ? ` · ${f.fn}()` : ""}</div>
              {f.snippet && <pre className="mono" style={{ margin: "6px 0 0", padding: "6px 8px", background: "var(--surface-base)", borderRadius: 4, fontSize: 10.5, overflow: "auto", color: "var(--text-secondary)" }}>{f.snippet}</pre>}
            </div>
          ))}
        </div>
      )}

      {/* checks (interface·protocol·conformance·policy) */}
      {r.evidence.checks && r.evidence.checks.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <tbody>
            {r.evidence.checks.map((c, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--line-subtle)" }}>
                <td style={{ padding: "6px 8px", width: 18, color: c.pass ? "var(--state-normal)" : "var(--state-critical)", fontWeight: 800 }}>{c.pass ? "✓" : "✗"}</td>
                <td className="mono" style={{ padding: "6px 8px" }}>{c.name}</td>
                <td style={{ padding: "6px 8px", color: "var(--text-muted)" }}>{c.detail ?? (c.expected ? `${c.actual} / ${c.expected}` : "")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* artifacts (manifest·package) */}
      {r.evidence.artifacts && r.evidence.artifacts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {r.evidence.artifacts.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, padding: "4px 0" }}>
              <span style={{ color: a.ok ? "var(--state-normal)" : "var(--state-critical)", fontWeight: 800, width: 14 }}>{a.ok ? "✓" : "✗"}</span>
              <span className="mono" style={{ flex: 1 }}>{a.name}</span>
              <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{a.note ?? ""}</span>
            </div>
          ))}
        </div>
      )}

      {r.evidence.note && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>{r.evidence.note}</div>}

      {/* 정적분석: 대상 소스 목록 */}
      {r.stage === "static" && (
        <div className="mono" style={{ fontSize: 10, color: "var(--text-disabled)", marginTop: 12 }}>대상 소스: {target.files.join(", ")}</div>
      )}
    </div>
  );
}
