// STATION Field OS Terminal — mock data (spec data.js + registry.js, English export build).

class Robot {
  static const id = 'RBT-THIN-0001';
  static const model = 'HV-Thinner X1';
  static const serial = 'SN-2026-0114-7732';
  static const battery = 78;
  static const batteryHours = 4.2;
  static const site = 'Greenhouse A';
  static const zone = 'A-3';
  static const fw = '3.6.2';
  static const agent = '5.1.4';
}

class Session {
  static const task = 'Thinning';
  static const appId = 'station.app.thin-control';
  static const zone = 'A-3';
  static const route = 'RT-A-THIN-03';
  static const eta = '9:40 AM';
  static const done = 198;
  static const total = 320;
  static const next = 'Right bed — remaining clusters';
  static const map = 'MAP-GH-A v7';
  static const bed = 5, beds = 8;
}

const todayFruits = 1240;
const todaySpark = <double>[12, 18, 14, 22, 19, 26, 24, 31, 28, 34, 30, 38];

class Task {
  final String id, name, state, meta;
  final List<String> gates;
  const Task(this.id, this.name, this.state, this.meta, this.gates);
}

const tasks = <Task>[
  Task('thin', 'Thinning', 'running', 'Zone A-3 · 38 min left', ['Route valid', 'Calibration', 'Version match']),
  Task('scan', 'Growth scan', 'ready', 'Zone A-1 · est 55 min', ['Route valid', 'NIR calibration', 'Version match']),
  Task('pinch', 'Pinching', 'blocked', 'End-effector mismatch', ['Route valid', 'End-effector', 'Version match']),
  Task('spray', 'Spraying', 'ready', 'Zone B-2 · est 40 min', ['Route valid', 'Tank level', 'Version match']),
];

const cameras = ['Front', 'Depth', 'Target', 'Gesture'];

class KV {
  final String k, v, tone;
  const KV(this.k, this.v, [this.tone = '']);
}

const safetyRows = <KV>[
  KV('E-stop relay', 'Clear', 'ok'),
  KV('Perception', 'Normal', 'ok'),
  KV('Command gates', 'Open', 'ok'),
  KV('Localization', '0.97 confidence', 'ok'),
];

const incidents = <KV>[
  KV('Person detected', 'Jun 9, 2:14 PM · auto-paused 38 s, resumed'),
  KV('Low localization', 'Jun 8, 9:51 AM · slowed to 0.2 m/s for 2 min'),
];

const about = <KV>[
  KV('Model', 'HV-Thinner X1'),
  KV('Serial', 'SN-2026-0114-7732'),
  KV('Robot ID', 'RBT-THIN-0001'),
  KV('Firmware', '3.6.2'),
  KV('Local agent', '5.1.4'),
  KV('Nodes', 'MCU · LPU · VPU · ACU · TEL'),
  KV('Authority', 'Field (level 3)'),
];

const network = <KV>[
  KV('Local agent', 'Connected · 4 ms', 'ok'),
  KV('Cloud mirror', 'Streaming', 'ok'),
  KV('Uplink', 'LTE-M · −71 dBm', 'ok'),
];

const settingsGroups = <KV>[
  KV('about', 'About robot'),
  KV('network', 'Network'),
  KV('modules', 'Modules'),
  KV('calib', 'Calibration'),
  KV('updates', 'Updates'),
  KV('dev', 'Developer'),
];

// ---- §0 registry ----
class NodeRow {
  final String id, org, bus, ifp, ts, sig, cmd;
  const NodeRow(this.id, this.org, this.bus, this.ifp, this.ts, this.sig, this.cmd);
}

const nodes = <NodeRow>[
  NodeRow('MCU', 'AGE Robotics', 'CAN', 'IF-P-MCU', 'TS-MCU', 'machine.motion.speed · machine.safety.estop', 'motion.stop · motion.set_speed_limit'),
  NodeRow('LPU', 'Daedong', 'DDS', 'IF-P-LPU', 'TS-LPU', 'machine.localization.{pose,confidence}', 'localization.relocalize'),
  NodeRow('VPU', 'MetaFarmers', 'ROS2', 'IF-P-VPU', 'TS-VPU', 'machine.vision.{fps,worker_detected}', 'vision.capture.start/stop'),
  NodeRow('ACU', 'MetaFarmers', 'DDS', 'IF-P-ACU', 'TS-ACU', 'machine.autonomy.{state,mode}', 'autonomy.mission.start · pause'),
  NodeRow('TEL', 'VIA', 'MQTT', 'IF-P-TEL', 'TS-TEL', 'env.greenhouse.{temperature,humidity,co2}', 'telemetry.uplink.flush'),
];

const modules = <KV>[
  KV('MOD-CAM-V01 · Vision camera', 'OptiVision · fw 2.4.1', 'ok'),
  KV('MOD-ARM-A2 · Manipulator', 'ArmTech · fw 1.9.0', 'ok'),
  KV('MOD-EE-THIN · Thinning EE', 'GreenEdge · fw 3.1.2', 'amber'),
  KV('MOD-NAV-N1 · Navigation', 'NaviCore · fw 4.0.5', 'ok'),
  KV('BUS-05 · Unidentified', 'vid:0x???? pid:0x?? — no driver', 'red'),
  KV('BUS-06 · Pinching EE', 'robot_type mismatch (pinch EE on thin robot)', 'red'),
];

// ---- §2 update catalog ----
class Update {
  final String id, name, owner, type, cur, next, gate, restart, status;
  final String? note, date, audit;
  final ReleaseNote? rel;
  const Update(this.id, this.name, this.owner, this.type, this.cur, this.next, this.gate, this.restart, this.status, {this.note, this.date, this.audit, this.rel});
  bool get available => status == 'update_available';
  bool get blocked => status == 'blocked';
}

class ReleaseNote {
  final String sum;
  final List<String> imp, add, fix;
  const ReleaseNote(this.sum, this.imp, this.add, this.fix);
}

const updates = <Update>[
  Update('UP-LOCAL-AGENT', 'Local Agent / RAL', 'VIA', 'sw', '2.1.3', '2.1.4', 'G7 · idle', 'Node link blip', 'update_available',
      note: 'Command ACK retry hardening · contracts 1.2 compat', date: '2026-06-09',
      rel: ReleaseNote('Reliability release for the node command path.',
          ['Command ACK retry now backs off exponentially — fewer false timeouts on busy CAN buses', 'Node reconnect after a link blip is ~40% faster'],
          ['contracts 1.2 verb registry support'],
          ['Fixed rare deadlock when two nodes re-registered at once', 'Telemetry uplink no longer stalls during agent restart'])),
  Update('UP-HMI-SHELL', 'HMI Shell', 'VIA', 'sw', '1.4.0', '1.4.0', 'G7', 'HMI reboot', 'up_to_date'),
  Update('UP-CONTRACTS', 'Contracts / SDK', 'VIA', 'sw', '1.2.0', '1.2.0', 'semver', 'None', 'up_to_date'),
  Update('UP-FW-LPU', 'LPU firmware', 'Daedong', 'sw', '4.0.5', '4.0.6', 'G2 · G7', 'Localization stop', 'update_available', audit: 'LPU',
      note: 'Map-match drift fix in long rails', date: '2026-06-08',
      rel: ReleaseNote('Localization accuracy fixes for long tube-rails.',
          ['Map-match confidence holds above 0.95 on rails over 80 m', 'Relocalization after the shutter is steadier'], [],
          ['Fixed pose drift accumulating past rail 24', 'Resolved QoS warning on the DDS map topic'])),
  Update('UP-FW-VPU', 'VPU firmware', 'Meta', 'sw', '2.4.1', '2.4.2', 'G2 · G7', 'Stream drop', 'update_available', audit: 'VPU',
      note: 'Frame-drop telemetry added', date: '2026-06-07',
      rel: ReleaseNote('Vision pipeline observability.', ['Steadier 30 fps under high canopy density'],
          ['machine.vision.framedrop telemetry signal', 'Per-source latency badge feed'], ['Fixed occasional black frame on source switch'])),
  Update('UP-FW-MCU', 'MCU firmware', 'AGE', 'sw', '1.8.2', '1.8.2', 'G2 · G7', 'MCU restart', 'up_to_date'),
  Update('UP-MOD-EE-THIN', 'Thinning EE firmware', 'NAS / GreenEdge', 'sw', '3.1.2', '3.1.3', 'G2 · G7', 'Module only', 'update_available', audit: 'MOD-EE-THIN',
      note: 'Cut-force calibration table v2', date: '2026-06-06',
      rel: ReleaseNote('Improved cut consistency on cherry tomato.',
          ['Cut-force table v2 — cleaner cuts on thin pedicels', 'Grip-to-cut cycle 60 ms faster'], [], ['Fixed end-effector returning to home before cut confirm'])),
  Update('UP-MOD-EE-PINCH', 'Pinching EE firmware', 'KIRO / GreenEdge', 'sw', '3.0.9', '3.1.0', 'G2 blocked', 'Module only', 'blocked', audit: 'MOD-EE-PINCH',
      note: 'Audit waiver required — static analysis critical', date: '2026-06-05',
      rel: ReleaseNote('Blocked from install — release did not pass audit (G2).', [],
          ['Adaptive pinch pressure (pending audit)'], ['Vendor reports interlock timing fix — unverified, static analysis flagged 3 critical findings'])),
  Update('UP-MOD-ARM', 'Manipulator driver', 'Meta', 'sw', '1.9.0', '1.9.1', 'G2 · G7', 'ACU reload', 'update_available', date: '2026-06-04',
      rel: ReleaseNote('Minor manipulator driver maintenance.', ['Smoother arm deceleration near rail ends'], [], ['Fixed jitter when holding pose under load'])),
  Update('UP-APP-GROWTH', 'Growth scan app', 'Meta', 'sw', '1.0.0', '1.1.0', 'requires compat', 'App restart', 'update_available',
      note: 'NDVI batch export', date: '2026-06-03',
      rel: ReleaseNote('Growth scan gets batch reporting.', ['Scan session resumes after interruption'],
          ['NDVI batch export to cloud', 'Per-bed observation summary'], ['Fixed LAI value rounding in the report'])),
  Update('UP-VISION-MODEL', 'Vision model · thinning', 'Meta', 'model', 'v3.1', 'v3.2', 'VPU compat · accuracy', 'VPU reload', 'update_available',
      note: 'Target recognition 91.2% → 93.5%', date: '2026-06-09',
      rel: ReleaseNote('New thinning target model — higher recognition accuracy.',
          ['Target recognition 91.2% → 93.5% (validation set)', 'Fewer missed clusters in dense canopy', 'False-positive rate down 1.8%'],
          ['Trained on +12k cherry-tomato samples'], ['Better handling of backlit fruit'])),
  Update('UP-MAP', 'Map · Greenhouse A', 'Daedong', 'data', 'v7', 'v8', 'G3 · map valid', 'Next session', 'update_available',
      note: '6 routes re-validated · bed 7 re-survey', date: '2026-06-08',
      rel: ReleaseNote('Updated greenhouse map — applied from the next session.',
          ['Bed 7 re-surveyed after layout change', 'All 6 routes re-validated (valid passed)'],
          ['New service-dock approach path'], ['Corrected rail 19 endpoint by 0.3 m'])),
  Update('UP-CALIB', 'Calibration profile', 'Meta', 'data', '2026.05', '2026.05', 'G4', 'None', 'up_to_date'),
  Update('UP-POLICY', 'Safety policy profile', 'VIA', 'data', '1.3', '1.3', 'safety check', 'Hot reload', 'up_to_date'),
];

const precheck = <KV>[
  KV('robot_idle', 'true'),
  KV('battery_pct', '≥ 30'),
  KV('package_available', 'true'),
  KV('no_active_mission', 'G7'),
  KV('operator_confirmed', 'true'),
];

// ---- §1 audit ----
const stageNames = ['manifest', 'static', 'interface', 'protocol', 'conformance', 'policy', 'package'];

class Audit {
  final String org, target, kind, lang, ts, state, gate;
  final List<String> stages;
  final String? note;
  const Audit(this.org, this.target, this.kind, this.lang, this.ts, this.state, this.gate, this.stages, [this.note]);
}

const audits = <Audit>[
  Audit('VIA', 'Telemetry', 'node', 'Python · MQTT', 'TS-TEL', 'approved', 'G2 pass', ['pass', 'pass', 'pass', 'pass', 'pass', 'pass', 'pass']),
  Audit('AGE Robotics', 'MCU', 'node', 'C · STM32/CAN', 'TS-MCU', 'approved', 'G2 pass', ['pass', 'pass', 'pass', 'pass', 'pass', 'pass', 'pass'], 'E-stop is physical authority ① — firmware reports state only'),
  Audit('MetaFarmers', 'VPU', 'node', 'Python · ROS2', 'TS-VPU', 'approved', 'G2 pass', ['pass', 'pass', 'pass', 'pass', 'pass', 'pass', 'pass']),
  Audit('MetaFarmers', 'ACU', 'node', 'C++ · DDS', 'TS-ACU', 'passed', 'G2 confirm_required', ['pass', 'warn', 'pass', 'pass', 'pass', 'pass', 'pass'], '2 warnings — unbounded queue in mission planner'),
  Audit('MetaFarmers', 'station.app.thin-control', 'app', 'AppManifest', 'TS-THIN', 'approved', 'G5 pass', ['pass', 'pass', 'na', 'na', 'pass', 'pass', 'pass']),
  Audit('Daedong', 'LPU', 'node', 'C++ · ROS2/DDS', 'TS-LPU', 'approved', 'G2 pass', ['pass', 'pass', 'pass', 'pass', 'pass', 'pass', 'pass'], 'Map validation MAP-GH-A-v8 · QoS static checks'),
  Audit('KIRO', 'MOD-EE-PINCH', 'module', 'C · CAN', 'TS-PINCH', 'waiver_required', 'G2 blocked', ['pass', 'critical', 'na', 'na', 'na', 'pass', 'fail'], 'Static analysis: buffer overflow · interlock bypass · use-after-free'),
  Audit('NAS', 'MOD-EE-THIN', 'module', 'C · CAN', 'TS-THIN', 'approved', 'G2 pass', ['pass', 'pass', 'na', 'na', 'na', 'pass', 'pass'], 'Clean pass — module audit (3 stages N/A)'),
];

const artifacts = <String>[
  'manifest.json', 'capability_profile.yaml', 'protocol_profile.yaml', 'telemetry_schema.json',
  'command_contract.yaml', 'error_code_map.csv', 'firmware_manifest.json', 'calibration_requirements.json',
  'conformance_test_results.json', 'sample_events.ndjson', 'sample_telemetry.ndjson', 'hmi_integration_notes.md',
  'telemetry_config_snapshot.json', 'audit_report.pdf',
];

int updatesAvailable() => updates.where((u) => u.available).length;
List<Update> releaseNotes() => updates.where((u) => u.available || u.blocked).toList();
