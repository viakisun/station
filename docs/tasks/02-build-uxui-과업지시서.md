# 02. STATION Build 개발·검증·배포 콘솔 UX/UI 과업지시서

| 문서 코드 | JJ-UX-02 |
| --- | --- |
| 문서 유형 | 제품별 UX/UI 설계 과업지시서 (Statement of Work) |
| 대상 제품 | **Build (개발·검증·배포)** = C02 Audit/DevKit/SDK + C04 펌웨어/OTA |
| 단일 참조 (SSOT) | [00 공통 설계 기준서](../00-ux-common-standards.md) (특히 §9.2) · [화면 갭](../spec-gap.md) |
| SSOT 원본 | C02 Audit Package·개발자 킷 (JJ-C02) · C04 펌웨어·정적분석·OTA (JJ-C04) |
| 상태 | 확정 과업 (미결정·대안은 [ADR](../adr/)로 분리) |
| 버전 | v1.0 · 2026-06-02 |

> 본 과업지시서는 [00 SSOT](../00-ux-common-standards.md)를 단일 참조로 삼는다. 상태·Gate·Audit·권한·DNA가 00과
> 충돌할 경우 **항상 00이 우선**한다. 본문에는 확정 원칙만 담고, 미결정은 [ADR](../adr/)로 링크한다.

---

## 1. 과업 개요

### 1.1 과업명
**STATION Build 개발·검증·배포 콘솔 UX/UI 설계**

### 1.2 배경
STATION은 사용자·디바이스·디자인 방향이 다른 3제품(Ops·Build·Field)이 하나의 Platform Core로 연결되는
구조다([00 §1](../00-ux-common-standards.md)). 그중 **Build**는 서로 다른 제조사의 이기종 모듈/펌웨어를 플랫폼 표준으로
온보딩·검증하고(C02), 펌웨어를 안전하게 분석·승인·배포·롤백하는(C04) 워크스페이스다. 현재 골격은 대표 화면
일부만 이식되어 있어([spec-gap §0](../spec-gap.md): C02 27%, C04 36%), **승인→배포→롤백 폐루프가 끊겨 있다**.
SSOT 원본(C02/C04)은 "흰 배경·enterprise UI"를 명시하나, Build의 사용자에는 비개발자(통합담당·배포관리자)가
포함되므로 터미널/로그 미학이 화면 전체를 지배해서는 안 된다.

### 1.3 목적
- 개발자와 배포관리자가 **공통으로 이해 가능한 운영형 배포 콘솔**을 설계한다.
- Audit 승인 → 운영 전환(Loop5), Firmware 승인 → 계획 → 성공·실패 → 롤백(Loop4)의 **폐루프**를 화면으로 닫는다.
- 모든 Gate(특히 `blocked`)에서 **차단 사유와 해결 행동**을 한 화면에서 명확히 제시한다([00 §5](../00-ux-common-standards.md)).
- 의사결정 정보(승인 상태·호환성·차단 사유·배포 대상·롤백 전략)는 카드/테이블/타임라인으로, 터미널/로그는
  보조 레이어로 한정한다([00 §9.2](../00-ux-common-standards.md)).

### 1.4 대상
| 구분 | 내용 |
| --- | --- |
| 주 사용자 | 제조사 개발자 · 플랫폼 통합 담당자 · 배포 관리자 · QA 담당자 · 시스템 관리자 |
| 디바이스 | Desktop 1440×900 |
| 디자인 방향 | 운영형 배포 콘솔(enterprise deployment console) + 터미널/로그 보조 레이어 |
| 워크스페이스 | C02 Audit/개발자 킷(11화면) · C04 펌웨어/OTA(11화면) |

---

## 2. 과업 범위

### 2.1 사용자 · 권한 ([00 §8](../00-ux-common-standards.md))
| 역할 | Build 권한 | 화면 맥락 적용 |
| --- | --- | --- |
| 제조사 개발자 | V(자사 한정) · profile/simulate E · **운영반영 승인 불가** | 자사 vendor 데이터만 노출 · Audit/Release **승인 버튼은 비활성 + 사유 툴팁** |
| 배포 관리자 | V · plan/canary/rollback E · release **A(부분)** | OTA 계획·canary·롤백 실행 · 릴리즈 부분 승인(운영 승인 단계) |
| 시스템 관리자 | V · E · A all · 위험 정책 | 펌웨어 정책(C04-10) · waiver 최종 승인 · 전체 장비 배포 |
| QA 담당자 | V · test E | Conformance 실행 · QA 승인 단계 |

> 하드 거부([00 §8](../00-ux-common-standards.md)): 제조사 개발자 ≠ 운영 반영 승인. 승인/운영 전환 버튼은 **숨김이 아니라 비활성
> + 사유 툴팁**으로 표현한다.

### 2.2 디바이스
Desktop 1440×900 단일 기준. 고밀도(density-comfortable 기본, compact 토글). 터치영역 규정(44/64px)은 Build 비대상.

### 2.3 화면 범위
- **C02-00~10 (11화면)** + **C04-00~10 (11화면)** = **22화면 전체**를 §5 표로 다룬다(구현/미구현 표기).
- 목업 코드 단위 **BUILD-01~12 (12개)** 를 SSOT 화면 ID에 매핑한다(§5.3).

### 2.4 제외
- 서버/백엔드 정책 재검증 로직(클라이언트 UX 차단·확인만 설계, 서버 재검증은 후속 — [00 §5](../00-ux-common-standards.md)).
- 실시간 데이터 소스 추상화(setInterval 가짜→Event Bus/SSE 전환은 [ADR-008](../adr/ADR-008-async-migration.md), Track C).
- Field(H01/T01)·Ops(C01/C03) 화면 본체(연동 포인트로만 참조).
- 상태 색상 토큰 최종값 결정([ADR-005](../adr/ADR-005-status-color-tokens.md) — 프로토타입 절제값 유지).

---

## 3. UX/UI 설계 방향

### 3.1 제품 디자인 방향 — 운영형 배포 콘솔 + 터미널 보조 ([00 §9.2](../00-ux-common-standards.md))

Build의 핵심은 "코드를 짜는 화면"이 아니라 **"배포해도 되는가를 판단하는 화면"**이다. 따라서 화면의 1차 언어는
의사결정 정보이며, 터미널 미학은 그 판단의 **근거를 보여주는 보조 레이어**다.

| 정보 유형 | 표현 매체 (1급) | 비고 |
| --- | --- | --- |
| 승인 상태 · 조건 충족 | 단계 타임라인 · 체크리스트 카드 | Release/Audit 승인 |
| 호환성 | matrix grid · 배지(호환/주의/불가) | C04-03 |
| **차단 사유 + 해결 행동** | 인라인 알림 카드(사유→행동→링크) | Gate `blocked` 필수 |
| 배포 대상 · 그룹 | 대상 테이블 · canary 그룹 카드 | C04-05 |
| 롤백 전략 | 이전 안정 버전 카드 · 영향 범위 | C04-07 |
| OTA 진행 | 진행률 헤더 + 대상별 상태 테이블 + 단계 타임라인 | C04-06 |

| 정보 유형 | 표현 매체 (보조 — 터미널 톤) | 한정 원칙 |
| --- | --- | --- |
| 테스트 실행 로그 | `.term` 패널(mono·암색) | Conformance Runner 하단 |
| static analysis 출력 | `.term` 코드 위치 뷰 | C04-02 findings 보조 |
| deploy progress 스트림 | `.term` 이벤트 로그 | C04-06 하단 이벤트 로그 |
| simulator 송수신 콘솔 | `.term` 메시지 콘솔 | C02-05 |

#### ⚠ 과한 터미널화 경고 (필수 명시)
- **핵심 의사결정 화면**(Audit 승인 C02-07, Release 승인 C04-04, Compatibility C04-03, Deployment Plan C04-05,
  Rollback C04-07)은 **enterprise deployment console**로 설계한다. 이들 화면을 "검은 터미널 + 로그 스트림"으로
  표현하는 것을 **금지**한다.
- 터미널/로그(`.term`)는 **로그·진행·분석의 보조 영역**에만 사용한다. 화면 폭의 1/3 이하, 항상 카드/타임라인
  하위 또는 우측 보조 컬럼에 배치한다.
- 모든 차단/실패 메시지는 raw 로그가 아니라 **사람이 읽는 사유 문구 + 해결 행동**으로 1차 표시하고, raw 로그는
  접힌(collapsible) 보조로 둔다. 비개발자(통합담당·배포관리자)가 화면만으로 의사결정할 수 있어야 한다.

### 3.2 정보 구조
- **공통 셸**(SSOT 원본 §2): 상단 글로벌 바(시스템 상태·현장 선택·검색·알림·배포 진행 수) · 좌측 내비(홈/맵·작업/
  Audit·개발자킷/장애/펌웨어·배포/HMI/Telemetry/설정) · 중앙 작업 영역 · 우측 컨텍스트 드로어 · 하단 이벤트 스트립.
- **정보 우선순위**([00 §9.1](../00-ux-common-standards.md) 준용): 1 배포 차단/위험(blocked·analysis_failed·rollback_required)
  2 승인 대기/진행(pending_approval·deploying) 3 모듈/펌웨어 버전 상태 4 이력·설정.
- **2축 탐색**: ① 워크스페이스 축(C02 모듈 검증 ↔ C04 펌웨어 배포) ② 객체 축(모듈→Audit→Firmware→Deploy를
  공유 ID로 따라가기).

### 3.3 인터랙션
| 패턴 | 적용 |
| --- | --- |
| 마법사(wizard) | 온보딩(C02-01) 5단계 · 펌웨어 등록(C04-01) 4단계 — 단계별 검증·blocked 차단 |
| 단계 타임라인 | 승인 워크플로우(C04-04) · OTA 단계(C04-06) — 현재 단계/다음 행동/차단 사유를 같은 위치 |
| hold-to-confirm | `confirm_required` 위험 액션(전체 장비 배포·운영 전환·롤백 실행) — 사유 명시 후 길게 눌러 실행 |
| 인라인 차단 카드 | `blocked` 게이트 — (a) 차단 사유 (b) 해결 행동 + 링크 |
| 드릴다운 | 대시보드 KPI → 목록 → 상세(findings/target) → 보조 로그 |
| diff 뷰 | Capability/Protocol 버전 변경 · 펌웨어 이력 before/after |
| 컨텍스트 드로어 | 객체 선택 시 즉시 정보 + 크로스 제품 링크([00 §7](../00-ux-common-standards.md)) |

### 3.4 상태 / 경고 / 위험 표현

#### 3.4.1 상태 체계 ([00 §3](../00-ux-common-standards.md))
- 모듈: `unknown·disconnected·initializing·normal·warning·degraded·fault·maintenance·disabled`
- 펌웨어 배포: `draft·analyzing·blocked·approved·scheduled·deploying·success·failed·rollback_required·rolled_back`
- Audit: `draft·submitted·running·passed·failed·waiver_required·approved·expired`
- 배지 = squared(3px) + dot + mono 라벨. 6단계 심각도 의미·색은 불변(DNA). 색상 토큰은 [ADR-005](../adr/ADR-005-status-color-tokens.md).
- **펌웨어 생명주기 상태와 배포 상태는 분리 표시**(SSOT C04 검수 기준).

#### 3.4.2 Gate 4단계 ([00 §5](../00-ux-common-standards.md))
`GateSeverity = pass | warn | confirm_required | blocked`

| Gate | Build 적용 지점 | 기본 레벨 | blocked 시 차단 사유 / 해결 행동 (예시) |
| --- | --- | --- | --- |
| **G2** Firmware-release | 릴리즈 승인(C04-04)·배포 계획(C04-05) 진입 | blocked | 사유: "정적분석 critical 2건 미해결 / Audit 미승인" · 행동: "정적분석 상세 열기 → waiver 요청" / "Audit Package 승인 요청" |
| **G5** Audit→operational | Audit Package approved 전 운영 전환 | blocked | 사유: "AuditPackage 미승인(conformance 92<95)" · 행동: "실패 테스트 재실행" / "이슈 보드 담당자 지정" |
| **G6** Deploy-preflight | 배포 계획 최종 확인(C04-05)·배포 시작 | blocked | 사유: "대상 RBT-THIN-0008 오프라인 / 배터리 18%" · 행동: "대상에서 제외" / "윈도우 재예약" |
| **G7** Incident-freeze | 대상 로봇 open critical 존재 | blocked | 사유: "대상에 미해결 critical incident INC-…" · 행동: "장애 상세 이동" / "대상 제외" |
| (G3) Version-mismatch | 호환성 매트릭스 map/parameter 경고 | map=blocked / param=confirm_required | 사유: "HMI 버전 < 요구 버전" · 행동: "호환성 규칙 보기" |

> **핵심 규칙**: 게이트가 `blocked`/`confirm_required`이면 UI는 반드시 **(a) 차단/확인 사유**와 **(b) 해결 행동(+링크)**을
> 함께 보여준다. 버튼은 비활성 + 사유, 위험 액션은 hold-to-confirm. 비개발자도 이해 가능한 문구로 1차 표시한다.

#### 3.4.3 Audit / Event 분리 ([00 §6](../00-ux-common-standards.md), [ADR-007](../adr/ADR-007-audit-vs-event-log.md))
| 구분 | Build 내용 | 화면 |
| --- | --- | --- |
| **Event Log** | 분석 진행·배포 진행·테스트 실행 결과·통신 지연·OTA 단계 전이 | 하단 이벤트 스트립 · OTA 이벤트 로그 · Runner 실시간 로그 |
| **Audit Log** | **운영 반영·승인 행위·정책 우회**: 릴리즈 승인/반려·Audit 승인·운영 전환·waiver 승인·배포 실행·롤백 실행·정책 변경 | 펌웨어 이력·감사 로그(C04-08) · 위험 액션 확인 모달 고지 |

> 모든 위험 전이·승인 행위는 커밋 전 AuditEntry(`actor·action·target·reason·before/after·result`)를 생성한다.
> 일반 분석/배포 진행 이벤트는 Event Log로 분리한다.

---

## 4. 주요 사용자 흐름 (Build 폐루프)

흐름은 [00 §10](../00-ux-common-standards.md) 5종 폐루프 중 **Loop4(펌웨어)·Loop5(audit)**가 닫히는지로 판정한다.
공유 ID 스파인([00 §2](../00-ux-common-standards.md)): `module_id(MOD-…)` · `audit_package_id(AUD-…)` · `firmware_id(FW-… [ADR-004](../adr/ADR-004-id-grammar.md))` ·
`deployment_plan_id(DEP-… [ADR-004](../adr/ADR-004-id-grammar.md))`.

### 4.1 Loop5 — 모듈 audit → 운영 전환 (G5)
| # | 단계 | 화면(SSOT ID) | 공유 ID | 게이트 |
| --- | --- | --- | --- | --- |
| 1 | 제조사/모듈 온보딩(5단계 wizard) | C02-01 | `module_id` 생성 | manifest checksum 검증 |
| 2 | Capability Profile 정의 | C02-02 | `module_id` | breaking change 경고 |
| 3 | Protocol 계약 정의 | C02-03 | `module_id` | schema invalid 차단 |
| 4 | Conformance Test 실행 | C02-06 | `module_id` | failed→waiver_required |
| 5 | Audit Package 빌드·승인 요청 | C02-07 | `audit_package_id` | score<threshold blocked |
| 6 | 승인 → 운영 전환(Registry) | C02-07 → 시스템 설정 | `module_id` approved | **G5 blocked**: AuditPackage approved 아니면 운영 전환 불가 |

> Context handoff([00 §7](../00-ux-common-standards.md)): 실패 테스트 → 통합 이슈 보드(C02-10)로 `module_id`+`test_case` 운반, 보완 후
> 실패 케이스만 재실행하여 `audit_package_id`에 보완 이력 누적. 완료 기준 = Audit Package `approved` → 모듈 운영 가능.

### 4.2 Loop4 — 펌웨어 릴리즈 → OTA → 롤백 (G2·G6)
| # | 단계 | 화면(SSOT ID) | 공유 ID | 게이트 |
| --- | --- | --- | --- | --- |
| 1 | 펌웨어 등록(4단계 wizard) | C04-01 | `firmware_id` 생성 | checksum mismatch 차단 |
| 2 | 정적분석 결과 확인 | C04-02 | `firmware_id` | critical finding → waiver_required |
| 3 | 호환성 매트릭스 확인 | C04-03 | `firmware_id` | incompatible 배포 차단 |
| 4 | 릴리즈 승인 워크플로우 | C04-04 | `firmware_id` | **G2 blocked**: 분석·Audit·QA·운영 조건 미충족 시 승인 불가 |
| 5 | OTA 배포 계획 생성(canary·rollback) | C04-05 | `deployment_plan_id` | **G6 blocked**: offline·battery·호환·윈도우·승인 누락 / **G7**: incident freeze |
| 6 | OTA 진행 모니터 | C04-06 | `deployment_plan_id` | success / failed → rollback_required |
| 7a | (성공) 다음 그룹 확대 | C04-06 | `deployment_plan_id` | canary 성공 후 |
| 7b | (실패) 롤백·복구 | C04-07 | `firmware_id`+`incident_id` | rollback 실행(confirm_required) → 실패 시 incident 연결 |
| 8 | 감사 기록 | C04-08 | 전체 | 등록·승인·배포·롤백·waiver actor/action/before/after 기록 |

> 화면 전이: C04-00 대시보드 → blocked release 패널 → C04-02/03 → C04-04 승인 → C04-05 계획 → C04-06 진행 →
> (실패) C04-07 롤백 → Ops 장애(C03)로 `incident_id` handoff. 완료 기준 = 분석 실패·호환 불가·Audit 미승인 중
> 하나라도 있으면 배포 계획 생성 차단(SSOT C04 완료 기준) + 롤백 전후 버전·담당자·사유·결과 감사 로그 기록.

---

## 5. 화면 설계 범위

### 5.1 C02 Audit / 개발자 킷 (11화면)
| 화면 ID | 화면명 | 주요 기능 | 핵심 데이터 항목 | 주요 인터랙션 | 구현 |
| --- | --- | --- | --- | --- | --- |
| C02-00 | 개발자 킷 홈 대시보드 | 온보딩 진행률·최근 Audit·실패 테스트·SDK·샌드박스 요약 | Vendor, Module, ProtocolProfile, AuditRun, SDKRelease | KPI 드릴다운·신규 모듈 등록·Audit 실행 | ✅ |
| C02-01 | 제조사/모듈 온보딩 마법사 | 5단계 표준 등록(vendor·모듈·지원로봇·manifest·검토) | Vendor, ModuleType, Module, CapabilityProfile, FirmwareManifest | wizard·manifest 업로드·초안 저장/제출 | ❌ |
| C02-02 | Capability Profile 편집기 | 기능/명령/파라미터/캘리브 요구 표준화·diff | CapabilityProfile, CommandContract, TelemetryChannelSchema, ParameterSchema | 기능 트리·스키마 테이블·버전 저장·breaking 경고 | ❌ |
| C02-03 | 프로토콜 계약 빌더 | transport/topic/payload/ack 계약 정의 | ProtocolProfile, TransportProfile, TopicMap, PayloadSchema, AckPolicy | schema editor·테스트 메시지·collision 경고 | ❌ |
| C02-04 | 메시지 스키마·Telemetry 채널 매퍼 | raw→표준 TelemetryChannel/Event 매핑 | RawMessageSample, TelemetryChannelSchema, EventSchema, UnitMap | drag 매핑·단위 변환·validation | ❌ |
| C02-05 | 시뮬레이터/에뮬레이터 | 모듈 메시지·명령·오류 시뮬레이션 | SimulatorScenario, ProtocolProfile, EventScenario | 메시지 콘솔(.term)·오류 주입·audit run 전환 | ❌ |
| C02-06 | Conformance Test Runner | 표준 준수 테스트 실행·결과·재실행 | AuditRun, TestCase, TestResult, Module | 전체 실행·실패 재실행·waiver 요청·실시간 로그(.term) | ✅ |
| C02-07 | Audit Package 빌더 | 아티팩트 묶음·검증 점수·승인 워크플로우·export | AuditPackage, AuditRun, CalibrationProfile, FirmwareManifest | artifact 체크·승인 요청·zip export | ✅ |
| C02-08 | SDK·문서 다운로드 센터 | SDK/스키마/changelog·breaking change | SDKRelease, APISpec, Schema, SampleCode | 다운로드·버전 비교·breaking 확인 | ❌ |
| C02-09 | 샌드박스·API 키 관리 | API 키·권한·rate limit·웹훅 | DeveloperApp, ApiKey, SandboxEnvironment, WebhookEndpoint | 키 생성/폐기·웹훅 테스트·샌드박스 리셋 | ❌ |
| C02-10 | 통합 이슈 보드 | 온보딩/Audit 이슈 담당자별 추적 | IntegrationIssue, AuditRun, Module, Owner | 칸반·담당자 지정·재검증 요청 | ❌ |

### 5.2 C04 펌웨어 / OTA (11화면)
| 화면 ID | 화면명 | 주요 기능 | 핵심 데이터 항목 | 주요 인터랙션 | 구현 |
| --- | --- | --- | --- | --- | --- |
| C04-00 | 펌웨어 운영 대시보드 | 버전·분석·배포 가능·위험 요약 | Firmware, Module, Robot, StaticAnalysisResult, Deployment | KPI·blocked release 패널·배포 계획 생성 | ✅ |
| C04-01 | 펌웨어 등록 마법사 | 4단계 등록(파일·manifest·대상·릴리즈노트·검증) | Firmware, FirmwareManifest, ModuleType, ReleaseNote | wizard·checksum 계산·분석 요청 | ❌ |
| C04-02 | 정적분석 결과 상세 | 위험도별 findings·rule·코드위치·차단여부·waiver | StaticAnalysisResult, Finding, Rule, Waiver | finding 필터·waiver 요청·재분석·코드위치(.term) | ✅ |
| C04-03 | 호환성 매트릭스 | 로봇/모듈/HMI/Telemetry 조합 배포 가능 여부 | CompatibilityRule, Robot, Module, HMI, TelemetryDevice | matrix grid·차단 사유·규칙 편집·대상 선택 이동 | ✅ |
| C04-04 | 릴리즈 승인 워크플로우 | 분석·Audit·QA·운영 조건 충족 시 승인(G2) | ReleaseApproval, Firmware, AuditPackage, ApprovalStep | 단계 타임라인·체크리스트·승인/반려 모달·waiver 확인 | ❌ |
| C04-05 | OTA 배포 계획 생성 | 대상/그룹/일정/canary/롤백조건(G6·G7) | DeploymentPlan, RobotGroup, RollbackPolicy, MaintenanceWindow | 대상 필터·canary 그룹·롤백 정책·최종 확인(hold) | ❌ |
| C04-06 | OTA 배포 진행 모니터 | 다운로드·설치·재시작·검증·실패/재시도 실시간 | Deployment, DeploymentTarget, Robot, Event | 진행 헤더·대상별 테이블·단계 타임라인·재시도/중단·이벤트 로그(.term) | ✅ |
| C04-07 | 롤백 및 복구 화면 | 이전 안정 버전 복구·영향·완료 검증 | RollbackPlan, Deployment, Firmware, Incident | 롤백 대상 선택·롤백 실행(hold)·incident 연결 | ❌ |
| C04-08 | 펌웨어 이력과 감사 로그 | 등록·분석·승인·배포·롤백·waiver 추적 | FirmwareHistory, AuditLog, Deployment, Approval, Waiver | 이력 타임라인·actor/action 테이블·diff·export | ❌ |
| C04-09 | 모듈 버전 상세 | 로봇별 모듈 현재/목표 버전·분석·배포 이력 | Robot, Module, Firmware, DeploymentHistory, Incident | 모듈 버전 카드·버전 차이·배포 계획 생성 | ❌ |
| C04-10 | 펌웨어 정책 설정 | 차단 기준·배포 윈도우·canary 비율·자동 incident | FirmwarePolicy, StaticAnalysisRule, DeploymentPolicy, RollbackPolicy | rule builder·threshold·시뮬레이션·활성화 | ❌ |

> 구현 현황 출처: [spec-gap §C02·§C04](../spec-gap.md). 미구현(❌) 8(C02)+7(C04)=15화면이 본 과업의 신규 설계 대상이며,
> 그중 **폐루프 차단 화면**(C04-04 승인·C04-05 계획·C04-07 롤백 / C02-01 온보딩·C02-02 Capability·C02-03 Protocol)이
> 우선순위 1이다([spec-gap §4 Phase 1](../spec-gap.md)).

### 5.3 BUILD-01~12 목업 ↔ SSOT 화면 ID 매핑
| 목업 | 목업 화면명 | SSOT ID | 구현 자산(참고) | 폐루프 |
| --- | --- | --- | --- | --- |
| BUILD-01 | Home(개발·배포 통합 홈) | C02-00 + C04-00 | `audit/_screens/AuditHome.tsx` · `firmware/_screens/FirmwareDash.tsx` | 진입 |
| BUILD-02 | Module 상세(모듈/버전) | C04-09 | 신규 | Loop4/5 교차 |
| BUILD-03 | Capability·Protocol 정의 | C02-02 + C02-03 | 신규 | Loop5 #2-3 |
| BUILD-04 | Audit 생성(Package 빌더) | C02-07 | `audit/_screens/AuditBuilder.tsx` | Loop5 #5 |
| BUILD-05 | Audit Run(Conformance) | C02-06 | `audit/_screens/ConformanceRunner.tsx` | Loop5 #4 |
| BUILD-06 | Audit 승인 → 운영 전환 | C02-07(승인) | 신규(G5) | Loop5 #6 |
| BUILD-07 | Firmware 목록 | C04-00 | `firmware/_screens/FirmwareDash.tsx` | Loop4 진입 |
| BUILD-08 | Release 승인 | C04-04 | 신규(G2) | Loop4 #4 |
| BUILD-09 | Compatibility | C04-03 | `firmware/_screens/CompatMatrix.tsx` | Loop4 #3 |
| BUILD-10 | Deployment Plan | C04-05 | 신규(G6·G7) | Loop4 #5 |
| BUILD-11 | OTA 진행 | C04-06 | `firmware/_screens/OtaMonitor.tsx` | Loop4 #6 |
| BUILD-12 | Rollback·Audit Log | C04-07 + C04-08 | 신규 | Loop4 #7-8 |

> 정적분석 상세(C04-02 / `StaticAnalysis.tsx`)는 BUILD-07(Firmware 목록)·BUILD-08(Release 승인)의 드릴다운으로
> 포함한다. 온보딩 마법사(C02-01)·SDK(C02-08)·샌드박스(C02-09)·이슈보드(C02-10)·매퍼(C02-04)·시뮬레이터(C02-05)는
> BUILD 12 핵심 목업 외 보강 화면([spec-gap Phase 2](../spec-gap.md))으로 분류한다.

---

## 6. 디자인 시스템 적용 기준

| 항목 | 기준 | 출처 |
| --- | --- | --- |
| DNA(불변) | 6단계 상태 의미·squared dot+mono 배지 · mono tabular(ID/버전/체크섬/%) · live dot `#1fb46a` · ink 단일 브랜드 · 페이퍼화이트+hairline · audit 정직성(hold+감사 고지) | [00 §4.1](../00-ux-common-standards.md) |
| 3-tier 토큰 | `primitive→semantic→[data-theme="build"]`. 컴포넌트는 semantic 토큰만 소비. Build 테마 override는 밀도·강조·radius·모션에 한정, DNA 불변 | [00 §4.2](../00-ux-common-standards.md) |
| 상태 배지 | StatusBadge(squared 3px·dot·mono). 펌웨어 생명주기/배포 상태 분리 배지. 색은 [ADR-005](../adr/ADR-005-status-color-tokens.md) 프로토타입 절제값 유지 | [00 §3](../00-ux-common-standards.md) |
| **1급 컴포넌트** | KpiCard · 테이블(목록/매트릭스) · 단계 타임라인 · 체크리스트 카드 · 인라인 차단 카드(사유+행동) | [00 §9.2](../00-ux-common-standards.md) |
| **보조 컴포넌트** | `.term` 터미널 패널(로그·진행·분석·시뮬레이터). 암색·mono. 폭 1/3 이하, 카드/타임라인 하위에 배치 | `hub/app/hub.css` `.term-body`/`.hero-term` |
| Gate 표현 | pass/warn/confirm_required/blocked 4레벨. blocked=비활성 버튼+사유+행동, confirm_required=hold-to-confirm | [00 §5](../00-ux-common-standards.md) |
| 위험 액션 | 전체 장비 배포·운영 전환·롤백·waiver 승인 = hold 또는 2단계 확인 + 감사 고지 모달 | [00 §4.1·§6](../00-ux-common-standards.md) |
| ID 표기 | 모든 ID(MOD-/AUD-/FW-/DEP-/RBT-) mono·tabular. 신규 문법은 [ADR-004](../adr/ADR-004-id-grammar.md) | [00 §2](../00-ux-common-standards.md) |
| 컨텍스트 칩 | 타깃 상단 "from Ops · RBT-…" 출처 칩 + 돌아가기 | [00 §7](../00-ux-common-standards.md) |

> Build 테마는 enterprise 콘솔 톤(흰 배경·녹색 포인트·정보 밀도)을 따르되, DNA 배지·배터리·live dot은 타 제품과
> 코드 변경 없이 교체해도 어색하지 않아야 한다([00 §4.1](../00-ux-common-standards.md) 일관성 테스트).

---

## 7. 산출물

| # | 산출물 | 형식 | 비고 |
| --- | --- | --- | --- |
| 1 | 본 과업지시서 | Markdown | 본 문서 |
| 2 | BUILD-01~12 화면 목업 | 화면 단위 | §5.3 매핑, C02/C04 22화면 커버 |
| 3 | Gate 차단 사유·해결 행동 카탈로그 | 표/스펙 | G2/G5/G6/G7 × (사유·행동·링크) |
| 4 | 폐루프 흐름도(Loop4·Loop5) | 다이어그램 | 단계·화면·공유 ID·게이트 |
| 5 | 권한별 화면 상태 표 | 표 | 역할 × 화면 × (V/E/A) · 비활성 사유 문구 |
| 6 | 컴포넌트 사용 가이드 | 표/스펙 | 1급(카드/테이블/타임라인) vs 보조(.term) 분리 기준 |

> 미결정 항목은 본문이 아닌 [ADR](../adr/)에 둔다(ID 문법 [ADR-004](../adr/ADR-004-id-grammar.md), 색상 [ADR-005](../adr/ADR-005-status-color-tokens.md),
> async [ADR-008](../adr/ADR-008-async-migration.md)).

---

## 8. 검수 기준

### 8.1 폐루프 완료 (최우선 — [00 §10](../00-ux-common-standards.md))
- [ ] **Loop5(audit)** 닫힘: 온보딩→Capability→Protocol→Conformance→Audit Package **approved**→운영 전환(G5)이
      `module_id`+`audit_package_id`로 끊김 없이 연결.
- [ ] **Loop4(펌웨어)** 닫힘: 등록→분석→호환성→승인(G2)→계획(G6/G7)→진행→**성공/실패→롤백**→감사 기록이
      `firmware_id`+`deployment_plan_id`로 연결. 분석실패·호환불가·Audit미승인 중 하나라도 있으면 배포 계획 생성 차단.

### 8.2 Gate 표현 ([00 §5](../00-ux-common-standards.md))
- [ ] G2/G5/G6/G7 모든 `blocked`에서 **(a) 차단 사유 + (b) 해결 행동(+링크)**을 한 화면에 표시.
- [ ] `confirm_required`(전체 장비 배포·운영 전환·롤백)는 hold-to-confirm + 사유 명시.
- [ ] 권한 없는 승인/운영 전환 버튼은 **숨김이 아니라 비활성 + 사유 툴팁**(제조사 개발자 ≠ 운영 반영 승인).

### 8.3 디자인 방향 ([00 §9.2](../00-ux-common-standards.md))
- [ ] 핵심 의사결정 화면(C02-07·C04-03·C04-04·C04-05·C04-07)이 카드/테이블/타임라인 중심이며 터미널화되지 않음.
- [ ] 터미널/로그(`.term`)는 로그·진행·분석·시뮬레이터 보조에만 사용, 폭 1/3 이하.
- [ ] 비개발자(통합담당·배포관리자)가 화면만으로 승인·배포·롤백 의사결정 가능(raw 로그는 접힘 보조).

### 8.4 SSOT 정합 ([00](../00-ux-common-standards.md) · C02/C04)
- [ ] 펌웨어 생명주기/배포 상태 분리. 정적분석 배포 차단 여부 명시. 호환성에 HMI/Telemetry 버전 포함.
- [ ] Audit Package zip export·승인 상태 구조. test case = expected/actual/result/log/waiver_status.
- [ ] 운영 반영·승인·정책 우회·롤백은 AuditEntry(actor/action/target/reason/before·after/result) 기록([00 §6](../00-ux-common-standards.md)).
- [ ] 상태·Gate·Audit·권한·DNA가 [00 SSOT](../00-ux-common-standards.md)와 일치(충돌 시 00 우선).

---

### 문서 정보 · 관련 문서
| 버전 | 일자 | 변경 |
| --- | --- | --- |
| v1.0 | 2026-06-02 | 최초 작성 — [00 공통 기준서](../00-ux-common-standards.md) 정합 |

**관련**: [00 공통 기준서](../00-ux-common-standards.md) · [01 Ops](01-ops-uxui-과업지시서.md) · [02 Build](02-build-uxui-과업지시서.md) · [03 Field](03-field-uxui-과업지시서.md) · [ADR](../adr/) · [화면 갭](../spec-gap.md)
