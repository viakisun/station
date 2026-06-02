HMI 현장 운용·파라미터·캘리브레이션 UX/UI SSOT

현장 HMI 하드웨어에서 로봇 자체와 온실 환경 파라미터를 관리하고 캘리브레이션하기 위한 화면 제작 기준서

| 문서 코드 | JJ-H01 |
| --- | --- |
| 문서 유형 | UX/UI 목업 제작용 SSOT 및 화면 프롬프트 기준서 |
| 적용 범위 | 적과로봇, 적심로봇, HMI, Telemetry, 관제 플랫폼, 통합 Audit Package |
| 작성일 | 2026-05-31 |
| 버전 | v1.0 |

# 1. 문서 목적과 적용 원칙

로봇 또는 현장에 설치되는 HMI 하드웨어 화면을 정의한다. 작업 제어, 수동 조그, 로봇 파라미터, 온실/작업 파라미터, 캘리브레이션, 모듈 Health, Telemetry 링크, 긴급정지 복구를 포함한다.

| 워크스페이스 | HMI 현장 운용 워크스페이스 및 장치 UI |
| --- | --- |
| 주요 사용자 | 현장 오퍼레이터, 현장 관리자, 설치 담당자, 유지보수 담당자 |
| 대상 디바이스 | HMI 1024x600, HMI 800x480, Tablet 1024x768 |
| 연동 의존성 | Command Service, Work Orchestration, Telemetry Device, Incident Action Guide, Calibration Profile, Audit Log |
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
| H01-00 | HMI 부팅 및 페어링 | HMI 장치를 로봇과 플랫폼에 연결하고 장치 ID, 로봇 ID, Telemetry 상태를 확인한다. | HMI 1024x600 / 800x480 |
| H01-01 | HMI 홈 상태판 | 현장에서 로봇 상태, 작업 상태, 모듈 상태, 안전 상태, Telemetry 연결을 5초 이내에 판단한다. | HMI 1024x600 |
| H01-02 | 작업 빠른 제어 | 현장에서 배정된 작업을 시작, 일시정지, 재개, 종료, 복귀 요청한다. | HMI 1024x600 |
| H01-03 | 수동 조그 및 안전 이동 | 점검/캘리브레이션 중 로봇 축, 작업부, 엔드이펙터를 제한 속도로 수동 이동한다. | HMI 1024x600 |
| H01-04 | 로봇 파라미터 관리 | 로봇 자체 운용 파라미터를 현장에서 조회하고 권한에 따라 수정한다. | HMI 1024x600 |
| H01-05 | 온실/작업 파라미터 관리 | 행 간격, 식재 간격, 작업 높이, 작물 프로파일, 적과/적심 임계값 등 현장 환경 파라미터를 관리한다. | HMI 1024x600 |
| H01-06 | 캘리브레이션 허브 | 카메라, 작업부, 축 원점, 센서, Telemetry, 온실 좌표 보정 등 모든 현장 캘리브레이션을 시작한다. | HMI 1024x600 |
| H01-07 | 카메라-작업부 캘리브레이션 단계 | 카메라 인식 좌표와 작업부 실제 동작 좌표를 단계별로 보정한다. | HMI 1024x600 |
| H01-08 | 모듈 Health 및 I/O 모니터 | 현장에서 모듈 연결, I/O 상태, 센서값, 오류 코드를 빠르게 점검한다. | HMI 1024x600 |
| H01-09 | Telemetry 링크 및 네트워크 상태 | HMI에서 Telemetry 장치 연결 상태, 신호 품질, 버퍼링, 동기화 상태를 확인한다. | HMI 1024x600 |
| H01-10 | 점검 체크리스트와 유지보수 모드 | 작업 전/후 점검과 유지보수 모드 전환을 현장에서 수행한다. | HMI 1024x600 |
| H01-11 | 긴급정지 잠금 및 복구 | 긴급정지 상태를 명확히 표시하고 복구 조건을 단계별로 확인한다. | HMI 1024x600 |

## H01-00 HMI 부팅 및 페어링

| 목적 | HMI 장치를 로봇과 플랫폼에 연결하고 장치 ID, 로봇 ID, Telemetry 상태를 확인한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | HMIDevice, Robot, TelemetryDevice, PairingCode, NetworkStatus |
| 주요 구성 | 큰 상태 아이콘, pairing code, QR/숫자 코드, 네트워크 상태, 재시도 버튼, 오프라인 모드 안내 |
| 주요 액션 | 페어링 시작, 코드 입력, 네트워크 재시도, 로컬 모드 진입 |
| 상태/예외 | unpaired, pairing, paired, network_failed, platform_unreachable, robot_not_found |
| 연동 포인트 | Platform device registry, Telemetry pairing, Audit device trace |

| 화면 생성 프롬프트 HMI 1024x600 / 800x480 기준의 UX/UI 목업을 생성한다. 화면 ID는 H01-00이고 화면명은 HMI 부팅 및 페어링이다. 목적은 HMI 장치를 로봇과 플랫폼에 연결하고 장치 ID, 로봇 ID, Telemetry 상태를 확인한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 큰 상태 아이콘, pairing code, QR/숫자 코드, 네트워크 상태, 재시도 버튼, 오프라인 모드 안내를 배치한다. 표시 데이터는 HMIDevice, Robot, TelemetryDevice, PairingCode, NetworkStatus이며, 주요 액션은 페어링 시작, 코드 입력, 네트워크 재시도, 로컬 모드 진입이다. 상태와 예외는 unpaired, pairing, paired, network_failed, platform_unreachable, robot_not_found를 반드시 시각화한다. 연동 포인트는 Platform device registry, Telemetry pairing, Audit device trace이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## H01-01 HMI 홈 상태판

| 목적 | 현장에서 로봇 상태, 작업 상태, 모듈 상태, 안전 상태, Telemetry 연결을 5초 이내에 판단한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Robot, WorkSession, Module, SafetyState, TelemetryStatus, Incident |
| 주요 구성 | 상단 안전 상태 바, 중앙 작업 상태 카드, 좌측 로봇/모듈 상태, 우측 빠른 조치, 하단 알림 |
| 주요 액션 | 작업 제어 열기, 캘리브레이션 열기, 장애 조치 열기, Telemetry 상태 보기 |
| 상태/예외 | ready, working, paused, blocked, fault, emergency_stop, telemetry_delayed |
| 연동 포인트 | Control workspace, Incident action guide, Telemetry UX, Command service |

| 화면 생성 프롬프트 HMI 1024x600 기준의 UX/UI 목업을 생성한다. 화면 ID는 H01-01이고 화면명은 HMI 홈 상태판이다. 목적은 현장에서 로봇 상태, 작업 상태, 모듈 상태, 안전 상태, Telemetry 연결을 5초 이내에 판단한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 상단 안전 상태 바, 중앙 작업 상태 카드, 좌측 로봇/모듈 상태, 우측 빠른 조치, 하단 알림를 배치한다. 표시 데이터는 Robot, WorkSession, Module, SafetyState, TelemetryStatus, Incident이며, 주요 액션은 작업 제어 열기, 캘리브레이션 열기, 장애 조치 열기, Telemetry 상태 보기이다. 상태와 예외는 ready, working, paused, blocked, fault, emergency_stop, telemetry_delayed를 반드시 시각화한다. 연동 포인트는 Control workspace, Incident action guide, Telemetry UX, Command service이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## H01-02 작업 빠른 제어

| 목적 | 현장에서 배정된 작업을 시작, 일시정지, 재개, 종료, 복귀 요청한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | WorkSession, Command, Route, Robot, SafetyState |
| 주요 구성 | 작업 정보 헤더, 진행률, 큰 제어 버튼 5개, 명령 상태 메시지, 확인 모달 |
| 주요 액션 | 시작, 일시정지, 재개, 종료, 홈/대기 위치 복귀, 명령 취소 |
| 상태/예외 | command_validating, executing, timeout, rejected, safety_lock, no_work_assigned |
| 연동 포인트 | Command service, Work Orchestration, Audit log, Control live session |

| 화면 생성 프롬프트 HMI 1024x600 기준의 UX/UI 목업을 생성한다. 화면 ID는 H01-02이고 화면명은 작업 빠른 제어이다. 목적은 현장에서 배정된 작업을 시작, 일시정지, 재개, 종료, 복귀 요청한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 작업 정보 헤더, 진행률, 큰 제어 버튼 5개, 명령 상태 메시지, 확인 모달를 배치한다. 표시 데이터는 WorkSession, Command, Route, Robot, SafetyState이며, 주요 액션은 시작, 일시정지, 재개, 종료, 홈/대기 위치 복귀, 명령 취소이다. 상태와 예외는 command_validating, executing, timeout, rejected, safety_lock, no_work_assigned를 반드시 시각화한다. 연동 포인트는 Command service, Work Orchestration, Audit log, Control live session이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## H01-03 수동 조그 및 안전 이동

| 목적 | 점검/캘리브레이션 중 로봇 축, 작업부, 엔드이펙터를 제한 속도로 수동 이동한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | RobotAxis, Module, SafetyZone, Command, MaintenanceMode |
| 주요 구성 | 축 선택 탭, 방향 버튼, 속도 제한 슬라이더, 현재 위치값, 안전 구역 경고, hold-to-move 버튼 |
| 주요 액션 | 축 선택, +/- 이동, 속도 변경, 원점 복귀, 비상정지, 이동 기록 저장 |
| 상태/예외 | maintenance_mode_required, limit_reached, safety_zone_violation, command_timeout, motor_fault |
| 연동 포인트 | HMI audit log, Calibration wizard, Incident diagnostics |

| 화면 생성 프롬프트 HMI 1024x600 기준의 UX/UI 목업을 생성한다. 화면 ID는 H01-03이고 화면명은 수동 조그 및 안전 이동이다. 목적은 점검/캘리브레이션 중 로봇 축, 작업부, 엔드이펙터를 제한 속도로 수동 이동한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 축 선택 탭, 방향 버튼, 속도 제한 슬라이더, 현재 위치값, 안전 구역 경고, hold-to-move 버튼를 배치한다. 표시 데이터는 RobotAxis, Module, SafetyZone, Command, MaintenanceMode이며, 주요 액션은 축 선택, +/- 이동, 속도 변경, 원점 복귀, 비상정지, 이동 기록 저장이다. 상태와 예외는 maintenance_mode_required, limit_reached, safety_zone_violation, command_timeout, motor_fault를 반드시 시각화한다. 연동 포인트는 HMI audit log, Calibration wizard, Incident diagnostics이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## H01-04 로봇 파라미터 관리

| 목적 | 로봇 자체 운용 파라미터를 현장에서 조회하고 권한에 따라 수정한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | RobotParameterSet, Robot, AuditLog, CapabilityProfile |
| 주요 구성 | 파라미터 카테고리, 현재값/권장값, 변경 사유 입력, 적용 전 검증, 되돌리기 버튼 |
| 주요 액션 | 값 수정, 검증, 적용, 이전값 복원, 변경 사유 저장 |
| 상태/예외 | read_only, invalid_range, unsaved_change, validation_failed, apply_success |
| 연동 포인트 | Audit Package parameter schema, Control workspace, Incident root cause |

| 화면 생성 프롬프트 HMI 1024x600 기준의 UX/UI 목업을 생성한다. 화면 ID는 H01-04이고 화면명은 로봇 파라미터 관리이다. 목적은 로봇 자체 운용 파라미터를 현장에서 조회하고 권한에 따라 수정한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 파라미터 카테고리, 현재값/권장값, 변경 사유 입력, 적용 전 검증, 되돌리기 버튼를 배치한다. 표시 데이터는 RobotParameterSet, Robot, AuditLog, CapabilityProfile이며, 주요 액션은 값 수정, 검증, 적용, 이전값 복원, 변경 사유 저장이다. 상태와 예외는 read_only, invalid_range, unsaved_change, validation_failed, apply_success를 반드시 시각화한다. 연동 포인트는 Audit Package parameter schema, Control workspace, Incident root cause이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## H01-05 온실/작업 파라미터 관리

| 목적 | 행 간격, 식재 간격, 작업 높이, 작물 프로파일, 적과/적심 임계값 등 현장 환경 파라미터를 관리한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | GreenhouseParameter, CropProfile, WorkParameterSet, Map, Route |
| 주요 구성 | 온실/구역 선택, 파라미터 카드, 적과/적심 탭, 지도 기준값, 적용 대상, 동기화 상태 |
| 주요 액션 | 구역 선택, 파라미터 수정, HMI 로컬 저장, 플랫폼 동기화, 프로파일 복사 |
| 상태/예외 | sync_pending, map_version_mismatch, invalid parameter, offline local change |
| 연동 포인트 | Map designer, Telemetry environment registry, Audit calibration snapshot |

| 화면 생성 프롬프트 HMI 1024x600 기준의 UX/UI 목업을 생성한다. 화면 ID는 H01-05이고 화면명은 온실/작업 파라미터 관리이다. 목적은 행 간격, 식재 간격, 작업 높이, 작물 프로파일, 적과/적심 임계값 등 현장 환경 파라미터를 관리한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 온실/구역 선택, 파라미터 카드, 적과/적심 탭, 지도 기준값, 적용 대상, 동기화 상태를 배치한다. 표시 데이터는 GreenhouseParameter, CropProfile, WorkParameterSet, Map, Route이며, 주요 액션은 구역 선택, 파라미터 수정, HMI 로컬 저장, 플랫폼 동기화, 프로파일 복사이다. 상태와 예외는 sync_pending, map_version_mismatch, invalid parameter, offline local change를 반드시 시각화한다. 연동 포인트는 Map designer, Telemetry environment registry, Audit calibration snapshot이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## H01-06 캘리브레이션 허브

| 목적 | 카메라, 작업부, 축 원점, 센서, Telemetry, 온실 좌표 보정 등 모든 현장 캘리브레이션을 시작한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | CalibrationProfile, CalibrationRequirement, Module, Robot, TelemetryChannel |
| 주요 구성 | 캘리브레이션 카드 그리드, 마지막 수행일, 상태 배지, 필요 권한, 시작 버튼 |
| 주요 액션 | 캘리브레이션 시작, 이력 보기, 프로파일 다운로드/업로드, Audit snapshot 생성 |
| 상태/예외 | due, overdue, completed, failed, required_before_work, device_unavailable |
| 연동 포인트 | Audit Package, Telemetry calibration, Incident action guide, Control readiness |

| 화면 생성 프롬프트 HMI 1024x600 기준의 UX/UI 목업을 생성한다. 화면 ID는 H01-06이고 화면명은 캘리브레이션 허브이다. 목적은 카메라, 작업부, 축 원점, 센서, Telemetry, 온실 좌표 보정 등 모든 현장 캘리브레이션을 시작한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 캘리브레이션 카드 그리드, 마지막 수행일, 상태 배지, 필요 권한, 시작 버튼를 배치한다. 표시 데이터는 CalibrationProfile, CalibrationRequirement, Module, Robot, TelemetryChannel이며, 주요 액션은 캘리브레이션 시작, 이력 보기, 프로파일 다운로드/업로드, Audit snapshot 생성이다. 상태와 예외는 due, overdue, completed, failed, required_before_work, device_unavailable를 반드시 시각화한다. 연동 포인트는 Audit Package, Telemetry calibration, Incident action guide, Control readiness이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## H01-07 카메라-작업부 캘리브레이션 단계

| 목적 | 카메라 인식 좌표와 작업부 실제 동작 좌표를 단계별로 보정한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | CalibrationStep, Camera, EndEffector, TargetMarker, ValidationResult |
| 주요 구성 | 단계 진행 표시, 라이브 이미지/기준점 영역, 측정값 입력, 자동 검증, 다음 버튼, 실패 원인 |
| 주요 액션 | 마커 인식, 기준점 선택, 테스트 동작, 보정값 저장, 재시도 |
| 상태/예외 | marker_not_found, validation_failed, motion_blocked, save_success, rollback_available |
| 연동 포인트 | Robot parameter set, Audit calibration snapshot, Incident diagnostics |

| 화면 생성 프롬프트 HMI 1024x600 기준의 UX/UI 목업을 생성한다. 화면 ID는 H01-07이고 화면명은 카메라-작업부 캘리브레이션 단계이다. 목적은 카메라 인식 좌표와 작업부 실제 동작 좌표를 단계별로 보정한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 단계 진행 표시, 라이브 이미지/기준점 영역, 측정값 입력, 자동 검증, 다음 버튼, 실패 원인를 배치한다. 표시 데이터는 CalibrationStep, Camera, EndEffector, TargetMarker, ValidationResult이며, 주요 액션은 마커 인식, 기준점 선택, 테스트 동작, 보정값 저장, 재시도이다. 상태와 예외는 marker_not_found, validation_failed, motion_blocked, save_success, rollback_available를 반드시 시각화한다. 연동 포인트는 Robot parameter set, Audit calibration snapshot, Incident diagnostics이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## H01-08 모듈 Health 및 I/O 모니터

| 목적 | 현장에서 모듈 연결, I/O 상태, 센서값, 오류 코드를 빠르게 점검한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Module, IOStatus, TelemetryChannel, ErrorCode, Incident |
| 주요 구성 | 모듈 리스트, 상태 배지, I/O 토글/읽기값, 원천 오류 코드, 표준 메시지, 조치 링크 |
| 주요 액션 | 모듈 선택, I/O 테스트, 오류 복사, 조치 가이드 열기, 리셋 요청 |
| 상태/예외 | disconnected, degraded, fault, test_running, reset_required |
| 연동 포인트 | Incident dictionary, Telemetry channel map, Audit capability profile |

| 화면 생성 프롬프트 HMI 1024x600 기준의 UX/UI 목업을 생성한다. 화면 ID는 H01-08이고 화면명은 모듈 Health 및 I/O 모니터이다. 목적은 현장에서 모듈 연결, I/O 상태, 센서값, 오류 코드를 빠르게 점검한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 모듈 리스트, 상태 배지, I/O 토글/읽기값, 원천 오류 코드, 표준 메시지, 조치 링크를 배치한다. 표시 데이터는 Module, IOStatus, TelemetryChannel, ErrorCode, Incident이며, 주요 액션은 모듈 선택, I/O 테스트, 오류 복사, 조치 가이드 열기, 리셋 요청이다. 상태와 예외는 disconnected, degraded, fault, test_running, reset_required를 반드시 시각화한다. 연동 포인트는 Incident dictionary, Telemetry channel map, Audit capability profile이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## H01-09 Telemetry 링크 및 네트워크 상태

| 목적 | HMI에서 Telemetry 장치 연결 상태, 신호 품질, 버퍼링, 동기화 상태를 확인한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | TelemetryDevice, NetworkStatus, SyncState, ChannelQuality |
| 주요 구성 | 연결 상태 다이어그램, 품질 카드, sync 진행률, 재연결 버튼, 상세 진단 링크 |
| 주요 액션 | 재연결, sync 강제 실행, Telemetry 설정 화면 열기, 진단 로그 export |
| 상태/예외 | connected, weak_signal, offline, buffer_full, sync_pending, sync_failed |
| 연동 포인트 | Telemetry UX, Control dashboard, Incident event |

| 화면 생성 프롬프트 HMI 1024x600 기준의 UX/UI 목업을 생성한다. 화면 ID는 H01-09이고 화면명은 Telemetry 링크 및 네트워크 상태이다. 목적은 HMI에서 Telemetry 장치 연결 상태, 신호 품질, 버퍼링, 동기화 상태를 확인한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 연결 상태 다이어그램, 품질 카드, sync 진행률, 재연결 버튼, 상세 진단 링크를 배치한다. 표시 데이터는 TelemetryDevice, NetworkStatus, SyncState, ChannelQuality이며, 주요 액션은 재연결, sync 강제 실행, Telemetry 설정 화면 열기, 진단 로그 export이다. 상태와 예외는 connected, weak_signal, offline, buffer_full, sync_pending, sync_failed를 반드시 시각화한다. 연동 포인트는 Telemetry UX, Control dashboard, Incident event이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## H01-10 점검 체크리스트와 유지보수 모드

| 목적 | 작업 전/후 점검과 유지보수 모드 전환을 현장에서 수행한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | MaintenanceChecklist, Robot, Module, WorkSession, Incident |
| 주요 구성 | 체크리스트, 유지보수 모드 토글, 안전 잠금 상태, 미완료 항목, 완료 서명 |
| 주요 액션 | 항목 체크, 유지보수 모드 진입/해제, 서명, 사진 첨부, 체크리스트 제출 |
| 상태/예외 | maintenance_mode, checklist_required, item_failed, photo_required, submitted |
| 연동 포인트 | Work readiness, Incident action guide, Audit log |

| 화면 생성 프롬프트 HMI 1024x600 기준의 UX/UI 목업을 생성한다. 화면 ID는 H01-10이고 화면명은 점검 체크리스트와 유지보수 모드이다. 목적은 작업 전/후 점검과 유지보수 모드 전환을 현장에서 수행한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 체크리스트, 유지보수 모드 토글, 안전 잠금 상태, 미완료 항목, 완료 서명를 배치한다. 표시 데이터는 MaintenanceChecklist, Robot, Module, WorkSession, Incident이며, 주요 액션은 항목 체크, 유지보수 모드 진입/해제, 서명, 사진 첨부, 체크리스트 제출이다. 상태와 예외는 maintenance_mode, checklist_required, item_failed, photo_required, submitted를 반드시 시각화한다. 연동 포인트는 Work readiness, Incident action guide, Audit log이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## H01-11 긴급정지 잠금 및 복구

| 목적 | 긴급정지 상태를 명확히 표시하고 복구 조건을 단계별로 확인한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | SafetyState, Robot, Incident, RecoveryChecklist, Command |
| 주요 구성 | 전체 화면 잠금, 원인 표시, 복구 체크리스트, 권한 확인, 해제 요청 버튼 |
| 주요 액션 | 원인 확인, 안전 체크, 관리자 인증, 해제 요청, 장애 상세 이동 |
| 상태/예외 | emergency_stop, recovery_pending, authorization_required, release_rejected, restored |
| 연동 포인트 | Command service, Incident, Audit log, HMI safety rules |

| 화면 생성 프롬프트 HMI 1024x600 기준의 UX/UI 목업을 생성한다. 화면 ID는 H01-11이고 화면명은 긴급정지 잠금 및 복구이다. 목적은 긴급정지 상태를 명확히 표시하고 복구 조건을 단계별로 확인한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 전체 화면 잠금, 원인 표시, 복구 체크리스트, 권한 확인, 해제 요청 버튼를 배치한다. 표시 데이터는 SafetyState, Robot, Incident, RecoveryChecklist, Command이며, 주요 액션은 원인 확인, 안전 체크, 관리자 인증, 해제 요청, 장애 상세 이동이다. 상태와 예외는 emergency_stop, recovery_pending, authorization_required, release_rejected, restored를 반드시 시각화한다. 연동 포인트는 Command service, Incident, Audit log, HMI safety rules이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

# 6. 핵심 사용자 흐름

## 설치 후 HMI 연결

- 1. HMI 전원 켜기

- 2. 페어링 코드로 로봇과 플랫폼 연결

- 3. Telemetry 링크 상태 확인

- 4. HMI 홈에서 로봇 ID와 상태 확인

- 5. 필수 캘리브레이션이 있으면 캘리브레이션 허브 이동

| 완료 기준 | 페어링 이력은 device_registry와 audit_log에 남아야 한다. |
| --- | --- |

## 작업 전 현장 파라미터 보정

- 1. 온실/작업 파라미터 관리에서 대상 구역 선택

- 2. 행 간격, 식재 간격, 작업 높이, 적과/적심 임계값 확인

- 3. 필요 값 수정 및 검증

- 4. 로컬 저장 후 플랫폼 동기화

- 5. 작업 시작 가능 상태 갱신

| 완료 기준 | map_version과 parameter_profile 버전 불일치가 있으면 작업 시작을 차단하거나 경고해야 한다. |
| --- | --- |

## 장애 조치와 캘리브레이션

- 1. HMI 홈에서 장애 알림 확인

- 2. 조치 가이드에서 안전 단계 수행

- 3. 필요 시 캘리브레이션 허브에서 wizard 수행

- 4. 검증 성공 후 조치 완료 제출

- 5. 관제 장애 상태가 resolved로 갱신

| 완료 기준 | HMI 조치와 캘리브레이션 결과는 incident_id와 calibration_profile_id에 연결되어야 한다. |
| --- | --- |

# 7. 목업 검수 기준

- HMI는 1024x600/800x480 저해상도에서도 핵심 정보가 잘려 보이지 않아야 한다.

- 모든 위험 명령은 hold-to-run 또는 2단계 확인을 사용해야 한다.

- 오프라인/네트워크 지연 상태에서도 가능한 로컬 기능과 제한 기능을 명확히 구분해야 한다.

- 로봇 파라미터와 온실 파라미터 변경은 사유 입력과 rollback 가능성을 제공해야 한다.

- 캘리브레이션 결과는 Audit Package와 Telemetry/Incident에 연결될 수 있어야 한다.

# 8. 용어와 화면 제작 주의사항

| 용어 | 정의/화면 적용 |
| --- | --- |
| HMI | 로봇 또는 현장에 설치된 터치 기반 Human-Machine Interface. 현장 조작, 점검, 캘리브레이션에 사용. |
| 로컬 모드 | 플랫폼 통신이 불안정해도 제한된 조회/캘리브레이션/점검을 수행하는 모드. |
| Hold-to-run | 사용자가 버튼을 누르고 있는 동안만 위험 동작을 허용하는 안전 UX 패턴. |
| 파라미터 프로파일 | 로봇 운용값 또는 온실 환경값의 버전 관리 단위. |
| 캘리브레이션 스냅샷 | 보정 결과, 측정값, 담당자, 시간, 대상 장치를 묶은 기록. |
