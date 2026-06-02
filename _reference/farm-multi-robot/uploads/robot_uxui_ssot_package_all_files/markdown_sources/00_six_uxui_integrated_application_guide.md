6대 UX/UI 통합 운영 설명서

통합 관제 애플리케이션, Audit Package, HMI, Telemetry가 유기적으로 동작하는 전체 설계 설명서

| 문서 코드 | JJ-UX00 |
| --- | --- |
| 문서 유형 | UX/UI 목업 제작용 SSOT 및 화면 프롬프트 기준서 |
| 적용 범위 | 적과로봇, 적심로봇, HMI, Telemetry, 관제 플랫폼, 통합 Audit Package |
| 작성일 | 2026-05-31 |
| 버전 | v1.0 |

# 1. 통합 방향: 하나의 애플리케이션, 여섯 개 워크스페이스

본 패키지의 여섯 UX/UI는 개별 납품물이지만 제품 구조상 하나의 통합 관제 애플리케이션 안에서 동작한다. 각 워크스페이스는 동일한 Platform Core API, Event Bus, Device Registry, Audit Log를 공유한다.

| 워크스페이스 | 핵심 역할 | 주요 사용자 | 주요 공유 객체 |
| --- | --- | --- | --- |
| JJ-C01 관제·맵·경로·작업 | 온실 맵, 경로, 작업 계획, 멀티로봇 실시간 관제 | 운영 관리자, 관제 오퍼레이터 | Map, Route, WorkSession, Robot, Event |
| JJ-C02 Audit Package·개발자 킷 | 제조사 모듈/프로토콜/SDK 표준화와 통합 검증 | 제조사 개발자, 통합 담당자 | Vendor, Module, CapabilityProfile, ProtocolProfile, AuditPackage |
| JJ-C03 장애·오류 관리 | 이벤트를 장애로 승격하고 조치/원인/재발을 관리 | 유지보수, QA, 운영 관리자 | Event, Incident, ErrorCode, ActionGuide |
| JJ-C04 펌웨어·OTA | 정적분석, 호환성, 승인, 배포, 롤백 | 배포 관리자, 개발자, QA | Firmware, Deployment, CompatibilityRule, AuditLog |
| JJ-H01 HMI | 현장 작업 제어, 로봇/온실 파라미터, 캘리브레이션 | 오퍼레이터, 설치/유지보수 | HMIDevice, CalibrationProfile, Command, ParameterSet |
| JJ-T01 Telemetry | Telemetry 장치 설정, 채널 매핑, 환경 파라미터, 데이터 품질 | Telemetry 담당자, 통합 담당자 | TelemetryDevice, TelemetryChannel, EnvironmentProfile, SyncState |

# 2. 통합 아키텍처 개념도

| 통합 구조 텍스트 다이어그램 [사용자/장치] 운영 웹 콘솔 \| 제조사 개발자 포털 \| HMI 장치 UI \| Telemetry 설정 UI         \| [Unified App Shell] 공통 내비게이션 \| 공통 로봇 드로어 \| 알림 \| 권한 \| 감사 로그         \| [Platform Core API] Map/Route API \| Work API \| Device/Module API \| Command API \| Incident API \| Firmware API \| Telemetry API \| Audit API         \| [Event & Data Layer] Event Bus \| Time-series DB \| Work/Robot DB \| Log Store \| Firmware Artifact Store \| Audit Package Store         \| [Edge/Robot Layer] 적과로봇 \| 적심로봇 \| HMI \| Telemetry Gateway \| 제조사 모듈 \| 센서/구동부/카메라/작업부 |
| --- |

# 3. 시스템 통합 플랜

| 단계 | 목표 | 결과물 | UI 영향 |
| --- | --- | --- | --- |
| 1단계: 표준 객체 정의 | Robot, Module, Work, Event, Firmware, Telemetry, Calibration, Audit 객체 확정 | 도메인 모델, 상태값 정의, ID 규칙 | 모든 화면의 필드명과 배지가 통일됨 |
| 2단계: 제조사 모듈 계약화 | Capability/Protocol/Telemetry/Command Profile 작성 | 개발자 킷, 스키마, 샌드박스 | Audit 워크스페이스에서 온보딩 가능 |
| 3단계: 현장 장치 통합 | HMI와 Telemetry를 Device Registry에 등록 | 페어링, 파라미터 동기화, 캘리브레이션 프로파일 | HMI/Telemetry 화면과 관제 로봇 드로어 연결 |
| 4단계: 작업 운영 연결 | 맵/경로/작업을 로봇과 HMI로 전송 | Work Package, Route Package, Parameter Profile | 관제/작업 화면에서 HMI 상태와 Telemetry 품질 표시 |
| 5단계: 운영 품질 폐루프 | Event -> Incident -> Action -> Firmware/Parameter 개선 | 장애 리포트, 포스트모템, OTA 롤백 | 장애, 펌웨어, HMI, Telemetry 화면이 상호 링크 |

# 4. 공통 데이터 흐름

## 제조사 모듈 온보딩 흐름

- 1. 제조사가 Developer Kit에서 SDK와 스키마를 받는다.

- 2. Capability Profile과 Protocol Profile을 작성한다.

- 3. Simulator에서 메시지를 검증한다.

- 4. Conformance Test Runner를 실행한다.

- 5. Audit Package가 승인되면 Module Registry에 운영 가능 모듈로 등록된다.

- 6. 해당 모듈은 HMI, Telemetry, 펌웨어, 장애 화면에서 동일 module_id로 사용된다.

## 맵/경로/작업 운영 흐름

- 1. Map Designer에서 온실 구조와 구역을 만든다.

- 2. Route Designer에서 robot_type별 경로를 설계한다.

- 3. Work Planner가 적과/적심 작업을 로봇에 배정한다.

- 4. HMI가 작업 패키지를 수신하고 현장 파라미터를 확인한다.

- 5. Telemetry가 위치/환경/상태 데이터를 수집한다.

- 6. Control 화면이 다중 로봇 진행 상황을 표시한다.

## 장애 대응 흐름

- 1. Telemetry 또는 모듈 event가 발생한다.

- 2. Event Engine이 표준 event_code와 severity로 정규화한다.

- 3. critical 이벤트는 Incident로 승격된다.

- 4. HMI에는 현장 조치 문구, 장애 콘솔에는 원인/로그/영향 범위가 표시된다.

- 5. 조치 결과와 캘리브레이션 결과가 audit_log에 기록된다.

- 6. 펌웨어나 파라미터 개선이 필요하면 해당 워크스페이스로 연결된다.

## 펌웨어 배포 흐름

- 1. 펌웨어가 manifest와 함께 등록된다.

- 2. 정적분석과 호환성 검증을 통과한다.

- 3. Audit Package와 승인 조건을 확인한다.

- 4. Canary 그룹에 OTA 배포한다.

- 5. Telemetry와 Incident에서 배포 후 상태를 모니터링한다.

- 6. 문제가 발생하면 rollback 또는 incident 조치로 전환한다.

# 5. 공통 ID 및 패키지 규칙

| 대상 | ID 예시 | 생성 주체 | 사용 범위 |
| --- | --- | --- | --- |
| Robot | RBT-THIN-0001, RBT-PINCH-0003 | Device Registry | 관제, HMI, Telemetry, 장애, 펌웨어 |
| Module | MOD-CAM-V01-0008 | Audit/Module Registry | Audit, 장애, 펌웨어, HMI |
| TelemetryChannel | TCH-greenhouse-humidity-01 | Telemetry Channel Map | Telemetry, 장애, 관제, 리포트 |
| WorkSession | WKS-20260531-00045 | Work Orchestration | 관제, HMI, 장애, 결과 분석 |
| CalibrationProfile | CAL-RBT-0001-CAM-20260531-A | HMI/Telemetry | HMI, Telemetry, Audit, 장애 |
| AuditPackage | AUD-MOD-CAM-20260531-01 | Audit Workspace | 개발자 킷, 펌웨어 승인, 모듈 운영 승인 |

| Audit Package 권장 목차 audit_package.zip   manifest.json   capability_profile.yaml   protocol_profile.yaml   telemetry_schema.json   command_contract.yaml   error_code_map.csv   firmware_manifest.json   calibration_requirements.json   conformance_test_results.json   sample_events.ndjson   sample_telemetry.ndjson   hmi_integration_notes.md   telemetry_config_snapshot.json   audit_report.pdf |
| --- |

# 6. 권한 매트릭스

| 역할 | 조회 | 실행 | 승인/관리 |
| --- | --- | --- | --- |
| 현장 오퍼레이터 | 작업, 로봇 상태, HMI 알림 | 작업 시작/일시정지/재개, 체크리스트 | 긴급정지 해제 불가, 제한된 로컬 저장 |
| 현장 관리자 | 작업/맵/장애/HMI | 작업 배정, 파라미터 수정, 조치 완료 | 현장 파라미터 승인 |
| 유지보수 담당자 | 장애, 모듈, Telemetry, HMI | 캘리브레이션, 조치 가이드 수행, I/O 테스트 | 장애 종료 요청 |
| 제조사 개발자 | 자사 모듈, SDK, Audit 결과 | Profile 작성, 시뮬레이션, test rerun | 운영 반영 승인 불가 |
| 배포 관리자 | 펌웨어, 호환성, 배포 상태 | 배포 계획, canary, rollback | 릴리즈 승인 일부 |
| 시스템 관리자 | 전체 | 사용자/권한/정책/장비 관리 | 최종 승인, 위험 정책 활성화 |

# 7. UX/UI 목업 제작 순서

- 먼저 00 통합 설명서의 공통 셸, 데이터 객체, 상태값, 디자인 토큰을 확정한다.

- 다음으로 01 관제 화면의 로봇 드로어와 상태 배지를 공통 컴포넌트로 만든다.

- 02 Audit 화면에서 Capability/Profile/Protocol 정의 컴포넌트를 만든 뒤 Telemetry/HMI/Firmware 화면에 재사용한다.

- 05 HMI와 06 Telemetry 화면은 하드웨어 해상도 제약을 먼저 반영하고, 동일 파라미터/캘리브레이션 객체를 사용한다.

- 모든 화면 생성 프롬프트는 screen_id를 유지하고, 우측 컨텍스트 드로어와 하단 이벤트 스트립을 누락하지 않는다.

# 8. 공통 검수 기준

- 여섯 UX/UI가 독립 앱처럼 보이지 않고 동일한 제품군과 내비게이션 체계를 가져야 한다.

- 적과로봇과 적심로봇의 robot_type 차이가 경로, 작업, 모듈, 펌웨어, 파라미터 화면에 일관되게 반영되어야 한다.

- HMI와 Telemetry는 단순 설정 도구가 아니라 현장 캘리브레이션과 시스템 통합을 줄이는 도구로 설계되어야 한다.

- Audit Package는 제조사 모듈 통합을 반복 가능하게 만드는 공식 산출물로 표현되어야 한다.

- 작업, 장애, 펌웨어, Telemetry, HMI 이벤트는 audit_log로 추적 가능해야 한다.

# 9. 기술 참고 원칙

구현 기술은 개발팀 역량과 현장 네트워크 조건에 맞춰 확정한다. 화면 설계 관점에서는 아래 원칙만 고정한다.

- 로봇 내부 통신과 관제용 API를 그대로 섞지 않는다. 엣지 게이트웨이 또는 어댑터 계층에서 표준 이벤트와 명령 계약으로 변환한다.

- Telemetry는 원천 신호를 플랫폼 표준 TelemetryChannel로 매핑한 뒤 저장/알림/리포트에 사용한다.

- 외부 제조사와의 API/SDK 계약은 기계가 읽을 수 있는 스키마와 사람이 읽을 수 있는 문서를 동시에 제공한다.

- 장애, 펌웨어 배포, 파라미터 변경, 긴급정지 해제는 모두 감사 로그와 권한 검증을 전제로 한다.

| 참고 항목 | 설계 반영 방식 | 공식 참고 URL |
| --- | --- | --- |
| MQTT | Telemetry 또는 엣지 메시징 후보. UI에서는 topic, payload, QoS, ack 정책을 설정 가능하게 표현. | https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html |
| ROS 2 | 로봇 내부 노드/토픽/서비스/액션 구조 후보. UI에는 직접 노출하지 않고 표준 이벤트/명령으로 추상화. | https://docs.ros.org/en/foxy/Concepts.html |
| OpenAPI | 개발자 킷에서 API 계약과 SDK 생성을 위한 문서/스키마 표현 방식 후보. | https://spec.openapis.org/oas/v3.2.0.html |
| OPC UA | 온실/산업 장비 연동이 필요한 경우 정보 모델링과 상호운용성 참고 후보. | https://opcfoundation.org/developer-tools/specifications-unified-architecture |
