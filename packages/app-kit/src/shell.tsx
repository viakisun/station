"use client";
/* ============================================================
   [SWC-PRODUCT-* / WR-MVP-1] ProductShell·ProductNav·ProductCard.
   강결합된 ConsoleShell 대체 — 제품-agnostic·설정형. Hub/Ops/Build/Field가
   동일 chrome 언어를 공유(브랜드·제품·authority/locus·scope·nav).
   ============================================================ */
import type { ReactNode } from "react";
import { Icon, type IconName } from "@station/design-system";
import type { ProductDef } from "./product-matrix";
import { AuthorityBadge } from "./surface";

export interface NavItem {
  label: string;
  href: string;
  icon?: IconName;
  active?: boolean;
}

/** 제품 셸 — top chrome(브랜드·제품·권한·scope slot) + left nav + main. data-theme 적용. */
export function ProductShell({
  product,
  nav,
  scopeSlot,
  headerRight,
  children,
}: {
  product: ProductDef;
  nav: NavItem[];
  scopeSlot?: ReactNode;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div data-theme={product.theme} style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--canvas)", color: "var(--ink)", fontFamily: "var(--font-ui)" }}>
      <header style={{ flex: "none", display: "flex", alignItems: "center", gap: 12, padding: "9px 16px", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
        <a href={process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:7330"} style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none", color: "var(--ink)" }}>
          <span style={{ width: 22, height: 22, borderRadius: 5, background: "var(--ink)", color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800 }}>S</span>
          <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: "-.2px" }}>STATION</span>
        </a>
        <span style={{ width: 1, height: 18, background: "var(--line-strong)" }} />
        <strong style={{ fontSize: 13 }}>{product.label}</strong>
        <AuthorityBadge authority={product.authority} locus={product.locus} />
        <div style={{ flex: 1 }} />
        {scopeSlot}
        {headerRight}
      </header>
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <nav style={{ flex: "none", width: 188, borderRight: "1px solid var(--line)", background: "var(--surface)", padding: 8, overflow: "auto" }}>
          <ProductNav items={nav} />
        </nav>
        <main style={{ flex: 1, minWidth: 0, overflow: "auto" }}>{children}</main>
      </div>
    </div>
  );
}

export function ProductNav({ items }: { items: NavItem[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map((it) => (
        <a
          key={it.href}
          href={it.href}
          style={{
            display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: "var(--r-sm)",
            textDecoration: "none", fontSize: 12.5, fontWeight: it.active ? 700 : 500,
            color: it.active ? "var(--ink)" : "var(--ink-2)",
            background: it.active ? "var(--surface-2)" : "transparent",
            borderLeft: it.active ? "2px solid var(--ink)" : "2px solid transparent",
          }}
        >
          {it.icon && <Icon name={it.icon} size={15} />}
          {it.label}
        </a>
      ))}
    </div>
  );
}

/** Hub 제품 카드 — Product Matrix의 한 제품을 role/locus/authority로 표현. */
export function ProductCard({ product }: { product: ProductDef }) {
  return (
    <a href={product.href} className="card" style={{ display: "block", padding: 16, textDecoration: "none", color: "var(--ink)", borderLeft: "3px solid var(--ink)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <strong style={{ fontSize: 15 }}>{product.label}</strong>
        <AuthorityBadge authority={product.authority} locus={product.locus} />
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 6 }}>{product.purpose}</div>
      <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>user: {product.user} · {product.authorityLabel}</div>
    </a>
  );
}
