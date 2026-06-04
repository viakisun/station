"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@station/design-system";

/* C04 · FIRMWARE · DEPLOY sub-nav (RC_NAV section 1) */
type NavItem = { id: string; icon: IconName; label: string; code: string; ready: boolean; href?: string };

const SECTION = "FIRMWARE · DEPLOY";
const ITEMS: NavItem[] = [
  { id: "c04-dash", icon: "gauge", label: "Firmware dashboard", code: "C04-00", ready: true, href: "/firmware" },
  { id: "c04-static", icon: "fileCode", label: "Static analysis", code: "C04-02", ready: true, href: "/firmware/static-analysis" },
  { id: "c04-compat", icon: "server", label: "Compatibility matrix", code: "C04-03", ready: true, href: "/firmware/compatibility" },
  { id: "c04-ota", icon: "rocket", label: "OTA rollout monitor", code: "C04-06", ready: true, href: "/firmware/ota" },
  { id: "c04-rollback", icon: "rollback", label: "Rollback · recovery", code: "C04-07", ready: false },
  { id: "c04-policy", icon: "settings", label: "Firmware policy", code: "C04-10", ready: false },
];

export default function FirmwareLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeHref = ITEMS.filter(i => i.href && (i.href === "/firmware" ? pathname === "/firmware" : pathname.startsWith(i.href)))
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
