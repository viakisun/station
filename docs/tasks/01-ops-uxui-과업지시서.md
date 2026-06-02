# 01. STATION Ops 관제 운영 시스템 UX/UI 설계 과업지시서

| 문서 코드 | JJ-UX-01 |
| --- | --- |
| 문서 유형 | 제품별 UX/UI 설계 과업지시서 (Statement of Work) |
| 대상 제품 | **Ops (관제)** = C01 맵·경로·작업·실시간 + C03 장애·오류·품질 |
| 단일 참조 (SSOT) | [00 공통 설계 기준서](../00-ux-common-standards.md) · [화면 갭](../spec-gap.md) |
| SSOT 원본 | C01 통합 관제·맵·경로·멀티로봇 (JJ-C01) · C03 장애·오류·품질 이벤트 (JJ-C03) |
| 상태 | 확정 과업 (미결정·대안은 [ADR](../adr/)로 분리) |
| 버전 | v1.0 · 2026-06-02 |

> 본 과업지시서는 [00 공통 기준서](../00-ux-common-standards.md)를 **단일 진실 공급원**으로 삼는다.
> 상태값·Gate 4단계·Audit/Event 분리·권한·DNA·색상 토큰은 00을 **그대로 따르며 재정의하지 않는다**(링크·요약만).
> 00 §11 산출물·검수 기준과 §3(과업지시서 공통 목차)을 준수한다.

---

## 1. 과업 개요

### 1.1 과업명
**STATION Ops 관제 운영 시스템 UX/UI 설계**

### 1.2 추진 배경
- STATION은 사용자·디바이스·디자인 방향이 다른 **3개 제품(Ops·Build·Field)** 으로 분리 운영되며, 하나의 Platform Core로 연결된다([00 §1](../00-ux-common-standards.md#1-제품-구조--3제품--하나의-연결-조직), [ADR-001](../adr/ADR-001-product-split-strategy.md)).
- Ops는 그중 **관제 제품**으로, 다수의 적과·적심 로봇을 실시간으로 모니터링하고 작업을 배정·추적하며 장애를 조치·종료하는 **운영의 중심 허브**다.
- 현재 골격은 대표 화면만 이식되어 있다. [갭 분석](../spec-gap.md) 기준 C01 6/10(60%)·C03 6/11(55%)만 구현되어 있고, **작업 폐루프(Loop1)·장애 폐루프(Loop2)** 가 화면 단위로 끊겨 있다.
- 본 과업은 끊긴 폐루프를 닫고, 00 기준서의 상태·Gate·Audit·권한·Context 표현을 Ops 전 화면에 일관 적용하는 UX/UI 설계 기준을 확정한다.

### 1.3 목적
1. **다수 로봇 상태의 빠른 파악** — enterprise 고밀도·맵 중심·상태 우선 화면으로 한눈에 안전/작업/로봇 상태 판단([00 §9.1](../00-ux-common-standards.md#91-ops--고밀도-관제)).
2. **작업 폐루프(Loop1)** — 배정(Ops) → 현장 실행(Field) → 상태 반영(Ops)을 `work_session_id` 한 축으로 닫는다([00 §10](../00-ux-common-standards.md#10-핵심-폐루프-5종-제품-경계-횡단--우선순위-기준)).
3. **장애 폐루프(Loop2)** — Event → Incident(Ops) → 조치(Field) → 재발 확인·Close(Ops)를 `incident_id`로 닫는다.
4. **일관된 위험·경고·정상 시각 언어** — 00 §3 6단계 심각도·§5 Gate 4단계·§6 Audit/Event 분리를 모든 화면에 동일 적용.

### 1.4 대상 제품
| 항목 | 내용 |
| --- | --- |
| 제품 | Ops (관제) |
| 워크스페이스 | C01(맵·경로·작업·실시간 관제) + C03(장애·오류·품질) |
| 주 사용자 | 운영관리자 · 관제 오퍼레이터 (보조: 유지보수·현장 관리자) |
| 디바이스 | Desktop 1440×900 |
| 디자인 방향 | enterprise 고밀도 · 맵 중심 · 상태 우선 · **live(실시간)/console(관리·설정) 이중 모드** |
| 테마 | `[data-theme="ops"]` · density-compact 기본([00 §4.2](../00-ux-common-standards.md#42-3-tier-디자인-토큰)) |

---

## 2. 과업 범위

### 2.1 대상 사용자
[00 §8 권한 표현 원칙](../00-ux-common-standards.md#8-권한-표현-원칙)을 Ops 맥락으로 구체화한다. 권한 없는 액션은 **숨김이 아니라 비활성 + 사유 툴팁**, 위험 거부는 차단.

| 역할 | Ops에서의 V(조회) / E(실행) / A(승인) | 대표 화면 맥락 |
| --- | --- | --- |
| 현장 오퍼레이터 | V 전체 · **작업 제어 E**(시작/일시정지/재개/복귀 요청) | C01-05 관제 맵, C01-06 세션 상세 |
| 현장 관리자 | V · **assign/param E** · 조치 완료 처리 | C01-04 작업 배정, C03-05 조치 |
| 유지보수 | V · **remediation E** · **close 요청** | C03-03 상세, C03-05 조치, C03-10 재발 |
| 제조사 개발자 | — (Ops 접근 없음) | — |
| 배포 관리자 | V (조회만) | C03-08 리포트, 펌웨어 연동 칩 |
| 시스템 관리자 | V·E·A all | 전 화면 + 정책(C03-09) |

**하드 거부(시각·동작 모두 차단)**: 현장 오퍼레이터는 **e-stop 해제 불가** / Incident **close 최종 승인은 close 권한자만**(요청과 승인 분리). 제조사 개발자는 Ops에서 운영 반영 승인 불가([00 §8 하드 거부](../00-ux-common-standards.md#8-권한-표현-원칙)).

### 2.2 대상 디바이스
- **주**: Desktop 1440×900 (전 화면). density-compact 그리드, hairline 보더, mono tabular 숫자.
- **부분 대응**: Tablet 1024×768 — C03-05 조치 가이드·체크리스트(현장 태블릿 사용 시나리오)만 반응형 고려. 단, 현장 전용 터치·해상도 최적화는 **Field 과업([03](03-field-uxui-과업지시서.md)) 범위**이며 본 과업은 콘솔 기준.

### 2.3 대상 화면
- **C01-00~09 (10화면)** + **C03-00~10 (11화면)** = 총 **21개 SSOT 화면 전체**를 5장 표에 싣고 구현/미구현(spec-gap 기준)을 표시한다.
- 목업 산출물 **OPS-01~10 (10본)** 을 SSOT 화면 ID에 매핑한다(5.1 매핑표).

### 2.4 제외 범위
- C02(Audit/개발자킷)·C04(펌웨어/OTA) 본체 화면 → **Build 과업([02](02-build-uxui-과업지시서.md))**. Ops에서는 **읽기 칩·연동 링크**로만 노출(예: 세션의 firmware 버전, 장애의 firmware_id 링크).
- H01(HMI)·T01(Telemetry) 현장 운영 화면 → **Field 과업([03](03-field-uxui-과업지시서.md))**. Ops에서는 **상태 요약·context handoff 진입점**으로만 노출.
- 맵/경로 **디자이너(C01-02/03)·가져오기(C01-09)** 의 대형 편집 캔버스는 본 과업에서 **목업 우선순위 밖**(Phase 2). 화면 정의·진입점·Gate(G1) 표현만 5장에 명세하고 목업 본은 OPS-01~10에 포함하지 않는다.
- 서버 정책 재검증·실시간 프로토콜 구현([ADR-003](../adr/ADR-003-realtime-protocol.md))은 개발 인계 사항이며 UX 설계 범위 아님(클라이언트는 UX 차단·확인 표현까지).
- 색상 토큰 최종 정합([ADR-005](../adr/ADR-005-status-color-tokens.md))은 미결정 → 본문 재정의 금지, ADR 링크만.

---

## 3. UX/UI 설계 방향

### 3.1 제품 디자인 방향
- **enterprise 고밀도·맵 중심·상태 우선**. 한 화면에서 다수 로봇·세션·장애를 비교 가능하게 표시한다.
- **live/console 이중 모드**: `live`(실시간 관제 맵·이벤트 스트림·세션 라이브)는 인광 그린 live dot `#1fb46a`로 "지금 스트리밍/정상"을 표현([00 §4.1](../00-ux-common-standards.md#41-패밀리-dna--불변--제품-테마가-절대-변경-금지)). `console`(목록·계획·리포트·정책)은 정적 테이블/카드 중심.
- **DNA 불변**: 상태 배지(squared dot+mono), mono tabular 숫자, ink 단일 브랜드, 페이퍼화이트+hairline은 테마가 변경하지 않는다.

### 3.2 정보 구조 원칙 ([00 §9.1](../00-ux-common-standards.md#91-ops--고밀도-관제))
Ops 모든 화면은 **정보 우선순위 1 안전/장애 > 2 작업 상태 > 3 로봇/모듈 > 4 이력/설정**을 시각 위계로 구현한다.

| 우선순위 | 화면 위치 규약 | 적용 예 |
| --- | --- | --- |
| 1 안전/장애 | 상단 글로벌 바 + 하단 이벤트 스트립(고정). critical/emergency는 절대 접히지 않음 | 미조치 장애 수 배지, emergency 핀 |
| 2 작업 상태 | 중앙 작업 영역 1차 | 진행 중 작업 테이블, 세션 진행률 |
| 3 로봇/모듈 | 중앙 2차 + 우측 컨텍스트 드로어 | 로봇 리스트 사이드바, 드로어 모듈 탭 |
| 4 이력/설정 | 별도 화면(console 모드)으로 분리 | 작업 이력(C01-08), 리포트(C03-08), 정책(C03-09) |

**공통 셸**(C01/C03 §2): 상단 바(시스템 상태·현장 선택·검색·알림·사용자) · 좌측 글로벌 내비 · 중앙 작업 영역 · 우측 컨텍스트 드로어 · 하단 이벤트 스트립을 전 화면 고정 유지한다.

### 3.3 인터랙션 원칙
- **선택 → 드로어 → 화면 이동**의 일관 패턴: 어느 화면이든 로봇/세션/장애 선택 시 우측 드로어(C01-07)가 즉시 정보를 보여주고, 드로어에서 상세·연동 화면으로 진입한다.
- **컨텍스트 보존**: 맵에서 선택한 `robot_id`는 장애·세션·드로어 이동 후에도 유지(C01/C03 §2, 3.4 handoff). console 내부는 물론 Field로의 handoff에도 ID를 운반.
- **live 데이터 신선도**: 위치 지연·통신 끊김·데이터 오래됨을 색상 단독이 아닌 **아이콘+라벨+타임스탬프**로 구분(C01 검수 기준).
- **위험 액션 = hold-to-confirm + Audit 고지**: 작업 시작 예약·구역 잠금·incident close·e-stop 관련은 확인 단계와 감사 기록 고지를 화면에 노출([00 §5](../00-ux-common-standards.md#5-gate-표현-원칙-4단계)·[§6](../00-ux-common-standards.md#6-audit--event-분리-원칙-adr-007)).

### 3.4 상태/경고/위험 표현 원칙

**(1) 상태 체계 ([00 §3](../00-ux-common-standards.md#3-공통-상태-체계))** — 재정의 금지. Ops가 표시하는 상태군:
- 로봇: `offline·online·idle·ready·working·paused·returning·maintenance·fault·emergency_stop`
- 작업: `planned·assigned·ready·running·paused·blocked·completed·failed·cancelled`
- 이벤트 심각도: `info·notice·warning·critical·emergency`
- Incident: `open·ack·in_progress·monitoring·resolved·closed`([ADR-009](../adr/ADR-009-incident-closed-state.md))
- 6단계 심각도 시각 언어(`normal·notice·warning·critical·emergency·disabled`) = squared(3px) dot+mono 라벨. 색상값은 [ADR-005](../adr/ADR-005-status-color-tokens.md).

**(2) Gate 4단계 ([00 §5](../00-ux-common-standards.md#5-gate-표현-원칙-4단계), [ADR-006](../adr/ADR-006-gate-severity-model.md))** — `pass | warn | confirm_required | blocked`. `blocked`/`confirm_required`는 반드시 **(a) 차단/확인 사유 + (b) 해결 행동**을 함께 표시. Ops가 직접 표현하는 게이트:

| Gate | Ops 표현 위치 | 기본 레벨 |
| --- | --- | --- |
| G1 Route-validation | C01-04 작업 배정 시 미검증 경로 = 배정 불가 칩 + "경로 검증 필요" | blocked |
| G3 Version-mismatch | 배정/시작 시 map/parameter 버전 불일치 표시 | map=blocked, parameter=confirm_required/warn |
| G4 Calibration-before-work | 필수 캘리브 미완 로봇 = 시작 차단 + "Field 캘리브로 이동" | blocked / confirm_required |
| G7 Incident-freeze | 대상 로봇에 open critical 장애 존재 시 작업 시작·배포 차단 | blocked |

**(3) Audit / Event 분리 ([00 §6](../00-ux-common-standards.md#6-audit--event-분리-원칙-adr-007), [ADR-007](../adr/ADR-007-audit-vs-event-log.md))** — 두 로그를 화면에서 분리:
- **Event Log** = 센서/상태/실시간 알림/command 결과 → 이벤트 스트림(C03-02)·하단 이벤트 스트립·세션 타임라인(C01-06).
- **Audit Log** = 사람의 승인·위험 액션·운영 반영(작업 배정 확정·incident close·구역 잠금·e-stop 해제) → 위험 액션 확인 모달 고지 + 드로어 감사 로그 링크. 커밋 전 `actor·action·target·reason·before/after·result` 생성.

---

## 4. 주요 사용자 흐름

### 4.1 핵심 시나리오
Ops가 관여하는 **2개 폐루프**([00 §10](../00-ux-common-standards.md#10-핵심-폐루프-5종-제품-경계-횡단--우선순위-기준))를 단계+화면+공유 ID+게이트로 정의한다. Ops 완료 기준 = 두 루프가 화면 단위로 닫힘.

**Loop1 — 작업 폐루프** (공유 스파인 `work_session_id`, 게이트 G1·G3·G4·G7)

| 단계 | 행위 | 화면 | 공유 ID | 게이트 |
| --- | --- | --- | --- | --- |
| 1 | 작업 생성·로봇 추천 | C01-04 작업 계획 보드 (OPS-04) | `work_plan_id` | — |
| 2 | 로봇 배정·경로 선택·검증 확인 | C01-04 | `work_session_id`(생성)·`route_id`·`robot_id` | **G1 경로검증·G3 버전·G4 캘리브·G7 장애freeze** |
| 3 | HMI/로봇 전송 (배정 확정 = Audit) | C01-04 → Field handoff | `work_session_id` | confirm_required(hold) |
| 4 | 현장 수신·시작 | **Field H01** (handoff 도착) | `work_session_id` | G4 |
| 5 | 실시간 진행 반영·제어 | C01-05 관제 맵 (OPS-02) · C01-06 세션 라이브 (OPS-05) | `work_session_id`·`command_id` | — |
| 6 | 완료/실패 결과 반영 | C01-06 → C01-08 이력 | `work_session_id`·`work_result` | — |

> 완료 기준(C01): 부적합 로봇·미검증 경로는 **배정 불가** 표시, command·event·incident·result가 동일 `work_session_id`로 연결.

**Loop2 — 장애 폐루프** (공유 스파인 `work_session_id`+`incident_id`, 게이트 G7)

| 단계 | 행위 | 화면 | 공유 ID | 게이트 |
| --- | --- | --- | --- | --- |
| 1 | Event 발생·표준 코드/severity 매핑 | C03-02 이벤트 스트림 (OPS-06) | `event_id`·`work_session_id` | — |
| 2 | warning↑ 알림 / critical↑ Incident 승격 | C03-02 → C03-00 대시보드 | `incident_id`(생성) | — |
| 3 | 원인 타임라인·영향 범위 확인 | C03-03 상세 (OPS-07) · C03-04 원인분류 | `incident_id`·`module_id` | — |
| 4 | 조치 가이드 수행 (현장은 Field) | C03-05 조치 (OPS-07) → Field handoff | `incident_id`·`calibration_profile_id`(왕복 풍부화) | confirm_required |
| 5 | 재발 확인 후 Close | C03-10 재발 → C03-03 Close (OPS-08) | `incident_id` | **재발 확인 또는 waiver 필수** |

> 완료 기준(C03): closure는 **재발 확인 또는 명시적 waiver**를 요구(C03 §7), 담당자·시간·근거·상태 변화가 Audit Log로 남는다.

### 4.2 화면 전이
```
[C01-00 대시보드]──선택→[드로어 C01-07]──→ C01-05 맵 / C01-06 세션 / C03-03 장애
[C01-05 맵]──핀 warning/critical→[C03-03 상세]──조치→[C03-05]──(Field)──→복귀
[C01-04 배정]──확정→(Field H01)──시작→[C01-06 라이브]──완료→[C01-08 이력]
[C03-00]──승격→[C03-03]──원인→[C03-04]──재발→[C03-10]──close→[C03-03(closed)]
```

### 4.3 Context handoff 흐름 ([00 §7](../00-ux-common-standards.md#7-context-handoff-표현-원칙), [ADR-002](../adr/ADR-002-context-envelope-transport.md))
- **운반 = ID만** 전달, 대상 화면이 재조회(단일 진실). 도착 시 관련 객체 자동 선택(드로어 열림·incident 포커스).
- 타깃 화면 상단에 **출처 칩**("from Ops · RBT-THIN-0008") + **돌아가기(return)** 경로 항상 표시.
- **Ops → Field** (OPS-09): 작업 배정 후 `work_session_id`·`robot_id` 운반, 현장 시작/캘리브 진입. 왕복 시 `calibration_profile_id`가 채워져 Ops로 복귀(Loop1·Loop3 풍부화).
- **Ops → Build** (OPS-10): 장애의 `firmware_id`·`module_id` 운반, 펌웨어/Audit 화면 진입(읽기·이슈 연결). 운영 반영 승인은 Build 권한자만(00 §8).
- ID 미해결 시 사이트 수준으로 graceful degrade + 안내.

### 4.4 Gate/Audit 반영 흐름
- **Gate**: 배정·시작·배포·close 직전 G1/G3/G4/G7 평가 → `blocked`이면 버튼 비활성+사유·해결행동, `confirm_required`이면 hold-to-confirm. 클라이언트는 UX 차단, 서버는 동일 정책 재검증(후속 인계).
- **Audit**: 위험 전이·승인 행위(배정 확정·구역 잠금·incident close·e-stop 해제 요청)는 커밋 전 AuditEntry 생성 고지 모달 → 실행 후 드로어 감사 로그·C04-08 뷰어에서 추적.

---

## 5. 화면 설계 범위

### 5.1 화면 목록 (C01-00~09 + C03-00~10 전체) — 구현/미구현 + OPS 매핑

> 구현 상태는 [spec-gap.md](../spec-gap.md) 기준. ✅이식 · ❌미구현 · 🟡부분. OPS = 본 과업 목업 산출물.

**C01 맵·경로·작업·실시간 관제**

| 화면 ID | 화면명 | 구현 | OPS 목업 | 비고 |
| --- | --- | --- | --- | --- |
| C01-00 | 통합 운영 대시보드 | ✅ | **OPS-01** | KPI 6·온실 카드·진행 작업·critical 리스트 |
| C01-01 | 온실 맵 목록·버전 관리 | ✅ | OPS-01 연계 | 운영중/초안 배지·검증 요약 |
| C01-02 | 온실 맵 디자이너 | ❌ | (Phase 2) | 대형 캔버스 — 정의·진입점만 |
| C01-03 | 경로 설계자 | ❌ | (Phase 2) | 대형 캔버스 — G1 표현만 |
| C01-04 | 작업 계획 보드 | ✅ | **OPS-04** | 작업 배정·로봇 추천·충돌 경고 |
| C01-05 | 멀티로봇 실시간 관제 맵 | ✅ | **OPS-02** | 맵·핀·경로 진행·이벤트 팝오버 |
| C01-06 | 작업 세션 라이브 상세 | ✅ | **OPS-05** | 진행률·명령 타임라인·모듈 카드 |
| C01-07 | 공통 로봇 상세 드로어 | ✅(shell) | **OPS-03** | 420px·탭·빠른 액션·감사 링크 |
| C01-08 | 작업 이력·결과 분석 | ❌ | (Phase 2) | 결과 테이블·실패 분포·리포트 |
| C01-09 | 맵/경로 가져오기·검증 | ❌ | (Phase 2) | 업로드·스키마 매핑·검증 |

**C03 장애·오류·품질**

| 화면 ID | 화면명 | 구현 | OPS 목업 | 비고 |
| --- | --- | --- | --- | --- |
| C03-00 | 장애 운영 대시보드 | ✅ | OPS-06 연계 | 심각도 KPI·조치 대기·heatmap |
| C03-01 | 장애 목록·필터 | ✅ | — | 고급 필터·bulk·미리보기 |
| C03-02 | 실시간 이벤트 스트림 | ✅ | **OPS-06** | timeline·severity 필터·raw·장애 생성 |
| C03-03 | 장애 상세·원인 타임라인 | ✅ | **OPS-07** | 요약·원인 후보·통합 타임라인 |
| C03-04 | 원인 분류·영향 범위 | ❌ | OPS-07 연계 | root cause taxonomy tree |
| C03-05 | 조치 가이드·체크리스트 | ✅ | **OPS-07** | 단계 체크·HMI 이동·완료/보류 |
| C03-06 | 오류 코드 사전·매핑 | ❌ | (Phase 2) | nav disabled |
| C03-07 | 유지보수 배정·출동(SLA) | ❌ | (Phase 2) | nav disabled |
| C03-08 | 장애 리포트·분석 | ✅ | — | MTTR/MTBF·Pareto·export |
| C03-09 | 알림 정책 관리 | ❌ | (Phase 2) | nav disabled |
| C03-10 | 재발 분석·포스트모템 | ❌ | **OPS-08** | 클러스터·포스트모템·Close 연결 |

**OPS 목업 산출물 10본 ↔ SSOT 매핑 요약**

| OPS | 목업 주제 | 주 SSOT 화면 | 폐루프 |
| --- | --- | --- | --- |
| OPS-01 | 통합 관제 대시보드 | C01-00 (+C01-01) | 진입 |
| OPS-02 | 멀티로봇 실시간 맵 | C01-05 | Loop1 |
| OPS-03 | 로봇 상세 드로어 | C01-07 | 공통 |
| OPS-04 | 작업 배정(계획 보드) | C01-04 | Loop1 |
| OPS-05 | 작업 진행(세션 라이브) | C01-06 | Loop1 |
| OPS-06 | Incident Queue·이벤트 스트림 | C03-02 (+C03-00) | Loop2 |
| OPS-07 | 장애 상세·조치 | C03-03 (+C03-04/05) | Loop2 |
| OPS-08 | 재발·Close 포스트모템 | C03-10 (+C03-03 close) | Loop2 |
| OPS-09 | Field handoff | C01-04→H01 / C03-05→H01 | Loop1·2 |
| OPS-10 | Build handoff | C03-03→C04/C02 | Loop2 |

### 5.2 화면별 주요 기능

| 화면 | 주요 기능 |
| --- | --- |
| C01-00 (OPS-01) | KPI 카드 6, 온실별 상태 카드, 진행 중 작업 테이블, critical 이벤트 리스트, 로봇유형별 가동률 차트, 빠른 필터, 드로어/장애/세션/맵 진입 |
| C01-04 (OPS-04) | 캘린더/칸반 전환, 작업 생성, 가용 로봇 추천, 경로 선택, **배정 게이트 평가(G1/G3/G4/G7)**, HMI 전송(Field handoff) |
| C01-05 (OPS-02) | 실시간 맵·로봇 핀(Thin=채운점/Pinch=빈점), 경로 진행률, 구역 잠금 레이어, 이벤트 팝오버, 로봇 리스트 사이드바, 일시정지 요청, 장애 화면 이동 |
| C01-06 (OPS-05) | 진행률 헤더, 명령 상태 타임라인(command lifecycle), 모듈 상태 카드, Telemetry 미니 차트, 이벤트 로그, 일시정지/재개/복귀 요청, 장애 티켓 생성 |
| C01-07 (OPS-03) | 상태 헤더, 탭(개요/모듈/작업/장애/펌웨어/HMI/Telemetry), 빠른 액션, 감사 로그 링크, 컨텍스트 운반 진입점 |
| C03-00 (OPS-06연계) | 심각도 KPI, 조치 대기 목록, 작업 영향 카드, 반복 장애 순위, 모듈별 heatmap, 담당자 배정 |
| C03-02 (OPS-06) | event timeline, severity 필터, raw payload viewer, incident rule indicator, stream pause, **장애 생성(승격)** |
| C03-03 (OPS-07) | 장애 요약 헤더, 원인 후보, 통합 타임라인(작업·명령·Telemetry·HMI·펌웨어), 관련 객체 카드, raw log 탭, 조치 시작, **Close(재발/waiver 게이트)** |
| C03-04 (OPS-07연계) | 원인 분류 tree, 영향 범위 카드, 유사 장애 검색, 조치 가이드 연결 |
| C03-05 (OPS-07) | 단계별 체크리스트, 안전 주의, HMI 캘리브 이동(Field handoff), 사진/메모, 완료/보류 |
| C03-10 (OPS-08) | 유사 장애 클러스터, 재발 패턴, 포스트모템 에디터, 예방 액션, Build 이슈 연결(handoff) |

### 5.3 화면별 데이터 표시 항목 (데이터 SSOT — [00 §2 공유 ID 스파인](../00-ux-common-standards.md#2-공유-id-스파인-cross-product-join-keys))

| 화면 | 데이터 SSOT 객체 | 핵심 표시 ID/필드 |
| --- | --- | --- |
| C01-00 | Robot·WorkSession·Incident·TelemetryChannel·FirmwareDeployment·Site | `robot_id`·`work_session_id`·`incident_id`·가동률·미조치 장애 수 |
| C01-04 | WorkPlan·WorkSession·Route·Robot·RobotAvailability·CropParameter | `work_session_id`·`route_id`·`robot_id`·validation_state |
| C01-05 | RobotLocation·WorkSession·RouteProgress·Event·Incident·TelemetrySummary | `robot_id`·location·progress·`event_id` |
| C01-06 | WorkSession·Command·Event·Robot·Module·TelemetryChannel·HMIStatus | `work_session_id`·`command_id`·progress·module health |
| C01-07 | Robot·Module·WorkSession·Incident·Firmware·HMIStatus·TelemetryStatus | `robot_id`·`module_id`·`firmware_version`·current_state |
| C03-00 | Incident·Event·Robot·Module·WorkSession·TelemetryChannel | `incident_id`·severity·status·작업 영향 |
| C03-02 | Event·EventPayload·Source·WorkSession·IncidentRule | `event_id`·severity·`event_code`·occurred_at |
| C03-03 | Incident·Event·Command·WorkSession·TelemetryChannel·HMIAction·FirmwareDeployment | `incident_id`·root_cause·`firmware_id`·timeline |
| C03-04 | Incident·RootCauseTaxonomy·Module·Firmware·TelemetryChannel·CalibrationProfile | `incident_id`·root_cause·영향 범위·`calibration_profile_id` |
| C03-05 | ActionGuide·Incident·ChecklistItem·HMIStatus·TelemetryStatus | `incident_id`·`action_guide_id`·체크 진행·HMI 상태 |
| C03-10 | IncidentCluster·Incident·RootCause·FirmwareChange·AuditIssue·PreventiveAction | cluster·재발률·예방 액션·`audit_issue` 링크 |

> 모든 ID는 **mono 폰트·tabular 숫자**로 표시([00 §2](../00-ux-common-standards.md#2-공유-id-스파인-cross-product-join-keys)).

### 5.4 주요 인터랙션

| 영역 | 인터랙션 | 표현 규약 |
| --- | --- | --- |
| 선택 | 핀/행/카드 클릭 → 드로어 열림 | 선택 객체 하이라이트 + 드로어 자동 포커스 |
| 작업 배정 | 로봇 선택 시 게이트 평가 | 부적합=배정 불가 칩(blocked)+사유+해결 행동 |
| 작업 시작 예약 | hold-to-confirm | G4/G7 통과 후 hold, Audit 고지 모달 |
| 구역 잠금 | 위험 액션 confirm | 사유 입력 + Audit 기록 고지 |
| 이벤트→장애 | 스트림에서 "장애 생성" | severity·rule 표시, `incident_id` 생성·연결 |
| 장애 Close | 재발 확인/waiver 게이트 | 미충족=blocked, waiver는 사유+Audit |
| handoff 진입 | "Field에서 조치"/"펌웨어 보기" | 출처 칩+return, ID만 운반 |
| 권한 부족 | 비활성 + 사유 툴팁 | e-stop 해제 등 하드 거부는 동작 차단 |

---

## 6. 디자인 시스템 적용 기준 ([00 §4](../00-ux-common-standards.md#4-공통-디자인-언어))

| 항목 | 적용 기준 (Ops) |
| --- | --- |
| **패밀리 DNA(불변)** | 상태 의미·squared dot+mono 배지 / mono tabular 숫자(ID·시각·지표·버전·%) / live dot `#1fb46a` / ink 단일 브랜드(primary·active nav·focus) / 페이퍼화이트+hairline / 로봇 정체성(Thin=채운점·Pinch=빈점). **테마가 변경 금지**([00 §4.1](../00-ux-common-standards.md#41-패밀리-dna--불변--제품-테마가-절대-변경-금지)) |
| **3-tier 토큰** | `primitive → semantic → [data-theme="ops"]`. 컴포넌트는 semantic 토큰·유틸클래스만 소비. Ops override는 **밀도·강조·타이포·radius·모션에 한정**, DNA 불변([00 §4.2](../00-ux-common-standards.md#42-3-tier-디자인-토큰)) |
| **상태 배지** | 6단계 심각도 동일 의미. 색상값 [ADR-005](../adr/ADR-005-status-color-tokens.md)(기본=프로토타입 절제값 유지) |
| **버튼** | primary=ink. 위험 액션=hold-to-confirm 패턴(Gate confirm_required/blocked 표현 [00 §5](../00-ux-common-standards.md#5-gate-표현-원칙-4단계)) |
| **카드/테이블** | density-compact 기본, hairline 보더, 비교 가능한 정렬·정량 정렬(미조치 critical·SLA 초과 우선 [C03 §7]) |
| **드로어** | 420px 우측 컨텍스트 드로어(C01-07), 탭 구조·감사 로그 링크 |
| **Ops 테마** | 고밀도 density-compact · live/console 모드 토큰 · 맵 레이어 색은 상태 색상 토큰 준수 |

---

## 7. 산출물

| 산출물 | 내용 | 범위 |
| --- | --- | --- |
| **UX Flow** | Loop1·Loop2 폐루프 다이어그램(단계·화면·공유 ID·게이트), handoff 흐름(Ops↔Field·Ops↔Build) | 4장 기반 |
| **Wireframe** | OPS-01~10 저충실도 와이어(공통 셸·정보 위계 1~4·드로어 패턴) | 10본 |
| **Hi-fi 목업** | OPS-01~10 고충실도(ops 테마·상태 배지·Gate 4단계·Audit 고지·live dot) | 10본 |
| **화면 캡처 PDF** | 21개 SSOT 화면 매핑표 + OPS 목업 캡처·상태/예외 변형 포함 | 1본 |
| **개발 인계 문서** | 3-tier 토큰 매핑·컴포넌트 명세·게이트 평가 위치·Audit 트리거·context envelope([ADR-002](../adr/ADR-002-context-envelope-transport.md)) 규격·실시간 소스 추상화([ADR-003](../adr/ADR-003-realtime-protocol.md)) 인계 | 1본 |

---

## 8. 검수 기준

| 기준 | 충족 조건 |
| --- | --- |
| **화면 커버리지** | C01-00~09 + C03-00~10 전체 21화면이 5장에 정의·구현 상태 표기. OPS-01~10이 SSOT ID에 매핑 |
| **사용자 흐름 충족** | Loop1(배정→실행→반영)·Loop2(Event→Incident→조치→재발→Close)가 화면 단위로 연결, 동일 `work_session_id`·`incident_id`로 추적 |
| **상태/경고/위험 표현** | 6단계 심각도·로봇/작업/Incident 상태가 00 §3대로 표시. 위치 지연·통신 끊김은 색상 외 아이콘+라벨로 구분 |
| **Gate 표현** | G1·G3·G4·G7이 배정/시작/배포/close에서 4단계로 표현, blocked/confirm은 **사유+해결 행동** 동반 |
| **Audit/Event 분리** | Event Log(스트림·스트립)와 Audit Log(승인·위험 액션 고지)가 화면에서 분리. close는 재발 확인/waiver + Audit 기록 |
| **Permission 표현** | 6역할 V/E/A가 화면 맥락에 반영. 권한 없음=비활성+툴팁, e-stop 해제·close 승인 등 하드 거부는 동작 차단 |
| **Context handoff** | 선택 `robot_id`가 화면·드로어·Field/Build 이동 후 유지, 출처 칩+return 표시, ID 미해결 시 graceful degrade |
| **개발 인계 가능성** | 3-tier 토큰·컴포넌트·게이트/Audit 트리거·context envelope·실시간 추상화가 인계 문서로 전달 |
| **Ops 완료 기준** | **운영 폐루프 Loop1·Loop2가 모두 닫힘**([00 §10](../00-ux-common-standards.md#10-핵심-폐루프-5종-제품-경계-횡단--우선순위-기준) 우선순위 기준) |

---

### 문서 정보 · 관련 문서
| 버전 | 일자 | 변경 |
| --- | --- | --- |
| v1.0 | 2026-06-02 | 최초 작성 — [00 공통 기준서](../00-ux-common-standards.md) 정합 |

**관련**: [00 공통 기준서](../00-ux-common-standards.md) · [01 Ops](01-ops-uxui-과업지시서.md) · [02 Build](02-build-uxui-과업지시서.md) · [03 Field](03-field-uxui-과업지시서.md) · [ADR](../adr/) · [화면 갭](../spec-gap.md)
