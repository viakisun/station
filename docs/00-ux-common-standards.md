# 00. STATION UX/UI 공통 설계 기준서 (SSOT)

| 문서 코드 | JJ-UX-00 |
| --- | --- |
| 문서 유형 | UX/UI 공통 설계 기준서 (Single Source of Truth) |
| 적용 범위 | STATION Ops · Build · Field 3제품 전체 |
| 상태 | 확정 원칙 (미결정 항목은 [ADR](adr/)로 분리) |
| 연결 문서 | [01 Ops 과업지시서](tasks/01-ops-uxui-과업지시서.md) · [02 Build](tasks/02-build-uxui-과업지시서.md) · [03 Field](tasks/03-field-uxui-과업지시서.md) · [화면 갭](spec-gap.md) |

## 0. 문서 목적과 위상

본 문서는 STATION 3제품 UX/UI 과업의 **단일 진실 공급원**이다. 제품 구조, 공유 도메인, 공통 디자인 언어,
상태 체계, Gate/Audit/Permission/Context 표현 원칙을 **확정 원칙**으로 정의한다. 3개 과업지시서는 본
문서를 단일 참조로 삼아 정합을 유지한다. 본 문서에는 **확정된 원칙만** 담으며, 미결정·제안은 ADR로 분리한다.

> 표기: 본문은 전부 확정. 결정 대기/대안은 본문에 쓰지 않고 `[ADR-00x]`로 링크한다.

---

## 1. 제품 구조 — 3제품 × 하나의 연결 조직

STATION은 "6개 워크스페이스 한 앱"이 아니라 **사용자·디바이스·디자인 방향이 다른 3개 제품**이며,
하나의 **Platform Core / Integration Fabric**으로 유기적으로 연결된다.

| 제품 | 워크스페이스 | 주 사용자 | 디바이스 | 디자인 방향 |
| --- | --- | --- | --- | --- |
| **Ops (관제)** | C01 맵·경로·작업·실시간 + C03 장애 | 운영관리자·관제 오퍼레이터 | Desktop 1440×900 | enterprise 고밀도·맵 중심·상태 우선 (live/console 이중 모드) |
| **Build (개발·릴리즈)** | C02 Audit/DevKit/SDK + C04 펌웨어/OTA | 제조사 개발자·통합담당·배포관리자 | Desktop | 운영형 배포 콘솔 (터미널/로그는 보조 레이어) |
| **Field (현장)** | H01 HMI + T01 Telemetry | 현장 오퍼레이터·유지보수 | Tablet 1024×768 · HMI 1024×600/800×480 | 큰 터치·고대비·안전 우선·<5s 글랜스 |

연결의 실체 = **공유 ID 스파인**(§2) + **Gate/Audit/Permission/Context 표현 원칙**(§5~§8)의 공유.
같은 `robot_id`·`work_session_id`·`module_id`가 제품 경계를 넘어 따라가며 같은 상태 의미·게이트 판정·감사
기록을 공유한다.

---

## 2. 공유 ID 스파인 (cross-product join keys)

모든 화면은 동일 ID 체계로 객체를 가리키고 제품 간 이동 시 ID로 컨텍스트를 운반한다.

| ID | 패턴 | 조인 범위(제품) |
| --- | --- | --- |
| Robot | `RBT-(THIN\|PINCH)-NNNN` | Ops·Build·Field 전체 (크로스 컨텍스트 선택 키) |
| WorkSession | `WKS-YYYYMMDD-NNNNN` | **작업 스파인** — Command·Event·Incident·Result 연결 |
| Module | `MOD-TYPE-Vnn-NNNN` | **모듈 스파인** — Audit→Firmware→HMI/Telemetry→Incident |
| Incident | `INC-YYYYMMDD-NNNN` | Ops·Field·Build |
| CalibrationProfile | `CAL-RBT-NNNN-…-DATE-X` | Field·Ops·Build (조치 결과 연결) |
| AuditPackage | `AUD-MOD-…-DATE-NN` | Build (승인-보유 아티팩트) |
| Map / Route | `MAP-<GH>-vN` · `RT-<GH>-(THIN\|PINCH)-NN` | Ops·Field |

> 화면 표기 규칙: 모든 ID는 mono 폰트·tabular 숫자로 표시한다. ID 문법 신규 항목(FW-/DEP-/CMD-)은 [ADR-004].

---

## 3. 공통 상태 체계

모든 워크스페이스에서 동일한 상태값·색상·문구를 사용한다.

| 상태군 | 값 |
| --- | --- |
| 로봇 | offline · online · idle · ready · working · paused · returning · maintenance · fault · emergency_stop |
| 모듈 | unknown · disconnected · initializing · normal · warning · degraded · fault · maintenance · disabled |
| 작업 | planned · assigned · ready · running · paused · blocked · completed · failed · cancelled |
| 이벤트 심각도 | info · notice · warning · critical · emergency |
| 펌웨어 배포 | draft · analyzing · blocked · approved · scheduled · deploying · success · failed · rollback_required · rolled_back |
| Audit | draft · submitted · running · passed · failed · waiver_required · approved · expired |
| Incident | open · ack · in_progress · monitoring · resolved · **closed** [ADR-009] |

**6단계 심각도 시각 언어**(전 제품 동일 의미): `normal · notice · warning · critical · emergency · disabled`.
배지 = squared(3px) + 점(dot) + mono 라벨. 색상 토큰 값은 [ADR-005] 참조(기본=프로토타입 절제값 유지).

---

## 4. 공통 디자인 언어

### 4.1 패밀리 DNA (불변 — 제품 테마가 절대 변경 금지)
1. **상태 의미·배지 형태**: 6단계 의미와 squared dot+mono 배지. 크기는 스케일 가능, 의미·색은 불변.
2. **mono tabular 숫자**: 모든 ID·타임스탬프·지표·버전·퍼센트.
3. **인광 그린 live dot** `#1fb46a` = "지금 라이브/스트리밍/정상". 값 불변.
4. **ink = 단일 브랜드**: primary 액션·active nav·focus는 ink/near-black. 경쟁 브랜드색 금지.
5. **페이퍼화이트 중립 + hairline 보더**.
6. **로봇 정체성**: Thin=채운 점, Pinch=빈 점. Battery 표현 동일.
7. **audit·안전 정직성**: 위험 액션의 hold-to-confirm + 감사 기록 고지.

> 일관성 테스트: 임의 두 제품 간 배지·배터리를 코드 변경 없이 교체해도 어색하지 않아야 한다.

### 4.2 3-tier 디자인 토큰
`primitive(raw)` → `semantic(역할)` → `product theme([data-theme="ops|build|field"])`. 컴포넌트는 semantic
토큰·유틸클래스만 소비하므로 테마는 레이어로 동작한다. 제품별 override는 밀도·터치영역·강조·타이포·radius·
모션에 한정하고 §4.1 DNA는 건드리지 않는다. (구현 마이그레이션은 개발 인계 문서.)

---

## 5. Gate 표현 원칙 (4단계)

안전·정합 규칙(SSOT 완료 기준)은 **일급 Gate**로 표현한다. 모든 제품이 동일 판정을 공유한다. [ADR-006]

```
GateSeverity = pass | warn | confirm_required | blocked
```
| 레벨 | UI 표현 |
| --- | --- |
| `pass` | 사용 가능 (정상 진행) |
| `warn` | 주의 후 진행 가능 (경고 배지 + 계속) |
| `confirm_required` | hold-to-confirm 필요 (이유 명시 후 길게 눌러 실행) |
| `blocked` | 진행 불가 (버튼 비활성 + **차단 사유 + 해결 행동** 표시) |

**게이트 ↔ 기본 레벨**

| Gate | 의미 | 기본 레벨 |
| --- | --- | --- |
| G1 Route-validation | 경로 검증 통과 | blocked |
| G2 Firmware-release | 분석·호환·audit 충족 | blocked |
| G3 Version-mismatch | map/parameter 버전 일치 | map=blocked, parameter=confirm_required/warn [ADR-…] |
| G4 Calibration-before-work | 필수 캘리브 완료 | blocked 또는 confirm_required |
| G5 Audit→operational | AuditPackage approved | blocked |
| G6 Deploy-preflight | 배터리·오프라인·호환·윈도우 | blocked |
| G7 Incident-freeze | 대상 로봇 open critical 없음 | blocked |

**핵심 규칙**: 게이트가 `blocked`/`confirm_required`일 때 UI는 반드시 **(a) 차단/확인 사유**와 **(b) 해결 행동**을
함께 보여준다. 클라이언트는 UX 차단·확인에, 서버는 동일 정책 재검증에 사용한다(서버 재검증은 후속).

---

## 6. Audit / Event 분리 원칙 [ADR-007]

두 로그를 **명확히 구분**한다(화면 표현도 분리).

| 구분 | 내용 | 화면 |
| --- | --- | --- |
| **Event Log** | 센서 이벤트·상태 변화·실시간 알림·command 결과·telemetry 이상 | 이벤트 스트림·실시간 스트립·타임라인 |
| **Audit Log** | 사람의 승인 행위·위험 액션·정책 우회·운영 반영(배포 승인·e-stop 해제·캘리브 저장·incident close·parameter apply) | 감사 로그 뷰어·위험 액션 확인 모달 고지 |

> 규칙(교정): "모든 상태변경"이 아니라 **모든 위험 전이·승인 행위·정책 우회·운영 반영 액션**이 커밋 전
> AuditEntry(`actor·action·target·reason·before/after·result`)를 생성한다. 일반 상태 이벤트는 Event Log로.

---

## 7. Context Handoff 표현 원칙

제품 경계를 넘는 이동 시 선택 컨텍스트(robot/work_session/incident/module/calibration 등)를 운반·복원한다. [ADR-002]
- 타깃 화면 상단에 **"from Ops · RBT-THIN-0008" 출처 칩** + **돌아가기(return)** 경로를 항상 표시.
- 운반 컨텍스트는 **ID만** 전달하고 대상 화면이 재조회(단일 진실). 왕복은 컨텍스트를 풍부화
  (예: Field 캘리브 완료 후 `calibration_profile_id`가 채워져 Ops로 복귀).
- 도착 시 관련 객체 자동 선택(드로어 열림·incident 포커스·모듈 스크롤). ID 미해결 시 사이트 수준으로 graceful degrade + 안내.

---

## 8. 권한 표현 원칙

6역할 × 제품 × (조회 V / 실행 E / 승인 A). 권한 없는 액션은 **숨김이 아니라 비활성 + 사유 툴팁**, 위험 거부는 차단.

| 역할 \ 영역 | Ops | Build | Field |
| --- | --- | --- | --- |
| 현장 오퍼레이터 | V·작업 제어 E | — | V·작업 제어 E(hold) · **e-stop 해제 불가** |
| 현장 관리자 | V·assign/param E·조치완료 | V | V·param/calib E·현장 param A |
| 유지보수 | V·remediation E·close 요청 | V·I/O·test E | V·calib/I/O E |
| 제조사 개발자 | — | V(자사)·profile/simulate E · **운영반영 승인 불가** | — |
| 배포 관리자 | V | V·plan/canary/rollback E·release A(부분) | V |
| 시스템 관리자 | V·E·A all | V·E·A all·위험정책 | V·E·A all |

**하드 거부(시각·동작 모두 차단)**: 현장 오퍼레이터 ≠ e-stop 해제, 제조사 개발자 ≠ 운영 반영 승인.

---

## 9. 제품별 정보구조·인터랙션 원칙

### 9.1 Ops — 고밀도 관제
다수 로봇 상태를 빠르게 파악. 맵·드로어·큐·테이블 중심, density-compact 기본. 정보 우선순위 = 1 안전/장애
2 작업 상태 3 로봇/모듈 4 이력/설정. live(실시간)/console(관리·설정) 이중 모드.

### 9.2 Build — 운영형 배포 콘솔 (터미널은 보조)
의사결정 화면(승인 상태·호환성·**차단 사유**·배포 대상·롤백 전략)은 **카드/테이블/타임라인**으로 명확히.
터미널/로그 미학은 **브랜드 톤 + 보조 레이어**(로그·테스트 결과·static analysis·deploy progress)로만. 비개발자
(통합담당·배포관리자)도 이해 가능해야 함 → 과한 터미널화 금지.

### 9.3 Field — 현장 8원칙 (필수)
① 한 화면에 하나의 주요 판단 ② 위험 액션은 항상 hold-to-confirm ③ 현재 상태/다음 행동/차단 사유를 항상
같은 위치 ④ 표 대신 key-value stack ⑤ 색상만으로 상태 전달 금지(아이콘·라벨 병행) ⑥ e-stop 화면은 일반
작업 흐름과 시각적으로 분리 ⑦ 네트워크 지연/오프라인을 상단 고정 영역 ⑧ 장갑 낀 손 기준 터치영역(HMI 64px).

---

## 10. 핵심 폐루프 5종 (제품 경계 횡단 — 우선순위 기준)

| Loop | 흐름 | 공유 스파인 | 게이트 |
| --- | --- | --- | --- |
| 1 작업 | 배정(Ops) → 수신(Field) → 시작(Field) → 반영(Ops) | work_session_id | G1·G3·G4 |
| 2 장애 | Event → Incident(Ops) → 조치(Field) → 재발·Close(Ops) | work_session_id+incident_id | G7 |
| 3 캘리브 | 필요(G4) → 수행(Field) → 저장 → Ops/Incident 연결 | calibration_profile_id | G4 |
| 4 펌웨어 | 승인(Build) → 계획 → 진행 → 롤백/Audit | firmware_id→deployment_plan_id | G2·G6 |
| 5 audit | Audit 승인(Build) → 운영 전환 → Gate 반영 | module_id+audit_package_id | G5 |

→ 목업 제작·구현 우선순위는 **화면 수가 아니라 위 5루프가 닫히는지**로 정한다.

---

## 11. 산출물·검수 공통 기준
- 모든 과업지시서는 §3(과업지시서 공통 목차, [01]~[03])을 따른다.
- 화면은 상태/경고/위험을 §3 상태 체계·§5 Gate·§6 Audit 표현으로 시각화한다.
- 컨텍스트 이동(§7)·권한(§8)·제품 원칙(§9)이 화면에 반영돼야 한다.
- 미결정은 본문이 아니라 [ADR](adr/)에 둔다.

## 12. 결정 대장 (요약 — 상세는 [adr/](adr/))
ADR-001 제품 분리(단계적) · 002 Context 전송 · 003 실시간 프로토콜 · 004 ID 문법 · 005 상태 색상 ·
006 Gate 4단계 · 007 Audit/Event 분리 · 008 async 전환 · 009 Incident `closed`.
