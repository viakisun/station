"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LIVE_SCREENS = [
  { key: "map",     code: "C01-05", label: "Live control map", href: "/control/map" },
  { key: "session", code: "C01-06", label: "Work session",     href: "/control/map" },
];
const CONSOLE_SCREENS = [
  { key: "dashboard", code: "C01-00", label: "Ops dashboard", href: "/control" },
  { key: "maps",      code: "C01-01", label: "Maps · versions", href: "/control/maps" },
  { key: "work-plan", code: "C01-04", label: "Work plan",      href: "/control/work-plan" },
];

function isActive(pathname: string, href: string) {
  if (href === "/control") return pathname === "/control";
  return pathname === href || pathname.startsWith(href + "/");
}

function TabGroup({ label, items, pathname }: { label: string; items: typeof LIVE_SCREENS; pathname: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".4px", marginRight: 4 }}>{label}</span>
      {items.map((s) => {
        const on = isActive(pathname, s.href) ||
          (s.key === "session" && pathname.startsWith("/control/sessions"));
        return (
          <Link key={s.key} href={s.href} style={{
            display: "flex", alignItems: "center", gap: 6, textDecoration: "none",
            padding: "6px 11px", borderRadius: "var(--r-sm)", fontSize: 12.5,
            fontWeight: on ? 700 : 600, color: on ? "var(--ink)" : "var(--ink-3)",
            background: on ? "var(--surface-2)" : "transparent", border: "1px solid " + (on ? "var(--line)" : "transparent") }}>
            <span className="mono" style={{ fontSize: 9.5, fontWeight: 700, color: "var(--ink-3)" }}>{s.code}</span>
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function ControlLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 16,
        padding: "8px 16px", background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
        <TabGroup label="Live" items={LIVE_SCREENS} pathname={pathname} />
        <span style={{ width: 1, height: 20, background: "var(--line)" }} />
        <TabGroup label="Console" items={CONSOLE_SCREENS} pathname={pathname} />
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}
