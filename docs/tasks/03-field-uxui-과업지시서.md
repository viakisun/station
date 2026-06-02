# 03. STATION Field HMI·Telemetry 현장 운영 UX/UI 설계 과업지시서

| 문서 코드 | JJ-UX-03 |
| --- | --- |
| 문서 유형 | 제품별 UX/UI 설계 과업지시서 (Statement of Work) |
| 대상 제품 | **Field (현장)** = H01 HMI 현장 운용 + T01 Telemetry 설정/캘리브레이션 |
| 단일 참조 (SSOT) | [00 공통 설계 기준서](../00-ux-common-standards.md) · [화면 갭](../spec-gap.md) |
| SSOT 원본 | H01 HMI 현장 운영·캘리브레이션 (JJ-H01) · T01 Telemetry 설정·캘리브레이션 (JJ-T01) |
| 상태 | 확정 과업 (미결정·대안은 [ADR](../adr/)로 분리) |
| 안전 등급 | **최상 (3제품 중 가장 엄격 — 물리적 안전이 걸린 현장 제품)** |
| 버전 | v1.0 · 2026-06-02 |

> 본 과업지시서는 [00 공통 기준서](../00-ux-common-standards.md)를 **단일 진실 공급원**으로 삼는다. 00과
> 충돌하는 어떤 규칙도 두지 않는다(충돌 시 00 우선). 특히 [§9.3 **Field 8원칙**](../00-ux-common-standards.md#93-field--현장-8원칙-필수)·[§5 **Gate 표현**](../00-ux-common-standards.md#5-gate-표현-원칙-4단계)·[§8 **권한 표현**](../00-ux-common-standards.md#8-권한-표현-원칙)(현장
> 오퍼레이터 e-stop 해제 하드 거부)은 본문에 그대로 싣고 화면별로 적용한다. 미결정 항목은 본문이 아니라
> [ADR](../adr/) 링크로 둔다.

---

## 1. 과업 개요

### 1.1 과업명
**STATION Field HMI·Telemetry 현장 운영 UX/UI 설계**

### 1.2 추진 배경
- STATION은 "6개 워크스페이스 한 앱"이 아니라 **사용자·디바이스·디자인 방향이 다른 3개 제품**이다([00 §1](../00-ux-common-standards.md#1-제품-구조--3제품--하나의-연결-조직), [ADR-001](../adr/ADR-001-product-split-strategy.md)).
- 그중 **Field**는 적과/적심 로봇의 현장 HMI 하드웨어와 Telemetry 장치 설정을 다루는 제품으로, 온실 현장의 오퍼레이터·유지보수 담당이 **장갑 낀 손**으로 **저해상도 HMI 패널**과 **태블릿**을 조작한다.
- 작업 시작·캘리브레이션·긴급정지처럼 **물리적 안전이 걸린 조작**이 화면 위에서 직접 일어나므로, Field는 3제품 중 **가장 엄격한 안전 UX**를 요구한다.
- 현 골격은 SSOT H01 12화면 중 사실상 커미셔닝 위저드만 구현되어 커버리지가 가장 낮다([화면 갭](../spec-gap.md), H01 ~17%).

### 1.3 목적
1. **5초 내 상태 파악**(HMI 홈)과 **위험 조작 실수 방지**(작업시작/캘리브/e-stop)를 양립시키는 현장 UX 확정.
2. 현장 폐루프 **Loop1(작업 수신→시작→반영)**·**Loop3(캘리브 필요→수행→저장→Ops/Incident 연결)**를 화면으로 닫는다([00 §10](../00-ux-common-standards.md#10-핵심-폐루프-5종-제품-경계-횡단--우선순위-기준)).
3. **현장 예외**(네트워크 지연·오프라인·버전 불일치)를 일관된 시각 언어로 표현한다.
4. Gate 차단([00 §5](../00-ux-common-standards.md#5-gate-표현-원칙-4단계))·Audit([00 §6](../00-ux-common-standards.md#6-audit--event-분리-원칙-adr-007))·Context handoff([00 §7](../00-ux-common-standards.md#7-context-handoff-표현-원칙))·권한([00 §8](../00-ux-common-standards.md#8-권한-표현-원칙))을 현장 화면에 반영한다.

### 1.4 대상 제품
| 항목 | 내용 |
| --- | --- |
| 제품 | Field (현장) |
| 워크스페이스 | H01(HMI 현장 운용·캘리브레이션) + T01(Telemetry 설정·품질) |
| 주 사용자 | 현장 오퍼레이터 · 유지보수 담당 (현장 관리자는 일부 승인 권한) |
| 디바이스 | HMI 1024×600 · HMI 800×480 · Tablet 1024×768 |
| 디자인 방향 | 큰 터치(HMI 64px)·고대비·안전 우선·<5s 글랜스·단계형 위저드 |
| 테마 | `[data-theme="field"]`([00 §4.2](../00-ux-common-standards.md#42-3-tier-디자인-토큰)) |

---

## 2. 과업 범위

### 2.1 대상 사용자 ([00 §8](../00-ux-common-standards.md#8-권한-표현-원칙))
권한 없는 액션은 **숨김이 아니라 비활성 + 사유 툴팁**, 위험 거부는 동작 차단.

| 역할 | Field에서의 V/E/A | 본 과업의 화면 반영 |
| --- | --- | --- |
| 현장 오퍼레이터 | V · 작업 제어 E(hold) · **e-stop 해제 불가(하드 거부)** | FIELD-04/05/12에서 hold-to-confirm·해제 차단 |
| 현장 관리자 | V · param/calib E · 현장 param A · **e-stop 해제 승인** | FIELD-10 Parameter Apply 승인, FIELD-12 해제 인증 |
| 유지보수 | V · calib/I/O E | FIELD-07/08/09 캘리브·I/O·Telemetry |

> **하드 거부([00 §8](../00-ux-common-standards.md#8-권한-표현-원칙))**: 현장 오퍼레이터는 **e-stop 해제 불가**. 해제 버튼은 시각(비활성+사유)·동작(차단) 모두 막고, 해제는 현장 관리자 권한 인증 + 복구 체크리스트 완료 후에만 가능.

### 2.2 대상 디바이스·해상도
| 해상도 | 디바이스 | 적용 화면 | 레이아웃 전략 |
| --- | --- | --- | --- |
| 1024×768 | Tablet(설치·유지보수) | T01 계열, H01 보조 | 베젤 스케일(현 `HmiFrame`), 2열 가능 |
| 1024×600 | HMI 패널(주 운용) | H01 전 화면 | 단일 판단 1열, 하단 고정 영역 |
| 800×480 | HMI 패널(소형) | H01 핵심(홈/작업/e-stop) | 정보 축약·핵심만, **터치 64px는 바닥값으로 불변** |

> 해상도 전략 원칙: 화면이 작아져도 **터치 최소값(HMI 64px)은 절대 줄이지 않는다**. 대신 정보 밀도·보조 정보를 접고, 상태/다음 행동/차단 사유의 고정 위치는 유지한다([00 §9.3 ①③⑧](../00-ux-common-standards.md#93-field--현장-8원칙-필수)).

### 2.3 대상 화면
- **H01-00~11 (12화면)** + **T01-00~10 (11화면)** = 총 **23개 SSOT 화면 전체**를 5장 표에 싣고 구현/미구현([화면 갭](../spec-gap.md))을 표시한다.
- 목업 산출물 **FIELD-01~12 (12본)** 을 SSOT 화면 ID에 매핑한다(5.3 매핑표).

### 2.4 제외 범위
- 서버 측 Gate 재검증·Command 서비스 구현(UX는 차단/확인까지, 서버 재검증은 후속 — [00 §5](../00-ux-common-standards.md#5-gate-표현-원칙-4단계)).
- 실시간 데이터 소스(Event Bus/MQTT/SSE) 추상화([ADR-003](../adr/ADR-003-realtime-protocol.md), Track C).
- 도메인 스키마 확장·시드 데이터(Track B — [화면 갭 §5](../spec-gap.md)).
- Ops(C01/C03)·Build(C02/C04) 제품 자체 화면 → 연결 지점만 Context handoff로 표현.
- 상태 색상 토큰 최종 정합([ADR-005](../adr/ADR-005-status-color-tokens.md))은 미결정 → 본문 재정의 금지, ADR 링크만.

---

## 3. UX/UI 설계 방향

### 3.1 제품 디자인 방향
Field 톤 = **명확·안전·즉시 판단**. 패밀리 DNA([00 §4.1](../00-ux-common-standards.md#41-패밀리-dna--불변--제품-테마가-절대-변경-금지))는 절대 불변(상태 배지 의미·색, mono tabular 숫자,
live dot `#1fb46a`, ink 단일 브랜드, 페이퍼화이트+hairline, 로봇 정체성, audit 정직성). Field 테마 override는
**밀도(낮게)·터치영역(크게)·radius(소프트)·고대비**에 한정하며 DNA는 건드리지 않는다([00 §4.2](../00-ux-common-standards.md#42-3-tier-디자인-토큰)).

### 3.2 정보 구조 원칙
정보 우선순위([00 §9.3](../00-ux-common-standards.md#93-field--현장-8원칙-필수), SSOT §4)= **1 안전/장애 → 2 작업 상태 → 3 로봇/모듈 상태 → 4 이력/설정**.
HMI는 홈(H01-01)을 허브로 하여 작업 제어·캘리브 허브·점검·e-stop을 **얕은 1뎁스**로 분기한다. Telemetry는
태블릿/Desktop 정보 밀도를 허용하되 캘리브·동기화·품질은 HMI 링크와 동일 상태 의미를 공유한다.

### 3.3 인터랙션 원칙 — Field 8원칙 (00 §9.3 전문 인용 + 화면 설계 규칙)

> **[[00 §9.3](../00-ux-common-standards.md#93-field--현장-8원칙-필수) 원문]** ① 한 화면에 하나의 주요 판단 ② 위험 액션은 항상 hold-to-confirm ③ 현재 상태/다음
> 행동/차단 사유를 항상 같은 위치 ④ 표 대신 key-value stack ⑤ 색상만으로 상태 전달 금지(아이콘·라벨
> 병행) ⑥ e-stop 화면은 일반 작업 흐름과 시각적으로 분리 ⑦ 네트워크 지연/오프라인을 상단 고정 영역
> ⑧ 장갑 낀 손 기준 터치영역(HMI 64px).

| 원칙 | 화면 설계 규칙(구체화) | 주 적용 화면 |
| --- | --- | --- |
| **① 한 화면 한 판단** | HMI 한 화면은 "지금 무엇을 할지" 1개 판단만 요구. 보조 정보는 드로어/다음 단계로 분리. 작업 제어·캘리브·e-stop을 한 화면에 섞지 않는다. | FIELD-01~12 전체 |
| **② hold-to-confirm** | 위험 액션(작업 시작·정지·캘리브 저장·param apply·e-stop)은 **버튼을 1.5~2초 누르고 있는 동안만** 실행. 누름 중 진행 링(progress ring)+사유 텍스트 표시. 단발 탭 금지. `confirm_required` Gate와 동일 패턴([00 §5](../00-ux-common-standards.md#5-gate-표현-원칙-4단계)). | FIELD-03/04/05/08/10/11/12 |
| **③ 상태/다음행동/차단사유 고정 위치** | 모든 H01 화면은 **상단=현재 상태바**, **중앙=주요 판단/다음 행동**, **차단 시 동일 위치에 차단 사유+해결 행동** 카드. 위치는 화면이 바뀌어도 이동하지 않는다. | FIELD-01~12 전체 |
| **④ 표 대신 KV 스택** | 현장 화면은 테이블 금지, **key-value stack**(현 `SumRow`/`PField` 패턴). 비교가 필요한 Telemetry 대시보드(태블릿)만 예외적 테이블 허용. | FIELD-01/02/07/10/11 |
| **⑤ 색만으로 상태 금지** | 모든 상태는 **아이콘+라벨+색** 3중 병행(현 `StatusBadge`=squared dot+mono 라벨, [00 §3](../00-ux-common-standards.md#3-공통-상태-체계)). 색각이상·고휘도 야외에서도 판독. | 전 화면 배지 |
| **⑥ e-stop 시각 분리** | e-stop 관련 화면(FIELD-11/12)은 일반 작업 흐름과 **완전히 다른 시각 모드**(전체 화면 잠금, emergency `#B71C1C` 프레임, 일반 nav 차단). 일반 화면의 E-STOP 버튼만 danger로 상시 노출. | FIELD-11/12 |
| **⑦ 지연/오프라인 상단 고정** | 네트워크 지연/오프라인은 **상단 고정 배너**(상태바 바로 아래)로 항상 표시. 오프라인 시 로컬 가능 기능과 제한 기능을 명시적으로 구분. | 전 화면 상단 |
| **⑧ 장갑 손 터치영역** | HMI 모든 인터랙티브 요소 **≥64px**(현 `TouchBtn` 56px → Field HMI 토큰에서 64px로 상향), 태블릿 ≥44px. 인접 버튼 간격 ≥12px. | 전 화면 |

### 3.4 상태/경고/위험 표현 원칙
- **상태 체계**([00 §3](../00-ux-common-standards.md#3-공통-상태-체계)): 로봇/모듈/작업/이벤트 심각도 6단계 시각 언어를 전 제품 동일 의미로 사용. 재정의 금지.
- **Gate 표현**([00 §5](../00-ux-common-standards.md#5-gate-표현-원칙-4단계), [ADR-006](../adr/ADR-006-gate-severity-model.md), 현장 강조): `pass`(진행)·`warn`(경고 배지+계속)·`confirm_required`(hold-to-confirm)·`blocked`(버튼 비활성 + **차단 사유 + 해결 행동** 동일 위치 카드). 현장에서 가장 중요한 게이트:

  | Gate | 현장 표현 | 화면 |
  | --- | --- | --- |
  | G1 Route-validation | 경로 미검증 시 작업 시작 `blocked`+사유 | FIELD-03 |
  | G3 Version-mismatch | map=blocked / parameter=confirm_required, 상단 버전 칩 | FIELD-03/10 |
  | G4 Calibration-before-work | 필수 캘리브 미완 시 작업 시작 `blocked` 또는 `confirm_required` | FIELD-03/07/08 |
  | G7 Incident-freeze | 대상 로봇 open critical 존재 시 시작 `blocked` | FIELD-03 |

- **Audit/Event 분리**([00 §6](../00-ux-common-standards.md#6-audit--event-분리-원칙-adr-007), [ADR-007](../adr/ADR-007-audit-vs-event-log.md)): 일반 상태 변화·통신 지연은 하단 이벤트 스트립(Event Log). 위험 전이·승인·정책 우회(작업 시작, e-stop 해제, 캘리브 저장, parameter apply)는 **확인 모달에 AuditEntry 고지**(`actor·action·target·reason·before/after·result`)를 동반한다.

---

## 4. 주요 사용자 흐름

### 4.1 핵심 시나리오
Field가 관여하는 **2개 폐루프**([00 §10](../00-ux-common-standards.md#10-핵심-폐루프-5종-제품-경계-횡단--우선순위-기준))를 단계+화면+공유 ID+게이트로 정의한다. Field 완료 기준 = 두 루프가 화면 단위로 닫힘 + e-stop 안전 분리.

**Loop1 — 작업 폐루프** (배정 Ops → 수신/시작 Field → 반영 Ops, 공유 스파인 `work_session_id`, 게이트 G1·G3·G4·G7)

| 단계 | 행위 | 화면 | 공유 ID | 게이트 |
| --- | --- | --- | --- | --- |
| 1 | 수신 — Ops 배정 `work_session_id` 도착, 출처 칩+돌아가기 | FIELD-02 (H01-02 수신) | `work_session_id`·`robot_id` | — |
| 2 | Gate Check — 시작 전 일괄 평가 | FIELD-03 (H01-02) | `work_session_id`·`route_id`·`parameter_version` | **G1·G3·G4·G7** |
| 3 | 시작 — hold-to-confirm + AuditEntry | FIELD-03→04 | `command_id` | confirm_required(hold) |
| 4 | 진행 — 진행률·다음 행동 고정 | FIELD-04 | `work_session_id` | — |
| 5 | 정지/재개/복귀 — 각 위험 전이 hold | FIELD-05 | `command_id` | confirm_required |
| 6 | 반영 — 진행/결과가 Ops 라이브 세션에 반영 | (Ops C01-06) | `work_session_id` | — |

> 완료 기준: 미검증 경로/버전 불일치/필수 캘리브 미완 시 **시작 차단**(G1/G3/G4), command·event는 동일 `work_session_id`로 연결.

**Loop3 — 캘리브 폐루프** (필요 G4 → 수행 Field → 저장 → Ops/Incident 연결, 공유 스파인 `calibration_profile_id`, 게이트 G4)

| 단계 | 행위 | 화면 | 공유 ID | 게이트 |
| --- | --- | --- | --- | --- |
| 1 | 필요 — G4 요구 또는 Incident 조치 가이드 진입 | FIELD-06 (H01-06 허브) | `incident_id`(수신 시) | **G4** |
| 2 | 수행 — 카메라-작업부 단계형 위저드 | FIELD-07 (H01-07) | `calibration_step` | — |
| 3 | 저장 — hold-to-confirm + Audit snapshot | FIELD-08 | `calibration_profile_id`(생성) | confirm_required |
| 4 | 연결/복귀 — `calibration_profile_id` 풍부화하여 Ops/Incident 연결 | (Ops C01/C03) | `calibration_profile_id`·`incident_id` | — |

> Telemetry 센서 캘리브(T01-03)는 HMI 캘리브 허브와 같은 프로파일·상태 의미를 공유한다.

### 4.2 화면 전이
```
[FIELD-01 홈]──작업→[FIELD-02 수신]──[FIELD-03 Gate Check]──pass+hold→[FIELD-04 진행]──[FIELD-05 정지/재개]
[FIELD-03]──blocked→[FIELD-06 차단 사유·조치]──(Incident 연결)
[FIELD-06/G4]──캘리브→[FIELD-07 단계]──hold 저장→[FIELD-08]──(Ops/Incident 연결)
[임의 화면 E-STOP]──→[FIELD-11 잠금]──해제 요청→[FIELD-12 권한 차단/인증]
```

### 4.3 Context handoff 흐름 ([00 §7](../00-ux-common-standards.md#7-context-handoff-표현-원칙), [ADR-002](../adr/ADR-002-context-envelope-transport.md))
- **운반 = ID만** 전달, 도착 화면이 재조회(단일 진실). 도착 시 상단 **출처 칩**("from Ops · RBT-THIN-0008") + **돌아가기(return)** 항상 표시.
- **Ops → Field**: 작업 배정 시 `work_session_id`·`robot_id`(FIELD-02), 장애 조치 시 `incident_id`·`robot_id`(FIELD-06) 수신.
- **Field → Ops/Incident**: 캘리브 완료 시 `calibration_profile_id`가 채워져 복귀(Loop3 풍부화), `incident_id` 연결.
- ID 미해결 시 사이트 수준으로 graceful degrade + 안내.

### 4.4 e-stop 흐름 (안전 분리)
1. 임의 화면의 상시 **E-STOP**(danger) → 즉시 전체 화면 잠금(FIELD-11), emergency 프레임.
2. 원인 표시 + 복구 체크리스트. **현장 오퍼레이터는 해제 불가**(FIELD-12에서 시각·동작 모두 차단, [00 §8](../00-ux-common-standards.md#8-권한-표현-원칙)).
3. 해제는 **현장 관리자 권한 인증 + 복구 체크리스트 완료** 후에만 가능. 해제 시 AuditEntry 필수([00 §6](../00-ux-common-standards.md#6-audit--event-분리-원칙-adr-007)).
4. Incident 상세로 이동 가능(`incident_id` handoff).

---

## 5. 화면 설계 범위 (전체 목록 · 기능 · 데이터 · 인터랙션)

> 구현 상태는 [화면 갭](../spec-gap.md) 기준. ✅이식 · 🟡부분 · ❌미구현. FIELD = 본 과업 목업 산출물. 모든 ID는 mono·tabular([00 §2](../00-ux-common-standards.md#2-공유-id-스파인-cross-product-join-keys)).

### 5.1 H01 HMI — 12화면

| 화면 ID | 화면명 | 핵심 기능 | 주요 데이터(KV) | 인터랙션 | 구현 |
| --- | --- | --- | --- | --- | --- |
| H01-00 | HMI 부팅·페어링 | 장치-로봇-플랫폼 연결, Telemetry 상태 확인 | HMIDevice·Robot·PairingCode·NetworkStatus | 코드 입력·재시도·로컬 모드 | 🟡 부분(커미셔닝 connect) |
| H01-01 | HMI 홈 상태판 | 5초 글랜스: 로봇·작업·모듈·안전·Telemetry | Robot·WorkSession·Module·SafetyState·TelemetryStatus | 작업제어/캘리브/장애/Telemetry 열기 | 🟡 부분(`HmiHome`) |
| H01-02 | 작업 빠른 제어 | 배정 작업 시작/정지/재개/종료/복귀 | WorkSession·Command·Route·SafetyState | 큰 버튼 5개·hold·확인 모달 | ❌ |
| H01-03 | 수동 조그·안전 이동 | 제한속도 수동 이동(점검·캘리브) | RobotAxis·SafetyZone·MaintenanceMode | hold-to-move·속도 슬라이더·안전구역 경고 | ❌ |
| H01-04 | 로봇 파라미터 관리 | 운용 파라미터 조회/권한 수정 | RobotParameterSet·AuditLog | 값 수정·검증·apply·복원·사유 | ❌ |
| H01-05 | 온실/작업 파라미터 관리 | 행간격·임계값 등 환경 파라미터 | GreenhouseParameter·CropProfile·Map·Route | 로컬 저장·플랫폼 동기화·버전 불일치 | ❌ |
| H01-06 | 캘리브레이션 허브 | 모든 현장 캘리브 시작/이력 | CalibrationProfile·CalibrationRequirement | 카드 그리드·시작·Audit snapshot | ❌ |
| H01-07 | 카메라-작업부 캘리브 단계 | 좌표 보정 단계형 위저드 | CalibrationStep·TargetMarker·ValidationResult | 마커 인식·기준점·테스트·재시도 | ❌ |
| H01-08 | 모듈 Health·I/O 모니터 | 연결·I/O·센서값·오류코드 점검 | Module·IOStatus·TelemetryChannel·ErrorCode | I/O 테스트·오류 복사·조치 링크·리셋 | ❌ |
| H01-09 | Telemetry 링크·네트워크 | 연결·신호·버퍼·동기화 상태 | TelemetryDevice·NetworkStatus·SyncState | 재연결·sync 강제·진단 export | ❌ |
| H01-10 | 점검 체크리스트·유지보수 모드 | 작업 전/후 점검, 모드 전환 | MaintenanceChecklist·WorkSession | 체크·모드 진입/해제·서명·제출 | ❌ |
| H01-11 | 긴급정지 잠금·복구 | e-stop 상태 표시·복구 조건 | SafetyState·Incident·RecoveryChecklist | 전체화면 잠금·체크·관리자 인증 | ❌ |

### 5.2 T01 Telemetry — 11화면

| 화면 ID | 화면명 | 핵심 기능 | 주요 데이터 | 인터랙션 | 구현 |
| --- | --- | --- | --- | --- | --- |
| T01-00 | Telemetry 장치 온보딩 | 하드웨어를 로봇·온실·HMI·플랫폼 연결 | TelemetryDevice·Robot·PairingCode | 검색·페어링·네트워크 테스트 | ❌ |
| T01-01 | Telemetry 개요 대시보드 | 장치·채널·품질·지연·버퍼·동기화 | TelemetryChannel·DataQuality·SyncState | 상세·매핑·진단·HMI 링크 | ✅ 이식(`MonitorView`) |
| T01-02 | 채널 맵 빌더 | 원천 신호→표준 채널 매핑 | RawSignal·TelemetryChannel·UnitMap | 매핑·단위 변환·Audit 검증 | ✅ 이식(`ChannelMapBuilder`) |
| T01-03 | 센서 캘리브레이션 매니저 | zero/span·offset·scale 보정 | CalibrationProfile·ReferenceValue | wizard·검증·저장·rollback·HMI 전송 | ✅ 이식(`SensorCalib`) |
| T01-04 | 온실 환경 파라미터 레지스트리 | 구역별 환경 파라미터 표준 관리 | GreenhouseParameter·EnvironmentProfile | 발행·HMI 동기화·diff 비교 | ❌ |
| T01-05 | 프로토콜·토픽 매핑 | transport·topic·payload·auth | ProtocolProfile·TopicMap·PayloadSchema | test publish·저장 | ❌ |
| T01-06 | 샘플링/임계값 정책 | 주기·threshold·이벤트 승격 | SamplingPolicy·ThresholdPolicy·EventRule | rule 빌더·이벤트 폭주 시뮬 | ✅ 이식(`SamplingPolicy`) |
| T01-07 | 엣지 버퍼·동기화 상태 | 로컬 저장·재전송·누락 구간 | EdgeBuffer·SyncJob·DataGap | 강제 동기화·재전송·gap 상세 | ❌ |
| T01-08 | 데이터 품질 진단 | 누락·지연·drift·단위 오류 | DataQualityReport·CalibrationProfile | 캘리브 요청·incident 생성·export | ✅ 이식(`QualityDiag`) |
| T01-09 | 설정 Export/Import·Audit Snapshot | 설정·캘리브·파라미터 패키지 | TelemetryConfigPackage·AuditPackage | export·import 검증·snapshot·HMI 전송 | ❌ |
| T01-10 | Telemetry 장치 펌웨어·Health | 펌웨어·리소스·재시작 이력 | TelemetryDevice·Firmware·DeviceMetric | 재시작·업데이트 계획·로그 | ❌ |

> 우선순위는 화면 수가 아니라 **Loop1/Loop3가 닫히는지**로 정한다([00 §10](../00-ux-common-standards.md#10-핵심-폐루프-5종-제품-경계-횡단--우선순위-기준)).

### 5.3 FIELD-01~12 목업 ↔ SSOT 화면 ID 매핑

| 목업 ID | 목업 화면 | SSOT 매핑 | Field 8원칙 핵심 적용 | Gate/Audit/권한 | 폐루프 |
| --- | --- | --- | --- | --- | --- |
| FIELD-01 | HMI Home | H01-01 | ①③⑤⑦ 글랜스 허브 | Context 출처 칩 | 진입 |
| FIELD-02 | 작업 패키지 수신 | H01-02(수신) | ③④ KV로 패키지 요약 | from Ops handoff([00 §7](../00-ux-common-standards.md#7-context-handoff-표현-원칙)) | Loop1 |
| FIELD-03 | 작업 시작 전 Gate Check | H01-02 + [00 §5](../00-ux-common-standards.md#5-gate-표현-원칙-4단계) | ②③ blocked 사유+해결 행동 | **G1/G3/G4/G7** | Loop1 |
| FIELD-04 | 작업 진행 | H01-02 | ①③⑦ 진행률·다음 행동 고정 | Audit(시작) | Loop1 |
| FIELD-05 | 정지·재개 | H01-02 | ② hold 위험 전이 | Audit(정지/재개) | Loop1 |
| FIELD-06 | 차단 사유·조치 안내 | H01-02/06 + Incident guide | ③ 차단 사유+해결 동일 위치 | blocked 표현, Incident 연결 | Loop1·3 |
| FIELD-07 | Calibration Step | H01-07 | ②③ 단계형·hold 테스트 동작 | G4 | Loop3 |
| FIELD-08 | Calibration 저장 | H01-06/07 | ② hold 저장 | Audit snapshot, `calibration_profile_id` | Loop3 |
| FIELD-09 | Telemetry 상태 | H01-09 / T01-01 | ⑤⑦ 지연/오프라인 상단 | Event Log | 공통 |
| FIELD-10 | Parameter Apply | H01-04/05 | ②③④ apply hold·사유·rollback | G3(version), Audit(apply), 현장 param A | 공통 |
| FIELD-11 | Emergency Stop | H01-11 | ⑥ 시각 분리·전체화면 잠금 | emergency, Audit | 안전 |
| FIELD-12 | E-stop 해제 요청·권한 차단 | H01-11 + [00 §8](../00-ux-common-standards.md#8-권한-표현-원칙) | ②⑥ **오퍼레이터 해제 하드 거부** | 관리자 권한+복구 체크리스트, Audit | 안전 |

---

## 6. 디자인 시스템 적용 기준 ([00 §4](../00-ux-common-standards.md#4-공통-디자인-언어))

### 6.1 DNA·3-tier ([00 §4](../00-ux-common-standards.md#4-공통-디자인-언어))
- 패밀리 DNA 7항은 불변. 컴포넌트는 semantic 토큰·유틸클래스만 소비, Field 테마는 `[data-theme="field"]` 레이어로 동작.
- Field override 허용 범위: **밀도(낮음)·터치영역(큼)·radius(소프트)·고대비**. 상태 색·배지 형태·mono 숫자·live dot은 절대 변경 금지([00 §4.1](../00-ux-common-standards.md#41-패밀리-dna--불변--제품-테마가-절대-변경-금지)).

### 6.2 Field 테마 토큰
| 토큰 | Field 값/규칙 | 근거 |
| --- | --- | --- |
| 터치 최소 | HMI 64px / 태블릿 44px (간격 ≥12px) | [00 §9.3 ⑧](../00-ux-common-standards.md#93-field--현장-8원칙-필수), SSOT §4 |
| radius | 소프트(현 `--r-md`보다 크게) | Field 친화·오작동 방지 |
| 대비 | 고대비(야외·고휘도 가독) | 안전 우선 |
| 상태 색 | 6단계 의미·아이콘·라벨 동일. 색상값은 [ADR-005](../adr/ADR-005-status-color-tokens.md)(기본=프로토타입 절제값 유지) | [00 §3](../00-ux-common-standards.md#3-공통-상태-체계) |
| live dot | `#1fb46a` 불변 | [00 §4.1](../00-ux-common-standards.md#41-패밀리-dna--불변--제품-테마가-절대-변경-금지) |

> 색상 토큰 정합: 프로토타입 `tokens.css`는 절제값(`--st-normal #3a7d4a` 등), SSOT는 고채도값을 지정한다. "디자인 보존" 원칙상 현 프로토타입 값을 유지하되 의미·아이콘·라벨은 동일. 최종 정합은 [ADR-005](../adr/ADR-005-status-color-tokens.md).

### 6.3 핵심 패턴
- **hold-to-confirm**: 위험 액션 표준 컴포넌트. 누름 진행 링 + 사유 텍스트 + 완료 시 AuditEntry 고지. `confirm_required` Gate와 동일 UX([00 §5](../00-ux-common-standards.md#5-gate-표현-원칙-4단계)·[§6](../00-ux-common-standards.md#6-audit--event-분리-원칙-adr-007)).
- **안전 배너**: 상단 고정 영역(상태바 하단). 지연/오프라인/버전 불일치/캘리브 due를 6단계 심각도 색+아이콘+라벨로([00 §9.3 ⑦](../00-ux-common-standards.md#93-field--현장-8원칙-필수)).
- **KV 스택**: 현장 화면 기본 표현(현 `SumRow`/`PField`). 테이블은 태블릿 Telemetry 대시보드 한정([00 §9.3 ④](../00-ux-common-standards.md#93-field--현장-8원칙-필수)).
- **상태 배지**: `StatusBadge`(squared 3px dot + mono 라벨), 색만 의존 금지([00 §3](../00-ux-common-standards.md#3-공통-상태-체계)).

### 6.4 해상도 전략 (베젤/스케일, 터치 최소값은 바닥)
- 현 `HmiFrame`(1024×768 태블릿 베젤 + center scale)을 기준으로, HMI 1024×600·800×480 프레임을 추가.
- 스케일은 **레이아웃 비율**만 조정. **터치 64px는 스케일 후에도 물리 64px 이상 보장**(스케일이 줄이지 못함).
- 800×480에서는 보조 정보(모듈 세부·이력)를 접고 핵심 판단/다음 행동/차단 사유/E-STOP만 유지([00 §9.3 ①③⑥⑧](../00-ux-common-standards.md#93-field--현장-8원칙-필수)).

---

## 7. 산출물

| # | 산출물 | 형식 | 비고 |
| --- | --- | --- | --- |
| 1 | UX Flow | 다이어그램 | Loop1·Loop3·e-stop 흐름(단계·화면·공유 ID·게이트) |
| 2 | Wireframe | FIELD-01~12 저충실도 | 고정 위치(상태/판단/차단)·KV 스택·64px 터치 |
| 3 | Hi-fi 목업 | FIELD-01~12 고충실도 | field 테마·hold-to-confirm·안전 배너·e-stop 분리 |
| 4 | 화면 캡처 PDF | 23개 SSOT 화면 매핑 + FIELD 목업·예외(오프라인/지연/blocked) | 1본 |
| 5 | 개발 인계 문서 | Field 테마 토큰·hold/안전배너/KV 컴포넌트·해상도 프레임(1024×768/600·800×480)·context envelope([ADR-002](../adr/ADR-002-context-envelope-transport.md)) | 1본 |

---

## 8. 검수 기준

| 기준 | 충족 조건 |
| --- | --- |
| **화면 커버리지** | H01-00~11 + T01-00~10 전체 23화면이 5장에 정의·구현 상태 표기. FIELD-01~12가 SSOT ID에 매핑 |
| **사용자 흐름 충족** | Loop1(수신→Gate→시작→진행→반영)·Loop3(필요→수행→저장→연결)가 화면 단위로 연결, `work_session_id`·`calibration_profile_id`로 추적 |
| **상태/경고/위험 표현** | 6단계 심각도([00 §3](../00-ux-common-standards.md#3-공통-상태-체계))를 아이콘+라벨+색으로. HMI 1024×600/800×480에서 핵심 정보 미손실 |
| **Gate 표현** | G1·G3·G4·G7이 4단계로 표현, `blocked`/`confirm_required`는 **사유+해결 행동** 동반(FIELD-03/06) |
| **Audit/Event 분리** | Event Log(이벤트 스트립)와 Audit Log(작업 시작·캘리브 저장·param apply·e-stop 해제 고지) 분리([00 §6](../00-ux-common-standards.md#6-audit--event-분리-원칙-adr-007)) |
| **Permission 표현** | **현장 오퍼레이터는 FIELD-12에서 e-stop 해제 버튼이 시각(비활성+사유)·동작(차단) 모두 차단**([00 §8](../00-ux-common-standards.md#8-권한-표현-원칙)). 해제는 현장 관리자 인증+복구 체크리스트 후에만 |
| **Field 8원칙** | [§3.3](#33-인터랙션-원칙--field-8원칙-00-93-전문-인용--화면-설계-규칙) 8원칙이 각 화면에서 검증(한 판단/hold/고정위치/KV/색+라벨/e-stop 분리/상단 배너/64px) |
| **위험 액션 실수 방지** | 작업 시작·캘리브 저장·param apply·e-stop 모두 hold-to-confirm + Audit 고지 |
| **개발 인계 가능성** | Field 테마 토큰·hold/안전배너/KV 컴포넌트·해상도 프레임·context envelope가 인계 문서로 전달 |
| **Field 완료 기준** | **현장 실행/안전 폐루프 Loop1·Loop3가 닫힘 + 8원칙 충족 + 위험 액션 실수 방지 + e-stop 시각 분리**([00 §10](../00-ux-common-standards.md#10-핵심-폐루프-5종-제품-경계-횡단--우선순위-기준)) |

---

### 문서 정보 · 관련 문서
| 버전 | 일자 | 변경 |
| --- | --- | --- |
| v1.0 | 2026-06-02 | 최초 작성 — [00 공통 기준서](../00-ux-common-standards.md) 정합 |

**관련**: [00 공통 기준서](../00-ux-common-standards.md) · [01 Ops](01-ops-uxui-과업지시서.md) · [02 Build](02-build-uxui-과업지시서.md) · [03 Field](03-field-uxui-과업지시서.md) · [ADR](../adr/) · [화면 갭](../spec-gap.md)
