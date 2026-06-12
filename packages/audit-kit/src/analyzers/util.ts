/* 분석기 공용 — 라인 헬퍼. 실 소스 문자열에 규칙을 적용해 실 line 번호 산출. */
import type { Finding } from "../types";

export interface Ctx {
  file: string;
  lines: string[];
  src: string;
}

export function ctxOf(file: string, src: string): Ctx {
  return { file, src, lines: src.split("\n") };
}

/** i 번째 줄을 감싸는 함수명 추정(역방향으로 `name(...) {` 탐색). */
export function enclosingFn(lines: string[], i: number): string | undefined {
  const sig = /(?:^|\s)([A-Za-z_]\w*)\s*\([^;]*\)\s*\{?\s*$/;
  for (let j = i; j >= 0 && j > i - 80; j--) {
    const m = lines[j].match(sig);
    if (m && !/\b(if|for|while|switch|return|sizeof)\b/.test(m[1])) return m[1];
  }
  return undefined;
}

/** 식별자가 소스 전체에서 몇 번 등장하는지(unused 판정용). */
export function countIdent(src: string, name: string): number {
  const m = src.match(new RegExp(`\\b${name}\\b`, "g"));
  return m ? m.length : 0;
}

export function mk(c: Ctx, line: number, p: Omit<Finding, "file" | "line" | "fn">): Finding {
  return { ...p, file: c.file, line, fn: enclosingFn(c.lines, line - 1) };
}
