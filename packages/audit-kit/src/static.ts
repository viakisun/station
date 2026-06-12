/* 정적분석 오케스트레이션 — 확장자별 분석기를 실 소스(SAMPLES)에 적용. */
import { SAMPLES } from "./samples.generated";
import { analyzeC } from "./analyzers/c";
import { analyzeCpp } from "./analyzers/cpp";
import { analyzePython } from "./analyzers/python";
import type { Finding, Severity } from "./types";

const PENALTY: Record<Severity, number> = { critical: 40, warning: 10, low: 3, info: 1 };

export function sourceOf(path: string): string {
  return SAMPLES[path] ?? "";
}

export function analyzeFile(path: string): Finding[] {
  const src = SAMPLES[path];
  if (src == null) return [];
  if (path.endsWith(".py")) return analyzePython(path, src);
  if (path.endsWith(".cpp") || path.endsWith(".hpp")) return analyzeCpp(path, src);
  if (path.endsWith(".c") || path.endsWith(".h")) return analyzeC(path, src);
  return [];
}

export function analyzeFiles(paths: string[]): Finding[] {
  return paths.flatMap(analyzeFile);
}

export function scoreFindings(findings: Finding[]): number {
  let p = 0;
  for (const f of findings) p += PENALTY[f.severity];
  return Math.max(0, 100 - p);
}
