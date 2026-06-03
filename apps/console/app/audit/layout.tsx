"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@station/design-system";

/* C02 · AUDIT · DEV KIT sub-nav (RC_NAV section 0) */
type NavItem = { id: string; icon: IconName; label: string; code: string; ready: boolean; href?: string };

const SECTION = "AUDIT · DEV KIT";
const ITEMS: NavItem[] = [
  { id: "c02-home", icon: "home2", label: "Dev kit home", code: "C02-00", ready: true, href: "/audit" },
  { id: "c02-conf", icon: "beaker", label: "Conformance tests", code: "C02-06", ready: true, href: "/audit/conformance" },
  { id: "c02-audit", icon: "pkg", label: "Audit Package", code: "C02-07", ready: true, href: "/audit/package" },
  { id: "c02-cap", icon: "layers", label: "Capability Profile", code: "C02-02", ready: false },
  { id: "c02-proto", icon: "branch", label: "Protocol builder", code: "C02-03", ready: false },
  { id: "c02-sdk", icon: "code", label: "SDK · 노드 적합성", code: "C02-08", ready: true, href: "/audit/sdk" },
  { id: "c02-key", icon: "key", label: "Sandbox · API keys", code: "C02-09", ready: false },
];

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeHref = ITEMS.filter(i => i.href && (i.href === "/audit" ? pathname === "/audit" : pathname.startsWith(i.href)))
    .sort((a, b) => (b.href!.length - a.href!.length))[0]?.href;

  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
      <nav style={{ width: "var(--nav-w)", flex: "none", background: "var(--surface)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, padding: "8px 8px", overflow: "auto" }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-3)", letterSpacing: ".4px", padding: "8px 10px 5px" }}>{SECTION}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {ITEMS.map(it => {
                const on = it.href === activeHref;
                const base: React.CSSProperties = {
                  display: "flex", alignItems: "center", gap: 10, height: 36, padding: "0 10px",
                  justifyContent: "flex-start", borderRadius: "var(--r-sm)", border: "none",
                  background: on ? "var(--surface-2)" : "transparent",
                  color: on ? "var(--ink)" : "var(--ink-2)", fontWeight: on ? 700 : 600, fontSize: 12.5,
                  textDecoration: "none",
                };
                if (!it.ready) {
                  return (
                    <button key={it.id} disabled title={it.label} style={{ ...base, color: "var(--ink-3)", opacity: 0.55, cursor: "default" }}>
                      <Icon name={it.icon} size={17} stroke={1.8} />
                      <span style={{ flex: 1, textAlign: "left" }}>{it.label}</span>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--line-strong)" }} />
                    </button>
                  );
                }
                return (
                  <Link key={it.id} href={it.href!} title={it.label} style={base}>
                    <Icon name={it.icon} size={17} stroke={on ? 2.1 : 1.8} />
                    <span style={{ flex: 1, textAlign: "left" }}>{it.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--canvas)", overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}
