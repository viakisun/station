/* ============================================================
   verify·배포 콘솔 — Mock 데이터
   제조사 이기종 모듈 표준화(Audit) + 펌웨어/OTA 배포
   ============================================================ */
(function () {
  const vendors = [
    { id: "VND-OPTI",  name: "OptiVision",  short: "OV", modules: 3, onboarded: "2026-03-12", contact: "dev@optivision.io" },
    { id: "VND-ARM",   name: "ArmTech",     short: "AT", modules: 2, onboarded: "2026-02-28", contact: "support@armtech.co" },
    { id: "VND-GREEN", name: "GreenEdge",   short: "GE", modules: 2, onboarded: "2026-04-05", contact: "eng@greenedge.kr" },
    { id: "VND-NAVI",  name: "NaviCore",    short: "NC", modules: 2, onboarded: "2026-01-19", contact: "dev@navicore.ai" },
  ];

  const auditMeta = {
    draft:{label:"draft",sev:"disabled"}, submitted:{label:"submitted",sev:"notice"},
    running:{label:"running",sev:"notice"}, passed:{label:"passed",sev:"normal"},
    failed:{label:"failed",sev:"critical"}, waiver_required:{label:"waiver required",sev:"warning"},
    approved:{label:"approved",sev:"normal"}, expired:{label:"expired",sev:"disabled"},
  };
  const moduleMeta = {
    normal:{label:"normal",sev:"normal"}, warning:{label:"warning",sev:"warning"},
    degraded:{label:"degraded",sev:"warning"}, fault:{label:"fault",sev:"critical"},
    disabled:{label:"disabled",sev:"disabled"}, initializing:{label:"initializing",sev:"notice"},
  };
  const sevMeta = {
    info:{label:"info",sev:"disabled"}, low:{label:"low",sev:"notice"},
    warning:{label:"warning",sev:"warning"}, critical:{label:"critical",sev:"critical"}, blocker:{label:"blocker",sev:"emergency"},
  };

  const modules = [
    { id: "MOD-CAM-V01",   type: "Vision camera",      vendor: "VND-OPTI",  robots: "Thin·Pinch", cap: "CAP-CAM-v3",   proto: "PRT-MQTT-v2", fw: "2.4.1", audit: "AUD-MOD-CAM-20260531-01", auditState: "approved" },
    { id: "MOD-CAM-V02",   type: "Vision camera Pro",  vendor: "VND-OPTI",  robots: "Pinch",      cap: "CAP-CAM-v3",   proto: "PRT-MQTT-v2", fw: "1.2.0", audit: "AUD-MOD-CAM2-20260530-01", auditState: "running" },
    { id: "MOD-ARM-A2",    type: "Manipulator",     vendor: "VND-ARM",   robots: "Thin·Pinch", cap: "CAP-ARM-v2",   proto: "PRT-ROS-v1",  fw: "1.9.0", audit: "AUD-MOD-ARM-20260528-02", auditState: "passed" },
    { id: "MOD-EE-THIN",   type: "Thinning end-effector",  vendor: "VND-GREEN", robots: "Thin",      cap: "CAP-EE-v4",    proto: "PRT-MQTT-v2", fw: "3.1.2", audit: "AUD-MOD-EE-20260525-01",  auditState: "approved" },
    { id: "MOD-EE-PINCH",  type: "Pinching end-effector",  vendor: "VND-GREEN", robots: "Pinch",      cap: "CAP-EE-v4",    proto: "PRT-MQTT-v2", fw: "3.0.9", audit: "AUD-MOD-EEP-20260601-01", auditState: "waiver_required" },
    { id: "MOD-NAV-N1",    type: "Navigation",        vendor: "VND-NAVI",  robots: "Thin·Pinch", cap: "CAP-NAV-v5",   proto: "PRT-DDS-v1",  fw: "4.0.5", audit: "AUD-MOD-NAV-20260520-03", auditState: "approved" },
    { id: "MOD-NAV-N2",    type: "Navigation LiDAR", vendor: "VND-NAVI",  robots: "Thin",      cap: "CAP-NAV-v5",   proto: "PRT-DDS-v1",  fw: "0.9.4", audit: "AUD-MOD-NAV2-20260601-01",auditState: "failed" },
  ];

  // C02-07 audit package artifacts (권장 목차)
  const auditArtifacts = [
    { f: "manifest.json",                  ok: true,  note: "required" },
    { f: "capability_profile.yaml",        ok: true,  note: "CAP-CAM-v3" },
    { f: "protocol_profile.yaml",          ok: true,  note: "PRT-MQTT-v2" },
    { f: "telemetry_schema.json",          ok: true,  note: "12 channels" },
    { f: "command_contract.yaml",          ok: true,  note: "8 commands" },
    { f: "error_code_map.csv",             ok: true,  note: "34 codes" },
    { f: "firmware_manifest.json",         ok: true,  note: "v2.4.1" },
    { f: "calibration_requirements.json",  ok: true,  note: "camera·tool" },
    { f: "conformance_test_results.json",  ok: true,  note: "98/102 pass" },
    { f: "sample_events.ndjson",           ok: true,  note: "1.2k lines" },
    { f: "sample_telemetry.ndjson",        ok: true,  note: "4.8k lines" },
    { f: "hmi_integration_notes.md",       ok: false, note: "missing" },
    { f: "telemetry_config_snapshot.json", ok: true,  note: "" },
    { f: "audit_report.pdf",               ok: false, note: "build pending" },
  ];

  // C02-06 conformance test suites
  const testSuites = [
    { id: "TS-SCHEMA",    name: "Message schema validation",       cases: 18, desc: "payload schema · type · required fields" },
    { id: "TS-HEARTBEAT", name: "Heartbeat / connectivity",       cases: 9,  desc: "interval · timeout · reconnect" },
    { id: "TS-CMDACK",    name: "Command ACK contract",         cases: 22, desc: "command rx · ack · timeout · reject" },
    { id: "TS-TELEMETRY", name: "Telemetry cadence",        cases: 15, desc: "sampling rate · unit · quality" },
    { id: "TS-ERRMAP",    name: "Error-code mapping",          cases: 26, desc: "vendor→standard code · severity" },
    { id: "TS-SAFETY",    name: "Safety interlock",           cases: 12, desc: "e-stop · safety zone · recovery" },
  ];

  // detailed cases for the runner (will animate)
  const testCases = [
    { id: "TC-001", suite: "TS-SCHEMA",    name: "frame payload required fields",   ms: 240 },
    { id: "TC-002", suite: "TS-SCHEMA",    name: "telemetry unit declaration",      ms: 180 },
    { id: "TC-003", suite: "TS-HEARTBEAT", name: "heartbeat interval ≤ 2s",         ms: 320 },
    { id: "TC-004", suite: "TS-CMDACK",    name: "START_WORK ack within 500ms",     ms: 410 },
    { id: "TC-005", suite: "TS-CMDACK",    name: "PAUSE reject when faulted",        ms: 260, fail: true, exp: "reject(SAFETY_LOCK)", act: "ack(OK)" },
    { id: "TC-006", suite: "TS-TELEMETRY", name: "sampling rate ≤ declared max",    ms: 300 },
    { id: "TC-007", suite: "TS-ERRMAP",    name: "vendor 0x2F → CAM-FRAME-DROP",    ms: 150 },
    { id: "TC-008", suite: "TS-ERRMAP",    name: "unmapped code 0x9C",              ms: 190, fail: true, exp: "mapped std code", act: "UNMAPPED" },
    { id: "TC-009", suite: "TS-SAFETY",    name: "E-STOP halts within 200ms",       ms: 220 },
    { id: "TC-010", suite: "TS-SAFETY",    name: "interlock blocks motion cmd",     ms: 280 },
  ];

  // C04 firmware
  const fwMeta = {
    draft:{label:"draft",sev:"disabled"}, analyzing:{label:"analyzing",sev:"notice"},
    blocked:{label:"blocked",sev:"critical"}, approved:{label:"approved",sev:"normal"},
    scheduled:{label:"scheduled",sev:"notice"}, deploying:{label:"deploying",sev:"notice"},
    success:{label:"success",sev:"normal"}, failed:{label:"failed",sev:"critical"},
    rollback_required:{label:"rollback required",sev:"emergency"}, rolled_back:{label:"rolled back",sev:"warning"},
  };
  const fwAnalysisMeta = {
    passed:{label:"passed",sev:"normal"}, warning:{label:"warning",sev:"warning"},
    blocked:{label:"blocker",sev:"critical"}, analyzing:{label:"analyzing",sev:"notice"},
    failed:{label:"failed",sev:"critical"},
  };
  const firmwares = [
    { id: "FW-CAM-2.4.2",  module: "MOD-CAM-V01",  ver: "2.4.2", vendor: "VND-OPTI",  analysis: "passed",   deploy: "deploying", findings: 2, critical: 0, audit: "approved",        note: "frame-drop fix" },
    { id: "FW-CAM-2.4.1",  module: "MOD-CAM-V01",  ver: "2.4.1", vendor: "VND-OPTI",  analysis: "passed",   deploy: "success",   findings: 0, critical: 0, audit: "approved",        note: "in production" },
    { id: "FW-ARM-1.9.1",  module: "MOD-ARM-A2",   ver: "1.9.1", vendor: "VND-ARM",   analysis: "warning",  deploy: "approved",  findings: 5, critical: 0, audit: "approved",        note: "joint PID tuning" },
    { id: "FW-EEP-3.1.0",  module: "MOD-EE-PINCH", ver: "3.1.0", vendor: "VND-GREEN", analysis: "blocked",  deploy: "blocked",   findings: 9, critical: 2, audit: "waiver_required", note: "blocked by static analysis" },
    { id: "FW-NAV-4.0.6",  module: "MOD-NAV-N1",   ver: "4.0.6", vendor: "VND-NAVI",  analysis: "analyzing",deploy: "draft",     findings: 0, critical: 0, audit: "passed",          note: "analysis running" },
    { id: "FW-NAV2-0.9.4", module: "MOD-NAV-N2",   ver: "0.9.4", vendor: "VND-NAVI",  analysis: "failed",   deploy: "draft",     findings: 14,critical: 4, audit: "failed",          note: "analysis failed" },
  ];

  // C04-02 static analysis findings (for FW-EEP-3.1.0)
  const findings = [
    { id: "F-1", sev: "critical", rule: "MEM-001", title: "possible buffer overflow", file: "src/grip_ctrl.c:218", fn: "apply_force()", waiver: null },
    { id: "F-2", sev: "critical", rule: "CON-014", title: "safety-interlock bypass path", file: "src/safety.c:91",    fn: "release_lock()", waiver: null },
    { id: "F-3", sev: "warning",  rule: "TIM-007", title: "missing watchdog reset region", file: "src/main.c:402",     fn: "loop()",         waiver: "requested" },
    { id: "F-4", sev: "warning",  rule: "STY-220", title: "integer overflow (cast)", file: "src/calib.c:55",    fn: "to_mm()",        waiver: null },
    { id: "F-5", sev: "warning",  rule: "MEM-003", title: "possible use-after-free",      file: "src/proto.c:140",   fn: "parse_msg()",    waiver: null },
    { id: "F-6", sev: "low",      rule: "STY-110", title: "unused variable",             file: "src/util.c:12",      fn: "—",              waiver: null },
    { id: "F-7", sev: "low",      rule: "STY-110", title: "implicit conversion",           file: "src/util.c:88",      fn: "—",              waiver: null },
    { id: "F-8", sev: "info",     rule: "DOC-001", title: "missing doc on public fn",      file: "src/api.c:33",       fn: "ee_init()",      waiver: null },
    { id: "F-9", sev: "info",     rule: "DOC-001", title: "missing doc on public fn",      file: "src/api.c:71",       fn: "ee_stop()",      waiver: null },
  ];

  // C04-03 compatibility matrix
  const compatTargets = [
    { id: "RBT-THIN", label: "Thin robot" },
    { id: "RBT-PINCH", label: "Pinch robot" },
    { id: "HMI-1024", label: "HMI 1024" },
    { id: "HMI-800", label: "HMI 800" },
    { id: "TEL-GW2", label: "Tel GW v2" },
  ];
  // matrix[firmwareIndex][targetIndex] = state
  const compatRows = [
    { fw: "FW-CAM-2.4.2",  vals: ["ok","ok","ok","warn","ok"] },
    { fw: "FW-ARM-1.9.1",  vals: ["ok","ok","ok","ok","ok"] },
    { fw: "FW-EEP-3.1.0",  vals: ["na","incompat","ok","ok","unknown"] },
    { fw: "FW-NAV-4.0.6",  vals: ["ok","ok","warn","warn","ok"] },
    { fw: "FW-NAV2-0.9.4", vals: ["incompat","na","na","na","incompat"] },
  ];
  const compatMeta = {
    ok:{label:"compatible",sev:"normal",mark:"✓"}, warn:{label:"warning",sev:"warning",mark:"!"},
    incompat:{label:"incompatible",sev:"critical",mark:"✕"}, unknown:{label:"unknown",sev:"disabled",mark:"?"},
    na:{label:"n/a",sev:"disabled",mark:"–"},
  };

  // C04-06 OTA deployment targets (will animate)
  const deployTargets = [
    { id: "RBT-THIN-0001", gh: "House A", group: "canary", stage: 4 },
    { id: "RBT-THIN-0002", gh: "House A", group: "canary", stage: 4 },
    { id: "RBT-THIN-0005", gh: "House B", group: "wave-1", stage: 2 },
    { id: "RBT-THIN-0006", gh: "House C", group: "wave-1", stage: 2 },
    { id: "RBT-THIN-0008", gh: "House A", group: "wave-1", stage: 0, fail: true },
    { id: "RBT-THIN-0010", gh: "House C", group: "wave-2", stage: 0 },
  ];
  const deployStages = ["queued", "download", "install", "reboot", "verify", "done"];

  const events = [
    { t: "09:02:14", sev: "info",     src: "DEPLOY",       msg: "OTA rollout started — FW-CAM-2.4.2 · canary group (2)" },
    { t: "09:01:40", sev: "warning",  src: "ANALYSIS",     msg: "FW-EEP-3.1.0 static analysis: 2 critical — release blocked" },
    { t: "09:00:12", sev: "info",     src: "AUDIT",        msg: "AUD-MOD-CAM-20260531-01 approved (98/102 pass)" },
    { t: "08:58:33", sev: "critical", src: "CONFORMANCE",  msg: "MOD-NAV-N2 conformance failed — 4 error-mapping issues" },
    { t: "08:55:09", sev: "info",     src: "SDK",          msg: "SDK v3.2.0 released — 1 breaking change" },
    { t: "08:52:47", sev: "warning",  src: "AUDIT",        msg: "AUD-MOD-EEP-20260601-01 waiver request pending" },
  ];

  window.RC = {
    org: { name: "Greenhouse Robotics Platform", env: "Integration · Release" },
    vendors, modules, auditMeta, moduleMeta, sevMeta, auditArtifacts,
    testSuites, testCases, fwMeta, fwAnalysisMeta, firmwares, findings,
    compatTargets, compatRows, compatMeta, deployTargets, deployStages, events,
    kpi: {
      vendorsActive: 4, modulesTotal: 7, modulesApproved: 4,
      auditPassRate: 91.2, openIssues: 5, sdkVersion: "3.2.0",
      fwAnalyzing: 1, fwBlocked: 1, deploysActive: 1, conformanceRuns: 23,
    },
  };
})();
