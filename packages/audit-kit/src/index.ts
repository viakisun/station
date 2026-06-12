/* [SWC-AUDIT-KIT] 공개 API — 인브라우저 실(實)감사 엔진. */
export * from "./types";
export { runAudit, finalizeReport } from "./engine";
export { AUDIT_TARGETS, TARGET_IDS, getTarget, SUITES, NODE_FACTORY } from "./targets";
export { analyzeFile, analyzeFiles, scoreFindings, sourceOf } from "./static";
