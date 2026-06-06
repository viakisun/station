// [SWC-HUB] STATION Landing — 컨소시엄 통합 오케스트레이션.
// 두 기둥: ① 통합 미들웨어(Local Agent/RAL) + ② 통합 오케스트레이션(readiness). 제품은 그 위의 계기.
import { Hero, FabricSection, ConnectSection, ReadinessSection, StudioSection, ProductsSection, Footer } from "./_sections";

export default function Page() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--surface-canvas)", color: "var(--text-primary)" }}>
      <Hero />
      <FabricSection />
      <ConnectSection />
      <ReadinessSection />
      <StudioSection />
      <ProductsSection />
      <Footer />
    </main>
  );
}
