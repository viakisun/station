/* ============================================================
   Telemetry 설정 콘솔 — Mock 데이터 (T01)
   원천 신호 → 표준 TelemetryChannel 매핑 · 캘리브 · 정책 · 품질
   (원본: telemetry-console/data.js · window.TM — 값 1:1 보존)
   ============================================================ */
import type { MetaMap } from "../types";

const device = {
  id: "TEL-GW-A-07",
  model: "EdgeGateway v2",
  robot: "RBT-THIN-0011",
  site: "Greenhouse A",
  fw: "2.1.4",
  uplink: "MQTT · tls",
  power: "PoE",
};

// 원천 신호 (모듈/센서가 보내는 raw 필드)
const rawSignals = [
  { id: "r1", key: "th_amb", hex: "0x21", sample: "2461", hint: "temp ×0.01°C", mapped: "TCH-gh-temp" },
  { id: "r2", key: "rh_pct", hex: "0x22", sample: "68.4", hint: "humidity %", mapped: "TCH-gh-humidity" },
  { id: "r3", key: "co2_raw", hex: "0x23", sample: "612", hint: "ppm", mapped: "TCH-gh-co2" },
  { id: "r4", key: "lux_x10", hex: "0x24", sample: "8420", hint: "lux ×10", mapped: null },
  { id: "r5", key: "j1_temp", hex: "0x31", sample: "58.2", hint: "°C", mapped: "TCH-arm-joint-temp" },
  { id: "r6", key: "grip_n", hex: "0x41", sample: "12.4", hint: "N", mapped: "TCH-ee-grip-force" },
  { id: "r7", key: "cam_fps", hex: "0x51", sample: "29.6", hint: "fps", mapped: "TCH-cam-fps" },
  { id: "r8", key: "path_dev", hex: "0x52", sample: "8", hint: "mm", mapped: null },
  { id: "r9", key: "vbat_mv", hex: "0x61", sample: "48120", hint: "mV", mapped: null },
] as { id: string; key: string; hex: string; sample: string; hint: string; mapped: string | null }[];

// 플랫폼 표준 채널
const channels = [
  { id: "TCH-gh-temp", label: "GH temperature", unit: "°C", group: "Env", icon: "thermo" },
  { id: "TCH-gh-humidity", label: "GH humidity", unit: "%", group: "Env", icon: "drop" },
  { id: "TCH-gh-co2", label: "CO₂ level", unit: "ppm", group: "Env", icon: "waves" },
  { id: "TCH-gh-lux", label: "Illuminance", unit: "lux", group: "Env", icon: "sun" },
  { id: "TCH-arm-joint-temp", label: "Joint temp", unit: "°C", group: "Robot", icon: "thermo" },
  { id: "TCH-ee-grip-force", label: "Grip force", unit: "N", group: "Robot", icon: "zap" },
  { id: "TCH-cam-fps", label: "Vision FPS", unit: "fps", group: "Robot", icon: "activity" },
  { id: "TCH-nav-deviation", label: "Path deviation", unit: "mm", group: "Robot", icon: "activity" },
  { id: "TCH-batt-voltage", label: "Battery voltage", unit: "V", group: "Robot", icon: "zap" },
];

// 센서 캘리브레이션 대상
const calibrations = [
  { ch: "TCH-gh-temp", label: "GH temperature", raw: 24.95, cal: 24.61, zero: 0.0, span: 1.0, offset: -0.34, scale: 1.0, due: false },
  { ch: "TCH-gh-humidity", label: "GH humidity", raw: 70.2, cal: 68.4, zero: 0.0, span: 1.0, offset: -1.8, scale: 1.0, due: true },
  { ch: "TCH-ee-grip-force", label: "Grip force", raw: 13.1, cal: 12.4, zero: 0.2, span: 0.98, offset: 0.0, scale: 0.98, due: false },
  { ch: "TCH-arm-joint-temp", label: "Joint temp", raw: 58.9, cal: 58.2, zero: 0.0, span: 1.0, offset: -0.7, scale: 1.0, due: false },
];

// 샘플링/임계값 정책
const policies = [
  { ch: "TCH-gh-temp", rate: "5s", warn: "≥ 28", crit: "≥ 32", smooth: "MA 3", promote: true },
  { ch: "TCH-gh-humidity", rate: "5s", warn: "≥ 78", crit: "≥ 85", smooth: "MA 3", promote: true },
  { ch: "TCH-gh-co2", rate: "10s", warn: "≥ 900", crit: "≥ 1200", smooth: "none", promote: false },
  { ch: "TCH-arm-joint-temp", rate: "1s", warn: "≥ 70", crit: "≥ 85", smooth: "MA 5", promote: true },
  { ch: "TCH-ee-grip-force", rate: "500ms", warn: "≤ 10", crit: "≤ 8", smooth: "MA 5", promote: true },
  { ch: "TCH-cam-fps", rate: "1s", warn: "≤ 24", crit: "≤ 15", smooth: "none", promote: true },
];

// 데이터 품질 진단
const qualityMeta: MetaMap = {
  good: { label: "good", sev: "normal" },
  warn: { label: "warning", sev: "warning" },
  bad: { label: "bad", sev: "critical" },
};
const quality = [
  { ch: "TCH-gh-temp", label: "GH temperature", q: "good", complete: 99.8, latency: 120, outliers: 0, drift: "0.1%/d", series: [24.4, 24.5, 24.6, 24.6, 24.5, 24.7, 24.6, 24.6] },
  { ch: "TCH-gh-humidity", label: "GH humidity", q: "warn", complete: 97.2, latency: 340, outliers: 3, drift: "1.8%/d", series: [66, 67, 68, 74, 69, 68, 70, 68] },
  { ch: "TCH-gh-co2", label: "CO₂", q: "good", complete: 99.1, latency: 210, outliers: 0, drift: "0.3%/d", series: [600, 605, 612, 610, 608, 612, 615, 612] },
  { ch: "TCH-arm-joint-temp", label: "Joint temp", q: "good", complete: 99.9, latency: 40, outliers: 1, drift: "0.0%/d", series: [54, 55, 56, 57, 57, 58, 58, 58] },
  { ch: "TCH-ee-grip-force", label: "Grip force", q: "warn", complete: 95.4, latency: 90, outliers: 6, drift: "2.4%/d", series: [14, 13, 13, 12, 12, 12, 11, 12] },
  { ch: "TCH-cam-fps", label: "Vision FPS", q: "bad", complete: 88.1, latency: 510, outliers: 12, drift: "—", series: [30, 29, 18, 30, 16, 29, 12, 28] },
];

const steps = [
  { id: "onboard", n: 1, icon: "plug", title: "Device onboarding", desc: "gateway pairing · network", state: "done" },
  { id: "channel", n: 2, icon: "node", title: "Channel map builder", desc: "raw signals → standard channels", state: "current" },
  { id: "calib", n: 3, icon: "sliders", title: "Sensor calibration", desc: "zero/span/offset/scale", state: "todo" },
  { id: "policy", n: 4, icon: "gauge", title: "Sampling · thresholds", desc: "rate · threshold · promotion", state: "todo" },
];

export const TELEMETRY = {
  device,
  rawSignals,
  channels,
  calibrations,
  policies,
  quality,
  qualityMeta,
  steps,
  kpi: {
    channelsTotal: 9,
    channelsMapped: 6,
    quality: 96.3,
    latency: 188,
    buffer: 12,
    syncState: "live",
    devicesOnline: 4,
  },
};

export type TelemetryData = typeof TELEMETRY;
