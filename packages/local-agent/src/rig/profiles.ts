import type { ProtocolProfile, WireBinding } from "@station/contracts";
import mcuWire from "@station/contracts/profiles/wire/wire.mcu.can.json" with { type: "json" };
import vpuWire from "@station/contracts/profiles/wire/wire.vpu.ros2.json" with { type: "json" };
import lpuWire from "@station/contracts/profiles/wire/wire.lpu.dds.json" with { type: "json" };
import acuWire from "@station/contracts/profiles/wire/wire.acu.dds.json" with { type: "json" };
import telemetryWire from "@station/contracts/profiles/wire/wire.telemetry.mqtt.json" with { type: "json" };

/* ============================================================
   온실 SDV 리그 — 노드별 통신 계약(ProtocolProfile).
   출처: docs/architecture/sdv-crop-growth-rig.md §03 Hardware Topology +
        station-field-os.md(§① RAL: CAN·Modbus(MCU)/ROS2·DDS(ACU·VPU·LPU)/MQTT).
   주의: 실 DDS 는 토픽별 QoS 를 따로 둔다. 본 모델은 ProtocolProfile.ack(노드 1개=QoS 1개)
   단순화 — 노드 성격에 맞춘 대표 QoS. 실 드라이버 교체 시 토픽별 QoS 로 세분화.
   ============================================================ */

export const MCU_PROFILE: ProtocolProfile = {
  id: "PRT-CAN-MCU-v1",
  transport: "CAN",
  ack: "at_most_once", // 종단 ACK 없음 — 주기 브로드캐스트
  timeout: "20ms",
  security: "none (physical bus · E-stop은 HW 회로)",
  topics: [
    { dir: "telemetry", topic: "0x18FF50 (motion·BMS)", payload: "machine.motion.speed · machine.battery.voltage" },
    { dir: "cmd", topic: "0x18EF50 (control)", payload: "motion.stop · motion.set_speed_limit" },
    { dir: "event", topic: "0x18FFE0 (emergency)", payload: "emergency_stop" },
  ],
  sample: "CAN 2.0B 500kbps · 8B/frame · ISO-TP 멀티프레임(바이너리 권장)",
};

export const VPU_PROFILE: ProtocolProfile = {
  id: "PRT-ROS2-VPU-v1",
  transport: "ROS2",
  ack: "at_least_once", // 생육분석 결과·이벤트는 RELIABLE
  timeout: "200ms",
  security: "DDS-Security(X.509) · dev=none",
  topics: [
    { dir: "telemetry", topic: "rt/crop/growth", payload: "crop.growth.* · vision.fps" },
    { dir: "cmd", topic: "rt/vision/capture", payload: "vision.capture · scan · calibrate" },
    { dir: "event", topic: "rt/disease/suspected", payload: "disease.suspected" },
  ],
  sample: "RTPS/UDP · Jetson Orin · RELIABLE/VOLATILE",
};

export const LPU_PROFILE: ProtocolProfile = {
  id: "PRT-DDS-LPU-v1",
  transport: "DDS", // SSOT(conformance EXPECTED_PROTOCOL) = DDS. ROS2 도 DDS 위.
  ack: "at_most_once", // 고주기 pose 스트림 — BEST_EFFORT
  timeout: "50ms",
  security: "DDS-Security(X.509) · dev=none",
  topics: [
    { dir: "telemetry", topic: "rt/localization/pose", payload: "localization.pose.* · confidence · map_id" },
    { dir: "cmd", topic: "rt/localization/relocalize", payload: "localization.relocalize" },
  ],
  sample: "RTPS/UDP · SLAM 융합 · BEST_EFFORT/VOLATILE(고주기)",
};

export const ACU_PROFILE: ProtocolProfile = {
  id: "PRT-DDS-ACU-v1",
  transport: "DDS",
  ack: "at_least_once", // 미션 상태/명령 RELIABLE
  timeout: "150ms",
  security: "DDS-Security(X.509) · dev=none",
  topics: [
    { dir: "telemetry", topic: "rt/autonomy/state", payload: "autonomy.state · mission.progress" },
    { dir: "cmd", topic: "rt/mission/cmd", payload: "mission.start · pause · cancel" },
  ],
  sample: "RTPS/UDP · 미션 FSM · RELIABLE/TRANSIENT_LOCAL",
};

export const TELEMETRY_PROFILE: ProtocolProfile = {
  id: "PRT-MQTT-TELEMETRY-v1",
  transport: "MQTT",
  ack: "at_least_once", // QoS1 클라우드 업링크
  timeout: "2s",
  security: "TLS · X.509(클라우드)",
  topics: [
    { dir: "telemetry", topic: "station/{site}/{robot}/tlm/#", payload: "전 노드 흡수 신호 업링크" },
    { dir: "cmd", topic: "station/{site}/{robot}/cmd/#", payload: "클라우드 요청(Policy Engine 경유)" },
  ],
  sample: "MQTT v5 · LTE/5G · QoS1 · retain(LWT) · 35~140ms RTT",
};

/** 노드 kind → ProtocolProfile. createLocalAgent 매니페스트의 attachesToNode 로 조회. */
export const NODE_PROFILES: Record<string, ProtocolProfile> = {
  MCU: MCU_PROFILE,
  VPU: VPU_PROFILE,
  LPU: LPU_PROFILE,
  ACU: ACU_PROFILE,
  Telemetry: TELEMETRY_PROFILE,
};

export const ALL_PROFILES = [MCU_PROFILE, VPU_PROFILE, LPU_PROFILE, ACU_PROFILE, TELEMETRY_PROFILE];

/** 노드 kind → WireBinding(IF-P 페이로드 IDL). ProfiledTransport 가 소비해 선언된
    frameId/topic/레이아웃으로 프레이밍 — CAN 은 JSON 휴리스틱(수십 프레임)이 아니라 바이너리 단일 프레임. */
export const NODE_BINDINGS: Record<string, WireBinding> = {
  MCU: mcuWire as WireBinding,
  VPU: vpuWire as WireBinding,
  LPU: lpuWire as WireBinding,
  ACU: acuWire as WireBinding,
  Telemetry: telemetryWire as WireBinding,
};
