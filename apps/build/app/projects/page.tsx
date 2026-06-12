// [SWS-BUILD-PROJECTS / SWC-PRODUCT-BUILD] 프로젝트 목록 — 통합/감사의 최상위.
import { SurfaceHeader } from "@station/app-kit";
import { ProjectsList } from "./_projects";

export default function Page() {
  return (
    <div>
      <SurfaceHeader sws="SWS-BUILD-PROJECTS" />
      <ProjectsList />
    </div>
  );
}
