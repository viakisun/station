"use client";
import { usePathname, useRouter } from "next/navigation";
import { ConsoleShell } from "@station/shell";
import { encodeCtx, type ContextEnvelope } from "@station/domain";

const FIELD_URL = process.env.NEXT_PUBLIC_FIELD_URL || "http://localhost:7332";

const WORKSPACES = ["control", "audit", "incident", "firmware"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const seg = pathname.split("/")[1] || "control";
  const active = WORKSPACES.includes(seg) ? seg : "control";

  const onNav = (id: string, ctx?: Record<string, unknown>) => {
    // 크로스 오리진(field) 핸드오프 — ctx 쿼리로 컨텍스트 운반(00 §7)
    const q = ctx ? "?ctx=" + encodeCtx({ ...(ctx as ContextEnvelope), origin: "ops" }) : "";
    if (id === "hmi") {
      window.location.href = FIELD_URL + "/hmi/operate" + q;
      return;
    }
    if (id === "telemetry") {
      window.location.href = FIELD_URL + "/telemetry" + q;
      return;
    }
    if (id === "home" || id === "settings") return; // not ready
    router.push("/" + id);
  };
  const onOpenSession = (id: string) => router.push(`/control/sessions/${id}`);
  const theme: "ops" | "build" = active === "audit" || active === "firmware" ? "build" : "ops";

  return (
    <ConsoleShell active={active} onNav={onNav} onOpenSession={onOpenSession} theme={theme}>
      {children}
    </ConsoleShell>
  );
}
