/* ============================================================
   시나리오 정합 보완(범위 A) mock — 신규 7화면용
   온보딩·Capability·Protocol·펌웨어 등록·Registry·게이트웨이·디지털트윈
   값은 mock. 기존 RELEASE/CONTROL/TELEMETRY 재사용.
   ============================================================ */

// ---- C02-02 Capability Profile (per module) ----
export interface CommandSpec { verb: string; ack: string; timeout: string; safety?: boolean }
export interface CapabilityProfileMock {
  id: string; module: string; version: string;
  commands: CommandSpec[];
  telemetry: { channel: string; unit: string; rate: string }[];
  parameters: { key: string; type: string; range: string }[];
  calibration: { req: string; due: string }[];
  diff?: { field: string; from: string; to: string }[];
}
export const capabilityProfiles: Record<string, CapabilityProfileMock> = {
  "MOD-CAM-V01": {
    id: "CAP-CAM-v3", module: "MOD-CAM-V01", version: "v3",
    commands: [
      { verb: "START_CAPTURE", ack: "at_least_once", timeout: "500ms" },
      { verb: "STOP_CAPTURE", ack: "at_least_once", timeout: "500ms" },
      { verb: "CALIBRATE", ack: "exactly_once", timeout: "5s", safety: true },
    ],
    telemetry: [
      { channel: "TCH-cam-fps", unit: "fps", rate: "1s" },
      { channel: "TCH-cam-framedrop", unit: "%", rate: "1s" },
    ],
    parameters: [
      { key: "exposure", type: "int", range: "0–255" },
      { key: "fps_target", type: "int", range: "15–30" },
    ],
    calibration: [{ req: "camera-tool 좌표 보정", due: "작업 전 필수" }],
    diff: [{ field: "fps_target.range", from: "15–24", to: "15–30" }],
  },
  "MOD-EE-PINCH": {
    id: "CAP-EE-v4", module: "MOD-EE-PINCH", version: "v4",
    commands: [
      { verb: "PINCH", ack: "exactly_once", timeout: "800ms", safety: true },
      { verb: "RELEASE", ack: "at_least_once", timeout: "500ms" },
    ],
    telemetry: [{ channel: "TCH-ee-grip-force", unit: "N", rate: "500ms" }],
    parameters: [{ key: "grip_force", type: "float", range: "8–16 N" }],
    calibration: [{ req: "grip-force zero/span", due: "overdue" }],
  },
};

// ---- C02-03 Protocol Profile ----
export interface ProtocolProfileMock {
  id: string; module: string; transport: "MQTT" | "ROS2" | "DDS";
  topics: { dir: string; topic: string; payload: string }[];
  ack: string; timeout: string; security: string; sample: string;
}
export const protocolProfiles: Record<string, ProtocolProfileMock> = {
  "MOD-CAM-V01": {
    id: "PRT-MQTT-v2", module: "MOD-CAM-V01", transport: "MQTT",
    topics: [
      { dir: "cmd", topic: "robot/{id}/cam/cmd", payload: "CommandEnvelope" },
      { dir: "telemetry", topic: "robot/{id}/cam/tel", payload: "FrameStats" },
    ],
    ack: "at_least_once", timeout: "500ms", security: "TLS · X.509",
    sample: '{ "verb":"START_CAPTURE", "ts":"08:12:04", "args":{"fps":30} }',
  },
};

// ---- Device Registry / pairing ----
export interface RegistryDevice {
  robot_id: string; type: "thin" | "pinch"; gh: string;
  modules: string[]; hmi: string; tel: string;
  pairing: "paired" | "pairing" | "unpaired"; firmware_set: string;
}
export const registryDevices: RegistryDevice[] = [
  { robot_id: "RBT-THIN-0001", type: "thin", gh: "GH-A", modules: ["MOD-CAM-V01", "MOD-ARM-A2", "MOD-EE-THIN", "MOD-NAV-N1"], hmi: "HMI-A-01", tel: "TEL-A-01", pairing: "paired", firmware_set: "FW-CAM-2.4.1·FW-ARM-1.9.0" },
  { robot_id: "RBT-PINCH-0004", type: "pinch", gh: "GH-B", modules: ["MOD-CAM-V01", "MOD-ARM-A2", "MOD-EE-PINCH", "MOD-NAV-N1"], hmi: "HMI-B-01", tel: "TEL-B-01", pairing: "paired", firmware_set: "FW-EEP-3.0.9" },
  { robot_id: "RBT-THIN-0011", type: "thin", gh: "GH-A", modules: ["MOD-CAM-V02", "MOD-ARM-A2", "MOD-EE-THIN", "MOD-NAV-N1"], hmi: "HMI-FIELD-07", tel: "TEL-GW-A-07", pairing: "pairing", firmware_set: "—" },
];
export const pairingCode = { code: "PAIR-7F3A-2196", ttl: "04:58", target: "RBT-THIN-0011" };

// ---- Telemetry Gateway (JJ-P02) ----
export interface GatewayMock {
  device: { id: string; model: string; uplink: string; robots: number };
  ingest: { key: string; hex: string; sample: string; mapped: string | null; quality: "good" | "warn" | "bad" }[];
  qos: { topic: string; qos: number; ack: string };
}
export const gateway: GatewayMock = {
  device: { id: "TEL-GW-A-07", model: "EdgeGateway v2", uplink: "MQTT · tls", robots: 4 },
  ingest: [
    { key: "th_amb", hex: "0x21", sample: "2461", mapped: "TCH-gh-temp", quality: "good" },
    { key: "rh_pct", hex: "0x22", sample: "68.4", mapped: "TCH-gh-humidity", quality: "warn" },
    { key: "cam_fps", hex: "0x51", sample: "29.6", mapped: "TCH-cam-fps", quality: "good" },
    { key: "grip_n", hex: "0x41", sample: "12.4", mapped: "TCH-ee-grip-force", quality: "warn" },
    { key: "lux_x10", hex: "0x24", sample: "8420", mapped: null, quality: "bad" },
  ],
  qos: { topic: "site/jinju/robot/+/telemetry", qos: 1, ack: "at_least_once" },
};

// ---- Digital Twin MVP (JJ-P01) — 2D ----
export interface TwinRobot { id: string; type: "thin" | "pinch"; gh: string; x: number; y: number; state: string; progress: number }
export const twinState = {
  greenhouse: { id: "GH-A", name: "Greenhouse A", crop: "cherry tomato", zones: ["A-1", "A-3", "A-5", "A-7"] },
  robots: [
    { id: "RBT-THIN-0001", type: "thin" as const, gh: "GH-A", x: 26, y: 34, state: "working", progress: 62 },
    { id: "RBT-THIN-0002", type: "thin" as const, gh: "GH-A", x: 70, y: 18, state: "ready", progress: 0 },
    { id: "RBT-PINCH-0003", type: "pinch" as const, gh: "GH-A", x: 48, y: 70, state: "paused", progress: 38 },
  ] as TwinRobot[],
  simEvents: [
    { id: "battery", label: "배터리 방전 (RBT-THIN-0002)", sev: "warning" },
    { id: "tipover", label: "전복 위험 (RBT-PINCH-0003)", sev: "critical" },
    { id: "obstacle", label: "장애물 진입 (A-3 통로)", sev: "notice" },
  ],
  mirror: { latency: "1.2s", sync: "live", fidelity: "2D (3D 향후)" },
};
