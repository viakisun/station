/* ============================================================
   TELEMETRY mock(채널·캘리브·정책) → 표준 SignalChannel[] (비파괴 투영)
   ============================================================ */
import type { SignalChannel } from "@station/contracts";
import { toNamespace } from "@station/contracts";
import { TELEMETRY } from "../data/telemetry";
import { channelNode } from "./modules-to-nodes";

export function telemetryToSignalChannels(): SignalChannel[] {
  const calib = new Map(TELEMETRY.calibrations.map((c) => [c.ch, c]));
  const pol = new Map(TELEMETRY.policies.map((p) => [p.ch, p]));
  return TELEMETRY.channels.map((ch) => {
    const c = calib.get(ch.id);
    const p = pol.get(ch.id);
    const node = channelNode(ch.id);
    const out: SignalChannel = {
      channel: toNamespace(ch.id) ?? ch.id,
      legacyId: ch.id,
      label: ch.label,
      unit: ch.unit,
      group: ch.group,
    };
    if (node) out.node = node;
    if (c) out.calibration = { zero: c.zero, span: c.span, offset: c.offset, scale: c.scale, due: c.due };
    if (p) out.policy = { rate: p.rate, warn: p.warn, crit: p.crit, smooth: p.smooth, promote: p.promote };
    return out;
  });
}
