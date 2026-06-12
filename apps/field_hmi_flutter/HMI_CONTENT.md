# STATION Field HMI — 구현 콘텐츠 명세 (Audit Set · Update 항목)

> 이 문서는 **실제로 구현되어야 하는 콘텐츠/데이터**만 담는다(디자인·레이아웃·색 제외).
> HMI 의 `mock/` 데이터와 Audit·Update 화면이 이 명세 그대로 채워지면 된다. 모든 식별자는 STATION 계약 정합.

---

## 0. 식별자 레지스트리 (모든 화면이 참조)

### 0.1 컨소시엄 기관
| orgId | 이름 | 역할 | platform |
|---|---|---|---|
| ORG-VIA | 비아 | 통합 플랫폼(Local Agent·계약)·HMI·Telemetry·관제 | true |
| ORG-AGE | 에이지로보틱스 | 모바일 베이스(MCU) — 구동·조향·충전·E-stop·엔코더 | |
| ORG-META | 메타파머스 | VPU·ACU + 작업모듈(매니퓰레이터+적과/적심 EE) + 작업앱 | |
| ORG-DAEDONG | 대동로보틱스 | 측위(LPU) — LPS·맵 | |
| ORG-KIRO | KIRO | 적심 EE 변형(메타 협력 공급) | |
| ORG-NAS | 국립농업과학원 | 적과 EE 변형(협력 공급) | |

### 0.2 노드 (5)
| node | 소유 | 전송 | IF-P | conformance | 주요 신호 | 주요 명령 |
|---|---|---|---|---|---|---|
| MCU | ORG-AGE | CAN | IF-P-MCU | TS-MCU | machine.motion.speed · machine.power.battery_voltage · machine.safety.estop · machine.heartbeat.mcu | motion.stop · motion.set_speed_limit |
| LPU | ORG-DAEDONG | DDS | IF-P-LPU | TS-LPU | machine.localization.{pose,confidence,map_match} · machine.heartbeat.lpu | localization.relocalize |
| VPU | ORG-META | ROS2 | IF-P-VPU | TS-VPU | machine.vision.{fps,framedrop,worker_detected} · crop.growth.{plant_height,lai,ndvi} · machine.heartbeat.vpu | vision.capture.start/stop · vision.calibrate |
| ACU | ORG-META | DDS | IF-P-ACU | TS-ACU | machine.autonomy.{state,mode} · machine.navigation.deviation · machine.heartbeat.acu | autonomy.mission.start · autonomy.pause · autonomy.slow_down |
| Telemetry | ORG-VIA | MQTT | IF-P-TEL | TS-TEL | env.greenhouse.{temperature,humidity,co2} · machine.telemetry.cloud_connected · machine.heartbeat.tel | telemetry.uplink.flush |

> IF-P 규율: 각 노드는 `carries`(허용 신호/명령)만 발행, `notCarried`(타 도메인 채널) 발행 금지. 위반은 audit interface 단계에서 차단.

### 0.3 모듈 (교체형 HW)
| moduleId | 종류 | 공급(벤더→기관) | 부착 노드 | 펌웨어(예) |
|---|---|---|---|---|
| MOD-CAM-V01 | 비전 카메라 | OptiVision → ORG-META | VPU | 2.4.1 |
| MOD-ARM-A2 | 매니퓰레이터 | ArmTech → ORG-META | ACU | 1.9.0 |
| MOD-EE-THIN | 적과 엔드이펙터 | GreenEdge → ORG-NAS(변형) | ACU(매니퓰레이터 끝단) | 3.1.2 |
| MOD-EE-PINCH | 적심 엔드이펙터 | GreenEdge → ORG-KIRO(변형) | ACU(매니퓰레이터 끝단) | 3.0.9 |
| MOD-NAV-N1 | 내비게이션 | NaviCore → ORG-DAEDONG | LPU | 4.0.5 |

### 0.4 작업 앱 (AppManifest)
| appId | 이름 | 소유 | requires.nodes | commands | calibration | conformance |
|---|---|---|---|---|---|---|
| station.app.growth-scan | 생육 스캔 | ORG-META | VPU·LPU·ACU | scan.start · scan.stop | CAL-VPU-NIR · CAL-VPU-RGB | TS-SCAN |
| station.app.thin-control | 적과 제어 | ORG-META | ACU·VPU | thin.actuate | — | TS-THIN |
| station.app.pinch-control | 적심 제어 | ORG-META(+KIRO) | ACU·VPU | pinch.actuate | — | TS-PINCH |
| station.app.arm-control | 매니퓰레이터 | ORG-META | ACU | arm.move | — | TS-ARM |
| station.app.ee-calibration | EE 캘리브 | ORG-META | ACU·VPU | ee.calibrate | — | TS-CAL |

### 0.5 플랫폼 소프트웨어 (ORG-VIA, 노드 아님)
| id | 항목 | 설명 |
|---|---|---|
| SW-LOCAL-AGENT | Local Agent / RAL | 로봇 내 통합 런타임(노드 흡수·신호/명령·게이트) |
| SW-HMI-SHELL | HMI Shell | 본 Field OS UI |
| SW-CONTRACTS | 계약/SDK | Signal·Command·Manifest 스키마 · verb registry · IF-P 시트(codegen) |
| SW-POLICY | 정책 프로파일 | 안전 규칙(아래 0.7) |

### 0.6 게이트 (Gate)
| gate | 의미 | 적용 시점 |
|---|---|---|
| G1 Route-validation | 경로 검증 통과 | 작업 시작 전 |
| G2 Firmware-release | 정적분석·호환성·audit 통과해야 배포 승인 | 노드/모듈 펌웨어 릴리스 |
| G3 Version | map/parameter 버전 정합 | 작업 시작 전 · 맵 업데이트 |
| G4 Calibration | 필수 캘리브 완료 | 작업 시작 전 |
| G5 Audit→operational | Audit Package 승인 → 운영 전환 | audit 최종 승인 |
| G6 Deploy-preflight | 대상 온라인·배터리·미션 점검 | OTA 롤아웃 |
| G7 Incident/Freeze | 작업·주행 중 변경 동결 | **업데이트 전 항목** |

### 0.7 안전 정책 프로파일
| id | 적용 명령 | 조건 | 효과 |
|---|---|---|---|
| POL-WORKER-SAFETY | autonomy.mission.start · autonomy.slow_down | machine.vision.worker_detected == true | blocked (G-Safety) |
| POL-ESTOP-MOTION | motion.set_speed_limit · motion.* | machine.safety.estop == true | blocked |
| POL-LOWBATT-CONFIRM | autonomy.* | battery_voltage < 22V | confirm_required |

### 0.8 캘리브 · 맵
- 캘리브: CAL-VPU-RGB, CAL-VPU-NIR, CAL-TOOL-EE (적과/적심 EE 정렬)
- 맵: MAP-GH-A-v7(active·valid passed), MAP-GH-A-v8(draft·검증 running) — 경로 RT-A-THIN-03 등

---

## 1. 기관별 Audit Set (제출·검증 콘텐츠)

### 1.1 Audit Package 공통 구성 (모든 대상)
**제출 산출물 14종**
```
manifest.json · capability_profile.yaml · protocol_profile.yaml · telemetry_schema.json ·
command_contract.yaml · error_code_map.csv · firmware_manifest.json · calibration_requirements.json ·
conformance_test_results.json · sample_events.ndjson · sample_telemetry.ndjson ·
hmi_integration_notes.md · telemetry_config_snapshot.json · audit_report.pdf
```
**7단계 실행 감사 (결과는 실행에서 도출, 하드코딩 금지)**
```
1 manifest    필수 필드/계약 정합
2 static      소스 정적분석(언어별) → findings(severity: critical/warning/low/info)
3 interface   IF-P carries/notCarried 적합
4 protocol    wire 바인딩 완전성(전송별)
5 conformance 노드 부팅·신호/명령·3단 ACK 실검사(TS-*)
6 policy      안전규칙 적용 확인
7 package     스코어 + 게이트(G2/G5) → 상태
```
**Audit 상태(state)**: `draft → submitted → running → passed → (failed | waiver_required) → approved`
**점수/게이트 도출 규칙**:
- static 에 critical ≥ 1 → state=`waiver_required`, gate G2=`blocked`
- 단계 fail 존재 → state=`failed`, G2=`blocked`
- warning 만 존재 → state=`passed`, G2=`confirm_required`
- 전부 pass → state=`approved`, G2=`pass`

### 1.2 기관별 대상 목록

**ORG-VIA 비아** — 플랫폼 + Telemetry
| target | 종류 | 언어 | 산출물 | conformance | 비고 |
|---|---|---|---|---|---|
| Telemetry | node | Python(MQTT) | 14종 | TS-TEL | env 신호 업링크 |
| SW-LOCAL-AGENT | platform | TS | manifest+계약검증 | (validate.mjs) | 런타임 적합성 |
| SW-HMI-SHELL | platform | Dart/TS | manifest | — | UI 셸 |
| SW-CONTRACTS | platform | JSON Schema | schema+verb registry | (codegen 검증) | 계약 SSOT |
| SW-POLICY | platform | JSON | 정책 룰셋 | — | 안전 규칙 |

**ORG-AGE 에이지로보틱스**
| target | 종류 | 언어 | conformance | 특이 |
|---|---|---|---|---|
| MCU | node | C(STM32/CAN) | TS-MCU | E-stop은 물리 권한① — 펌웨어는 상태보고만. 정적분석 대상(경계검사·watchdog) |

**ORG-META 메타파머스** — 최대 셋
| target | 종류 | 언어 | conformance |
|---|---|---|---|
| VPU | node | Python(ROS2) | TS-VPU |
| ACU | node | C++(DDS) | TS-ACU |
| MOD-CAM-V01 | module | — | (TS-VPU 연계) |
| MOD-ARM-A2 | module | — | TS-ARM |
| station.app.growth-scan/thin/pinch/arm/ee-calibration | app | — | TS-SCAN/THIN/PINCH/ARM/CAL |
> 앱 audit 은 AppManifest(requires.nodes·permissions·conformance·panel) 정합 + 호환성 검사.

**ORG-DAEDONG 대동로보틱스**
| target | 종류 | 언어 | conformance | 특이 |
|---|---|---|---|---|
| LPU | node | C++(ROS2/DDS) | TS-LPU | 맵 검증(MAP-* valid)·QoS 정적분석 |

**ORG-KIRO** (협력 — 적심 EE)
| target | 종류 | 언어 | conformance | 특이 |
|---|---|---|---|---|
| MOD-EE-PINCH | module | C(CAN) | TS-PINCH | ⚠ 차단 케이스: 정적분석 critical(버퍼오버플로·interlock 우회·UAF) → G2 blocked, waiver 필요. interface/conformance 단계는 N/A(노드 IF-P 없음) |

**ORG-NAS** (협력 — 적과 EE)
| target | 종류 | 언어 | conformance | 특이 |
|---|---|---|---|---|
| MOD-EE-THIN | module | C(CAN) | TS-THIN | clean 통과. 모듈이라 interface/conformance N/A |

> **모듈(EE) 규칙**: 노드 IF-P 가 없으므로 audit 의 ③interface·④protocol·⑤conformance 는 **N/A**, ①manifest·②static·⑦package 로 평가.

---

## 2. HMI Update 항목 (OTA 수신 대상)

### 2.1 업데이트 항목 카탈로그 (11계층)
각 항목 필드: `id · 항목명 · 소유 · 패키지타입 · 전송 · current/target(예) · gate · restart(재시작 영향) · rollback · requires(호환성)`

| id | 항목 | 소유 | 패키지·전송 | current→target | gate | restart | rollback | requires |
|---|---|---|---|---|---|---|---|---|
| UP-HMI-SHELL | HMI Shell | 비아 | shell / cloud·USB | 1.4.0→1.4.0 | G7 | HMI 재부팅 | A/B | contracts≥1.0 |
| UP-LOCAL-AGENT | Local Agent/RAL | 비아 | agent / cloud | 2.1.3→**2.1.4** | G7·idle | 노드연결 순단 | ✅ | contracts≥1.0 |
| UP-CONTRACTS | 계약/SDK | 비아 | schema+verb registry | 1.2.0→1.2.0 | semver 호환검사 | 무중단 | ✅ | — |
| UP-FW-MCU | MCU 펌웨어 | 에이지 | OTA(CAN, A/B) | —→— | G2·G7 | MCU 재시작 | ✅ | TS-MCU pass |
| UP-FW-LPU | LPU 펌웨어 | 대동 | OTA(DDS) | 4.0.5→4.0.6 | G2·G7 | 측위 정지 | ✅ | TS-LPU pass |
| UP-FW-VPU | VPU 펌웨어 | 메타 | OTA(ROS2) | 2.4.1→2.4.2 | G2·G7 | 스트림 끊김 | ✅ | TS-VPU pass |
| UP-FW-ACU | ACU 펌웨어 | 메타 | OTA(DDS) | —→— | G2·G7 | 미션 중단 필수 | ✅ | TS-ACU pass |
| UP-FW-TEL | Telemetry 펌웨어 | 비아 | OTA(MQTT) | —→— | G2·G7 | 업링크 순단 | ✅ | TS-TEL pass |
| UP-MOD-EE-THIN | 적과 EE 펌웨어 | NAS/GreenEdge | driver pkg | **3.1.2→3.1.3** | G2(audit)·G7 | 해당 모듈만 | ✅ | TS-THIN pass |
| UP-MOD-EE-PINCH | 적심 EE 펌웨어 | KIRO/GreenEdge | driver pkg | 3.0.9→3.1.0 | **G2 blocked(현재)** | 모듈만 | ✅ | TS-PINCH pass |
| UP-MOD-CAM | 비전 카메라 드라이버 | 메타 | driver pkg | 2.4.1→2.4.1 | G2·G7 | VPU 재로드 | ✅ | — |
| UP-MOD-ARM | 매니퓰레이터 드라이버 | 메타 | driver pkg | 1.9.0→1.9.1 | G2·G7 | ACU 재로드 | ✅ | — |
| UP-MOD-NAV | 내비게이션 드라이버 | 대동 | driver pkg | 4.0.5→4.0.5 | G2·G7 | LPU 재로드 | ✅ | — |
| UP-APP-GROWTH | 생육 스캔 앱 | 메타 | AppManifest pkg | 1.0.0→**1.1.0** | requires.nodes 호환 | 앱 재기동 | ✅ | VPU·LPU·ACU |
| UP-APP-THIN | 적과 제어 앱 | 메타 | AppManifest pkg | —→— | 호환 | 앱 재기동 | ✅ | ACU·VPU |
| UP-CALIB | 캘리브 프로파일 | 메타 | calib pkg | — | G4 | 무중단 | ✅ | VPU |
| UP-MAP | 맵/경로 | 대동 | map pkg | v7→**v8** | G3·맵 valid | 무중단(다음 세션) | ✅ | LPU |
| UP-POLICY | 정책 프로파일 | 비아 | policy pkg | — | 안전 검증 | 무중단(hot-reload) | ✅ | — |
| UP-VISION-MODEL | AI 비전 모델 | 메타 | model pkg | — | VPU 호환·정확도 | VPU 재로드 | ✅ | VPU |
| UP-SUITE | Conformance Suite 정의 | 비아 | suite pkg | — | — | 무중단 | ✅ | contracts |

> 항목 상태(status): `up_to_date · update_available · downloading · staged · installing · failed · rolled_back · blocked`

### 2.2 업데이트 사전점검 (precheck) — G7 freeze
업데이트 실행은 아래를 **모두** 만족해야 허용:
```
robot_idle == true            (작업/주행 중 금지)
battery_pct >= 30             (펌웨어는 충전 중 권장)
package_available == true     (cloud 또는 로컬 패키지)
no_active_mission == true     (G7)
operator_confirmed == true    (현장 확인)
```
미충족 시: 차단 사유 표시(예: "G7 차단 — 작업 진행 중"). 충족 시: 설치 허용.

### 2.3 배포·호환·복구 규칙
- **단계 롤아웃(Ops 관리, HMI는 자기 로봇분만 표시)**: canary → wave-1 → wave-2.
- **A/B 뱅크 + Rollback 지점**: 모든 항목 직전 버전 즉시 복귀.
- **호환성 매트릭스**: contracts ↔ 노드 펌웨어 ↔ 작업앱 semver 상호검사. 비호환 조합 설치 차단.
- **권한**: 실행=Field③(operator 확인). 위험 항목(노드/모듈 펌웨어)은 Cloud④ 승인 병행 가능. **작업 중 동결(G7)은 절대.**

---

## 3. 화면-콘텐츠 연결 (어디에 무엇이 들어가나)
| HMI 위치 | 들어갈 콘텐츠 |
|---|---|
| Update Center | §2.1 카탈로그 전체(계층별 그룹) + §2.2 precheck + §2.3 rollback/호환 |
| Audit(패키지) | §1 기관별 대상 + 14 산출물 + 7단계 결과 + state/gate |
| Developer · Manifest Viewer | §0.2~0.5 manifest 원문(노드/모듈/앱/플랫폼) |
| Safety | §0.7 정책 + §0.6 게이트 평가 결과 |
| Settings · Pairing | §0.3 모듈 + 탐지/충돌 |
| Settings · Calib | §0.8 캘리브 + G4 |
| Home/Work App | §0.2 신호 + §0.8 맵/세션 |

> 구현 시: 위 표를 `lib/mock/` 데이터(노드·모듈·앱·플랫폼SW·업데이트항목·게이트·정책·캘리브·맵)로 1:1 모델링하고,
> Update Center 와 Audit 뷰가 이 데이터를 소비하도록 한다. 식별자는 STATION 계약(@station/contracts)과 동일 문자열 사용.
