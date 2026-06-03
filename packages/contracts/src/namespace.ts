/* ============================================================
   표준 신호/명령 네임스페이스(machine.* · env.*) + TCH-* legacy alias
   기존 telemetry.ts 채널을 폐기하지 않고 표준 NS의 alias로 둔다(비파괴).
   ============================================================ */

/** TCH-* (기존 표준채널 id) → 표준 NS 이름 */
export const LEGACY_TO_NS: Record<string, string> = {
  "TCH-gh-temp": "env.greenhouse.temperature",
  "TCH-gh-humidity": "env.greenhouse.humidity",
  "TCH-gh-co2": "env.greenhouse.co2",
  "TCH-gh-lux": "env.greenhouse.illuminance",
  "TCH-arm-joint-temp": "machine.arm.joint_temp",
  "TCH-ee-grip-force": "machine.ee.grip_force",
  "TCH-cam-fps": "machine.vision.fps",
  "TCH-nav-deviation": "machine.navigation.deviation",
  "TCH-batt-voltage": "machine.power.battery_voltage",
};

export const NS_TO_LEGACY: Record<string, string> = Object.fromEntries(
  Object.entries(LEGACY_TO_NS).map(([legacy, ns]) => [ns, legacy]),
);

/** TCH-* → 표준 NS 이름 */
export function toNamespace(legacyId: string): string | undefined {
  return LEGACY_TO_NS[legacyId];
}

/** 표준 NS 이름 → TCH-* (호환) */
export function toLegacy(channel: string): string | undefined {
  return NS_TO_LEGACY[channel];
}

/** 안전 관련 명령 verb(2단계 PolicyEngine/CommandRouter가 guard) */
const SAFETY_VERBS = new Set([
  "ee.pinch",
  "ee.release",
  "ee.calibrate",
  "arm.move",
  "arm.calibrate",
  "vision.calibrate",
  "motion.stop",
  "autonomy.pause",
  "autonomy.slow_down",
]);

export function isSafetyVerb(verb: string): boolean {
  return SAFETY_VERBS.has(verb);
}
