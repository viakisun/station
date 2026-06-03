/* ============================================================
   CapabilityProfile.commands(CommandSpec) → 표준 CommandDescriptor[] (비파괴 투영)
   verb 는 NS 소문자로 표준화하고 기존 SCREAMING 동사는 legacyVerb 로 병기.
   ============================================================ */
import type { CommandDescriptor } from "@station/contracts";
import { capabilityProfiles } from "../data/mockups2";

const VERB_NS: Record<string, string> = {
  START_CAPTURE: "vision.capture.start",
  STOP_CAPTURE: "vision.capture.stop",
  CALIBRATE: "vision.calibrate",
  PINCH: "ee.pinch",
  RELEASE: "ee.release",
};

const ackPolicy = (a: string): CommandDescriptor["ack"] =>
  a === "exactly_once" || a === "at_least_once" || a === "at_most_once" ? a : "at_least_once";

const toMs = (t: string): number => {
  const m = /([\d.]+)\s*(ms|s)/.exec(t);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return m[2] === "s" ? n * 1000 : n;
};

export function capabilityToCommands(moduleId: string): CommandDescriptor[] {
  const prof = capabilityProfiles[moduleId];
  if (!prof) return [];
  return prof.commands.map((c) => ({
    verb: VERB_NS[c.verb] ?? c.verb.toLowerCase(),
    legacyVerb: c.verb,
    ack: ackPolicy(c.ack),
    timeoutMs: toMs(c.timeout),
    safety: c.safety ? "safety_critical" : "none",
  }));
}
