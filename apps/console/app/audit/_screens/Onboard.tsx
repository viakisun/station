"use client";
import { useState } from "react";
import {
  Icon,
  PanelHead,
  StatusBadge,
  WizardStepper,
  WizardFrame,
  type WizardStep,
} from "@station/design-system";
import { RELEASE, capabilityProfiles } from "@station/domain";

/* ---------------- C02-01 모듈 온보딩 마법사 ---------------- */
const STEPS: WizardStep[] = [
  { key: "vendor", label: "제조사" },
  { key: "module", label: "모듈 기본" },
  { key: "cap", label: "Capability" },
  { key: "fw", label: "Firmware" },
  { key: "review", label: "검토·제출" },
];

type RobotType = "thin" | "pinch";
const NEW_MODULE_ID = "MOD-NEW-A1"; // 발급 표기(mock)

export function Onboard({ density }: { density: string }) {
  const R = RELEASE;
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // form state (mock)
  const [vendorId, setVendorId] = useState(R.vendors[0].id);
  const [robotTypes, setRobotTypes] = useState<RobotType[]>(["thin", "pinch"]);
  const [moduleType, setModuleType] = useState("Vision camera");
  const [capRef, setCapRef] = useState("MOD-CAM-V01");
  const [fwId, setFwId] = useState(R.firmwares[0].id);

  const vendor = R.vendors.find((v) => v.id === vendorId);
  const cap = capabilityProfiles[capRef];
  const fw = R.firmwares.find((f) => f.id === fwId);

  const toggleRobot = (t: RobotType) =>
    setRobotTypes((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  const next = () => setCurrent((c) => Math.min(c + 1, STEPS.length - 1));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const dense = density === "compact";

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      {/* header */}
      <div className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>모듈 온보딩 마법사</span>
            <StatusBadge sev="notice" label="C02-01" />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
            제조사 → 모듈 → Capability → Firmware → 검토 5단계로 신규 모듈을 등록합니다 · multi-vendor
          </div>
        </div>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", padding: "2px 8px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>{NEW_MODULE_ID}</span>
      </div>

      {/* stepper */}
      <div className="card" style={{ padding: "16px 18px 4px" }}>
        <WizardStepper steps={STEPS} current={current} onStep={(i) => !submitted && setCurrent(i)} />
      </div>

      {/* step body */}
      {current === 0 && (
        <WizardFrame title="① 제조사(Vendor) 정보" sub="등록된 제조사를 선택하거나 신규 제조사를 입력합니다" onPrev={prev} onNext={next} canPrev={false}
          footer={<span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{R.vendors.length} 제조사 등록됨</span>}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {R.vendors.map((v) => {
              const on = v.id === vendorId;
              return (
                <button key={v.id} onClick={() => setVendorId(v.id)} style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: on ? "1.5px solid var(--brand)" : "1px solid var(--line)", borderRadius: "var(--r-sm)", background: on ? "var(--surface-2)" : "var(--surface)", cursor: "pointer" }}>
                  <span style={{ width: 34, height: 34, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", background: "var(--surface-3)", fontWeight: 800, fontSize: 12 }}>{v.short}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{v.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}><span className="mono">{v.id}</span> · {v.modules} 모듈</div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>{v.contact}</div>
                  </div>
                  {on && <Icon name="check" size={16} style={{ color: "var(--brand)", flex: "none" }} />}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
            <Field label="신규 제조사명 (선택)" placeholder="예: NewVision Robotics" />
            <Field label="담당자 이메일 (선택)" placeholder="dev@example.com" />
          </div>
        </WizardFrame>
      )}

      {current === 1 && (
        <WizardFrame title="② 모듈 기본 정보" sub="module_id 발급 · 지원 robot_type · module_type" onPrev={prev} onNext={next}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div>
              <Lbl>발급 module_id</Lbl>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)" }}>
                <Icon name="pkg" size={15} style={{ color: "var(--ink-3)" }} />
                <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{NEW_MODULE_ID}</span>
                <StatusBadge sev="notice" label="발급(mock)" />
              </div>

              <Lbl style={{ marginTop: 16 }}>module_type</Lbl>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["Vision camera", "Manipulator", "End-effector", "Navigation"].map((t) => (
                  <label key={t} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, cursor: "pointer" }}>
                    <input type="radio" name="mtype" checked={moduleType === t} onChange={() => setModuleType(t)} />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Lbl>지원 robot_type</Lbl>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(["thin", "pinch"] as RobotType[]).map((t) => {
                  const on = robotTypes.includes(t);
                  return (
                    <button key={t} onClick={() => toggleRobot(t)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", border: on ? "1.5px solid var(--brand)" : "1px solid var(--line)", borderRadius: "var(--r-sm)", background: on ? "var(--surface-2)" : "var(--surface)", cursor: "pointer", textAlign: "left" }}>
                      <span style={{ width: 18, height: 18, borderRadius: 4, flex: "none", display: "grid", placeItems: "center", background: on ? "var(--brand)" : "var(--surface-2)", border: on ? "none" : "1.5px solid var(--line-strong)", color: "#fff" }}>
                        {on && <Icon name="check" size={12} stroke={3} />}
                      </span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, textTransform: "capitalize" }}>{t} robot</div>
                        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{t === "thin" ? "적과 로봇" : "착과 로봇"}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: "var(--ink-3)" }}>최소 1개 robot_type을 지원해야 합니다.</div>
            </div>
          </div>
        </WizardFrame>
      )}

      {current === 2 && (
        <WizardFrame title="③ Capability 요약" sub="참조 Capability Profile에서 명령·텔레메트리 카운트 미리보기" onPrev={prev} onNext={next}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {Object.keys(capabilityProfiles).map((id) => {
              const on = id === capRef;
              return (
                <button key={id} className={"btn sm" + (on ? " primary" : "")} onClick={() => setCapRef(id)}><span className="mono" style={{ fontSize: 11 }}>{id}</span></button>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
            <CountCard icon="terminal" label="commands" value={cap.commands.length} />
            <CountCard icon="telemetry" label="telemetry" value={cap.telemetry.length} />
            <CountCard icon="sliders" label="parameters" value={cap.parameters.length} />
            <CountCard icon="wrench" label="calibration" value={cap.calibration.length} />
          </div>
          <div className="card" style={{ padding: 0, boxShadow: "none" }}>
            <PanelHead title="명령 미리보기" sub={`${cap.id} · ${cap.version}`} dense />
            <div style={{ padding: 8 }}>
              {cap.commands.map((c) => (
                <div key={c.verb} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px" }}>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>{c.verb}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{c.ack}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{c.timeout}</span>
                  {c.safety && <StatusBadge sev="warning" label="safety" />}
                </div>
              ))}
            </div>
          </div>
        </WizardFrame>
      )}

      {current === 3 && (
        <WizardFrame title="④ Firmware manifest" sub="대상 펌웨어 선택 · checksum(mock)" onPrev={prev} onNext={next}>
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left" }}>
                {["", "Firmware", "Module", "Ver", "checksum (mock)"].map((h, i) =>
                  <th key={i} style={{ padding: "9px 12px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {R.firmwares.map((f) => {
                  const on = f.id === fwId;
                  return (
                    <tr key={f.id} className="hov-row" onClick={() => setFwId(f.id)} style={{ borderBottom: "1px solid var(--line)", cursor: "pointer", background: on ? "var(--surface-2)" : "transparent" }}>
                      <td style={{ padding: "9px 12px" }}><input type="radio" name="fw" checked={on} onChange={() => setFwId(f.id)} /></td>
                      <td style={{ padding: "9px 12px" }}><span className="mono" style={{ fontSize: 11.5, fontWeight: 700 }}>{f.id}</span></td>
                      <td style={{ padding: "9px 12px" }}><span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{f.module}</span></td>
                      <td style={{ padding: "9px 12px" }}><span className="mono" style={{ fontSize: 11.5 }}>v{f.ver}</span></td>
                      <td style={{ padding: "9px 12px" }}><span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{mockChecksum(f.id)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </WizardFrame>
      )}

      {current === 4 && (
        <WizardFrame title="⑤ 검토 · 제출" sub="입력 내용을 확인하고 모듈을 등록합니다"
          onPrev={submitted ? undefined : prev}
          onNext={submitted ? undefined : next} canNext={false} nextLabel="제출 →"
          footer={submitted ? <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--st-normal)" }}>등록 완료(mock)</span> : <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>제출 시 Audit Package 생성 단계로 진행됩니다</span>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <ReviewBlock title="제조사" rows={[["벤더", vendor?.name ?? "—"], ["ID", vendor?.id ?? "—"], ["담당자", vendor?.contact ?? "—"]]} />
            <ReviewBlock title="모듈" rows={[["module_id", NEW_MODULE_ID], ["type", moduleType], ["robot_type", robotTypes.join(" · ") || "—"]]} />
            <ReviewBlock title="Capability" rows={[["profile", cap.id], ["commands", String(cap.commands.length)], ["telemetry", String(cap.telemetry.length)]]} />
            <ReviewBlock title="Firmware" rows={[["firmware", fw?.id ?? "—"], ["ver", "v" + (fw?.ver ?? "—")], ["checksum", mockChecksum(fwId)]]} />
          </div>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {!submitted ? (
              <button className="btn primary" style={{ alignSelf: "flex-start" }} onClick={() => setSubmitted(true)}>
                <Icon name="check" size={15} /> 모듈 등록 제출
              </button>
            ) : (
              <div className="card" style={{ padding: "14px 16px", background: "var(--tint-normal, var(--surface-2))", border: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
                <Icon name="check" size={18} stroke={2.4} style={{ color: "var(--st-normal)", flex: "none" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{NEW_MODULE_ID} 등록 완료 (mock)</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>이어서 Audit Package를 생성하세요.</div>
                </div>
                <a className="btn primary sm" href="/audit/package"><Icon name="pkg" size={14} /> Audit Package 생성으로 이동</a>
              </div>
            )}
          </div>
        </WizardFrame>
      )}
    </div>
  );
}

function Lbl({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 7, ...style }}>{children}</div>;
}
function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <Lbl>{label}</Lbl>
      <input placeholder={placeholder} style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", background: "var(--surface)", fontSize: 12.5, fontFamily: "inherit" }} />
    </div>
  );
}
function CountCard({ icon, label, value }: { icon: import("@station/design-system").IconName; label: string; value: number }) {
  return (
    <div className="card" style={{ padding: 13, boxShadow: "none", display: "flex", flexDirection: "column", gap: 6 }}>
      <Icon name={icon} size={16} style={{ color: "var(--ink-3)" }} />
      <span className="tnum" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>{label}</span>
    </div>
  );
}
function ReviewBlock({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="card" style={{ padding: "12px 14px", boxShadow: "none" }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 8 }}>{title}</div>
      {rows.map(([k, v], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < rows.length - 1 ? "1px solid var(--line)" : "none" }}>
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{k}</span>
          <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}
function mockChecksum(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return "sha256:" + h.toString(16).padStart(8, "0") + "…";
}
