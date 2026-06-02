통합 Audit Package·개발자 킷 UX/UI SSOT

서로 다른 제조사의 로봇/모듈/소프트웨어/프로토콜을 표준화하고 개발자 킷을 제공하기 위한 화면 제작 기준서

| 문서 코드 | JJ-C02 |
| --- | --- |
| 문서 유형 | UX/UI 목업 제작용 SSOT 및 화면 프롬프트 기준서 |
| 적용 범위 | 적과로봇, 적심로봇, HMI, Telemetry, 관제 플랫폼, 통합 Audit Package |
| 작성일 | 2026-05-31 |
| 버전 | v1.0 |

# 1. 문서 목적과 적용 원칙

제조사별 이기종 모듈을 하나의 플랫폼 표준으로 온보딩하고 검증하기 위한 Audit Package 및 Developer Kit 워크스페이스를 정의한다.

| 워크스페이스 | Audit/개발자 킷 워크스페이스 |
| --- | --- |
| 주요 사용자 | 제조사 개발자, 플랫폼 통합 담당자, QA 담당자, 시스템 관리자 |
| 대상 디바이스 | Desktop 1440x900 |
| 연동 의존성 | Module Registry, Firmware Manifest, HMI/Telemetry Contract, SDK, API Gateway, Incident Dictionary |
| 공통 원칙 | 하나의 애플리케이션 셸 안에서 동일한 로봇, 모듈, 작업, 이벤트, 펌웨어, 캘리브레이션 데이터를 공유한다. |

이 문서는 화면 디자이너, UX 기획자, Figma 제작자, 프론트엔드 개발자, 시스템 통합 담당자가 동일한 기준으로 목업을 만들기 위한 단일 진실 공급원(SSOT)이다. 각 화면의 프롬프트 카드는 그대로 복사하여 화면 생성 프롬프트로 사용할 수 있다.

# 2. 공통 애플리케이션 셸

여섯 개 UX/UI는 별도 제품이 아니라 하나의 통합 관제 애플리케이션에 포함되는 워크스페이스다. 사용자는 좌측 글로벌 내비게이션과 우측 컨텍스트 드로어를 통해 로봇, 작업, 모듈, 장애, 펌웨어, HMI, Telemetry 정보를 교차 탐색한다.

| 영역 | 고정 구성 | 표시 정보 |
| --- | --- | --- |
| 상단 바 | 시스템 상태, 현장 선택, 검색, 알림, 사용자 메뉴 | 전체 온라인 로봇 수, 미조치 장애 수, 배포 진행 수, 현재 온실/구역 |
| 좌측 내비게이션 | 홈, 맵/경로/작업, Audit/개발자킷, 장애/오류, 펌웨어/배포, HMI, Telemetry, 시스템 설정 | 사용자 권한에 따라 메뉴 노출 |
| 중앙 작업 영역 | 선택된 워크스페이스의 주요 화면 | 대시보드, 에디터, 목록, 상세, 모니터링 패널 |
| 우측 컨텍스트 드로어 | 선택 객체의 즉시 정보 | 로봇 상태, 모듈 상태, 작업 세션, 장애, 펌웨어, HMI/Telemetry 링크 |
| 하단 이벤트 스트립 | 실시간 이벤트 요약 | warning 이상 이벤트, 명령 진행, 배포 진행, 통신 지연 |

- 컨텍스트 유지: 맵에서 로봇을 선택한 뒤 장애 화면으로 이동해도 동일 robot_id가 유지되어야 한다.

- 상태 표현: 정상, 주의, 경고, 오류, 긴급정지는 모든 워크스페이스에서 동일한 색상, 아이콘, 문구 체계를 사용한다.

- 안전 액션: 작업 시작, 긴급정지 해제, 펌웨어 배포, 캘리브레이션 저장은 확인 단계와 감사 로그 기록이 필수다.

# 3. 공통 SSOT 객체와 상태값

| 객체 | 필수 필드 | 사용 화면 |
| --- | --- | --- |
| Robot | robot_id, robot_type, model, site_id, current_state, location, active_work_session_id, hmi_device_id, telemetry_device_id | 전체 |
| Module | module_id, vendor_id, module_type, robot_id, capability_profile_id, firmware_version, health_state, protocol_profile_id | Audit, 장애, 펌웨어, HMI, Telemetry |
| WorkSession | work_session_id, work_type, route_id, robot_id, status, started_at, progress, result_summary | 관제, HMI, 장애 |
| Route | route_id, map_id, robot_type_support, waypoint_list, safety_zones, version, validation_state | 관제, HMI, Audit |
| Event | event_id, source_type, source_id, severity, event_code, payload, occurred_at, work_session_id | 장애, 관제, Telemetry |
| Incident | incident_id, severity, status, robot_id, module_id, root_cause, action_guide_id, owner_id | 장애, HMI, 관제 |
| Firmware | firmware_id, module_type, version, checksum, analysis_status, deploy_state, compatibility_rules | 펌웨어, Audit, 장애 |
| TelemetryChannel | channel_id, device_id, source, unit, sampling_rate, threshold_policy, quality_state, calibration_profile_id | Telemetry, 장애, 관제 |
| CalibrationProfile | profile_id, target_type, target_id, parameter_set, version, created_by, audit_link | HMI, Telemetry, Audit |
| AuditPackage | audit_package_id, vendor_id, module_id, conformance_score, artifacts, approval_status | Audit, 펌웨어, 시스템 설정 |

| 상태군 | 권장 상태값 | UI 표시 기준 |
| --- | --- | --- |
| 로봇 | offline, online, idle, ready, working, paused, returning, maintenance, fault, emergency_stop | 지도 핀, 로봇 카드, HMI 홈 |
| 모듈 | unknown, disconnected, initializing, normal, warning, degraded, fault, maintenance, disabled | 모듈 카드, 오류, Audit |
| 작업 | planned, assigned, ready, running, paused, blocked, completed, failed, cancelled | 작업 보드, HMI |
| 이벤트 심각도 | info, notice, warning, critical, emergency | 알림, 이벤트 스트림 |
| 펌웨어 배포 | draft, analyzing, blocked, approved, scheduled, deploying, success, failed, rollback_required, rolled_back | 펌웨어, 장애 |
| Audit | draft, submitted, running, passed, failed, waiver_required, approved, expired | 개발자 킷 |

# 4. 공통 디자인 토큰

| 토큰 | 값/규칙 | 사용처 |
| --- | --- | --- |
| 제품 톤 | 현장 장비용은 명확, 안전, 즉시 판단 가능. 관리자 콘솔용은 정보 밀도, 추적성, 비교 가능성 중심. | 전체 |
| 레이아웃 | 웹 1440x900, 태블릿 1024x768, HMI 1024x600/800x480 기준. | 전체 |
| 상태 색상 | normal #2E7D32, notice #1976D2, warning #F9A825, critical #E65100, emergency #B71C1C, disabled #9E9E9E | 상태 배지 |
| 터치 영역 | 태블릿 44px 이상, HMI 64px 이상. 위험 액션은 hold 또는 2단계 확인. | HMI/태블릿 |
| 정보 우선순위 | 1 안전/장애, 2 작업 상태, 3 로봇/모듈 상태, 4 이력/설정. | 대시보드 |

# 5. 화면 목록과 프롬프트 카드

| 화면 ID | 화면명 | 목적 | 디바이스 |
| --- | --- | --- | --- |
| C02-00 | 개발자 킷 홈 대시보드 | 제조사, 모듈, 프로토콜, SDK, Audit 상태를 통합적으로 보여준다. | Desktop 1440x900 |
| C02-01 | 제조사/모듈 온보딩 마법사 | 서로 다른 제조사의 모듈을 표준 등록 절차로 온보딩한다. | Desktop 1440x900 |
| C02-02 | Capability Profile 편집기 | 모듈이 제공하는 기능, 명령, Telemetry, 파라미터, 캘리브레이션 요구사항을 표준화한다. | Desktop 1440x900 |
| C02-03 | 프로토콜 계약 빌더 | 모듈과 플랫폼 간 transport, topic, endpoint, payload, ack 규칙을 표준 계약으로 정의한다. | Desktop 1440x900 |
| C02-04 | 메시지 스키마 및 Telemetry 채널 매퍼 | 모듈의 원천 메시지를 플랫폼 표준 TelemetryChannel 및 Event schema로 매핑한다. | Desktop 1440x900 |
| C02-05 | 시뮬레이터/에뮬레이터 플레이그라운드 | 실제 로봇 없이도 모듈 메시지, 명령 응답, 오류 상황을 시뮬레이션한다. | Desktop 1440x900 |
| C02-06 | Conformance Test Runner | 스키마, heartbeat, command ack, Telemetry cadence, error mapping, 안전 interlock 등 표준 준수 테스트를 실행한다. | Desktop 1440x900 |
| C02-07 | Audit Package 빌더 | 통합 테스트 결과, 프로토콜 계약, 샘플 로그, 캘리브레이션 스냅샷을 하나의 audit package로 묶는다. | Desktop 1440x900 |
| C02-08 | SDK 및 문서 다운로드 센터 | 제조사 개발자가 표준 SDK, 샘플 코드, OpenAPI/스키마, HMI/Telemetry 통합 가이드를 받는다. | Desktop 1440x900 |
| C02-09 | 샌드박스와 API 키 관리 | 제조사별 테스트 환경, API 키, 권한, 호출 제한, 웹훅을 관리한다. | Desktop 1440x900 |
| C02-10 | 통합 이슈 보드 | 모듈 온보딩과 Audit 중 발견된 이슈를 담당자별로 추적한다. | Desktop 1440x900 |

## C02-00 개발자 킷 홈 대시보드

| 목적 | 제조사, 모듈, 프로토콜, SDK, Audit 상태를 통합적으로 보여준다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Vendor, Module, ProtocolProfile, AuditRun, SDKRelease, Certification |
| 주요 구성 | 온보딩 진행률, 최근 Audit 결과, 실패 테스트, SDK 버전 카드, 샌드박스 상태, 빠른 시작 체크리스트 |
| 주요 액션 | 신규 모듈 등록, SDK 다운로드, Audit 실행, 실패 리포트 보기 |
| 상태/예외 | audit failed, expired certification, sandbox offline, SDK update available |
| 연동 포인트 | Module Registry, Firmware manifest, Telemetry schema, HMI calibration contract |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C02-00이고 화면명은 개발자 킷 홈 대시보드이다. 목적은 제조사, 모듈, 프로토콜, SDK, Audit 상태를 통합적으로 보여준다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 온보딩 진행률, 최근 Audit 결과, 실패 테스트, SDK 버전 카드, 샌드박스 상태, 빠른 시작 체크리스트를 배치한다. 표시 데이터는 Vendor, Module, ProtocolProfile, AuditRun, SDKRelease, Certification이며, 주요 액션은 신규 모듈 등록, SDK 다운로드, Audit 실행, 실패 리포트 보기이다. 상태와 예외는 audit failed, expired certification, sandbox offline, SDK update available를 반드시 시각화한다. 연동 포인트는 Module Registry, Firmware manifest, Telemetry schema, HMI calibration contract이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C02-01 제조사/모듈 온보딩 마법사

| 목적 | 서로 다른 제조사의 모듈을 표준 등록 절차로 온보딩한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Vendor, ModuleType, Module, CapabilityProfile, FirmwareManifest |
| 주요 구성 | 5단계 wizard, 제조사 정보, 모듈 기본정보, 지원 로봇 유형, 펌웨어 메타데이터, 제출 전 검토 |
| 주요 액션 | vendor 생성, module_type 선택, 적과/적심 지원 선택, manifest 업로드, 초안 저장, 제출 |
| 상태/예외 | 필수 필드 누락, 중복 serial, 지원 로봇 유형 없음, manifest checksum 오류 |
| 연동 포인트 | Module Registry, Firmware C04 registration, HMI/Telemetry contracts |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C02-01이고 화면명은 제조사/모듈 온보딩 마법사이다. 목적은 서로 다른 제조사의 모듈을 표준 등록 절차로 온보딩한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 5단계 wizard, 제조사 정보, 모듈 기본정보, 지원 로봇 유형, 펌웨어 메타데이터, 제출 전 검토를 배치한다. 표시 데이터는 Vendor, ModuleType, Module, CapabilityProfile, FirmwareManifest이며, 주요 액션은 vendor 생성, module_type 선택, 적과/적심 지원 선택, manifest 업로드, 초안 저장, 제출이다. 상태와 예외는 필수 필드 누락, 중복 serial, 지원 로봇 유형 없음, manifest checksum 오류를 반드시 시각화한다. 연동 포인트는 Module Registry, Firmware C04 registration, HMI/Telemetry contracts이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C02-02 Capability Profile 편집기

| 목적 | 모듈이 제공하는 기능, 명령, Telemetry, 파라미터, 캘리브레이션 요구사항을 표준화한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | CapabilityProfile, CommandContract, TelemetryChannelSchema, ParameterSchema, CalibrationRequirement |
| 주요 구성 | 기능 트리, 명령 스키마 테이블, 파라미터 에디터, 캘리브레이션 요구사항 카드, 변경 diff |
| 주요 액션 | 기능 추가, 명령 정의, 파라미터 타입 지정, 캘리브레이션 항목 연결, 버전 저장 |
| 상태/예외 | 필드 타입 오류, 필수 명령 누락, breaking change, 호환성 경고 |
| 연동 포인트 | HMI 파라미터 관리, Telemetry channel map, Command service, Firmware compatibility |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C02-02이고 화면명은 Capability Profile 편집기이다. 목적은 모듈이 제공하는 기능, 명령, Telemetry, 파라미터, 캘리브레이션 요구사항을 표준화한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 기능 트리, 명령 스키마 테이블, 파라미터 에디터, 캘리브레이션 요구사항 카드, 변경 diff를 배치한다. 표시 데이터는 CapabilityProfile, CommandContract, TelemetryChannelSchema, ParameterSchema, CalibrationRequirement이며, 주요 액션은 기능 추가, 명령 정의, 파라미터 타입 지정, 캘리브레이션 항목 연결, 버전 저장이다. 상태와 예외는 필드 타입 오류, 필수 명령 누락, breaking change, 호환성 경고를 반드시 시각화한다. 연동 포인트는 HMI 파라미터 관리, Telemetry channel map, Command service, Firmware compatibility이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C02-03 프로토콜 계약 빌더

| 목적 | 모듈과 플랫폼 간 transport, topic, endpoint, payload, ack 규칙을 표준 계약으로 정의한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | ProtocolProfile, TransportProfile, TopicMap, PayloadSchema, AckPolicy, SecurityProfile |
| 주요 구성 | transport 선택, topic/endpoint 매핑, payload schema editor, ack/timeout 정책, 보안 설정, 샘플 메시지 |
| 주요 액션 | transport 선택, topic 추가, schema 붙여넣기, ack 정책 지정, 테스트 메시지 생성 |
| 상태/예외 | schema invalid, topic collision, QoS mismatch, auth missing, timeout policy missing |
| 연동 포인트 | Telemetry settings, Command service, Audit test runner, SDK generator |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C02-03이고 화면명은 프로토콜 계약 빌더이다. 목적은 모듈과 플랫폼 간 transport, topic, endpoint, payload, ack 규칙을 표준 계약으로 정의한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 transport 선택, topic/endpoint 매핑, payload schema editor, ack/timeout 정책, 보안 설정, 샘플 메시지를 배치한다. 표시 데이터는 ProtocolProfile, TransportProfile, TopicMap, PayloadSchema, AckPolicy, SecurityProfile이며, 주요 액션은 transport 선택, topic 추가, schema 붙여넣기, ack 정책 지정, 테스트 메시지 생성이다. 상태와 예외는 schema invalid, topic collision, QoS mismatch, auth missing, timeout policy missing를 반드시 시각화한다. 연동 포인트는 Telemetry settings, Command service, Audit test runner, SDK generator이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C02-04 메시지 스키마 및 Telemetry 채널 매퍼

| 목적 | 모듈의 원천 메시지를 플랫폼 표준 TelemetryChannel 및 Event schema로 매핑한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | RawMessageSample, TelemetryChannelSchema, EventSchema, UnitMap, SamplingPolicy |
| 주요 구성 | 좌측 raw sample viewer, 중앙 drag mapping canvas, 우측 표준 필드 목록, 하단 validation 결과 |
| 주요 액션 | 필드 드래그 매핑, 단위 변환, 샘플링 주기 지정, event_code 매핑, 저장 |
| 상태/예외 | 필수 채널 누락, 단위 미정의, sampling rate 과다, event severity 미매핑 |
| 연동 포인트 | Telemetry UX T01, Incident event engine, Audit package artifacts |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C02-04이고 화면명은 메시지 스키마 및 Telemetry 채널 매퍼이다. 목적은 모듈의 원천 메시지를 플랫폼 표준 TelemetryChannel 및 Event schema로 매핑한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 좌측 raw sample viewer, 중앙 drag mapping canvas, 우측 표준 필드 목록, 하단 validation 결과를 배치한다. 표시 데이터는 RawMessageSample, TelemetryChannelSchema, EventSchema, UnitMap, SamplingPolicy이며, 주요 액션은 필드 드래그 매핑, 단위 변환, 샘플링 주기 지정, event_code 매핑, 저장이다. 상태와 예외는 필수 채널 누락, 단위 미정의, sampling rate 과다, event severity 미매핑를 반드시 시각화한다. 연동 포인트는 Telemetry UX T01, Incident event engine, Audit package artifacts이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C02-05 시뮬레이터/에뮬레이터 플레이그라운드

| 목적 | 실제 로봇 없이도 모듈 메시지, 명령 응답, 오류 상황을 시뮬레이션한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | SimulatorScenario, ProtocolProfile, CommandContract, EventScenario, TelemetryScenario |
| 주요 구성 | 시나리오 목록, 메시지 송수신 콘솔, 명령 실행 패널, Telemetry 그래프, 오류 주입 버튼 |
| 주요 액션 | 시나리오 실행, 명령 전송, 오류 주입, 메시지 로그 저장, audit run으로 전환 |
| 상태/예외 | simulator offline, schema mismatch, command timeout, event injection success |
| 연동 포인트 | Audit test runner, Command service sandbox, Telemetry viewer |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C02-05이고 화면명은 시뮬레이터/에뮬레이터 플레이그라운드이다. 목적은 실제 로봇 없이도 모듈 메시지, 명령 응답, 오류 상황을 시뮬레이션한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 시나리오 목록, 메시지 송수신 콘솔, 명령 실행 패널, Telemetry 그래프, 오류 주입 버튼를 배치한다. 표시 데이터는 SimulatorScenario, ProtocolProfile, CommandContract, EventScenario, TelemetryScenario이며, 주요 액션은 시나리오 실행, 명령 전송, 오류 주입, 메시지 로그 저장, audit run으로 전환이다. 상태와 예외는 simulator offline, schema mismatch, command timeout, event injection success를 반드시 시각화한다. 연동 포인트는 Audit test runner, Command service sandbox, Telemetry viewer이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C02-06 Conformance Test Runner

| 목적 | 스키마, heartbeat, command ack, Telemetry cadence, error mapping, 안전 interlock 등 표준 준수 테스트를 실행한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | AuditRun, TestCase, TestResult, Module, ProtocolProfile, CapabilityProfile |
| 주요 구성 | 테스트 스위트 목록, 진행률, 실시간 로그, 결과 테이블, 실패 상세, 재실행 버튼 |
| 주요 액션 | 테스트 선택, 전체 실행, 실패 케이스 재실행, waiver 요청, report 생성 |
| 상태/예외 | running, passed, failed, blocked, waiver_required, timeout |
| 연동 포인트 | Audit package builder, Incident dictionary, Firmware release gate |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C02-06이고 화면명은 Conformance Test Runner이다. 목적은 스키마, heartbeat, command ack, Telemetry cadence, error mapping, 안전 interlock 등 표준 준수 테스트를 실행한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 테스트 스위트 목록, 진행률, 실시간 로그, 결과 테이블, 실패 상세, 재실행 버튼를 배치한다. 표시 데이터는 AuditRun, TestCase, TestResult, Module, ProtocolProfile, CapabilityProfile이며, 주요 액션은 테스트 선택, 전체 실행, 실패 케이스 재실행, waiver 요청, report 생성이다. 상태와 예외는 running, passed, failed, blocked, waiver_required, timeout를 반드시 시각화한다. 연동 포인트는 Audit package builder, Incident dictionary, Firmware release gate이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C02-07 Audit Package 빌더

| 목적 | 통합 테스트 결과, 프로토콜 계약, 샘플 로그, 캘리브레이션 스냅샷을 하나의 audit package로 묶는다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | AuditPackage, AuditRun, ProtocolProfile, CapabilityProfile, SDKRelease, CalibrationProfile, FirmwareManifest |
| 주요 구성 | 패키지 목차, 포함 아티팩트 체크리스트, 검증 점수, 승인 워크플로우, export 버튼 |
| 주요 액션 | artifact 선택, 패키지 빌드, 승인 요청, zip export, 만료일 지정 |
| 상태/예외 | artifact missing, score below threshold, approval pending, approved, expired |
| 연동 포인트 | Firmware release gate, Module registry approval, HMI/Telemetry calibration snapshot |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C02-07이고 화면명은 Audit Package 빌더이다. 목적은 통합 테스트 결과, 프로토콜 계약, 샘플 로그, 캘리브레이션 스냅샷을 하나의 audit package로 묶는다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 패키지 목차, 포함 아티팩트 체크리스트, 검증 점수, 승인 워크플로우, export 버튼를 배치한다. 표시 데이터는 AuditPackage, AuditRun, ProtocolProfile, CapabilityProfile, SDKRelease, CalibrationProfile, FirmwareManifest이며, 주요 액션은 artifact 선택, 패키지 빌드, 승인 요청, zip export, 만료일 지정이다. 상태와 예외는 artifact missing, score below threshold, approval pending, approved, expired를 반드시 시각화한다. 연동 포인트는 Firmware release gate, Module registry approval, HMI/Telemetry calibration snapshot이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C02-08 SDK 및 문서 다운로드 센터

| 목적 | 제조사 개발자가 표준 SDK, 샘플 코드, OpenAPI/스키마, HMI/Telemetry 통합 가이드를 받는다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | SDKRelease, APISpec, Schema, SampleCode, Documentation |
| 주요 구성 | SDK 버전 카드, 문서 검색, API spec 다운로드, 샘플 프로젝트, changelog, quick start |
| 주요 액션 | SDK 다운로드, API spec 복사, sample clone 안내, 버전 비교, breaking change 확인 |
| 상태/예외 | new version available, deprecated, beta, required update |
| 연동 포인트 | Developer onboarding, Protocol builder, HMI/Telemetry integration docs |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C02-08이고 화면명은 SDK 및 문서 다운로드 센터이다. 목적은 제조사 개발자가 표준 SDK, 샘플 코드, OpenAPI/스키마, HMI/Telemetry 통합 가이드를 받는다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 SDK 버전 카드, 문서 검색, API spec 다운로드, 샘플 프로젝트, changelog, quick start를 배치한다. 표시 데이터는 SDKRelease, APISpec, Schema, SampleCode, Documentation이며, 주요 액션은 SDK 다운로드, API spec 복사, sample clone 안내, 버전 비교, breaking change 확인이다. 상태와 예외는 new version available, deprecated, beta, required update를 반드시 시각화한다. 연동 포인트는 Developer onboarding, Protocol builder, HMI/Telemetry integration docs이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C02-09 샌드박스와 API 키 관리

| 목적 | 제조사별 테스트 환경, API 키, 권한, 호출 제한, 웹훅을 관리한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | DeveloperApp, ApiKey, SandboxEnvironment, WebhookEndpoint, RateLimitPolicy |
| 주요 구성 | API key 테이블, 권한 스코프, 샌드박스 상태, 웹훅 URL 설정, 호출 로그 요약 |
| 주요 액션 | 키 생성/폐기, 스코프 수정, 웹훅 테스트, 샌드박스 리셋, 호출 로그 보기 |
| 상태/예외 | key expired, key leaked suspected, sandbox reset pending, webhook failed |
| 연동 포인트 | Protocol test, SDK, Audit Runner |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C02-09이고 화면명은 샌드박스와 API 키 관리이다. 목적은 제조사별 테스트 환경, API 키, 권한, 호출 제한, 웹훅을 관리한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 API key 테이블, 권한 스코프, 샌드박스 상태, 웹훅 URL 설정, 호출 로그 요약를 배치한다. 표시 데이터는 DeveloperApp, ApiKey, SandboxEnvironment, WebhookEndpoint, RateLimitPolicy이며, 주요 액션은 키 생성/폐기, 스코프 수정, 웹훅 테스트, 샌드박스 리셋, 호출 로그 보기이다. 상태와 예외는 key expired, key leaked suspected, sandbox reset pending, webhook failed를 반드시 시각화한다. 연동 포인트는 Protocol test, SDK, Audit Runner이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C02-10 통합 이슈 보드

| 목적 | 모듈 온보딩과 Audit 중 발견된 이슈를 담당자별로 추적한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | IntegrationIssue, AuditRun, Module, Vendor, Owner, Comment |
| 주요 구성 | 칸반 보드, 심각도 필터, 이슈 상세, 관련 테스트, 댓글/첨부, 해결 확인 |
| 주요 액션 | 이슈 생성, 담당자 지정, 상태 변경, 관련 로그 첨부, 재검증 요청 |
| 상태/예외 | open, in_progress, blocked, resolved, verified, reopened |
| 연동 포인트 | Audit failed tests, Incident dictionary, Firmware gate |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C02-10이고 화면명은 통합 이슈 보드이다. 목적은 모듈 온보딩과 Audit 중 발견된 이슈를 담당자별로 추적한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 칸반 보드, 심각도 필터, 이슈 상세, 관련 테스트, 댓글/첨부, 해결 확인를 배치한다. 표시 데이터는 IntegrationIssue, AuditRun, Module, Vendor, Owner, Comment이며, 주요 액션은 이슈 생성, 담당자 지정, 상태 변경, 관련 로그 첨부, 재검증 요청이다. 상태와 예외는 open, in_progress, blocked, resolved, verified, reopened를 반드시 시각화한다. 연동 포인트는 Audit failed tests, Incident dictionary, Firmware gate이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

# 6. 핵심 사용자 흐름

## 신규 제조사 모듈 표준 등록

- 1. 개발자 킷 홈에서 신규 모듈 등록 시작

- 2. 모듈 유형, 지원 로봇 유형, 펌웨어 manifest 입력

- 3. Capability Profile에서 명령, 파라미터, Telemetry 채널 정의

- 4. Protocol Builder에서 transport와 payload 계약 정의

- 5. Conformance Test를 실행하고 통과하면 Audit Package 생성

| 완료 기준 | Audit Package가 approved 상태가 되어야 Module Registry에서 운영 가능으로 전환된다. |
| --- | --- |

## 통합 실패 보완

- 1. Conformance Test 실패 항목 확인

- 2. expected/actual diff와 raw log 확인

- 3. 통합 이슈 보드에 담당자와 due date 지정

- 4. 제조사가 프로토콜/스키마 수정

- 5. 실패 케이스만 재실행하고 결과 반영

| 완료 기준 | 보완 이력과 waiver 요청은 audit_package_id에 남아야 한다. |
| --- | --- |

## 개발자 킷 배포

- 1. SDK 새 버전 등록

- 2. OpenAPI/스키마/changelog와 sample app 연결

- 3. breaking change 표시

- 4. 제조사별 업데이트 필요 여부 노출

- 5. 다운로드 로그와 동의 이력 저장

| 완료 기준 | SDK와 API spec 버전이 Profile 버전과 추적 가능해야 한다. |
| --- | --- |

# 7. 목업 검수 기준

- Capability Profile, Protocol Profile, Telemetry Schema, Command Contract를 각각 별도 객체로 편집하고 버전 관리해야 한다.

- Audit Package는 zip으로 export 가능한 목차 구조와 승인 상태를 가져야 한다.

- 제조사 개발자와 내부 통합 담당자의 권한과 화면 문구를 구분해야 한다.

- 각 test case는 expected, actual, result, log, waiver_status를 보여야 한다.

- HMI와 Telemetry에 필요한 파라미터/캘리브레이션 요구사항이 Audit Profile에 포함되어야 한다.

# 8. 용어와 화면 제작 주의사항

| 용어 | 정의/화면 적용 |
| --- | --- |
| Capability Profile | 모듈이 제공하는 기능, 명령, 파라미터, Telemetry 채널, 캘리브레이션을 정의하는 표준 프로파일. |
| Protocol Profile | transport, topic, endpoint, payload, ack, timeout, auth 규칙을 묶은 통신 계약. |
| Conformance Test | 제조사 모듈이 플랫폼 표준을 따르는지 확인하는 테스트 묶음. |
| Audit Package | 프로토콜 계약, 스키마, 테스트 결과, 샘플 로그, 캘리브레이션 스냅샷, 승인 이력을 포함하는 통합 검증 산출물. |
| Developer Kit | SDK, API spec, message schema, simulator, sample code, integration guide, test data를 포함하는 제조사용 개발 패키지. |
