통합 관제·맵·경로·멀티로봇 작업 UX/UI SSOT

관제의 기본 기능과 적과/적심 로봇 작업 운영을 하나의 애플리케이션으로 통합하기 위한 화면 제작 기준서

| 문서 코드 | JJ-C01 |
| --- | --- |
| 문서 유형 | UX/UI 목업 제작용 SSOT 및 화면 프롬프트 기준서 |
| 적용 범위 | 적과로봇, 적심로봇, HMI, Telemetry, 관제 플랫폼, 통합 Audit Package |
| 작성일 | 2026-05-31 |
| 버전 | v1.0 |

# 1. 문서 목적과 적용 원칙

맵 설계, 경로 설계, 작업 계획, 멀티로봇 실시간 관제, 작업 이력, 로봇 컨텍스트 드로어를 중심으로 적과로봇과 적심로봇의 운용 흐름을 화면 단위로 구체화한다.

| 워크스페이스 | 맵/경로/작업 관제 워크스페이스 |
| --- | --- |
| 주요 사용자 | 운영 관리자, 현장 관리자, 관제 오퍼레이터, 맵 설계자, 실증 담당자 |
| 대상 디바이스 | Desktop 1440x900, Tablet 1024x768 일부 대응 |
| 연동 의존성 | HMI 작업 패키지, Telemetry 환경 파라미터, Incident Engine, Firmware Compatibility, Audit Route Schema |
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
| C01-00 | 통합 운영 대시보드 | 적과로봇과 적심로봇의 전체 가동 현황, 작업 현황, 장애 현황, Telemetry 품질, 배포 리스크를 한 화면에서 판단한다. | Desktop 1440x900 |
| C01-01 | 온실 맵 목록 및 버전 관리 | 여러 온실/구역 맵을 목록화하고 운영 중 버전과 편집 중 버전을 구분한다. | Desktop 1440x900 |
| C01-02 | 온실 맵 디자이너 | 온실 구역, 베드, 행, 장애물, 충전/대기 위치, 안전 구역을 시각적으로 설계한다. | Desktop 1440x900 |
| C01-03 | 경로 설계자 | 적과로봇과 적심로봇 유형별로 주행 경로, 작업 구간, 정지점, 속도 제한, 회피 영역을 설계한다. | Desktop 1440x900 |
| C01-04 | 작업 계획 보드 | 적과/적심 작업을 온실 구역과 로봇에 배정하고 작업 일정과 우선순위를 관리한다. | Desktop 1440x900 |
| C01-05 | 멀티로봇 실시간 관제 맵 | 여러 적과/적심 로봇의 위치, 작업 진행, 경로 점유, 위험 이벤트를 맵 위에서 실시간 확인한다. | Desktop 1440x900 |
| C01-06 | 작업 세션 라이브 상세 | 하나의 작업 세션을 중심으로 진행률, 명령 상태, 이벤트, HMI/Telemetry 신호를 통합 확인한다. | Desktop 1440x900 |
| C01-07 | 공통 로봇 상세 드로어 | 어느 화면에서든 선택한 로봇의 핵심 상태, 작업, 모듈, HMI, Telemetry, 장애, 펌웨어를 빠르게 확인한다. | Drawer 420px |
| C01-08 | 작업 이력과 결과 분석 | 완료/실패/중단된 작업의 결과와 품질, 장애 연관성을 분석한다. | Desktop 1440x900 |
| C01-09 | 맵/경로 가져오기 및 검증 | 외부 설계 파일 또는 현장 캘리브레이션 데이터를 가져와 표준 맵/경로 스키마에 맞는지 검증한다. | Desktop 1440x900 |

## C01-00 통합 운영 대시보드

| 목적 | 적과로봇과 적심로봇의 전체 가동 현황, 작업 현황, 장애 현황, Telemetry 품질, 배포 리스크를 한 화면에서 판단한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Robot, WorkSession, Incident, TelemetryChannel, FirmwareDeployment, Site |
| 주요 구성 | 상단 KPI 카드 6개, 온실별 상태 카드, 진행 중 작업 테이블, critical 이벤트 리스트, 로봇 유형별 가동률 차트, 빠른 필터 |
| 주요 액션 | 현장/온실 선택, 로봇 상세 열기, 장애 상세 이동, 작업 세션 열기, 맵 보기 이동 |
| 상태/예외 | 전체 정상, 일부 로봇 offline, emergency 이벤트, 데이터 지연, 초기 데이터 없음 |
| 연동 포인트 | 장애 C03, 펌웨어 C04, Telemetry T01, HMI H01과 교차 링크 |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C01-00이고 화면명은 통합 운영 대시보드이다. 목적은 적과로봇과 적심로봇의 전체 가동 현황, 작업 현황, 장애 현황, Telemetry 품질, 배포 리스크를 한 화면에서 판단한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 상단 KPI 카드 6개, 온실별 상태 카드, 진행 중 작업 테이블, critical 이벤트 리스트, 로봇 유형별 가동률 차트, 빠른 필터를 배치한다. 표시 데이터는 Robot, WorkSession, Incident, TelemetryChannel, FirmwareDeployment, Site이며, 주요 액션은 현장/온실 선택, 로봇 상세 열기, 장애 상세 이동, 작업 세션 열기, 맵 보기 이동이다. 상태와 예외는 전체 정상, 일부 로봇 offline, emergency 이벤트, 데이터 지연, 초기 데이터 없음를 반드시 시각화한다. 연동 포인트는 장애 C03, 펌웨어 C04, Telemetry T01, HMI H01과 교차 링크이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C01-01 온실 맵 목록 및 버전 관리

| 목적 | 여러 온실/구역 맵을 목록화하고 운영 중 버전과 편집 중 버전을 구분한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Map, Site, Zone, Route, ValidationReport |
| 주요 구성 | 맵 목록 테이블, 운영중/초안 배지, 검색/필터, 신규 맵 버튼, 검증 요약 패널 |
| 주요 액션 | 맵 생성, 복제, 운영 버전 지정 요청, 검증 리포트 보기, Route Designer 이동 |
| 상태/예외 | 운영 중, 초안, 검증 실패, 폐기, 버전 충돌 |
| 연동 포인트 | Route Designer C01-03, Audit Route Contract, HMI 파라미터 패키지 |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C01-01이고 화면명은 온실 맵 목록 및 버전 관리이다. 목적은 여러 온실/구역 맵을 목록화하고 운영 중 버전과 편집 중 버전을 구분한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 맵 목록 테이블, 운영중/초안 배지, 검색/필터, 신규 맵 버튼, 검증 요약 패널를 배치한다. 표시 데이터는 Map, Site, Zone, Route, ValidationReport이며, 주요 액션은 맵 생성, 복제, 운영 버전 지정 요청, 검증 리포트 보기, Route Designer 이동이다. 상태와 예외는 운영 중, 초안, 검증 실패, 폐기, 버전 충돌를 반드시 시각화한다. 연동 포인트는 Route Designer C01-03, Audit Route Contract, HMI 파라미터 패키지이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C01-02 온실 맵 디자이너

| 목적 | 온실 구역, 베드, 행, 장애물, 충전/대기 위치, 안전 구역을 시각적으로 설계한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Map, Zone, Row, Bed, Obstacle, DockingStation, SafetyZone, GreenhouseParameter |
| 주요 구성 | 캔버스, 그리드/스냅 도구, 좌측 레이어 패널, 우측 속성 패널, 하단 검증 로그 |
| 주요 액션 | 행/구역 추가, 장애물 배치, 좌표 보정, 온실 파라미터 편집, 저장, 검증 실행 |
| 상태/예외 | 좌표 미정렬, 행 간격 오류, 안전 구역 중첩, 저장 중, offline editing |
| 연동 포인트 | HMI 온실 파라미터, Telemetry 환경 파라미터, Route Designer와 동일 map_id 사용 |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C01-02이고 화면명은 온실 맵 디자이너이다. 목적은 온실 구역, 베드, 행, 장애물, 충전/대기 위치, 안전 구역을 시각적으로 설계한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 캔버스, 그리드/스냅 도구, 좌측 레이어 패널, 우측 속성 패널, 하단 검증 로그를 배치한다. 표시 데이터는 Map, Zone, Row, Bed, Obstacle, DockingStation, SafetyZone, GreenhouseParameter이며, 주요 액션은 행/구역 추가, 장애물 배치, 좌표 보정, 온실 파라미터 편집, 저장, 검증 실행이다. 상태와 예외는 좌표 미정렬, 행 간격 오류, 안전 구역 중첩, 저장 중, offline editing를 반드시 시각화한다. 연동 포인트는 HMI 온실 파라미터, Telemetry 환경 파라미터, Route Designer와 동일 map_id 사용이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C01-03 경로 설계자

| 목적 | 적과로봇과 적심로봇 유형별로 주행 경로, 작업 구간, 정지점, 속도 제한, 회피 영역을 설계한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Route, Waypoint, RobotType, SafetyZone, WorkType, ValidationReport |
| 주요 구성 | 맵 캔버스, 경로 레이어, 웨이포인트 리스트, 로봇 유형 선택, 시뮬레이션 패널, 검증 결과 |
| 주요 액션 | 경로 생성, waypoint 편집, 로봇 유형 적용, 시뮬레이션, 충돌/회전반경 검증, 운영 배포 요청 |
| 상태/예외 | 검증 통과, 회전반경 초과, 장애물 충돌, 로봇 유형 미지원, 저장 충돌 |
| 연동 포인트 | Audit route schema validator, HMI 경로 패키지, Work Planner |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C01-03이고 화면명은 경로 설계자이다. 목적은 적과로봇과 적심로봇 유형별로 주행 경로, 작업 구간, 정지점, 속도 제한, 회피 영역을 설계한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 맵 캔버스, 경로 레이어, 웨이포인트 리스트, 로봇 유형 선택, 시뮬레이션 패널, 검증 결과를 배치한다. 표시 데이터는 Route, Waypoint, RobotType, SafetyZone, WorkType, ValidationReport이며, 주요 액션은 경로 생성, waypoint 편집, 로봇 유형 적용, 시뮬레이션, 충돌/회전반경 검증, 운영 배포 요청이다. 상태와 예외는 검증 통과, 회전반경 초과, 장애물 충돌, 로봇 유형 미지원, 저장 충돌를 반드시 시각화한다. 연동 포인트는 Audit route schema validator, HMI 경로 패키지, Work Planner이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C01-04 작업 계획 보드

| 목적 | 적과/적심 작업을 온실 구역과 로봇에 배정하고 작업 일정과 우선순위를 관리한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | WorkPlan, WorkSession, Route, Robot, RobotAvailability, CropParameter |
| 주요 구성 | 캘린더/칸반 전환, 작업 생성 패널, 로봇 추천 카드, 구역별 작업 상태, 충돌 경고 |
| 주요 액션 | 작업 생성, 로봇 배정, 일정 변경, 경로 선택, 작업 시작 예약, HMI 전송 |
| 상태/예외 | 로봇 사용 불가, 경로 미검증, 파라미터 미승인, 중복 배정, 환경 조건 경고 |
| 연동 포인트 | HMI 작업 패키지, Telemetry 환경 파라미터, Incident blocking, Firmware compatibility |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C01-04이고 화면명은 작업 계획 보드이다. 목적은 적과/적심 작업을 온실 구역과 로봇에 배정하고 작업 일정과 우선순위를 관리한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 캘린더/칸반 전환, 작업 생성 패널, 로봇 추천 카드, 구역별 작업 상태, 충돌 경고를 배치한다. 표시 데이터는 WorkPlan, WorkSession, Route, Robot, RobotAvailability, CropParameter이며, 주요 액션은 작업 생성, 로봇 배정, 일정 변경, 경로 선택, 작업 시작 예약, HMI 전송이다. 상태와 예외는 로봇 사용 불가, 경로 미검증, 파라미터 미승인, 중복 배정, 환경 조건 경고를 반드시 시각화한다. 연동 포인트는 HMI 작업 패키지, Telemetry 환경 파라미터, Incident blocking, Firmware compatibility이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C01-05 멀티로봇 실시간 관제 맵

| 목적 | 여러 적과/적심 로봇의 위치, 작업 진행, 경로 점유, 위험 이벤트를 맵 위에서 실시간 확인한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | RobotLocation, WorkSession, RouteProgress, Event, Incident, TelemetrySummary |
| 주요 구성 | 실시간 맵, 로봇 핀, 경로 진행률, 구역 잠금 레이어, 이벤트 팝오버, 로봇 리스트 사이드바 |
| 주요 액션 | 로봇 선택, 경로 추적, 작업 일시정지 요청, 구역 잠금, 장애 화면 이동, Telemetry 확인 |
| 상태/예외 | 로봇 위치 지연, 통신 끊김, 충돌 위험, emergency_stop, 데이터 오래됨 |
| 연동 포인트 | Event Engine, Command Service, HMI link, Telemetry link, Incident creation |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C01-05이고 화면명은 멀티로봇 실시간 관제 맵이다. 목적은 여러 적과/적심 로봇의 위치, 작업 진행, 경로 점유, 위험 이벤트를 맵 위에서 실시간 확인한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 실시간 맵, 로봇 핀, 경로 진행률, 구역 잠금 레이어, 이벤트 팝오버, 로봇 리스트 사이드바를 배치한다. 표시 데이터는 RobotLocation, WorkSession, RouteProgress, Event, Incident, TelemetrySummary이며, 주요 액션은 로봇 선택, 경로 추적, 작업 일시정지 요청, 구역 잠금, 장애 화면 이동, Telemetry 확인이다. 상태와 예외는 로봇 위치 지연, 통신 끊김, 충돌 위험, emergency_stop, 데이터 오래됨를 반드시 시각화한다. 연동 포인트는 Event Engine, Command Service, HMI link, Telemetry link, Incident creation이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C01-06 작업 세션 라이브 상세

| 목적 | 하나의 작업 세션을 중심으로 진행률, 명령 상태, 이벤트, HMI/Telemetry 신호를 통합 확인한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | WorkSession, Command, Event, Robot, Module, TelemetryChannel, HMIStatus |
| 주요 구성 | 진행률 헤더, 명령 상태 타임라인, 모듈 상태 카드, Telemetry 미니 차트, 작업 이벤트 로그, 조치 버튼 |
| 주요 액션 | 일시정지/재개 요청, 복귀 요청, 장애 티켓 생성, HMI 화면 열기, Telemetry 채널 상세 |
| 상태/예외 | 작업 중, blocked, failed, paused, 명령 timeout, HMI 응답 없음 |
| 연동 포인트 | HMI work control, Telemetry data quality, Incident detail, Command audit log |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C01-06이고 화면명은 작업 세션 라이브 상세이다. 목적은 하나의 작업 세션을 중심으로 진행률, 명령 상태, 이벤트, HMI/Telemetry 신호를 통합 확인한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 진행률 헤더, 명령 상태 타임라인, 모듈 상태 카드, Telemetry 미니 차트, 작업 이벤트 로그, 조치 버튼를 배치한다. 표시 데이터는 WorkSession, Command, Event, Robot, Module, TelemetryChannel, HMIStatus이며, 주요 액션은 일시정지/재개 요청, 복귀 요청, 장애 티켓 생성, HMI 화면 열기, Telemetry 채널 상세이다. 상태와 예외는 작업 중, blocked, failed, paused, 명령 timeout, HMI 응답 없음를 반드시 시각화한다. 연동 포인트는 HMI work control, Telemetry data quality, Incident detail, Command audit log이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C01-07 공통 로봇 상세 드로어

| 목적 | 어느 화면에서든 선택한 로봇의 핵심 상태, 작업, 모듈, HMI, Telemetry, 장애, 펌웨어를 빠르게 확인한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Robot, Module, WorkSession, Incident, Firmware, HMIStatus, TelemetryStatus |
| 주요 구성 | 상태 헤더, 탭(개요/모듈/작업/장애/펌웨어/HMI/Telemetry), 빠른 액션, 감사 로그 링크 |
| 주요 액션 | 상세 화면 이동, 작업 보기, 장애 보기, HMI 연결, Telemetry 상세, 펌웨어 버전 확인 |
| 상태/예외 | 로봇 offline, HMI 미연결, Telemetry 지연, firmware blocked |
| 연동 포인트 | 모든 워크스페이스의 공통 컨텍스트 구성요소 |

| 화면 생성 프롬프트 Drawer 420px 기준의 UX/UI 목업을 생성한다. 화면 ID는 C01-07이고 화면명은 공통 로봇 상세 드로어이다. 목적은 어느 화면에서든 선택한 로봇의 핵심 상태, 작업, 모듈, HMI, Telemetry, 장애, 펌웨어를 빠르게 확인한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 상태 헤더, 탭(개요/모듈/작업/장애/펌웨어/HMI/Telemetry), 빠른 액션, 감사 로그 링크를 배치한다. 표시 데이터는 Robot, Module, WorkSession, Incident, Firmware, HMIStatus, TelemetryStatus이며, 주요 액션은 상세 화면 이동, 작업 보기, 장애 보기, HMI 연결, Telemetry 상세, 펌웨어 버전 확인이다. 상태와 예외는 로봇 offline, HMI 미연결, Telemetry 지연, firmware blocked를 반드시 시각화한다. 연동 포인트는 모든 워크스페이스의 공통 컨텍스트 구성요소이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C01-08 작업 이력과 결과 분석

| 목적 | 완료/실패/중단된 작업의 결과와 품질, 장애 연관성을 분석한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | WorkResult, WorkSession, Incident, TelemetryChannel, Robot, Route |
| 주요 구성 | 필터, 결과 테이블, 작업량 차트, 실패 사유 분포, 세션 상세 미리보기, 리포트 내보내기 |
| 주요 액션 | 기간/로봇/작업유형 필터, 결과 다운로드, 실패 세션 재검토, 장애 상세 이동 |
| 상태/예외 | 결과 데이터 없음, 일부 Telemetry 누락, 이력 로딩 중 |
| 연동 포인트 | 장애 리포트 C03, Telemetry 품질, Audit trail |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C01-08이고 화면명은 작업 이력과 결과 분석이다. 목적은 완료/실패/중단된 작업의 결과와 품질, 장애 연관성을 분석한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 필터, 결과 테이블, 작업량 차트, 실패 사유 분포, 세션 상세 미리보기, 리포트 내보내기를 배치한다. 표시 데이터는 WorkResult, WorkSession, Incident, TelemetryChannel, Robot, Route이며, 주요 액션은 기간/로봇/작업유형 필터, 결과 다운로드, 실패 세션 재검토, 장애 상세 이동이다. 상태와 예외는 결과 데이터 없음, 일부 Telemetry 누락, 이력 로딩 중를 반드시 시각화한다. 연동 포인트는 장애 리포트 C03, Telemetry 품질, Audit trail이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C01-09 맵/경로 가져오기 및 검증

| 목적 | 외부 설계 파일 또는 현장 캘리브레이션 데이터를 가져와 표준 맵/경로 스키마에 맞는지 검증한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | MapImportJob, RouteImportJob, ValidationReport, AuditPackage |
| 주요 구성 | 파일 업로드 영역, 스키마 매핑, 검증 체크리스트, 오류 위치 하이라이트, 반영 버튼 |
| 주요 액션 | 파일 업로드, 스키마 매핑, 검증 실행, 오류 수정, 초안 맵 생성 |
| 상태/예외 | 스키마 불일치, 좌표계 누락, route waypoint 오류, 중복 map_id |
| 연동 포인트 | Audit Package schema validator, HMI calibration snapshot, Telemetry environment parameters |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C01-09이고 화면명은 맵/경로 가져오기 및 검증이다. 목적은 외부 설계 파일 또는 현장 캘리브레이션 데이터를 가져와 표준 맵/경로 스키마에 맞는지 검증한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 파일 업로드 영역, 스키마 매핑, 검증 체크리스트, 오류 위치 하이라이트, 반영 버튼를 배치한다. 표시 데이터는 MapImportJob, RouteImportJob, ValidationReport, AuditPackage이며, 주요 액션은 파일 업로드, 스키마 매핑, 검증 실행, 오류 수정, 초안 맵 생성이다. 상태와 예외는 스키마 불일치, 좌표계 누락, route waypoint 오류, 중복 map_id를 반드시 시각화한다. 연동 포인트는 Audit Package schema validator, HMI calibration snapshot, Telemetry environment parameters이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

# 6. 핵심 사용자 흐름

## 온실 맵 생성 후 운영 반영

- 1. 맵 목록에서 신규 맵 생성

- 2. 맵 디자이너에서 구역/행/장애물/충전 위치 입력

- 3. 온실 파라미터 등록 및 좌표 보정

- 4. 검증 실행 후 운영 반영 요청

- 5. 승인 후 Work Planner와 HMI에 동일 map_version 노출

| 완료 기준 | 검증 실패 버전은 작업 계획과 HMI 전송에 사용할 수 없어야 한다. |
| --- | --- |

## 멀티로봇 작업 계획 수립

- 1. 작업 유형을 적과 또는 적심으로 선택

- 2. 대상 온실 구역과 경로 선택

- 3. 가용 로봇 추천 목록에서 로봇 배정

- 4. 경로 검증, 펌웨어 호환성, Telemetry 연결 상태 확인

- 5. 작업 패키지를 HMI와 로봇에 전송

| 완료 기준 | 부적합 로봇과 미검증 경로는 배정 불가 상태로 표시한다. |
| --- | --- |

## 작업 중 장애 대응

- 1. 실시간 관제 맵에서 로봇 핀이 warning 또는 critical로 변경

- 2. 작업 세션 상세에서 이벤트와 명령 상태 확인

- 3. 장애 티켓 생성 또는 기존 장애 상세 이동

- 4. 필요 시 작업 일시정지 또는 복귀 명령 요청

- 5. 조치 후 작업 재개 또는 실패 처리

| 완료 기준 | 명령, 이벤트, 장애, 작업 결과가 동일 work_session_id로 연결되어야 한다. |
| --- | --- |

# 7. 목업 검수 기준

- 맵, 경로, 작업, 로봇 상태가 동일 ID 체계로 연결되어야 한다.

- 적과로봇과 적심로봇을 robot_type으로 명확히 구분하고 경로/작업/모듈 호환성을 표시해야 한다.

- 멀티로봇 화면은 로봇 위치 지연과 통신 끊김을 시각적으로 구분해야 한다.

- 작업 시작, 일시정지, 복귀 명령은 command lifecycle과 감사 로그가 보이도록 설계해야 한다.

- HMI, Telemetry, 장애, 펌웨어 화면으로 이동해도 선택 로봇 컨텍스트가 유지되어야 한다.

# 8. 용어와 화면 제작 주의사항

| 용어 | 정의/화면 적용 |
| --- | --- |
| 적과로봇 | 과실 솎기 작업 로봇. 작업 경로, 엔드이펙터, 인식 파라미터가 적심로봇과 다를 수 있다. |
| 적심로봇 | 생장점 또는 줄기/가지 절단 작업 로봇. 안전 구역과 작업 파라미터가 별도로 관리된다. |
| 작업 세션 | 계획된 작업이 실제 로봇에서 수행되는 실행 단위. |
| 경로 검증 | 온실 맵, 로봇 크기, 회전반경, 안전 구역, 장애물 기준의 route 실행 가능성 확인. |
| 컨텍스트 드로어 | 선택한 로봇/모듈의 핵심 정보를 보여주는 공통 UI 패턴. |
