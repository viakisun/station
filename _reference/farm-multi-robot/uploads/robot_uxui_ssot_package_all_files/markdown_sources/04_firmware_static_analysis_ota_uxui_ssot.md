펌웨어 정적분석·버전·OTA 배포 관리 UX/UI SSOT

각 제조사 모듈 펌웨어의 정적분석, 호환성, 승인, 배포, 롤백을 관리하기 위한 화면 제작 기준서

| 문서 코드 | JJ-C04 |
| --- | --- |
| 문서 유형 | UX/UI 목업 제작용 SSOT 및 화면 프롬프트 기준서 |
| 적용 범위 | 적과로봇, 적심로봇, HMI, Telemetry, 관제 플랫폼, 통합 Audit Package |
| 작성일 | 2026-05-31 |
| 버전 | v1.0 |

# 1. 문서 목적과 적용 원칙

이기종 모듈의 펌웨어를 안전하게 등록, 분석, 승인, 배포, 롤백하는 워크스페이스를 정의한다. 적과로봇, 적심로봇, HMI, Telemetry 장치 버전까지 포함한 호환성 매트릭스를 중심으로 설계한다.

| 워크스페이스 | 펌웨어/배포 워크스페이스 |
| --- | --- |
| 주요 사용자 | 펌웨어 개발자, 배포 관리자, QA 담당자, 운영 관리자, 시스템 통합 담당자 |
| 대상 디바이스 | Desktop 1440x900 |
| 연동 의존성 | Audit Package, Module Registry, Incident Engine, HMI/Telemetry Firmware, Command/Event Services |
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
| C04-00 | 펌웨어 운영 대시보드 | 모듈별 펌웨어 버전, 정적분석 상태, 배포 가능 여부, 위험 항목을 요약한다. | Desktop 1440x900 |
| C04-01 | 펌웨어 등록 마법사 | 새 펌웨어 파일, manifest, 대상 모듈, 릴리즈 노트, 서명/체크섬을 등록한다. | Desktop 1440x900 |
| C04-02 | 정적분석 결과 상세 | 펌웨어 정적분석 결과를 위험도, 규칙, 파일/함수, 배포 차단 여부 기준으로 보여준다. | Desktop 1440x900 |
| C04-03 | 호환성 매트릭스 | 펌웨어 버전이 어떤 로봇, 모듈, 제어기, HMI, Telemetry 조합에 배포 가능한지 확인한다. | Desktop 1440x900 |
| C04-04 | 릴리즈 승인 워크플로우 | 분석, Audit, QA, 운영 승인 조건을 만족한 펌웨어만 배포 승인한다. | Desktop 1440x900 |
| C04-05 | OTA 배포 계획 생성 | 대상 로봇/모듈, 배포 방식, 일정, 단계적 배포 그룹, 롤백 조건을 설정한다. | Desktop 1440x900 |
| C04-06 | OTA 배포 진행 모니터 | 배포 중인 로봇/모듈의 다운로드, 설치, 재시작, 검증, 실패/재시도 상태를 실시간 추적한다. | Desktop 1440x900 |
| C04-07 | 롤백 및 복구 화면 | 배포 실패 또는 장애 증가 시 안전하게 이전 버전으로 되돌린다. | Desktop 1440x900 |
| C04-08 | 펌웨어 이력과 감사 로그 | 펌웨어 등록, 분석, 승인, 배포, 롤백, waiver 기록을 추적한다. | Desktop 1440x900 |
| C04-09 | 모듈 버전 상세 | 특정 로봇의 모듈별 현재 버전, 목표 버전, 분석 상태, 배포 이력을 확인한다. | Desktop 1440x900 |
| C04-10 | 펌웨어 정책 설정 | 정적분석 차단 기준, 배포 가능 시간, canary 비율, 자동 incident 생성 조건을 설정한다. | Desktop 1440x900 |

## C04-00 펌웨어 운영 대시보드

| 목적 | 모듈별 펌웨어 버전, 정적분석 상태, 배포 가능 여부, 위험 항목을 요약한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Firmware, Module, Robot, StaticAnalysisResult, Deployment, AuditPackage |
| 주요 구성 | 버전 KPI, 배포 대기 목록, 분석 실패 카드, 로봇/모듈 버전 분포, blocked release 패널 |
| 주요 액션 | 펌웨어 등록, 분석 결과 열기, 배포 계획 생성, 호환성 확인 |
| 상태/예외 | analysis_failed, blocked, pending_approval, deploying, rollback_required |
| 연동 포인트 | Audit package, Incident trends, Module registry, Telemetry device firmware |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C04-00이고 화면명은 펌웨어 운영 대시보드이다. 목적은 모듈별 펌웨어 버전, 정적분석 상태, 배포 가능 여부, 위험 항목을 요약한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 버전 KPI, 배포 대기 목록, 분석 실패 카드, 로봇/모듈 버전 분포, blocked release 패널를 배치한다. 표시 데이터는 Firmware, Module, Robot, StaticAnalysisResult, Deployment, AuditPackage이며, 주요 액션은 펌웨어 등록, 분석 결과 열기, 배포 계획 생성, 호환성 확인이다. 상태와 예외는 analysis_failed, blocked, pending_approval, deploying, rollback_required를 반드시 시각화한다. 연동 포인트는 Audit package, Incident trends, Module registry, Telemetry device firmware이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C04-01 펌웨어 등록 마법사

| 목적 | 새 펌웨어 파일, manifest, 대상 모듈, 릴리즈 노트, 서명/체크섬을 등록한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Firmware, FirmwareManifest, ModuleType, Vendor, ReleaseNote |
| 주요 구성 | 4단계 wizard, 파일 업로드, manifest preview, 대상 모듈 선택, 릴리즈 노트 편집, 등록 전 검증 |
| 주요 액션 | 파일 업로드, checksum 계산, manifest validate, 대상 모듈 지정, 분석 요청 |
| 상태/예외 | checksum mismatch, manifest missing, unsupported module, duplicate version, upload failed |
| 연동 포인트 | Audit Package manifest, Static analysis runner, Module registry |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C04-01이고 화면명은 펌웨어 등록 마법사이다. 목적은 새 펌웨어 파일, manifest, 대상 모듈, 릴리즈 노트, 서명/체크섬을 등록한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 4단계 wizard, 파일 업로드, manifest preview, 대상 모듈 선택, 릴리즈 노트 편집, 등록 전 검증를 배치한다. 표시 데이터는 Firmware, FirmwareManifest, ModuleType, Vendor, ReleaseNote이며, 주요 액션은 파일 업로드, checksum 계산, manifest validate, 대상 모듈 지정, 분석 요청이다. 상태와 예외는 checksum mismatch, manifest missing, unsupported module, duplicate version, upload failed를 반드시 시각화한다. 연동 포인트는 Audit Package manifest, Static analysis runner, Module registry이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C04-02 정적분석 결과 상세

| 목적 | 펌웨어 정적분석 결과를 위험도, 규칙, 파일/함수, 배포 차단 여부 기준으로 보여준다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | StaticAnalysisResult, Finding, Rule, Firmware, Waiver |
| 주요 구성 | 분석 요약, 위험도별 findings, rule 설명, 코드 위치, waiver 요청, 재분석 버튼 |
| 주요 액션 | finding 필터, waiver 요청, 수정 상태 표시, 재분석, 배포 차단 해제 요청 |
| 상태/예외 | passed, warning, critical finding, waiver_required, analysis timeout |
| 연동 포인트 | Release approval, Audit package, Incident recurrence data |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C04-02이고 화면명은 정적분석 결과 상세이다. 목적은 펌웨어 정적분석 결과를 위험도, 규칙, 파일/함수, 배포 차단 여부 기준으로 보여준다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 분석 요약, 위험도별 findings, rule 설명, 코드 위치, waiver 요청, 재분석 버튼를 배치한다. 표시 데이터는 StaticAnalysisResult, Finding, Rule, Firmware, Waiver이며, 주요 액션은 finding 필터, waiver 요청, 수정 상태 표시, 재분석, 배포 차단 해제 요청이다. 상태와 예외는 passed, warning, critical finding, waiver_required, analysis timeout를 반드시 시각화한다. 연동 포인트는 Release approval, Audit package, Incident recurrence data이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C04-03 호환성 매트릭스

| 목적 | 펌웨어 버전이 어떤 로봇, 모듈, 제어기, HMI, Telemetry 조합에 배포 가능한지 확인한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | CompatibilityRule, Robot, Module, Firmware, HMI, TelemetryDevice, AuditPackage |
| 주요 구성 | matrix grid, 필터, 호환/주의/불가 배지, 차단 사유, 영향 로봇 목록 |
| 주요 액션 | 대상 조합 필터, 차단 사유 보기, 호환성 규칙 편집, 배포 대상 선택으로 이동 |
| 상태/예외 | compatible, warning, incompatible, unknown, rule missing |
| 연동 포인트 | Module registry, HMI version, Telemetry firmware, Audit approval |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C04-03이고 화면명은 호환성 매트릭스이다. 목적은 펌웨어 버전이 어떤 로봇, 모듈, 제어기, HMI, Telemetry 조합에 배포 가능한지 확인한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 matrix grid, 필터, 호환/주의/불가 배지, 차단 사유, 영향 로봇 목록를 배치한다. 표시 데이터는 CompatibilityRule, Robot, Module, Firmware, HMI, TelemetryDevice, AuditPackage이며, 주요 액션은 대상 조합 필터, 차단 사유 보기, 호환성 규칙 편집, 배포 대상 선택으로 이동이다. 상태와 예외는 compatible, warning, incompatible, unknown, rule missing를 반드시 시각화한다. 연동 포인트는 Module registry, HMI version, Telemetry firmware, Audit approval이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C04-04 릴리즈 승인 워크플로우

| 목적 | 분석, Audit, QA, 운영 승인 조건을 만족한 펌웨어만 배포 승인한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | ReleaseApproval, Firmware, StaticAnalysisResult, AuditPackage, ApprovalStep |
| 주요 구성 | 승인 단계 타임라인, 조건 체크리스트, 승인자 카드, 리스크 요약, 승인/반려 모달 |
| 주요 액션 | 승인, 반려, waiver 확인, 조건 재검토, 승인 기록 보기 |
| 상태/예외 | approval pending, rejected, condition failed, approved, expired approval |
| 연동 포인트 | Deployment planner, Audit package, Incident risk report |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C04-04이고 화면명은 릴리즈 승인 워크플로우이다. 목적은 분석, Audit, QA, 운영 승인 조건을 만족한 펌웨어만 배포 승인한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 승인 단계 타임라인, 조건 체크리스트, 승인자 카드, 리스크 요약, 승인/반려 모달를 배치한다. 표시 데이터는 ReleaseApproval, Firmware, StaticAnalysisResult, AuditPackage, ApprovalStep이며, 주요 액션은 승인, 반려, waiver 확인, 조건 재검토, 승인 기록 보기이다. 상태와 예외는 approval pending, rejected, condition failed, approved, expired approval를 반드시 시각화한다. 연동 포인트는 Deployment planner, Audit package, Incident risk report이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C04-05 OTA 배포 계획 생성

| 목적 | 대상 로봇/모듈, 배포 방식, 일정, 단계적 배포 그룹, 롤백 조건을 설정한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | DeploymentPlan, Firmware, RobotGroup, Module, RollbackPolicy, MaintenanceWindow |
| 주요 구성 | 대상 선택, 그룹 나누기, 일정/윈도우, 롤백 조건, 영향 범위, 최종 확인 |
| 주요 액션 | 대상 필터, canary group 생성, 배포 예약, 롤백 정책 저장, 최종 확인 |
| 상태/예외 | robot offline, incompatible target, maintenance window conflict, insufficient battery, approval missing |
| 연동 포인트 | Fleet status, HMI/Telemetry availability, Incident freeze windows |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C04-05이고 화면명은 OTA 배포 계획 생성이다. 목적은 대상 로봇/모듈, 배포 방식, 일정, 단계적 배포 그룹, 롤백 조건을 설정한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 대상 선택, 그룹 나누기, 일정/윈도우, 롤백 조건, 영향 범위, 최종 확인를 배치한다. 표시 데이터는 DeploymentPlan, Firmware, RobotGroup, Module, RollbackPolicy, MaintenanceWindow이며, 주요 액션은 대상 필터, canary group 생성, 배포 예약, 롤백 정책 저장, 최종 확인이다. 상태와 예외는 robot offline, incompatible target, maintenance window conflict, insufficient battery, approval missing를 반드시 시각화한다. 연동 포인트는 Fleet status, HMI/Telemetry availability, Incident freeze windows이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C04-06 OTA 배포 진행 모니터

| 목적 | 배포 중인 로봇/모듈의 다운로드, 설치, 재시작, 검증, 실패/재시도 상태를 실시간 추적한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Deployment, DeploymentTarget, Robot, Module, Event, TelemetryChannel |
| 주요 구성 | 진행률 헤더, 대상별 상태 테이블, 단계별 timeline, 실패 상세, 재시도/중단 버튼, 이벤트 로그 |
| 주요 액션 | 배포 일시중지, 실패 대상 재시도, 롤백 전환, 로그 다운로드 |
| 상태/예외 | downloading, installing, rebooting, verifying, success, failed, timeout, rollback_required |
| 연동 포인트 | Event stream, Incident creation, HMI status, Telemetry connectivity |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C04-06이고 화면명은 OTA 배포 진행 모니터이다. 목적은 배포 중인 로봇/모듈의 다운로드, 설치, 재시작, 검증, 실패/재시도 상태를 실시간 추적한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 진행률 헤더, 대상별 상태 테이블, 단계별 timeline, 실패 상세, 재시도/중단 버튼, 이벤트 로그를 배치한다. 표시 데이터는 Deployment, DeploymentTarget, Robot, Module, Event, TelemetryChannel이며, 주요 액션은 배포 일시중지, 실패 대상 재시도, 롤백 전환, 로그 다운로드이다. 상태와 예외는 downloading, installing, rebooting, verifying, success, failed, timeout, rollback_required를 반드시 시각화한다. 연동 포인트는 Event stream, Incident creation, HMI status, Telemetry connectivity이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C04-07 롤백 및 복구 화면

| 목적 | 배포 실패 또는 장애 증가 시 안전하게 이전 버전으로 되돌린다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | RollbackPlan, Deployment, Firmware, Robot, Incident, CompatibilityRule |
| 주요 구성 | 롤백 대상, 이전 안정 버전, 영향 범위, 복구 단계, 확인 모달, 완료 검증 |
| 주요 액션 | 롤백 대상 선택, 롤백 실행, 복구 검증, 실패 대상 incident 연결 |
| 상태/예외 | rollback_required, rollback_running, rollback_success, rollback_failed, manual_recovery_needed |
| 연동 포인트 | Incident management, HMI maintenance mode, Telemetry health check |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C04-07이고 화면명은 롤백 및 복구 화면이다. 목적은 배포 실패 또는 장애 증가 시 안전하게 이전 버전으로 되돌린다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 롤백 대상, 이전 안정 버전, 영향 범위, 복구 단계, 확인 모달, 완료 검증를 배치한다. 표시 데이터는 RollbackPlan, Deployment, Firmware, Robot, Incident, CompatibilityRule이며, 주요 액션은 롤백 대상 선택, 롤백 실행, 복구 검증, 실패 대상 incident 연결이다. 상태와 예외는 rollback_required, rollback_running, rollback_success, rollback_failed, manual_recovery_needed를 반드시 시각화한다. 연동 포인트는 Incident management, HMI maintenance mode, Telemetry health check이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C04-08 펌웨어 이력과 감사 로그

| 목적 | 펌웨어 등록, 분석, 승인, 배포, 롤백, waiver 기록을 추적한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | FirmwareHistory, AuditLog, Deployment, Approval, Waiver |
| 주요 구성 | 이력 타임라인, actor/action table, 변경 diff, 필터, export |
| 주요 액션 | 이력 필터, audit log 다운로드, diff 보기, 관련 incident/approval 이동 |
| 상태/예외 | log incomplete, restricted action, no history |
| 연동 포인트 | IAM/Audit service, Integration audit package |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C04-08이고 화면명은 펌웨어 이력과 감사 로그이다. 목적은 펌웨어 등록, 분석, 승인, 배포, 롤백, waiver 기록을 추적한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 이력 타임라인, actor/action table, 변경 diff, 필터, export를 배치한다. 표시 데이터는 FirmwareHistory, AuditLog, Deployment, Approval, Waiver이며, 주요 액션은 이력 필터, audit log 다운로드, diff 보기, 관련 incident/approval 이동이다. 상태와 예외는 log incomplete, restricted action, no history를 반드시 시각화한다. 연동 포인트는 IAM/Audit service, Integration audit package이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C04-09 모듈 버전 상세

| 목적 | 특정 로봇의 모듈별 현재 버전, 목표 버전, 분석 상태, 배포 이력을 확인한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | Robot, Module, Firmware, DeploymentHistory, Incident |
| 주요 구성 | 로봇 헤더, 모듈 버전 카드, 버전 차이, 최근 배포, 관련 장애, 배포 가능 버튼 |
| 주요 액션 | 모듈 선택, 배포 계획 생성, 장애 상세 이동, Audit profile 확인 |
| 상태/예외 | outdated, blocked, current, update_available, unknown version |
| 연동 포인트 | Robot drawer, Incident, Audit package, HMI/Telemetry status |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C04-09이고 화면명은 모듈 버전 상세이다. 목적은 특정 로봇의 모듈별 현재 버전, 목표 버전, 분석 상태, 배포 이력을 확인한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 로봇 헤더, 모듈 버전 카드, 버전 차이, 최근 배포, 관련 장애, 배포 가능 버튼를 배치한다. 표시 데이터는 Robot, Module, Firmware, DeploymentHistory, Incident이며, 주요 액션은 모듈 선택, 배포 계획 생성, 장애 상세 이동, Audit profile 확인이다. 상태와 예외는 outdated, blocked, current, update_available, unknown version를 반드시 시각화한다. 연동 포인트는 Robot drawer, Incident, Audit package, HMI/Telemetry status이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

## C04-10 펌웨어 정책 설정

| 목적 | 정적분석 차단 기준, 배포 가능 시간, canary 비율, 자동 incident 생성 조건을 설정한다. |
| --- | --- |
| 사용자 | 해당 워크스페이스 권한 사용자 |
| 데이터 SSOT | FirmwarePolicy, StaticAnalysisRule, DeploymentPolicy, RollbackPolicy |
| 주요 구성 | 정책 목록, rule builder, threshold 설정, 적용 대상, 테스트 정책 실행 |
| 주요 액션 | 정책 생성, 조건 편집, 대상 지정, 시뮬레이션, 저장/활성화 |
| 상태/예외 | policy conflict, missing approver, unsafe policy, disabled |
| 연동 포인트 | Release approval, Deployment planner, Incident engine |

| 화면 생성 프롬프트 Desktop 1440x900 기준의 UX/UI 목업을 생성한다. 화면 ID는 C04-10이고 화면명은 펌웨어 정책 설정이다. 목적은 정적분석 차단 기준, 배포 가능 시간, canary 비율, 자동 incident 생성 조건을 설정한다.이다. 레이아웃은 상단 글로벌 바, 좌측 내비게이션, 중앙 작업 영역, 우측 컨텍스트 드로어 진입 버튼, 하단 이벤트 스트립을 유지한다. 중앙 작업 영역에는 정책 목록, rule builder, threshold 설정, 적용 대상, 테스트 정책 실행를 배치한다. 표시 데이터는 FirmwarePolicy, StaticAnalysisRule, DeploymentPolicy, RollbackPolicy이며, 주요 액션은 정책 생성, 조건 편집, 대상 지정, 시뮬레이션, 저장/활성화이다. 상태와 예외는 policy conflict, missing approver, unsafe policy, disabled를 반드시 시각화한다. 연동 포인트는 Release approval, Deployment planner, Incident engine이다. 시각 스타일은 통합 관제 애플리케이션 스타일, 흰색 배경, 녹색 계열 포인트, 상태 배지, 실무형 enterprise UI. 위험 액션은 확인 단계와 감사 로그가 보이도록 구성한다. |
| --- |

# 6. 핵심 사용자 흐름

## 펌웨어 등록에서 승인까지

- 1. 펌웨어 파일과 manifest 등록

- 2. 정적분석 실행 및 critical finding 확인

- 3. 호환성 매트릭스에서 대상 조합 확인

- 4. Audit Package와 QA 조건 확인 후 릴리즈 승인 요청

- 5. 승인 후 배포 계획 생성

| 완료 기준 | 분석 실패, 호환성 불가, Audit 미승인 중 하나라도 있으면 배포 계획 생성을 차단한다. |
| --- | --- |

## 단계적 OTA 배포

- 1. Canary 대상 로봇 선택

- 2. 배포 윈도우와 롤백 조건 설정

- 3. 배포 시작 및 대상별 상태 모니터링

- 4. Canary 성공 후 다음 그룹 확대

- 5. 실패 대상은 incident 연결 또는 롤백

| 완료 기준 | 대상 로봇별 current_step과 결과가 실시간으로 갱신되어야 한다. |
| --- | --- |

## 장애 기반 롤백

- 1. 배포 후 특정 오류 증가

- 2. 장애 화면에서 배포 이력과 연관성 확인

- 3. 펌웨어 화면에서 rollback_required 전환

- 4. 이전 안정 버전 선택 및 영향 확인

- 5. 롤백 후 Telemetry health check와 작업 재개 가능 여부 확인

| 완료 기준 | 롤백 전후 버전, 담당자, 사유, 결과가 감사 로그에 남아야 한다. |
| --- | --- |

# 7. 목업 검수 기준

- 펌웨어 생명주기 상태와 배포 상태가 분리되어야 한다.

- 정적분석 결과는 배포 차단 여부를 명확히 표시해야 한다.

- 호환성 매트릭스에는 HMI와 Telemetry 장치 버전까지 포함해야 한다.

- 전체 장비 배포는 2단계 확인과 권한 검증이 필수다.

- 배포 실패는 Incident와 연결되며 롤백 흐름을 제공해야 한다.

# 8. 용어와 화면 제작 주의사항

| 용어 | 정의/화면 적용 |
| --- | --- |
| Firmware Manifest | 파일명, 버전, 대상 모듈, checksum, 서명, 지원 로봇 유형, 의존 버전 등을 포함한 메타데이터. |
| 정적분석 | 실행 전 코드/바이너리/규칙 기반 점검 결과를 UI에 반영하는 분석 절차. |
| OTA | 현장 장치에 원격으로 펌웨어를 배포하는 절차. 승인, 단계 배포, 롤백 포함. |
| Canary | 전체 배포 전 일부 로봇/모듈에 먼저 적용하여 위험을 검증하는 배포 방식. |
| Rollback | 배포 실패 또는 장애 증가 시 이전 안정 버전으로 되돌리는 절차. |
