/* ============================================================
   C++ 정적분석기 — ROS2 노드(LPU·ACU). 규칙:
     QOS-002(안전 토픽 BEST_EFFORT 다운그레이드)·RES-001(raw new 누수)·
     STY-110(미사용)·DOC-001. + C 규칙 일부 재사용(MEM/UAF).
   ============================================================ */
import type { Finding } from "../types";
import { ctxOf, mk, countIdent } from "./util";

// IF-P 상 RELIABLE 이어야 하는 안전/명령 토픽 패턴.
const RELIABLE_TOPICS = /autonomy\/state|autonomy\/mode|\/cmd|mission|estop|safety/;

export function analyzeCpp(file: string, src: string): Finding[] {
  const c = ctxOf(file, src);
  const out: Finding[] = [];
  const L = c.lines;

  for (let i = 0; i < L.length; i++) {
    const ln = L[i];
    const n = i + 1;

    // QOS-002 — 안전/명령 토픽을 best_effort 로 생성.
    if (/create_publisher|create_subscription/.test(ln) && /best_effort/i.test(ln)) {
      const t = ln.match(/"([^"]+)"/);
      if (t && RELIABLE_TOPICS.test(t[1])) {
        out.push(mk(c, n, { rule: "QOS-002", severity: "warning", title: `QoS 다운그레이드 — '${t[1]}' 는 RELIABLE 이어야 함(BEST_EFFORT 사용)`, snippet: ln.trim() }));
      }
    }

    // RES-001 — raw new(스마트 포인터 아님) → 누수 위험.
    if (/=\s*new\s+[A-Za-z_]\w*\s*[\(\{]/.test(ln) && !/make_shared|make_unique|unique_ptr|shared_ptr/.test(ln)) {
      out.push(mk(c, n, { rule: "RES-001", severity: "warning", title: "raw new — RAII/스마트 포인터 미사용(누수 위험)", snippet: ln.trim() }));
    }

    // MEM-003 — use-after-free / delete-then-use(C++).
    const del = ln.match(/\b(?:delete|free)\s*\(?\s*([A-Za-z_]\w*)/);
    if (del) {
      const v = del[1];
      for (let j = i + 1; j < Math.min(L.length, i + 8); j++) {
        if (new RegExp(`\\b${v}\\s*(->|\\[|\\.)`).test(L[j])) {
          out.push(mk(c, j + 1, { rule: "MEM-003", severity: "critical", title: `use-after-free: '${v}'`, snippet: L[j].trim() }));
          break;
        }
      }
    }
  }

  // STY-110 — 미사용 지역 변수.
  for (let i = 0; i < L.length; i++) {
    const d = L[i].match(/^\s*(?:auto|int|double|float|bool|std::string)\s+([A-Za-z_]\w*)\s*=/);
    if (d && countIdent(src, d[1]) === 1) {
      out.push(mk(c, i + 1, { rule: "STY-110", severity: "low", title: `미사용 지역 변수 '${d[1]}'`, snippet: L[i].trim() }));
    }
  }

  return out;
}
