"use client";
import { useRouter } from "next/navigation";
import { useShell } from "@station/shell";
import { AuditHome } from "./_screens/AuditHome";

const ROUTE: Record<string, string> = {
  "c02-home": "/audit",
  "c02-conf": "/audit/conformance",
  "c02-audit": "/audit/package",
};

export default function Page() {
  const router = useRouter();
  const { navWorkspace } = useShell();
  const onNav = (id: string) => {
    if (id.startsWith("c04")) { navWorkspace("firmware"); return; } // cross-workspace
    const r = ROUTE[id];
    if (r) router.push(r);
  };
  return <AuditHome onNav={onNav} density="regular" />;
}
