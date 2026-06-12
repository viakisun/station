// [SWS-BUILD-PROJECTS / SWC-PRODUCT-BUILD] 프로젝트 허브 — Audit Package 목록(통합 작업 단위).
import { ProjectHub } from "./_hub";

export default async function Page({ params }: { params: Promise<{ prj: string }> }) {
  const { prj } = await params;
  return <ProjectHub projectId={prj} />;
}
