/* ============================================================
   감사 대상 레지스트리 — 노드/모듈 ↔ 실 소스·계약·러너 연결점.
   build 앱은 domain audit-packages(AUD-*) 를 이 target id 로 매핑한다.
   ============================================================ */
import type { ConformanceSuite } from "@station/contracts";
import type { MockSource } from "@station/node-kit";
import { McuSource } from "@station/node-mcu";
import { VpuSource } from "@station/node-vpu";
import { LpuSource } from "@station/node-lpu";
import { AcuSource } from "@station/node-acu";
import type { AuditTarget } from "./types";

/** 노드 FSM 팩토리 — conformance 단계가 실제로 부팅·검사. */
export const NODE_FACTORY: Record<string, () => MockSource> = {
  MCU: () => new McuSource(),
  VPU: () => new VpuSource(),
  LPU: () => new LpuSource(),
  ACU: () => new AcuSource(),
};

/** conformance 스위트 — 실 FSM 이 emit/ack 하는 채널·verb 와 정합. */
export const SUITES: Record<string, ConformanceSuite> = {
  MCU: {
    id: "TS-MCU", node: "MCU", protocolRef: "PRT-CAN-v1",
    expectSignals: ["machine.motion.speed", "machine.power.battery_voltage", "machine.safety.estop", "machine.heartbeat.mcu"],
    expectCommands: ["motion.stop", "motion.set_speed_limit"], windowMs: 1500, maxAckMs: 1000,
  } as ConformanceSuite,
  ACU: {
    id: "TS-ACU", node: "ACU", protocolRef: "PRT-DDS-v1",
    expectSignals: ["machine.autonomy.state", "machine.autonomy.mode", "machine.navigation.deviation", "machine.heartbeat.acu"],
    expectCommands: ["autonomy.mission.start", "autonomy.pause", "autonomy.slow_down"], windowMs: 1500, maxAckMs: 1000,
  } as ConformanceSuite,
  LPU: {
    id: "TS-LPU", node: "LPU", protocolRef: "PRT-DDS-v1",
    expectSignals: ["machine.localization.confidence", "machine.localization.pose.x", "machine.localization.pose.y", "machine.localization.pose.theta", "machine.localization.map_match", "machine.heartbeat.lpu"],
    expectCommands: ["localization.relocalize"], windowMs: 1500, maxAckMs: 1000,
  } as ConformanceSuite,
  VPU: {
    id: "TS-VPU", node: "VPU", protocolRef: "PRT-ROS-v1",
    expectSignals: ["machine.vision.fps", "machine.vision.framedrop", "machine.vision.worker_detected", "machine.heartbeat.vpu"],
    expectCommands: ["vision.capture.start", "vision.capture.stop", "vision.calibrate"], windowMs: 1500, maxAckMs: 1000,
  } as ConformanceSuite,
};

export const AUDIT_TARGETS: Record<string, AuditTarget> = {
  MCU: {
    id: "MCU", label: "MCU — 하위제어(베어메탈/CAN)", kind: "node", node: "MCU", lang: "c",
    files: ["firmware/mcu-stm32/main.c", "firmware/mcu-stm32/can.h"],
    declaredSignals: ["machine.motion.speed", "machine.power.battery_voltage", "machine.safety.estop", "machine.heartbeat.mcu"],
    wireInterfaceId: "IF-P-MCU",
  },
  LPU: {
    id: "LPU", label: "LPU — 측위(ROS2/DDS)", kind: "node", node: "LPU", lang: "cpp",
    files: ["ros2/lpu_localization/src/lpu_node.cpp"],
    declaredSignals: ["machine.localization.pose", "machine.localization.map_match"],
    wireInterfaceId: "IF-P-LPU",
  },
  ACU: {
    id: "ACU", label: "ACU — 자율(ROS2/DDS)", kind: "node", node: "ACU", lang: "cpp",
    files: ["ros2/acu_autonomy/src/acu_node.cpp"],
    declaredSignals: ["machine.autonomy.state", "machine.autonomy.mode", "machine.navigation.deviation"],
    wireInterfaceId: "IF-P-ACU",
  },
  VPU: {
    id: "VPU", label: "VPU — 비전(Python/ROS2)", kind: "node", node: "VPU", lang: "python",
    files: ["vision/vpu_vision/vpu/node.py", "vision/vpu_vision/vpu/vision.py"],
    declaredSignals: ["machine.vision.fps", "machine.vision.framedrop", "machine.vision.worker_detected"],
    wireInterfaceId: "IF-P-VPU",
  },
  TELEMETRY: {
    id: "TELEMETRY", label: "Telemetry — 업링크(Python/MQTT)", kind: "node", lang: "python",
    files: ["telemetry/telemetry_gw/telemetry_gw/gateway.py"],
    declaredSignals: ["env.greenhouse.temperature", "env.greenhouse.humidity", "env.greenhouse.co2", "machine.telemetry.cloud_connected"],
    wireInterfaceId: "IF-P-TEL",
  },
  "EE-THIN": {
    id: "EE-THIN", label: "적과 EE — 모듈(C/CAN)", kind: "module", lang: "c",
    files: ["firmware/ee-thinning-stm32/main.c", "firmware/ee-thinning-stm32/ee.h"],
    declaredSignals: [],
  },
  "EE-PINCH": {
    id: "EE-PINCH", label: "적심 EE — 모듈(C/CAN)", kind: "module", lang: "c",
    files: [
      "firmware/ee-pinching-stm32/src/main.c",
      "firmware/ee-pinching-stm32/src/grip_ctrl.c",
      "firmware/ee-pinching-stm32/src/safety.c",
      "firmware/ee-pinching-stm32/src/proto.c",
      "firmware/ee-pinching-stm32/src/calib.c",
      "firmware/ee-pinching-stm32/src/util.c",
      "firmware/ee-pinching-stm32/src/api.c",
    ],
    declaredSignals: [],
  },
};

export const TARGET_IDS = Object.keys(AUDIT_TARGETS);
export function getTarget(id: string): AuditTarget | undefined {
  return AUDIT_TARGETS[id];
}
