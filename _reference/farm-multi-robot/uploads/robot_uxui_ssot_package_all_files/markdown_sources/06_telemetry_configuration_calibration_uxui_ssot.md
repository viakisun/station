Telemetry 설정·채널·환경 파라미터 UX/UI SSOT

Telemetry 하드웨어 설정, 채널 표준화, 환경 파라미터, 데이터 품질, 동기화를 관리하기 위한 화면 제작 기준서

| 문서 코드 | JJ-T01 |
| --- | --- |
| 문서 유형 | UX/UI 목업 제작용 SSOT 및 화면 프롬프트 기준서 |
| 적용 범위 | 적과로봇, 적심로봇, HMI, Telemetry, 관제 플랫폼, 통합 Audit Package |
| 작성일 | 2026-05-31 |
| 버전 | v1.0 |

# 1. 문서 목적과 적용 원칙

Telemetry 하드웨어와 설정 UX/UI를 정의한다. 장치 온보딩, 채널 맵, 센서 캘리브레이션, 온실 환경 파라미터 레지스트리, 프로토콜/토픽 매핑, 샘플링/임계값 정책, 엣지 버퍼, 데이터 품질 진단을 포함한다.

| 워크스페이스 | Telemetry 설정 워크스페이스 및 장치 관리 UI |
| --- | --- |
| 주요 사용자 | 시스템 통합 담당자, Telemetry 담당자, 설치 담당자, 운영 관리자, 데이터 담당자 |
| 대상 디바이스 | Desktop 1440x900, Tablet 1024x768 |
| 연동 의존성 | HMI, Audit Package, Incident Engine, Map Designer, Work Planner, Firmware Device Management |
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
| T01-00 | Telemetry 장치 온보딩 | Telemetry 하드웨어를 현장 로봇, 온실, HMI, 플랫폼에 연결한다. | Desktop 1440x900 / Tablet 1024x768 |
| T01-01 | Telemetry 개요 대시보드 | Telemetry 장치, 채널, 데이터 품질, 지연, 버퍼, 동기화 상태를 통합 확인한다. | Desktop 1440x900 |
| T01-02 | 채널 맵 빌더 | 센서/모듈 원천 신호를 표준 TelemetryChannel로 매핑한다. | Desktop 1440x900 |
| T01-03 | 센서 캘리브레이션 매니저 | 환경 센서와 로봇 센서의 zero/span, offset, scale, 위치 보정을 관리한다. | Desktop 1440x900 / Tablet 1024x768 |
| T01-04 | 온실 환경 파라미터 레지스트리 | 온실별 온도, 습도, 조도, CO2, 행/베드 구조, 작물 프로파일 등 환경/작업 파라미터를 표준 레지스트리로 관리한다. | Desktop 1440x900 |
| T01-05 | 프로토콜 및 토픽 매핑 | Telemetry 장치가 플랫폼으로 전송하는 transport, topic, endpoint, payload, 인증 정보를 설정한다. | Desktop 1440x900 |
| T01-06 | 샘플링/임계값 정책 | Telemetry 채널별 수집 주기, 압축/평활, threshold, 이벤트 승격 조건을 설정한다. | Desktop 1440x900 |
| T01-07 | 엣지 버퍼 및 동기화 상태 | 네트워크 불안정 시 Telemetry 데이터의 로컬 저장, 재전송, 누락 구간을 관리한다. | Desktop 1440x900 |
| T01-08 | 데이터 품질 진단 | 채널별 누락, 지연, 이상치, 단위 오류, 센서 drift를 진단한다. | Desktop 1440x900 |
| T01-09 | 설정 Export/Import 및 Audit Snapshot | Telemetry 설정, 채널 매핑, 캘리브레이션, 환경 파라미터를 Audit Package와 현장 장치에 공유 가능한 파일로 관리한다. | Desktop 1440x900 |
| T01-10 | Telemetry 장치 펌웨어와 Health | Telemetry 하드웨어 자체의 펌웨어, CPU/메모리/저장소, 네트워크, 재시작 이력을 관리한다. | Desktop 1440x900 |

## T01-00 Telemetry 장치 온보딩

| 목적 | Telemetry 하드웨어를 현장 로봇, 온실, HMI, 플랫폼에 연결한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | TelemetryDevice, Robot, Site, HMI, PairingCode, NetworkStatus |
| 주요 구성 | 장치 검색, pairing wizard, 연결 대상 선택, 네트워크 테스트, 완료 요약 |
| 주요 액션 | 장치 검색, 페어링, 로봇/HMI 연결, 네트워크 테스트, 등록 완료 |
| 상태/예외 | device_not_found, pairing_failed, duplicate_device, weak_signal, registered |
| 연동 포인트 | Device registry, HMI pairing, Audit device trace |

| 화면 생성 프롬프트 Desktop 1440x900 / Tablet 1024x768 기준의 UX/UI 목업을 생성한다. 화면 ID는 T01-00이고 화면명은 Telemetry 장치 온보딩이다. 목적은 Telemetry 하드웨어를 현장 로봇, 온실, HMI, 플랫폼에 연결한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 장치 검색, pairing wizard, 연결 대상 선택, 네트워크 테스트, 완료 요약를 배치한다. 표시 데이터는 TelemetryDevice, Robot, Site, HMI, PairingCode, NetworkStatus이며, 주요 액션은 장치 검색, 페어링, 로봇/HMI 연결, 네트워크 테스트, 등록 완료이다. 상태와 예외는 device_not_found, pairing_failed, duplicate_device, weak_signal, registered를 반드시 시각화한다. 연동 포인트는 Device registry, HMI pairing, Audit device trace이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## T01-01 Telemetry 개요 대시보드

| 목적 | Telemetry 장치, 채널, 데이터 품질, 지연, 버퍼, 동기화 상태를 통합 확인한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | TelemetryDevice, TelemetryChannel, DataQuality, SyncState, Event |
| 주요 구성 | 장치 상태 KPI, 채널 품질 테이블, latency 차트, 버퍼 사용량, 최근 이벤트, HMI 링크 |
| 주요 액션 | 장치 상세 열기, 채널 매핑, 진단 실행, HMI 링크 보기 |
| 상태/예외 | online, weak_signal, data_gap, buffer_full, sync_failed, calibration_due |
| 연동 포인트 | Control dashboard, Incident event, HMI network screen |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 T01-01이고 화면명은 Telemetry 개요 대시보드이다. 목적은 Telemetry 장치, 채널, 데이터 품질, 지연, 버퍼, 동기화 상태를 통합 확인한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 장치 상태 KPI, 채널 품질 테이블, latency 차트, 버퍼 사용량, 최근 이벤트, HMI 링크를 배치한다. 표시 데이터는 TelemetryDevice, TelemetryChannel, DataQuality, SyncState, Event이며, 주요 액션은 장치 상세 열기, 채널 매핑, 진단 실행, HMI 링크 보기이다. 상태와 예외는 online, weak_signal, data_gap, buffer_full, sync_failed, calibration_due를 반드시 시각화한다. 연동 포인트는 Control dashboard, Incident event, HMI network screen이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## T01-02 채널 맵 빌더

| 목적 | 센서/모듈 원천 신호를 표준 TelemetryChannel로 매핑한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | RawSignal, TelemetryChannel, UnitMap, CapabilityProfile, ProtocolProfile |
| 주요 구성 | 원천 신호 목록, 표준 채널 트리, 매핑 캔버스, 단위 변환, 샘플 미리보기, 검증 결과 |
| 주요 액션 | 신호 매핑, 단위 변환, 채널명 지정, 저장, Audit 검증 |
| 상태/예외 | unmapped_signal, unit_mismatch, duplicate_channel, invalid_sampling |
| 연동 포인트 | Audit schema mapper, Incident event, Control dashboard metrics |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 T01-02이고 화면명은 채널 맵 빌더이다. 목적은 센서/모듈 원천 신호를 표준 TelemetryChannel로 매핑한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 원천 신호 목록, 표준 채널 트리, 매핑 캔버스, 단위 변환, 샘플 미리보기, 검증 결과를 배치한다. 표시 데이터는 RawSignal, TelemetryChannel, UnitMap, CapabilityProfile, ProtocolProfile이며, 주요 액션은 신호 매핑, 단위 변환, 채널명 지정, 저장, Audit 검증이다. 상태와 예외는 unmapped_signal, unit_mismatch, duplicate_channel, invalid_sampling를 반드시 시각화한다. 연동 포인트는 Audit schema mapper, Incident event, Control dashboard metrics이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## T01-03 센서 캘리브레이션 매니저

| 목적 | 환경 센서와 로봇 센서의 zero/span, offset, scale, 위치 보정을 관리한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | CalibrationProfile, Sensor, TelemetryChannel, ReferenceValue, ValidationResult |
| 주요 구성 | 센서 목록, 캘리브레이션 상태, 현재값/기준값, wizard, 결과 그래프, 이력 |
| 주요 액션 | 캘리브레이션 시작, 기준값 입력, 검증, 저장, rollback, HMI로 전송 |
| 상태/예외 | calibration_due, reference_missing, validation_failed, saved, rollback_available |
| 연동 포인트 | HMI calibration hub, Audit snapshot, Incident diagnostics |

| 화면 생성 프롬프트 Desktop 1440x900 / Tablet 1024x768 기준의 UX/UI 목업을 생성한다. 화면 ID는 T01-03이고 화면명은 센서 캘리브레이션 매니저이다. 목적은 환경 센서와 로봇 센서의 zero/span, offset, scale, 위치 보정을 관리한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 센서 목록, 캘리브레이션 상태, 현재값/기준값, wizard, 결과 그래프, 이력를 배치한다. 표시 데이터는 CalibrationProfile, Sensor, TelemetryChannel, ReferenceValue, ValidationResult이며, 주요 액션은 캘리브레이션 시작, 기준값 입력, 검증, 저장, rollback, HMI로 전송이다. 상태와 예외는 calibration_due, reference_missing, validation_failed, saved, rollback_available를 반드시 시각화한다. 연동 포인트는 HMI calibration hub, Audit snapshot, Incident diagnostics이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## T01-04 온실 환경 파라미터 레지스트리

| 목적 | 온실별 온도, 습도, 조도, CO2, 행/베드 구조, 작물 프로파일 등 환경/작업 파라미터를 표준 레지스트리로 관리한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | GreenhouseParameter, EnvironmentProfile, CropProfile, Map, HMIParameterSet |
| 주요 구성 | 온실/구역 트리, 파라미터 테이블, 적용 대상, 버전, HMI 동기화 상태, 변경 diff |
| 주요 액션 | 파라미터 생성, 값 수정, 버전 발행, HMI 동기화, 이력 비교 |
| 상태/예외 | draft, published, sync_pending, conflict, deprecated |
| 연동 포인트 | Map designer, HMI greenhouse parameter, Work planner, Audit calibration snapshot |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 T01-04이고 화면명은 온실 환경 파라미터 레지스트리이다. 목적은 온실별 온도, 습도, 조도, CO2, 행/베드 구조, 작물 프로파일 등 환경/작업 파라미터를 표준 레지스트리로 관리한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 온실/구역 트리, 파라미터 테이블, 적용 대상, 버전, HMI 동기화 상태, 변경 diff를 배치한다. 표시 데이터는 GreenhouseParameter, EnvironmentProfile, CropProfile, Map, HMIParameterSet이며, 주요 액션은 파라미터 생성, 값 수정, 버전 발행, HMI 동기화, 이력 비교이다. 상태와 예외는 draft, published, sync_pending, conflict, deprecated를 반드시 시각화한다. 연동 포인트는 Map designer, HMI greenhouse parameter, Work planner, Audit calibration snapshot이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## T01-05 프로토콜 및 토픽 매핑

| 목적 | Telemetry 장치가 플랫폼으로 전송하는 transport, topic, endpoint, payload, 인증 정보를 설정한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | ProtocolProfile, TopicMap, TelemetryDevice, SecurityProfile, PayloadSchema |
| 주요 구성 | transport 탭, topic table, payload schema preview, auth 설정, test publish, 결과 로그 |
| 주요 액션 | topic 추가, endpoint 입력, auth 설정, test publish, profile 저장 |
| 상태/예외 | auth_failed, topic_conflict, schema_invalid, publish_success, qos_warning |
| 연동 포인트 | Audit protocol contract, SDK, Event stream |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 T01-05이고 화면명은 프로토콜 및 토픽 매핑이다. 목적은 Telemetry 장치가 플랫폼으로 전송하는 transport, topic, endpoint, payload, 인증 정보를 설정한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 transport 탭, topic table, payload schema preview, auth 설정, test publish, 결과 로그를 배치한다. 표시 데이터는 ProtocolProfile, TopicMap, TelemetryDevice, SecurityProfile, PayloadSchema이며, 주요 액션은 topic 추가, endpoint 입력, auth 설정, test publish, profile 저장이다. 상태와 예외는 auth_failed, topic_conflict, schema_invalid, publish_success, qos_warning를 반드시 시각화한다. 연동 포인트는 Audit protocol contract, SDK, Event stream이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## T01-06 샘플링/임계값 정책

| 목적 | Telemetry 채널별 수집 주기, 압축/평활, threshold, 이벤트 승격 조건을 설정한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | SamplingPolicy, ThresholdPolicy, TelemetryChannel, EventRule |
| 주요 구성 | 채널 목록, sampling rate editor, threshold graph, rule builder, 예상 이벤트 수 시뮬레이션 |
| 주요 액션 | 샘플링 주기 변경, threshold 지정, 이벤트 rule 생성, 시뮬레이션, 저장 |
| 상태/예외 | sampling too high, threshold conflict, rule disabled, event storm risk |
| 연동 포인트 | Incident event engine, Data storage, Control dashboard |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 T01-06이고 화면명은 샘플링/임계값 정책이다. 목적은 Telemetry 채널별 수집 주기, 압축/평활, threshold, 이벤트 승격 조건을 설정한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 채널 목록, sampling rate editor, threshold graph, rule builder, 예상 이벤트 수 시뮬레이션를 배치한다. 표시 데이터는 SamplingPolicy, ThresholdPolicy, TelemetryChannel, EventRule이며, 주요 액션은 샘플링 주기 변경, threshold 지정, 이벤트 rule 생성, 시뮬레이션, 저장이다. 상태와 예외는 sampling too high, threshold conflict, rule disabled, event storm risk를 반드시 시각화한다. 연동 포인트는 Incident event engine, Data storage, Control dashboard이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## T01-07 엣지 버퍼 및 동기화 상태

| 목적 | 네트워크 불안정 시 Telemetry 데이터의 로컬 저장, 재전송, 누락 구간을 관리한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | EdgeBuffer, SyncJob, TelemetryDevice, DataGap, NetworkStatus |
| 주요 구성 | 버퍼 사용량, sync queue, data gap timeline, 재전송 버튼, purge 정책, 저장소 상태 |
| 주요 액션 | 강제 동기화, 재전송, gap 상세, buffer purge, 저장소 정책 변경 |
| 상태/예외 | buffer_full, sync_pending, sync_failed, data_gap, disk_warning |
| 연동 포인트 | Incident event, HMI network status, Control dashboard |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 T01-07이고 화면명은 엣지 버퍼 및 동기화 상태이다. 목적은 네트워크 불안정 시 Telemetry 데이터의 로컬 저장, 재전송, 누락 구간을 관리한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 버퍼 사용량, sync queue, data gap timeline, 재전송 버튼, purge 정책, 저장소 상태를 배치한다. 표시 데이터는 EdgeBuffer, SyncJob, TelemetryDevice, DataGap, NetworkStatus이며, 주요 액션은 강제 동기화, 재전송, gap 상세, buffer purge, 저장소 정책 변경이다. 상태와 예외는 buffer_full, sync_pending, sync_failed, data_gap, disk_warning를 반드시 시각화한다. 연동 포인트는 Incident event, HMI network status, Control dashboard이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## T01-08 데이터 품질 진단

| 목적 | 채널별 누락, 지연, 이상치, 단위 오류, 센서 drift를 진단한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | DataQualityReport, TelemetryChannel, CalibrationProfile, Sensor, Incident |
| 주요 구성 | 품질 점수 카드, 채널별 진단 테이블, trend chart, 이상치 리스트, 조치 추천 |
| 주요 액션 | 기간 필터, 채널 상세, 캘리브레이션 요청, 장애 생성, 리포트 export |
| 상태/예외 | quality_good, drift_detected, unit_error, data_gap, stale_calibration |
| 연동 포인트 | Incident creation, Calibration manager, Work result analytics |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 T01-08이고 화면명은 데이터 품질 진단이다. 목적은 채널별 누락, 지연, 이상치, 단위 오류, 센서 drift를 진단한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 품질 점수 카드, 채널별 진단 테이블, trend chart, 이상치 리스트, 조치 추천를 배치한다. 표시 데이터는 DataQualityReport, TelemetryChannel, CalibrationProfile, Sensor, Incident이며, 주요 액션은 기간 필터, 채널 상세, 캘리브레이션 요청, 장애 생성, 리포트 export이다. 상태와 예외는 quality_good, drift_detected, unit_error, data_gap, stale_calibration를 반드시 시각화한다. 연동 포인트는 Incident creation, Calibration manager, Work result analytics이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## T01-09 설정 Export/Import 및 Audit Snapshot

| 목적 | Telemetry 설정, 채널 매핑, 캘리브레이션, 환경 파라미터를 Audit Package와 현장 장치에 공유 가능한 파일로 관리한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | TelemetryConfigPackage, CalibrationProfile, ChannelMap, EnvironmentProfile, AuditPackage |
| 주요 구성 | export 대상 체크리스트, 패키지 미리보기, 버전/서명, import 검증, 변경 diff |
| 주요 액션 | 설정 export, import 검증, Audit snapshot 생성, HMI 전송, rollback |
| 상태/예외 | import_invalid, version_conflict, signature_missing, export_success |
| 연동 포인트 | Audit Package, HMI parameter sync, Developer Kit |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 T01-09이고 화면명은 설정 Export/Import 및 Audit Snapshot이다. 목적은 Telemetry 설정, 채널 매핑, 캘리브레이션, 환경 파라미터를 Audit Package와 현장 장치에 공유 가능한 파일로 관리한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 export 대상 체크리스트, 패키지 미리보기, 버전/서명, import 검증, 변경 diff를 배치한다. 표시 데이터는 TelemetryConfigPackage, CalibrationProfile, ChannelMap, EnvironmentProfile, AuditPackage이며, 주요 액션은 설정 export, import 검증, Audit snapshot 생성, HMI 전송, rollback이다. 상태와 예외는 import_invalid, version_conflict, signature_missing, export_success를 반드시 시각화한다. 연동 포인트는 Audit Package, HMI parameter sync, Developer Kit이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## T01-10 Telemetry 장치 펌웨어와 Health

| 목적 | Telemetry 하드웨어 자체의 펌웨어, CPU/메모리/저장소, 네트워크, 재시작 이력을 관리한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | TelemetryDevice, Firmware, DeviceMetric, DeploymentHistory, Incident |
| 주요 구성 | 장치 health 카드, 펌웨어 버전, 리소스 차트, 재시작 이력, 업데이트 버튼, 장애 링크 |
| 주요 액션 | 장치 재시작 요청, 펌웨어 업데이트 계획, 로그 다운로드, 장애 생성 |
| 상태/예외 | healthy, degraded, high_cpu, disk_warning, update_available, update_failed |
| 연동 포인트 | Firmware C04, Incident C03, HMI link status |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 T01-10이고 화면명은 Telemetry 장치 펌웨어와 Health이다. 목적은 Telemetry 하드웨어 자체의 펌웨어, CPU/메모리/저장소, 네트워크, 재시작 이력을 관리한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 장치 health 카드, 펌웨어 버전, 리소스 차트, 재시작 이력, 업데이트 버튼, 장애 링크를 배치한다. 표시 데이터는 TelemetryDevice, Firmware, DeviceMetric, DeploymentHistory, Incident이며, 주요 액션은 장치 재시작 요청, 펌웨어 업데이트 계획, 로그 다운로드, 장애 생성이다. 상태와 예외는 healthy, degraded, high_cpu, disk_warning, update_available, update_failed를 반드시 시각화한다. 연동 포인트는 Firmware C04, Incident C03, HMI link status이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

# 6. 핵심 사용자 흐름

## Telemetry 장치 설치와 채널 매핑

- 1. Telemetry 장치를 검색하고 로봇/HMI와 페어링

- 2. 프로토콜과 topic 설정

- 3. 원천 신호를 표준 TelemetryChannel로 매핑

- 4. 샘플링 주기와 threshold 지정

- 5. 테스트 publish와 데이터 품질 진단 통과 후 운영 상태 전환

| 완료 기준 | 채널 매핑과 프로토콜 설정은 Audit Package에 export 가능해야 한다. |
| --- | --- |

## 온실 파라미터 현장 동기화

- 1. 환경 파라미터 레지스트리에서 구역별 프로파일 발행

- 2. HMI 동기화 상태 확인

- 3. 현장 HMI 로컬 수정 발생 시 conflict 표시

- 4. 관리자가 diff를 보고 병합 또는 덮어쓰기 선택

- 5. 최종 프로파일 버전이 작업 계획에 적용

| 완료 기준 | map_version, environment_profile_version, hmi_parameter_version이 함께 추적되어야 한다. |
| --- | --- |

## 데이터 품질 문제 처리

- 1. 대시보드에서 data_gap 또는 drift 확인

- 2. 데이터 품질 진단에서 채널별 원인 확인

- 3. 필요 시 센서 캘리브레이션 요청

- 4. 품질 문제가 작업에 영향을 주면 incident 생성

- 5. 조치 후 품질 점수 회복 여부 확인

| 완료 기준 | 진단 결과는 incident_id 또는 calibration_profile_id와 연결되어야 한다. |
| --- | --- |

# 7. 목업 검수 기준

- Telemetry 채널은 원천 신호와 표준 channel_id의 매핑을 명확히 보여야 한다.

- 샘플링/임계값 정책은 이벤트 폭주 위험을 시뮬레이션해야 한다.

- 온실 환경 파라미터는 HMI와 map/work planner에서 동일 버전으로 참조해야 한다.

- 버퍼/동기화 상태는 데이터 누락 구간을 시간축으로 보여야 한다.

- 설정 export/import는 Audit Package와 호환되는 패키지 구조를 가져야 한다.

# 8. 용어와 화면 제작 주의사항

| 용어 | 정의/화면 적용 |
| --- | --- |
| Telemetry | 로봇, 모듈, 센서, 온실 환경에서 수집되는 상태/수치/이벤트 데이터와 이를 수집·전송하는 하드웨어/소프트웨어. |
| TelemetryChannel | 표준화된 데이터 수집 단위. 예: motor_temp, camera_latency, greenhouse_humidity. |
| Channel Map | 제조사 원천 신호를 플랫폼 표준 TelemetryChannel에 연결하는 매핑. |
| Edge Buffer | 네트워크 불안정 시 현장 장치가 데이터를 임시 저장하고 나중에 동기화하는 공간. |
| Environment Profile | 온실 구역별 환경/작업 기준값을 버전 관리하는 프로파일. |
