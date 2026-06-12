// [SWS-BUILD-PROJECTS / SWC-PRODUCT-BUILD] Audit 워크벤치 — 실(實)감사 실행.
import { Workbench } from "./_workbench";

export default async function Page({ params }: { params: Promise<{ prj: string; aud: string }> }) {
  const { prj, aud } = await params;
  return <Workbench projectId={prj} audId={aud} />;
}
