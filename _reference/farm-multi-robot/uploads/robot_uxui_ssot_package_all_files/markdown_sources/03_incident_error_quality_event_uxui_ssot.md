장애·오류·품질 이벤트 통합 관리 UX/UI SSOT

로봇, 모듈, HMI, Telemetry, 펌웨어 배포 이벤트와 장애를 통합 관리하기 위한 화면 제작 기준서

| 문서 코드 | JJ-C03 |
| --- | --- |
| 문서 유형 | UX/UI 목업 제작용 SSOT 및 화면 프롬프트 기준서 |
| 적용 범위 | 적과로봇, 적심로봇, HMI, Telemetry, 관제 플랫폼, 통합 Audit Package |
| 작성일 | 2026-05-31 |
| 버전 | v1.0 |

# 1. 문서 목적과 적용 원칙

단순 로그 뷰어가 아니라 운영 조치를 유도하는 장애 관리 워크스페이스를 정의한다. 실시간 이벤트, 장애 티켓, 원인 분류, 영향 범위, 조치 가이드, 오류 코드 사전, 재발 분석을 포함한다.

| 워크스페이스 | 장애/오류 관리 워크스페이스 |
| --- | --- |
| 주요 사용자 | 운영 관리자, 유지보수 담당자, QA 담당자, 개발자, 현장 오퍼레이터 |
| 대상 디바이스 | Desktop 1440x900, Tablet 1024x768 일부 대응 |
| 연동 의존성 | Event Engine, Work Session, HMI Action Log, Telemetry Diagnostics, Firmware History, Audit Issue Board |
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
| C03-00 | 장애 운영 대시보드 | 현재 조치가 필요한 장애와 반복 오류, 작업 영향도를 우선순위로 표시한다. | Desktop 1440x900 |
| C03-01 | 장애 목록과 필터 | 모든 장애를 기간, 심각도, 로봇, 모듈, 상태, 담당자, 작업 세션 기준으로 조회한다. | Desktop 1440x900 |
| C03-02 | 실시간 이벤트 스트림 | 로봇, 모듈, HMI, Telemetry, 펌웨어 배포에서 발생하는 모든 이벤트를 시간순으로 확인한다. | Desktop 1440x900 |
| C03-03 | 장애 상세 및 원인 타임라인 | 장애 발생 전후의 작업, 명령, Telemetry, HMI 조작, 펌웨어 변경 이력을 하나의 타임라인으로 본다. | Desktop 1440x900 |
| C03-04 | 원인 분류 및 영향 범위 화면 | 장애의 원인을 통신, 센서, 구동부, 작업 파라미터, 펌웨어, HMI 조작, 환경 조건으로 분류한다. | Desktop 1440x900 |
| C03-05 | 조치 가이드 및 체크리스트 | 현장 담당자가 장애별 표준 조치 절차를 단계별로 수행하고 결과를 기록한다. | Desktop 1440x900 / Tablet 1024x768 |
| C03-06 | 오류 코드 사전과 매핑 관리 | 제조사별 오류 코드를 플랫폼 표준 오류 코드와 사용자 친화 메시지로 매핑한다. | Desktop 1440x900 |
| C03-07 | 유지보수 배정 및 현장 출동 관리 | 장애별 담당자, 출동 상태, 조치 SLA, 필요 부품을 관리한다. | Desktop 1440x900 |
| C03-08 | 장애 리포트와 분석 | 기간별, 로봇별, 모듈별 장애 경향과 재발률, 작업 영향 시간을 분석한다. | Desktop 1440x900 |
| C03-09 | 알림 정책 관리 | 이벤트 심각도, 사용자 역할, 로봇 유형, 온실 구역별 알림 조건과 수신 채널을 설정한다. | Desktop 1440x900 |
| C03-10 | 재발 분석 및 포스트모템 | 반복 장애를 묶어 원인, 조치, 예방책, Audit/펌웨어 개선 항목으로 연결한다. | Desktop 1440x900 |

## C03-00 장애 운영 대시보드

| 목적 | 현재 조치가 필요한 장애와 반복 오류, 작업 영향도를 우선순위로 표시한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Incident, Event, Robot, Module, WorkSession, TelemetryChannel |
| 주요 구성 | 심각도 KPI, 조치 대기 목록, 작업 영향 카드, 반복 장애 순위, 모듈별 heatmap, 알림 정책 요약 |
| 주요 액션 | 장애 상세 열기, 담당자 배정, 심각도 필터, 보고서 생성 |
| 상태/예외 | 미조치 critical, emergency, 데이터 지연, 장애 없음 |
| 연동 포인트 | 관제 대시보드, HMI 조치 안내, Firmware version, Telemetry raw data |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C03-00이고 화면명은 장애 운영 대시보드이다. 목적은 현재 조치가 필요한 장애와 반복 오류, 작업 영향도를 우선순위로 표시한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 심각도 KPI, 조치 대기 목록, 작업 영향 카드, 반복 장애 순위, 모듈별 heatmap, 알림 정책 요약를 배치한다. 표시 데이터는 Incident, Event, Robot, Module, WorkSession, TelemetryChannel이며, 주요 액션은 장애 상세 열기, 담당자 배정, 심각도 필터, 보고서 생성이다. 상태와 예외는 미조치 critical, emergency, 데이터 지연, 장애 없음를 반드시 시각화한다. 연동 포인트는 관제 대시보드, HMI 조치 안내, Firmware version, Telemetry raw data이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C03-01 장애 목록과 필터

| 목적 | 모든 장애를 기간, 심각도, 로봇, 모듈, 상태, 담당자, 작업 세션 기준으로 조회한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Incident, Robot, Module, WorkSession, Owner |
| 주요 구성 | 고급 필터, 저장된 뷰, 장애 테이블, bulk action, 우측 상세 미리보기 |
| 주요 액션 | 필터 저장, 담당자 일괄 지정, 상태 변경, CSV export, 상세 열기 |
| 상태/예외 | 검색 결과 없음, 권한 없는 bulk action, 오래된 미조치 장애 |
| 연동 포인트 | Audit trail, Robot drawer, Work session detail |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C03-01이고 화면명은 장애 목록과 필터이다. 목적은 모든 장애를 기간, 심각도, 로봇, 모듈, 상태, 담당자, 작업 세션 기준으로 조회한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 고급 필터, 저장된 뷰, 장애 테이블, bulk action, 우측 상세 미리보기를 배치한다. 표시 데이터는 Incident, Robot, Module, WorkSession, Owner이며, 주요 액션은 필터 저장, 담당자 일괄 지정, 상태 변경, CSV export, 상세 열기이다. 상태와 예외는 검색 결과 없음, 권한 없는 bulk action, 오래된 미조치 장애를 반드시 시각화한다. 연동 포인트는 Audit trail, Robot drawer, Work session detail이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C03-02 실시간 이벤트 스트림

| 목적 | 로봇, 모듈, HMI, Telemetry, 펌웨어 배포에서 발생하는 모든 이벤트를 시간순으로 확인한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Event, EventPayload, Source, WorkSession, IncidentRule |
| 주요 구성 | event timeline, severity filter, raw payload viewer, incident rule indicator, pause stream 버튼 |
| 주요 액션 | 스트림 일시정지, raw 보기, 장애 생성, 이벤트 복사, 필터 적용 |
| 상태/예외 | stream paused, high volume, payload parse error, duplicate suppression |
| 연동 포인트 | Event engine, Telemetry quality, Firmware deploy events, HMI events |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C03-02이고 화면명은 실시간 이벤트 스트림이다. 목적은 로봇, 모듈, HMI, Telemetry, 펌웨어 배포에서 발생하는 모든 이벤트를 시간순으로 확인한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 event timeline, severity filter, raw payload viewer, incident rule indicator, pause stream 버튼를 배치한다. 표시 데이터는 Event, EventPayload, Source, WorkSession, IncidentRule이며, 주요 액션은 스트림 일시정지, raw 보기, 장애 생성, 이벤트 복사, 필터 적용이다. 상태와 예외는 stream paused, high volume, payload parse error, duplicate suppression를 반드시 시각화한다. 연동 포인트는 Event engine, Telemetry quality, Firmware deploy events, HMI events이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C03-03 장애 상세 및 원인 타임라인

| 목적 | 장애 발생 전후의 작업, 명령, Telemetry, HMI 조작, 펌웨어 변경 이력을 하나의 타임라인으로 본다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Incident, Event, Command, WorkSession, TelemetryChannel, HMIAction, FirmwareDeployment |
| 주요 구성 | 장애 요약 헤더, 원인 후보, 통합 타임라인, 관련 객체 카드, raw log 탭, 조치 버튼 |
| 주요 액션 | 원인 태그 지정, 담당자 변경, 조치 시작, 로그 다운로드, 관련 화면 이동 |
| 상태/예외 | root cause unknown, log missing, telemetry delayed, firmware link found |
| 연동 포인트 | Work session, Firmware history, HMI action log, Telemetry diagnostics |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C03-03이고 화면명은 장애 상세 및 원인 타임라인이다. 목적은 장애 발생 전후의 작업, 명령, Telemetry, HMI 조작, 펌웨어 변경 이력을 하나의 타임라인으로 본다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 장애 요약 헤더, 원인 후보, 통합 타임라인, 관련 객체 카드, raw log 탭, 조치 버튼를 배치한다. 표시 데이터는 Incident, Event, Command, WorkSession, TelemetryChannel, HMIAction, FirmwareDeployment이며, 주요 액션은 원인 태그 지정, 담당자 변경, 조치 시작, 로그 다운로드, 관련 화면 이동이다. 상태와 예외는 root cause unknown, log missing, telemetry delayed, firmware link found를 반드시 시각화한다. 연동 포인트는 Work session, Firmware history, HMI action log, Telemetry diagnostics이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C03-04 원인 분류 및 영향 범위 화면

| 목적 | 장애의 원인을 통신, 센서, 구동부, 작업 파라미터, 펌웨어, HMI 조작, 환경 조건으로 분류한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Incident, RootCauseTaxonomy, Module, Firmware, TelemetryChannel, CalibrationProfile |
| 주요 구성 | 원인 분류 tree, 영향 범위 카드, 관련 로봇/작업 목록, 증거 데이터, 분류 저장 버튼 |
| 주요 액션 | 원인 선택, 영향 범위 갱신, 유사 장애 검색, 조치 가이드 연결 |
| 상태/예외 | unknown, multi-cause, recurrence detected, calibration mismatch |
| 연동 포인트 | HMI parameter profile, Telemetry diagnostics, Firmware version matrix, Audit issue board |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C03-04이고 화면명은 원인 분류 및 영향 범위 화면이다. 목적은 장애의 원인을 통신, 센서, 구동부, 작업 파라미터, 펌웨어, HMI 조작, 환경 조건으로 분류한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 원인 분류 tree, 영향 범위 카드, 관련 로봇/작업 목록, 증거 데이터, 분류 저장 버튼를 배치한다. 표시 데이터는 Incident, RootCauseTaxonomy, Module, Firmware, TelemetryChannel, CalibrationProfile이며, 주요 액션은 원인 선택, 영향 범위 갱신, 유사 장애 검색, 조치 가이드 연결이다. 상태와 예외는 unknown, multi-cause, recurrence detected, calibration mismatch를 반드시 시각화한다. 연동 포인트는 HMI parameter profile, Telemetry diagnostics, Firmware version matrix, Audit issue board이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C03-05 조치 가이드 및 체크리스트

| 목적 | 현장 담당자가 장애별 표준 조치 절차를 단계별로 수행하고 결과를 기록한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | ActionGuide, Incident, ChecklistItem, HMIStatus, TelemetryStatus |
| 주요 구성 | 단계별 체크리스트, 안전 주의, 필요한 도구, HMI 이동 버튼, 사진/메모 입력, 완료 확인 |
| 주요 액션 | 조치 시작, 단계 체크, 사진 첨부, HMI 캘리브레이션 열기, 완료/보류 |
| 상태/예외 | 안전 잠금 필요, HMI offline, 권한 부족, 조치 실패, 재발 확인 필요 |
| 연동 포인트 | HMI calibration, Telemetry channel test, Audit log |

| 화면 생성 프롬프트 Desktop 1440x900 / Tablet 1024x768 기준의 UX/UI 목업을 생성한다. 화면 ID는 C03-05이고 화면명은 조치 가이드 및 체크리스트이다. 목적은 현장 담당자가 장애별 표준 조치 절차를 단계별로 수행하고 결과를 기록한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 단계별 체크리스트, 안전 주의, 필요한 도구, HMI 이동 버튼, 사진/메모 입력, 완료 확인를 배치한다. 표시 데이터는 ActionGuide, Incident, ChecklistItem, HMIStatus, TelemetryStatus이며, 주요 액션은 조치 시작, 단계 체크, 사진 첨부, HMI 캘리브레이션 열기, 완료/보류이다. 상태와 예외는 안전 잠금 필요, HMI offline, 권한 부족, 조치 실패, 재발 확인 필요를 반드시 시각화한다. 연동 포인트는 HMI calibration, Telemetry channel test, Audit log이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C03-06 오류 코드 사전과 매핑 관리

| 목적 | 제조사별 오류 코드를 플랫폼 표준 오류 코드와 사용자 친화 메시지로 매핑한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | ErrorCodeMap, Vendor, ModuleType, EventSchema, ActionGuide |
| 주요 구성 | 코드 매핑 테이블, 표준 코드 검색, 사용자 메시지 편집, 조치 가이드 연결, 버전 diff |
| 주요 액션 | 코드 추가, severity 지정, 메시지 작성, 가이드 연결, 배포 요청 |
| 상태/예외 | unmapped code, duplicate code, severity conflict, message missing |
| 연동 포인트 | Audit profile, Incident event engine, HMI alert copy |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C03-06이고 화면명은 오류 코드 사전과 매핑 관리이다. 목적은 제조사별 오류 코드를 플랫폼 표준 오류 코드와 사용자 친화 메시지로 매핑한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 코드 매핑 테이블, 표준 코드 검색, 사용자 메시지 편집, 조치 가이드 연결, 버전 diff를 배치한다. 표시 데이터는 ErrorCodeMap, Vendor, ModuleType, EventSchema, ActionGuide이며, 주요 액션은 코드 추가, severity 지정, 메시지 작성, 가이드 연결, 배포 요청이다. 상태와 예외는 unmapped code, duplicate code, severity conflict, message missing를 반드시 시각화한다. 연동 포인트는 Audit profile, Incident event engine, HMI alert copy이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C03-07 유지보수 배정 및 현장 출동 관리

| 목적 | 장애별 담당자, 출동 상태, 조치 SLA, 필요 부품을 관리한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Incident, Owner, MaintenanceTask, SparePart, Schedule |
| 주요 구성 | 담당자 칸반, SLA 타이머, 필요 부품 목록, 일정 캘린더, 담당자 변경 모달 |
| 주요 액션 | 담당자 지정, 우선순위 변경, 출동 예약, 부품 요청, SLA 알림 설정 |
| 상태/예외 | SLA breach, owner unavailable, spare unavailable, blocked |
| 연동 포인트 | Notification service, HMI checklist, audit log |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C03-07이고 화면명은 유지보수 배정 및 현장 출동 관리이다. 목적은 장애별 담당자, 출동 상태, 조치 SLA, 필요 부품을 관리한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 담당자 칸반, SLA 타이머, 필요 부품 목록, 일정 캘린더, 담당자 변경 모달를 배치한다. 표시 데이터는 Incident, Owner, MaintenanceTask, SparePart, Schedule이며, 주요 액션은 담당자 지정, 우선순위 변경, 출동 예약, 부품 요청, SLA 알림 설정이다. 상태와 예외는 SLA breach, owner unavailable, spare unavailable, blocked를 반드시 시각화한다. 연동 포인트는 Notification service, HMI checklist, audit log이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C03-08 장애 리포트와 분석

| 목적 | 기간별, 로봇별, 모듈별 장애 경향과 재발률, 작업 영향 시간을 분석한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Incident, Event, WorkResult, Robot, Module, Firmware, TelemetryQuality |
| 주요 구성 | 기간 필터, 장애 추이 차트, 모듈별 Pareto, MTTR/MTBF 카드, 작업 영향 분석, 리포트 export |
| 주요 액션 | 기간 변경, 모듈 drill-down, PDF export, 원본 데이터 다운로드 |
| 상태/예외 | 데이터 부족, 필터 결과 없음, 비식별화 필요 |
| 연동 포인트 | Work result, firmware deployment history, audit package quality metrics |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C03-08이고 화면명은 장애 리포트와 분석이다. 목적은 기간별, 로봇별, 모듈별 장애 경향과 재발률, 작업 영향 시간을 분석한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 기간 필터, 장애 추이 차트, 모듈별 Pareto, MTTR/MTBF 카드, 작업 영향 분석, 리포트 export를 배치한다. 표시 데이터는 Incident, Event, WorkResult, Robot, Module, Firmware, TelemetryQuality이며, 주요 액션은 기간 변경, 모듈 drill-down, PDF export, 원본 데이터 다운로드이다. 상태와 예외는 데이터 부족, 필터 결과 없음, 비식별화 필요를 반드시 시각화한다. 연동 포인트는 Work result, firmware deployment history, audit package quality metrics이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C03-09 알림 정책 관리

| 목적 | 이벤트 심각도, 사용자 역할, 로봇 유형, 온실 구역별 알림 조건과 수신 채널을 설정한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | NotificationPolicy, Role, EventCode, Site, Channel |
| 주요 구성 | 정책 목록, 조건 빌더, 수신자/채널 설정, 조용한 시간, 테스트 알림 |
| 주요 액션 | 정책 생성, 조건 추가, 수신자 지정, 테스트 전송, 활성화/비활성화 |
| 상태/예외 | policy conflict, no recipient, disabled, test failed |
| 연동 포인트 | Incident engine, HMI alert, operator dashboard |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C03-09이고 화면명은 알림 정책 관리이다. 목적은 이벤트 심각도, 사용자 역할, 로봇 유형, 온실 구역별 알림 조건과 수신 채널을 설정한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 정책 목록, 조건 빌더, 수신자/채널 설정, 조용한 시간, 테스트 알림를 배치한다. 표시 데이터는 NotificationPolicy, Role, EventCode, Site, Channel이며, 주요 액션은 정책 생성, 조건 추가, 수신자 지정, 테스트 전송, 활성화/비활성화이다. 상태와 예외는 policy conflict, no recipient, disabled, test failed를 반드시 시각화한다. 연동 포인트는 Incident engine, HMI alert, operator dashboard이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C03-10 재발 분석 및 포스트모템

| 목적 | 반복 장애를 묶어 원인, 조치, 예방책, Audit/펌웨어 개선 항목으로 연결한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | IncidentCluster, Incident, RootCause, FirmwareChange, AuditIssue, PreventiveAction |
| 주요 구성 | 유사 장애 클러스터, 재발 패턴, 포스트모템 에디터, 예방 액션, 관련 배포/감사 링크 |
| 주요 액션 | 클러스터 생성, 포스트모템 작성, 예방 액션 생성, 개발자 이슈 연결 |
| 상태/예외 | pattern detected, insufficient data, postmortem pending, preventive action overdue |
| 연동 포인트 | Audit issue board, Firmware release, Work analytics |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C03-10이고 화면명은 재발 분석 및 포스트모템이다. 목적은 반복 장애를 묶어 원인, 조치, 예방책, Audit/펌웨어 개선 항목으로 연결한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 유사 장애 클러스터, 재발 패턴, 포스트모템 에디터, 예방 액션, 관련 배포/감사 링크를 배치한다. 표시 데이터는 IncidentCluster, Incident, RootCause, FirmwareChange, AuditIssue, PreventiveAction이며, 주요 액션은 클러스터 생성, 포스트모템 작성, 예방 액션 생성, 개발자 이슈 연결이다. 상태와 예외는 pattern detected, insufficient data, postmortem pending, preventive action overdue를 반드시 시각화한다. 연동 포인트는 Audit issue board, Firmware release, Work analytics이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

# 6. 핵심 사용자 흐름

## 이벤트에서 장애 티켓 생성

- 1. Telemetry 또는 로봇 모듈 event 수집

- 2. Event Engine이 표준 error_code와 severity 매핑

- 3. 작업 영향과 반복 여부 계산

- 4. warning 이상은 알림, critical 이상은 incident 승격

- 5. 대시보드와 작업 세션에 동일 incident_id 연결

| 완료 기준 | 단순 로그와 조치 대상 장애가 UI에서 명확히 분리되어야 한다. |
| --- | --- |

## 현장 조치 수행

- 1. 장애 상세에서 원인과 영향 범위 확인

- 2. 조치 가이드에서 안전 단계 확인

- 3. HMI 캘리브레이션 또는 Telemetry 채널 테스트 수행

- 4. 사진/메모를 남기고 조치 완료 처리

- 5. 재발 확인 조건 충족 후 장애 종료

| 완료 기준 | 담당자, 시간, 근거, 상태 변화가 감사 로그로 남아야 한다. |
| --- | --- |

## 오류 코드 표준화

- 1. 제조사 모듈에서 미매핑 오류 수집

- 2. vendor_code를 표준 event_code에 매핑

- 3. 사용자 메시지와 조치 가이드 작성

- 4. 버전 저장 후 Audit Profile 반영

- 5. 이후 같은 오류는 자동으로 표준 장애 처리

| 완료 기준 | 미매핑 오류는 Audit blocker 또는 notice로 추적되어야 한다. |
| --- | --- |

# 7. 목업 검수 기준

- 장애 상세에서 작업, 로봇, 모듈, HMI 액션, Telemetry 품질, 펌웨어 버전이 함께 보일 것.

- 오류 코드 사전은 제조사 코드와 표준 코드의 버전 이력을 가져야 할 것.

- 조치 가이드는 현장용 문구와 기술자용 로그를 분리할 것.

- 장애 목록은 미조치 critical과 SLA 초과 항목을 우선 정렬할 것.

- Incident closure는 재발 확인 또는 명시적 waiver를 요구할 것.

# 8. 용어와 화면 제작 주의사항

| 용어 | 정의/화면 적용 |
| --- | --- |
| Event | 모든 시스템 상태 변화와 로그성 신호. 반드시 장애는 아니며 severity와 rule에 따라 장애로 승격된다. |
| Incident | 담당자 조치와 종료 기준이 필요한 운영 문제. |
| Root Cause | 통신, 센서, 구동부, 펌웨어, 파라미터, 환경 조건, 작업 계획 등 표준 원인 분류. |
| Action Guide | 현장 담당자가 따라 할 수 있는 단계별 조치 절차. |
| SLA | 장애 심각도별 목표 조치 시간. |
