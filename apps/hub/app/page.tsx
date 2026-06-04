"use client";
// [SWC-HUB / WR-MVP-1] 제품군 런처 — Product Matrix 기반 4제품 카드 + scope 요약(조작 없음).
import { PRODUCTS, ProductCard, ScopeSummary } from "@station/app-kit";

export default function Page() {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ width: 30, height: 30, borderRadius: 7, background: "var(--product-accent)", color: "#fff", display: "grid", placeItems: "center", fontSize: 15, fontWeight: 800 }}>S</span>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-.3px" }}>STATION</h1>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>VIA 통합관제 SaaS — 제품군 런처</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)" }}>on-robot 실체 ↔ cloud 미러 · 권한 ① 물리 &gt; ② Agent &gt; ③ field &gt; ④ cloud</span>
        <span style={{ flex: 1 }} />
        <ScopeSummary />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {PRODUCTS.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      <div className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 18, lineHeight: 1.6 }}>
        Agent는 사용자 제품이 아니라 on-robot runtime — Build의 Runtime Inspector를 통해 본다.<br />
        scope(project→site→robot) 선택·조작은 각 제품 안에서. Hub는 런처.
      </div>
    </div>
  );
}
