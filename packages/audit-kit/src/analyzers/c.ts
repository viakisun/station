/* ============================================================
   C 정적분석기 — 펌웨어(MCU·EE) 규칙. 실 소스에 적용해 실 findings 산출.
   규칙: MEM-001(overflow)·CON-014(interlock bypass)·MEM-003(UAF)·
         TIM-007(no watchdog)·STY-220(narrowing)·STY-110(unused/implicit)·DOC-001.
   ============================================================ */
import type { Finding } from "../types";
import { ctxOf, mk, countIdent } from "./util";

const FN_DEF = /^[A-Za-z_][\w \t\*]*\b([A-Za-z_]\w*)\s*\([^;{]*\)\s*\{?\s*$/;
const COMMENTISH = /^\s*(\/\/|\/\*|\*|\*\/)/;

export function analyzeC(file: string, src: string): Finding[] {
  const c = ctxOf(file, src);
  const out: Finding[] = [];
  const L = c.lines;

  for (let i = 0; i < L.length; i++) {
    const ln = L[i];
    const n = i + 1;

    // MEM-001 — 경계검사 없는 메모리 복사.
    const mc = ln.match(/\bmemcpy\s*\([^,]+,[^,]+,\s*([A-Za-z_]\w*)\s*\)/);
    if (mc && !/sizeof/.test(ln)) {
      out.push(mk(c, n, { rule: "MEM-001", severity: "critical", title: `경계 검사 없는 memcpy (length='${mc[1]}')`, snippet: ln.trim() }));
    }
    if (/\b(strcpy|strcat|gets|sprintf)\s*\(/.test(ln)) {
      out.push(mk(c, n, { rule: "MEM-001", severity: "critical", title: "unbounded string 연산", snippet: ln.trim() }));
    }

    // CON-014 — interlock 우회(force 경로에서 잠금 해제).
    if (/\bg?_?locked\s*=\s*0/.test(ln)) {
      const back = L.slice(Math.max(0, i - 4), i + 1).join("\n");
      if (/if\s*\(\s*force/.test(back)) {
        out.push(mk(c, n, { rule: "CON-014", severity: "critical", title: "safety-interlock 우회 — interlock 검증 없이 잠금 해제", snippet: ln.trim() }));
      }
    }

    // MEM-003 — use-after-free.
    const fr = ln.match(/\bfree\s*\(\s*([A-Za-z_]\w*)\s*\)/);
    if (fr) {
      const v = fr[1];
      for (let j = i + 1; j < Math.min(L.length, i + 10); j++) {
        if (new RegExp(`\\b${v}\\s*(->|\\[|\\.)`).test(L[j])) {
          out.push(mk(c, j + 1, { rule: "MEM-003", severity: "critical", title: `use-after-free: '${v}' (L${n} 에서 free 후 재사용)`, snippet: L[j].trim() }));
          break;
        }
      }
    }

    // STY-220 — narrowing 캐스트(곱셈 포함 → 오버플로 가능).
    if (/\(\s*(int8_t|int16_t|short|uint8_t|uint16_t)\s*\)\s*\([^)]*\*[^)]*\)/.test(ln)) {
      out.push(mk(c, n, { rule: "STY-220", severity: "warning", title: "narrowing 캐스트 — 정수 오버플로 가능", snippet: ln.trim() }));
    }

    // TIM-007 — 무한 루프에 watchdog refresh 없음.
    if (/\bfor\s*\(\s*;\s*;\s*\)|\bwhile\s*\(\s*1\s*\)/.test(ln)) {
      const body = L.slice(i, Math.min(L.length, i + 40)).join("\n");
      if (!/watchdog_refresh|IWDG|wdt_reset|HAL_IWDG|kick_wdt/.test(body)) {
        out.push(mk(c, n, { rule: "TIM-007", severity: "warning", title: "무한 루프에 watchdog refresh 영역 없음", snippet: ln.trim() }));
      }
    }

    // STY-110(b) — 암묵적 float→int 변환(곱셈 결과를 int 로).
    const ic = ln.match(/\bint\s+(\w+)\s*=\s*[A-Za-z_]\w*\s*\*\s*[A-Za-z_]\w*\s*;/);
    if (ic && /\bfloat\b|\bdouble\b/.test(src.slice(0, src.indexOf(ln)).split("\n").slice(-30).join("\n"))) {
      out.push(mk(c, n, { rule: "STY-110", severity: "low", title: "암묵적 부동소수→정수 변환(명시 캐스트 없음)", snippet: ln.trim() }));
    }

    // DOC-001 — 공개(non-static) 함수에 doc 주석 없음.
    const fd = ln.match(FN_DEF);
    if (fd && !/^\s*(static|typedef|return|else)\b/.test(ln) && !/=/.test(ln) && /\{?\s*$/.test(ln)) {
      const prev = L[i - 1] ?? "";
      const isPublic = !/^\s*static\b/.test(ln);
      if (isPublic && !COMMENTISH.test(prev) && prev.trim() !== "") {
        out.push(mk(c, n, { rule: "DOC-001", severity: "info", title: `공개 함수 '${fd[1]}' doc 주석 없음`, snippet: ln.trim() }));
      }
    }
  }

  // STY-110(a) — 미사용 지역 변수(선언 후 1회만 등장).
  for (let i = 0; i < L.length; i++) {
    const d = L[i].match(/^\s*(?:int|uint\d+_t|int\d+_t|float|double|char|short|long|size_t)\s+([A-Za-z_]\w*)\s*=/);
    if (d && countIdent(src, d[1]) === 1) {
      out.push(mk(c, i + 1, { rule: "STY-110", severity: "low", title: `미사용 지역 변수 '${d[1]}'`, snippet: L[i].trim() }));
    }
  }

  return out;
}
