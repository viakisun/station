// [SWC-HUB] STATION Landing — commercial SaaS integration orchestration.
// 구매자 관점: 통합 현황, 책임 추적, 검증, 릴리스 판단을 한 화면에서 설명한다.
import { Hero, ProblemOutcomeSection, FabricSection, ConnectSection, ReadinessSection, StudioSection, ProductsSection, Footer } from "./_sections";

export default function Page() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--surface-canvas)", color: "var(--text-primary)" }}>
      <Hero />
      <ProblemOutcomeSection />
      <FabricSection />
      <ConnectSection />
      <ReadinessSection />
      <StudioSection />
      <ProductsSection />
      <Footer />
    </main>
  );
}
