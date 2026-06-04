"use client";
// [SWC-PRODUCT-OPS / WR-MVP-1] Ops 제품 셸 — app-kit ProductShell 소비(공통 chrome).
import { usePathname } from "next/navigation";
import { ProductShell, ProjectScopePicker, ScopeProvider, productById, surfacesOf } from "@station/app-kit";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const nav = surfacesOf("ops").map((s) => ({ label: s.label, href: s.route, active: path === s.route || path.startsWith(s.route + "/") }));
  return (
    <ScopeProvider>
      <ProductShell product={productById("ops")} nav={nav} scopeSlot={<ProjectScopePicker depth="robot" />}>
        {children}
      </ProductShell>
    </ScopeProvider>
  );
}
