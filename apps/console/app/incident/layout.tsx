"use client";
/* ============================================================
   Incident & Quality — workspace sub-nav (ported from IcNav)
   ============================================================ */
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Icon, type IconName } from "@station/design-system";

type NavItem = {
  id: string;
  icon: IconName;
  label: string;
  code: string;
  ready: boolean;
  href?: string;
};

const IC_NAV: NavItem[] = [
  { id: "dashboard", icon: "alert", label: "Incident dashboard", code: "C03-00", ready: true, href: "/incident" },
  { id: "list", icon: "board", label: "Incidents · filter", code: "C03-01", ready: true, href: "/incident/list" },
  { id: "stream", icon: "activity", label: "Live event stream", code: "C03-02", ready: true, href: "/incident/stream" },
  { id: "report", icon: "trending", label: "Reports · analytics", code: "C03-08", ready: true, href: "/incident/reports" },
  { id: "errcode", icon: "fileCode", label: "Error-code dictionary", code: "C03-06", ready: false },
  { id: "policy", icon: "bell", label: "Alert policy", code: "C03-09", ready: false },
  { id: "recur", icon: "refresh", label: "Recurrence · postmortem", code: "C03-10", ready: false },
  { id: "maint", icon: "wrench", label: "Maintenance dispatch", code: "C03-07", ready: false },
];

export default function IncidentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (it: NavItem) => {
    if (!it.href) return false;
    if (it.href === "/incident") return pathname === "/incident";
    return pathname === it.href || pathname.startsWith(it.href + "/");
  };

  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
      <nav
        style={{
          width: "var(--nav-w)",
          flex: "none",
          background: "var(--surface)",
          borderRight: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
          transition: "width .16s",
        }}
      >
        <div style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {IC_NAV.map((it) => {
            const on = isActive(it);
            const content = (
              <>
                <Icon name={it.icon} size={18} stroke={on ? 2.1 : 1.8} />
                <span style={{ flex: 1, textAlign: "left" }}>{it.label}</span>
                {it.code && (
                  <span className="mono" style={{ fontSize: 9, color: "var(--ink-3)", fontWeight: 700 }}>
                    {it.code}
                  </span>
                )}
                {!it.ready && (
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--line-strong)" }} />
                )}
              </>
            );
            const baseStyle: React.CSSProperties = {
              display: "flex",
              alignItems: "center",
              gap: 11,
              height: 40,
              padding: "0 11px",
              justifyContent: "flex-start",
              borderRadius: "var(--r-sm)",
              border: "none",
              background: on ? "var(--surface-2)" : "transparent",
              color: on ? "var(--ink)" : "var(--ink-2)",
              fontWeight: on ? 700 : 600,
              fontSize: 12.5,
            };
            if (!it.ready || !it.href) {
              return (
                <button
                  key={it.id}
                  title={it.label}
                  disabled
                  style={{ ...baseStyle, opacity: 0.5, cursor: "default" }}
                >
                  {content}
                </button>
              );
            }
            return (
              <Link key={it.id} href={it.href} title={it.label} style={baseStyle}>
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--canvas)",
          overflow: "hidden",
        }}
      >
        <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>{children}</div>
      </main>
    </div>
  );
}
