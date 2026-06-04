// [SWS-BUILD-MANIFESTS / SWC-PRODUCT-BUILD] Module/App manifests · blueprints (stub).
import { SurfaceHeader, StubPanel } from "@station/app-kit";
export default function Page() {
  return (
    <div>
      <SurfaceHeader sws="SWS-BUILD-MANIFESTS" />
      <StubPanel title="Manifests — ModuleManifest · AppManifest · Blueprint">
        <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
          벤더 산출물의 매니페스트·blueprint 카탈로그(project/platform scope). @station/contracts 정합. 목록·검증은 후속.
        </div>
      </StubPanel>
    </div>
  );
}
