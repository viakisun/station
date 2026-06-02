/* ============================================================
   현장 HMI 커미셔닝 콘솔 — Mock 데이터 (H01)
   이기종 로봇/모듈/현장환경 · plug&play 아님 (식별→선택→compatible매칭→연결)
   (원본: hmi-console/data.js · window.HM — 값 1:1 보존)
   ============================================================ */
const robot = {
  id: "RBT-THIN-0011",
  type: "thin",
  model: "HV-Thinner X2",
  serial: "HX2-2026-0211",
  hmi: "HMI-FIELD-07",
  controller: "CTRL v3.2",
  power: 82,
};

const sites = [
  { id: "GH-A", name: "Greenhouse A", crop: "cherry tomato", rows: 32, beds: 8 },
  { id: "GH-B", name: "Greenhouse B", crop: "paprika", rows: 24, beds: 6 },
  { id: "GH-C", name: "Greenhouse C", crop: "cucumber", rows: 20, beds: 5 },
];

// 개발자 key (Release Console에서 발급된 것으로 설정)
const devKey = { id: "DK-FIELD-7F3A", scope: "module.read · device.register · registry.read", issuer: "Release Console", issued: "2026-05-28", state: "valid" };

// 모듈 카탈로그 (승인된 모듈 — 디스커버리 노드를 여기에 매핑)
const catalog = [
  { id: "MOD-CAM-V01", type: "Vision camera", vendor: "OptiVision", icon: "node" },
  { id: "MOD-CAM-V02", type: "Vision camera Pro", vendor: "OptiVision", icon: "node" },
  { id: "MOD-ARM-A2", type: "Manipulator", vendor: "ArmTech", icon: "node" },
  { id: "MOD-EE-THIN", type: "Thinning end-effector", vendor: "GreenEdge", icon: "node" },
  { id: "MOD-EE-PINCH", type: "Pinching end-effector", vendor: "GreenEdge", icon: "node" },
  { id: "MOD-NAV-N1", type: "Navigation", vendor: "NaviCore", icon: "node" },
  { id: "MOD-NAV-N2", type: "Navigation LiDAR", vendor: "NaviCore", icon: "node" },
];

// 버스에서 감지된 노드 (NOT plug&play — 일부는 수동 식별 필요)
// detect: identified | unidentified | conflict
const nodes = [
  { node: "BUS-01", port: "CAN-1", raw: "vid:0x1A2B pid:0x07", detect: "identified", suggest: "MOD-CAM-V01", fw: "2.4.1", proto: "MQTT" },
  { node: "BUS-02", port: "CAN-2", raw: "vid:0x33C0 pid:0x11", detect: "identified", suggest: "MOD-ARM-A2", fw: "1.9.0", proto: "ROS2" },
  { node: "BUS-03", port: "ETH-1", raw: "vid:0x9F01 pid:0x04", detect: "identified", suggest: "MOD-EE-THIN", fw: "3.1.2", proto: "MQTT" },
  { node: "BUS-04", port: "ETH-2", raw: "vid:0x5512 pid:0x02", detect: "identified", suggest: "MOD-NAV-N1", fw: "4.0.5", proto: "DDS" },
  { node: "BUS-05", port: "CAN-3", raw: "vid:0x????  pid:0x??", detect: "unidentified", suggest: null, fw: "—", proto: "—" },
  { node: "BUS-06", port: "USB-1", raw: "vid:0x9F01 pid:0x09", detect: "conflict", suggest: "MOD-EE-PINCH", fw: "3.0.9", proto: "MQTT", conflict: "robot_type mismatch (Pinch EE on a Thin robot)" },
] as { node: string; port: string; raw: string; detect: string; suggest: string | null; fw: string; proto: string; conflict?: string }[];
const detectMeta = {
  identified: { label: "identified", sev: "normal" },
  unidentified: { label: "unidentified", sev: "warning" },
  conflict: { label: "conflict", sev: "critical" },
};

// compatible 버전 매칭 — 모듈별 capability / firmware / protocol 후보
// state: approved(recommended) | compatible | warning | incompatible
const versions: Record<
  string,
  { capability: { v: string; state: string; note: string }[]; firmware: { v: string; state: string; note: string }[]; protocol: { v: string; state: string; note: string }[] }
> = {
  "MOD-CAM-V01": {
    capability: [
      { v: "CAP-CAM-v3", state: "approved", note: "recommended" },
      { v: "CAP-CAM-v2", state: "compatible", note: "legacy compatible" },
    ],
    firmware: [
      { v: "2.4.2", state: "approved", note: "frame-drop fix · deploying" },
      { v: "2.4.1", state: "compatible", note: "currently installed" },
      { v: "2.3.0", state: "warning", note: "telemetry cadence warning" },
    ],
    protocol: [
      { v: "PRT-MQTT-v2", state: "approved", note: "standard contract" },
      { v: "PRT-MQTT-v1", state: "incompatible", note: "ack policy mismatch" },
    ],
  },
};
const verMeta = {
  approved: { label: "recommended", sev: "normal" },
  compatible: { label: "compatible", sev: "normal" },
  warning: { label: "warning", sev: "warning" },
  incompatible: { label: "incompatible", sev: "critical" },
};

// 프로토콜 설정 프리셋
const transports = [
  { id: "MQTT", label: "MQTT v5", desc: "topic · QoS · ack", reco: true },
  { id: "ROS2", label: "ROS 2 / DDS", desc: "node · topic · service", reco: false },
  { id: "HTTP", label: "HTTP / REST", desc: "endpoint · webhook", reco: false },
];
const protocolDefaults = {
  transport: "MQTT",
  broker: "tls://edge-gw.local:8883",
  topicCmd: "robot/RBT-THIN-0011/cmd",
  topicTel: "robot/RBT-THIN-0011/telemetry",
  qos: 1,
  ack: "at_least_once",
  timeout: 500,
  security: "TLS · X.509",
};

// 커미셔닝 5단계
const steps = [
  { id: "connect", n: 1, icon: "qr", title: "Connect · auth", desc: "pairing code · dev key check", state: "done" },
  { id: "discover", n: 2, icon: "scan", title: "Module discovery", desc: "identify · select connected hardware", state: "current" },
  { id: "compat", n: 3, icon: "layers", title: "Compatible versions", desc: "Capability · firmware · protocol", state: "todo" },
  { id: "protocol", n: 4, icon: "branch", title: "Protocol setup", desc: "transport · topic · ack", state: "todo" },
  { id: "control", n: 5, icon: "link", title: "Connect · register", desc: "device registry", state: "todo" },
];

export const HMI = {
  robot,
  sites,
  devKey,
  catalog,
  nodes,
  detectMeta,
  versions,
  verMeta,
  transports,
  protocolDefaults,
  steps,
  safety: { state: "safe", label: "safe" },
};

export type HmiData = typeof HMI;
