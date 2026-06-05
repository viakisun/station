"use client";
// [SWC-PRODUCT-FIELD / WR-MVP-1] Field 제품 셸 — on-robot operator panel(권한 ③, field theme).
import { usePathname } from "next/navigation";
import { ProductShell, ProjectScopePicker, ScopeProvider, productById, surfacesOf } from "@station/app-kit";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const nav = surfacesOf("field").map((s) => ({ label: s.label, href: s.route, active: path === s.route || path.startsWith(s.route + "/") }));
  return (
    <ScopeProvider>
      <ProductShell
        product={productById("field")}
        nav={nav}
        scopeSlot={<ProjectScopePicker depth="robot" />}
        headerRight={<span className="mono" style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 700 }}>local-first · cloud mirror 하위</span>}
      >
        {children}
      </ProductShell>
    </ScopeProvider>
  );
}
