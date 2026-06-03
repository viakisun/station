/* ============================================================
   INCIDENT.streamSeed(구조화 이벤트) + CONTROL.events(대시보드 스트림) → 표준 Event[]
   ============================================================ */
import type { Event } from "@station/contracts";
import { CONTROL } from "../data/control";
import { INCIDENT } from "../data/incident";

type Severity = Event["severity"];
const SEVS: readonly string[] = ["info", "notice", "warning", "critical", "emergency"];
const sev = (s: string): Severity => (SEVS.includes(s) ? (s as Severity) : "info");

export function eventsToEvents(): Event[] {
  const fromStream: Event[] = INCIDENT.streamSeed.map((e) => ({
    ts: e.t,
    severity: sev(e.sev),
    source: e.node,
    code: e.code,
    message: e.msg,
    promotedIncidentId: e.promoted,
  }));
  const fromControl: Event[] = CONTROL.events.map((e) => ({
    ts: e.t,
    severity: sev(e.sev),
    source: e.src,
    code: "EVENT",
    message: e.msg,
  }));
  return [...fromStream, ...fromControl];
}
