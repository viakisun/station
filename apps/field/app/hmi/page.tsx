// [SWS-FIELD-HMI / SWC-PRODUCT-FIELD] Field HMI Mock — on-robot operator panel.
import { SurfaceHeader, StubPanel } from "@station/app-kit";

export default function Page() {
  return (
    <div>
      <SurfaceHeader sws="SWS-FIELD-HMI" right={<span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>Field HMI Mock — on-robot operator panel</span>} />
      <StubPanel title="HMI — 현장 조작 (authority ③ · local-first)">
        <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
          이 화면은 cloud SaaS 페이지가 아니라 <b style={{ color: "var(--ink)" }}>on-robot operator panel</b>의 목업이다. 현장 작업자가 로봇 가까이에서 조작하며 cloud(④)보다 상위 권한(③)을 갖는다. 작업 시작/정지·진행률은 후속.
        </div>
      </StubPanel>
    </div>
  );
}
