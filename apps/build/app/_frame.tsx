"use client";
// [SWC-PRODUCT-BUILD / WR-MVP-1] Build 제품 셸. nav = build surfaces + agent(Agent Status).
// Agent는 사용자 제품이 아니라 Build를 통해 노출 — surfacesOf("agent") 포함.
import { usePathname } from "next/navigation";
import { ProductShell, ProjectScopePicker, ScopeProvider, productById, surfacesOf } from "@station/app-kit";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const surfaces = [...surfacesOf("build"), ...surfacesOf("agent")];
  const nav = surfaces.map((s) => ({ label: s.label, href: s.route, active: path === s.route || path.startsWith(s.route + "/") }));
  return (
    <ScopeProvider>
      <ProductShell product={productById("build")} nav={nav} scopeSlot={<ProjectScopePicker depth="robot" />}>
        {children}
      </ProductShell>
    </ScopeProvider>
  );
}
