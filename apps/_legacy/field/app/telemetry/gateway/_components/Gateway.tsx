"use client";
/* ============================================================
   텔레메트리 게이트웨이 (JJ-P02)
   원천 신호 인입 → 표준 채널 매핑 · QoS · 인입 품질 요약
   field 테마(고대비) · 게이트웨이 설정/모니터 → 태블릿 정보밀도 허용(테이블)
   ============================================================ */
import { Icon, StatusBadge, KpiCard, PanelHead, Sparkline, KVStack, type Sev } from "@station/design-system";
import { gateway } from "@station/domain";

type Quality = "good" | "warn" | "bad";

const QUALITY_META: Record<Quality, { sev: Sev; label: string }> = {
  good: { sev: "normal", label: "양호" },
  warn: { sev: "warning", label: "주의" },
  bad: { sev: "critical", label: "불량" },
};

export function Gateway() {
  const { device, ingest, qos } = gateway;
  const mappedCount = ingest.filter((r) => r.mapped).length;
  const unmappedCount = ingest.length - mappedCount;
  const qCount: Record<Quality, number> = {
    good: ingest.filter((r) => r.quality === "good").length,
    warn: ingest.filter((r) => r.quality === "warn").length,
    bad: ingest.filter((r) => r.quality === "bad").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--canvas)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: 9, background: "var(--brand)", display: "grid", placeItems: "center", color: "#fff", flex: "none" }}>
            <Icon name="telemetry" size={21} />
          </span>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>텔레메트리 게이트웨이</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700 }}>JJ-P02 · 원천 신호 인입 → 표준 채널 매핑</div>
          </div>
        </div>

        {/* 상단: 장치 카드 + KPI */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 12, alignItems: "stretch" }}>
          <div className="card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Icon name="plug" size={17} style={{ color: "var(--ink-3)", flex: "none" }} />
              <span className="mono" style={{ fontSize: 14, fontWeight: 800 }}>{device.id}</span>
            </div>
            <KVStack
              pairs={[
                ["모델", device.model],
                ["업링크", <span key="up" className="mono" style={{ fontSize: 12 }}>{device.uplink}</span>],
                ["연결 로봇", <span key="rb" className="tnum">{device.robots}대</span>],
              ]}
            />
          </div>
          <KpiCard label="인입 신호" value={ingest.length} sub="raw signals" icon="database" />
          <KpiCard label="매핑됨" value={mappedCount} sub="standard channels" icon="layers" />
          <KpiCard label="미매핑" value={unmappedCount} sub="unmapped" icon="alert" sev={unmappedCount > 0 ? "warning" : "normal"} />
        </div>

        {/* 중앙: 인입 → 표준 채널 매핑 테이블 */}
        <div className="card" style={{ overflow: "hidden" }}>
          <PanelHead
            title="원천 신호 인입 → 표준 채널 매핑"
            sub={`${ingest.length}개 신호 · ${unmappedCount}개 미매핑`}
            right={
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-2)", fontWeight: 700 }}>
                <span className="live-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand-live)" }} /> LIVE
              </span>
            }
          />
          {/* 표 헤더 */}
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.7fr 0.9fr 1.4fr 0.8fr", gap: 12, padding: "9px 16px", borderBottom: "1px solid var(--line)", background: "var(--surface-2)", fontSize: 10.5, fontWeight: 800, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".4px" }}>
            <span>원천 키</span>
            <span>HEX</span>
            <span>샘플</span>
            <span>표준 채널</span>
            <span style={{ textAlign: "right" }}>품질</span>
          </div>
          {ingest.map((r) => {
            const qm = QUALITY_META[r.quality];
            const unmapped = !r.mapped;
            return (
              <div
                key={r.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.1fr 0.7fr 0.9fr 1.4fr 0.8fr",
                  gap: 12,
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--line)",
                  borderLeft: "3px solid " + (unmapped ? "var(--st-warning)" : "transparent"),
                  background: unmapped ? "var(--tint-warning)" : "transparent",
                }}
              >
                <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{r.key}</span>
                <span className="mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>{r.hex}</span>
                <span className="mono tnum" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{r.sample}</span>
                <span>
                  {r.mapped ? (
                    <span className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{r.mapped}</span>
                  ) : (
                    <StatusBadge sev="warning" label="미매핑" />
                  )}
                </span>
                <span style={{ display: "flex", justifyContent: "flex-end" }}>
                  <StatusBadge sev={qm.sev} label={qm.label} />
                </span>
              </div>
            );
          })}
        </div>

        {/* 하단: QoS/topic 카드 + 인입 품질 요약 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "start" }}>
          <div className="card">
            <PanelHead title="QoS / Topic" sub="MQTT 전송 정책" dense />
            <div style={{ padding: "6px 16px 14px" }}>
              <KVStack
                pairs={[
                  ["topic", <span key="t" className="mono" style={{ fontSize: 12 }}>{qos.topic}</span>],
                  ["QoS", <span key="q" className="tnum">{qos.qos}</span>],
                  ["ack", <span key="a" className="mono" style={{ fontSize: 12 }}>{qos.ack}</span>],
                ]}
              />
            </div>
          </div>

          <div className="card">
            <PanelHead title="인입 품질 요약" sub={`good ${qCount.good} · warn ${qCount.warn} · bad ${qCount.bad}`} dense />
            <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ flex: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                <QRow label="양호" count={qCount.good} sev="normal" />
                <QRow label="주의" count={qCount.warn} sev="warning" />
                <QRow label="불량" count={qCount.bad} sev="critical" />
              </div>
              <div style={{ flex: 1, minWidth: 0, background: "#1c1c1a", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.5)", fontWeight: 700, marginBottom: 6 }}>인입율 (mock)</div>
                <Sparkline data={[58, 61, 60, 64, 62, 67, 65, 63, 66, 64]} w={260} h={56} color="var(--brand-live)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QRow({ label, count, sev }: { label: string; count: number; sev: Sev }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: `var(--st-${sev})`, flex: "none" }} />
      <span style={{ fontSize: 12.5, color: "var(--ink-2)", fontWeight: 600, width: 40 }}>{label}</span>
      <span className="tnum" style={{ fontSize: 16, fontWeight: 800 }}>{count}</span>
    </div>
  );
}
