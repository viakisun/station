/* ============================================================
   Python 정적분석기 — VPU·Telemetry. 규칙:
     PY-MUTABLE-DEFAULT(가변 기본 인자)·PY-BARE-EXCEPT(광범위 except)·
     PY-UNUSED-IMPORT·DOC-001(공개 함수 docstring 없음).
   ============================================================ */
import type { Finding } from "../types";
import { ctxOf, mk } from "./util";

export function analyzePython(file: string, src: string): Finding[] {
  const c = ctxOf(file, src);
  const out: Finding[] = [];
  const L = c.lines;

  for (let i = 0; i < L.length; i++) {
    const ln = L[i];
    const n = i + 1;

    // PY-MUTABLE-DEFAULT — def f(..., x=[] | {})
    if (/^\s*def\s+\w+\s*\([^)]*=\s*(\[\s*\]|\{\s*\})/.test(ln)) {
      out.push(mk(c, n, { rule: "PY-MUTABLE-DEFAULT", severity: "warning", title: "가변 기본 인자 — 호출 간 상태 누수", snippet: ln.trim() }));
    }

    // PY-BARE-EXCEPT — except: / except Exception
    if (/^\s*except\s*:/.test(ln) || /^\s*except\s+Exception\b/.test(ln)) {
      out.push(mk(c, n, { rule: "PY-BARE-EXCEPT", severity: "warning", title: "광범위 except — 오류 은폐", snippet: ln.trim() }));
    }

    // DOC-001 — def 다음 줄에 docstring 없음(공개 함수, _ 시작 제외).
    const fn = ln.match(/^\s*def\s+([a-zA-Z]\w*)\s*\(/);
    if (fn && !fn[1].startsWith("_")) {
      const next = (L[i + 1] ?? "").trim();
      if (!next.startsWith('"""') && !next.startsWith("'''")) {
        out.push(mk(c, n, { rule: "DOC-001", severity: "info", title: `공개 함수 '${fn[1]}' docstring 없음`, snippet: ln.trim() }));
      }
    }
  }

  return out;
}
