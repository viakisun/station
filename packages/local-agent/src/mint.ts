import { isId } from "@station/contracts";

/**
 * M3 — 런타임 식별자 민팅 유틸(local-agent 전용).
 * ids.ts 는 검증기(isId)만 두고 생성기는 없다 → SCN-/OBS- 식별자를 여기서 민팅한다.
 * 문법: SCN-YYYYMMDD-NNNN · OBS-YYYYMMDD-NNNN (일자 + 4자리 증가 seq).
 * new Date() 허용(런타임 인스턴스 식별자라 결정성보다 단조성이 우선).
 */
const seq = new Map<string, number>();

function today(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function next(prefix: string, date: string): string {
  const key = `${prefix}-${date}`;
  const n = (seq.get(key) ?? 0) + 1;
  seq.set(key, n);
  return String(n).padStart(4, "0");
}

/** 새 스캔 세션 식별자 SCN-YYYYMMDD-NNNN. */
export function mintScan(): string {
  const date = today();
  const id = `SCN-${date}-${next("SCN", date)}`;
  if (!isId("scanSession", id)) throw new Error(`mintScan produced invalid id: ${id}`);
  return id;
}

/** 새 관측 식별자 OBS-YYYYMMDD-NNNN. */
export function mintObservation(): string {
  const date = today();
  const id = `OBS-${date}-${next("OBS", date)}`;
  if (!isId("observation", id)) throw new Error(`mintObservation produced invalid id: ${id}`);
  return id;
}
