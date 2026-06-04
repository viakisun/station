"use client";
import { useRouter } from "next/navigation";
import { FirmwareDash } from "./_screens/FirmwareDash";

const ROUTE: Record<string, string> = {
  "c04-dash": "/firmware",
  "c04-static": "/firmware/static-analysis",
  "c04-compat": "/firmware/compatibility",
  "c04-ota": "/firmware/ota",
};

export default function Page() {
  const router = useRouter();
  const onNav = (id: string) => { const r = ROUTE[id]; if (r) router.push(r); };
  return <FirmwareDash onNav={onNav} density="regular" />;
}
