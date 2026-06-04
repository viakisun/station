"use client";
import { useState } from "react";
import {
  Icon,
  StatusBadge,
  WizardStepper,
  WizardFrame,
  GateNotice,
  type WizardStep,
} from "@station/design-system";
import { RELEASE } from "@station/domain";

/* ---------------- C04-01 펌웨어 등록 마법사 ---------------- */
const STEPS: WizardStep[] = [
  { key: "upload", label: "파일 업로드" },
  { key: "manifest", label: "manifest 확인" },
  { key: "target", label: "대상 모듈" },
  { key: "release", label: "릴리즈 노트 · 검증" },
];

// mock manifest (업로드된 펌웨어 패키지에서 파싱된 값)
const MANIFEST = {
  file: "fw-ee-thin-3.1.3.bin",
  size: "4.21 MB",
  version: "3.1.3",
  module_type: "Thinning end-effector",
  checksum: "sha256:9f3a2196c4e7b81d0a55fe2c4471e9b6a8d3f02e1c6b7a90",
  builtAt: "2026-06-01 14:22 KST",
};

export function FirmwareRegister() {
  const [current, setCurrent] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const uploaded = fileName != null;
  const canNext =
    current === 0 ? uploaded : current === 2 ? target != null : true;

  const next = () => setCurrent(c => Math.min(c + 1, STEPS.length - 1));
  const prev = () => setCurrent(c => Math.max(c - 1, 0));

  return (
    <div
      className="screen-enter"
      style={{ padding: "var(--gap)", maxWidth: 880, margin: "0 auto", width: "100%" }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)" }}>C04-01</span>
          <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>펌웨어 등록</h1>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4 }}>
          패키지 업로드 → manifest 확인 → 대상 모듈 지정 → 정적분석 요청
        </div>
      </div>

      <WizardStepper steps={STEPS} current={current} onStep={i => i <= current && setCurrent(i)} />

      {current === 0 && (
        <WizardFrame
          title="펌웨어 패키지 업로드"
          sub="서명된 펌웨어 바이너리(.bin) 또는 패키지를 업로드하세요."
          onNext={next}
          canNext={canNext}
        >
          <button
            onClick={() => setFileName(MANIFEST.file)}
            style={{
              width: "100%", border: `2px dashed ${uploaded ? "var(--brand)" : "var(--line-strong)"}`,
              borderRadius: "var(--r-md)", background: uploaded ? "var(--surface-2)" : "var(--surface)",
              padding: "34px 20px", display: "flex", flexDirection: "column", alignItems: "center",
              gap: 10, cursor: "pointer",
            }}
          >
            <span style={{ width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center",
              background: "var(--surface-2)", border: "1px solid var(--line)" }}>
              <Icon name="upload" size={22} style={{ color: "var(--brand)" }} />
            </span>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>
              {uploaded ? "파일이 업로드되었습니다" : "여기로 파일을 끌어다 놓거나 클릭하여 선택"}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>.bin · 최대 64 MB · 서명 필요</div>
          </button>

          {uploaded && (
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10,
              padding: "11px 13px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", background: "var(--surface)" }}>
              <Icon name="fileCode" size={18} style={{ color: "var(--ink-2)" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{fileName}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{MANIFEST.size}</div>
              </div>
              <StatusBadge sev="normal" label="수신 완료" />
              <button className="btn sm" onClick={() => setFileName(null)}><Icon name="close" size={13} /> 제거</button>
            </div>
          )}
        </WizardFrame>
      )}

      {current === 1 && (
        <WizardFrame
          title="manifest 미리보기"
          sub="패키지에서 파싱된 메타데이터입니다. 값이 의도와 일치하는지 확인하세요."
          onPrev={prev}
          onNext={next}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
            border: "1px solid var(--line)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
            {[
              ["version", MANIFEST.version, true],
              ["module_type", MANIFEST.module_type, false],
              ["build_at", MANIFEST.builtAt, false],
              ["file", MANIFEST.file, true],
            ].map(([k, v, mono], i) => (
              <div key={i} style={{ padding: "11px 14px", borderBottom: "1px solid var(--line)",
                borderRight: i % 2 === 0 ? "1px solid var(--line)" : "none" }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 3 }}>{k as string}</div>
                <div className={mono ? "mono" : ""} style={{ fontSize: 12.5, fontWeight: 600 }}>{v as string}</div>
              </div>
            ))}
            <div style={{ padding: "11px 14px", gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 3 }}>checksum</div>
              <div className="mono" style={{ fontSize: 12, fontWeight: 600, wordBreak: "break-all", color: "var(--ink-2)" }}>{MANIFEST.checksum}</div>
            </div>
          </div>
        </WizardFrame>
      )}

      {current === 2 && (
        <WizardFrame
          title="대상 모듈 선택"
          sub="이 펌웨어가 적용될 표준화(Audit) 완료 모듈을 지정하세요."
          onPrev={prev}
          onNext={next}
          canNext={canNext}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {RELEASE.modules.map(m => {
              const sel = target === m.id;
              return (
                <button key={m.id} onClick={() => setTarget(m.id)}
                  style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 12,
                    border: `1px solid ${sel ? "var(--brand)" : "var(--line)"}`,
                    background: sel ? "var(--surface-2)" : "var(--surface)",
                    borderRadius: "var(--r-sm)", padding: "11px 13px" }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", flex: "none",
                    border: `2px solid ${sel ? "var(--brand)" : "var(--line-strong)"}`,
                    display: "grid", placeItems: "center" }}>
                    {sel && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand)" }} />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{m.id}</span>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{m.type} · 현재 fw {m.fw}</div>
                  </div>
                  <StatusBadge sev={RELEASE.auditMeta[m.auditState].sev} label={RELEASE.auditMeta[m.auditState].label} />
                </button>
              );
            })}
          </div>
        </WizardFrame>
      )}

      {current === 3 && (
        <WizardFrame
          title="릴리즈 노트 · 등록 전 검증"
          sub="변경 사항을 기록하고 checksum 일치를 확인한 뒤 정적분석을 요청합니다."
          onPrev={prev}
          footer={
            <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--ink-3)" }}>
              <Icon name="shield" size={14} /> 등록 시 정적분석 큐에 추가됩니다.
            </span>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>릴리즈 노트</div>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="예) 프레임 드롭 수정, 그립 PID 재튜닝, 워치독 리셋 영역 보강"
                rows={4} style={{ width: "100%", resize: "vertical", padding: "10px 12px", fontSize: 12.5,
                  borderRadius: "var(--r-sm)", border: "1px solid var(--line)", background: "var(--surface)",
                  color: "var(--ink)", fontFamily: "inherit", lineHeight: 1.5 }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px",
              border: "1px solid var(--line)", borderRadius: "var(--r-sm)", background: "var(--surface)" }}>
              <Icon name="check" size={16} style={{ color: "var(--st-normal)" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>checksum 일치</div>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", wordBreak: "break-all" }}>{MANIFEST.checksum}</div>
              </div>
              <StatusBadge sev="normal" label="일치" />
            </div>

            <div style={{ fontSize: 12, color: "var(--ink-2)", display: "flex", gap: 18, flexWrap: "wrap" }}>
              <span><b style={{ color: "var(--ink-3)", fontWeight: 700 }}>version</b> <span className="mono">{MANIFEST.version}</span></span>
              <span><b style={{ color: "var(--ink-3)", fontWeight: 700 }}>module</b> <span className="mono">{target ?? "—"}</span></span>
            </div>

            <GateNotice
              severity="confirm_required"
              title="등록 후 흐름"
              reason="정적분석 → 호환성 검사 → Audit 승인을 통과해야 배포 계획을 세울 수 있습니다."
              actions={[{ label: "정적분석 화면 안내", href: "/firmware/static-analysis" }]}
            />

            <a href="/firmware/static-analysis" className="btn primary"
              style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 7 }}>
              <Icon name="fileCode" size={15} /> 정적분석 요청
            </a>
          </div>
        </WizardFrame>
      )}
    </div>
  );
}
