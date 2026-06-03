# 시나리오 변경 명세서 — 노드/기관 모델 정합

> 통합 시나리오([scenarios/index.html](../scenarios/index.html))를 **노드/기관 분해**로 갱신하기 위한 **변경 계획**이다. 본 문서는 명세만이며, 시나리오 HTML은 이번에 수정하지 않는다.
>
> 근거 모델: [STATION Field OS 아키텍처](station-field-os.md) · [ADR-011 노드/기관 소유](../adr/ADR-011-node-org-ownership-model.md). 식별자·타입은 [@station/contracts](../../packages/contracts/README.md) 실물과 일치.

---

## 0. 변경 원칙

1. **가공 벤더 → 실제 기관·노드**: 모든 "벤더/모듈" 표현을 기관(`ORG-*`)·노드(`MCU/VPU/ACU/Telemetry/LPU`)로 치환한다. 기존 `VND-*`/`MOD-*` 식별자는 비파괴 alias로 살린다([ADR-011](../adr/ADR-011-node-org-ownership-model.md)).
2. **호환성 = 노드 간 계약 호환**: 조합 구성기의 "벤더 옵션"을 "기관/노드 옵션"으로 바꾸고, 호환성 판정을 **노드 간 표준 계약 호환**으로 재정의한다.
3. **책임 라우팅**: 추적성 매트릭스 행위자에 `owner_org`·`node` 컬럼을 추가해 "누가/어느 노드 책임인가"를 드러낸다.

---

## 1. 가공 벤더명 → 실제 기관 정합표 (`src/organizations.ts` 일치)

| 가공 벤더(`VND-*`) | 실제 기관(`ORG-*`) | 노드/모듈 | 표준 계약 인계 |
| --- | --- | --- | --- |
| `VND-OPTI` (OptiVision) | `ORG-META` 메타파머스 | `VPU` 비전 | Signal → ACU·Telemetry |
| `VND-ARM` (ArmTech) | `ORG-META` 메타파머스 | WorkModule(매니퓰레이터, `attachesToNode: ACU`) | Command/Signal ↔ ACU |
| `VND-GREEN` (GreenEdge) | `ORG-META` 메타파머스 | WorkModule(EE, KIRO/농과원 변형) | Command/Calibration |
| `VND-NAVI` (NaviCore) | `ORG-DAEDONG` 대동로보틱스 | `LPU` 측위 | Signal → 메타 ACU |
| (신규) MCU 베이스 | `ORG-AGE` 에이지로보틱스 | `MCU` | Command/Signal ↔ ACU |
| (신규) 게이트웨이 | `ORG-VIA` 비아 | `Telemetry` | 업링크 → 관제 |

> EE 변형 협력 공급: KIRO(`ORG-KIRO`)·국립농업과학원(`ORG-NAS`).

---

## 2. 조합 구성기 (`scenarios/index.html` §조합 구성기) 변경

- **선택 옵션 치환**: "벤더 선택"(OptiVision·ArmTech·GreenEdge·NaviCore) → **기관/노드 선택**(에이지 MCU · 메타 VPU/ACU/WorkModule · 대동 LPU · 비아 Telemetry).
- **조립 단위**: 한 대의 로봇 = 에이지 `MCU` + 메타 `VPU`·`ACU`·매니퓰레이터·EE + 대동 `LPU` + 비아 `Telemetry`.
- **호환성 판정 재정의**: 기존 6종 계약 매칭을 **노드 간 표준 계약 호환**으로 표현 — 에이지 MCU↔메타 ACU(Command/Signal), 대동 LPU→메타 ACU(측위 Signal), 전 노드→비아 Telemetry. 불일치는 `GateResult`(pass/warn/confirm_required/blocked)와 사유·해결행동으로 자동 차단([ADR-006](../adr/ADR-006-gate-severity-model.md)).

---

## 3. 추적성 매트릭스(TRACE) 변경

각 행위자 행에 **`owner_org`·`node` 컬럼 추가**. 변경 후 예:

| 시나리오 | 행위자 | owner_org | node | 계약 | 도구 |
| --- | --- | --- | --- | --- | --- |
| S1 | 기관 5곳 | ORG-AGE·META·DAEDONG·VIA·KIRO/NAS | MCU·VPU·ACU·LPU·Telemetry | ModuleManifest·Node·ProtocolProfile | Build 개발자킷·Audit |
| S3 | 메타·대동·에이지 | ORG-META·DAEDONG·AGE | VPU·ACU·LPU·MCU | Signal·Command(가상) | 디지털트윈·Telemetry |
| S4 | 비아 운영자 | ORG-VIA | (전 노드) | CommandEnvelope·Signal·GateResult | 통합관제 대시보드·맵 |
| S6 | 오퍼레이터·유지보수·관제 | (장애 노드 owner_org) | (장애 node) | Event/Incident | 장애 관리·원인분류·e-stop |
| S7 | 신규 기관 | (신규 ORG-*) | (신규 node) | ModuleManifest 1회→레지스트리 | Audit 승인·통합 대시보드 |

---

## 4. 시나리오별 변경 전/후 핵심 문구

### S1 — 산출물 표준 온보딩
- **변경 전**: "제조사 5기관이 각 모듈을 표준 계약으로 등록 — 이음의 출발."
- **변경 후**: "각 **기관이 자기 노드를 표준 계약으로 등록**한다 — 에이지가 `MCU`(`age.node.mcu.v1`), 메타가 `VPU`·`ACU`·매니퓰레이터(`meta.module.manipulator.v1`), 대동이 `LPU`. 매니페스트의 `ownerOrg`·`attachesToNode`가 소유·부착을 박는다."

### S3 — 실물 전 조합 가상 통합·시험가동
- **변경 전**: "디지털트윈·텔레메트리 게이트웨이로 조합이 맞물리는지 검증."
- **변경 후**: "**에이지 `MCU` + 메타 `VPU`·`ACU`·매니퓰레이터·EE + 대동 `LPU`** 조립을 **비아 플랫폼이 통합**한다. 노드 간 계약 호환(MCU↔ACU Command/Signal, LPU→ACU 측위 Signal)을 가상 환경에서 검증한다."

### S4 — 이기종 다중 로봇 통합 관제
- **변경 전**: "여러 기관 모듈로 조립된 로봇들을 한 화면에서 하나처럼."
- **변경 후**: "**기관 노드 조립체(MCU·VPU·ACU·LPU·Telemetry)**로 만든 로봇들을 **비아 관제로 통합**한다. `CommandEnvelope`(3단계 ACK)·표준 `Signal`이 노드/기관과 무관하게 한 화면에서 동일하게 흐른다."

### S6 — 이기종 가로지르는 문제 추적·개선
- **변경 전**: "어느 모듈에서 문제 나도 한 시스템에서 원인까지 추적."
- **변경 후**: "**장애를 노드/기관 책임으로 라우팅**한다 — `Event.source`·`node`·`code`가 발생 노드와 owner_org를 가리키고, 임계 초과 시 Incident로 승격(`promotedIncidentId`)된다. 예: VPU `CAM-FRAME-DROP`(ORG-META) / MCU 안전정지(ORG-AGE)."

### S7 — 신규 기관/노드 무중단 합류
- **변경 전**: "새 제조사 모듈을 표준 1회 등록 → 기존 플릿에 무중단 합류."
- **변경 후**: "**신규 기관/노드가 표준계약 1회로 합류**한다 — `ORGANIZATIONS` 레지스트리 1행 + `schema/`를 통과하는 `ModuleManifest` 1건 + NodeAdapter 1개. 기존 플릿·계약을 건드리지 않는다(합류 비용 O(N)→O(1))."

---

## 5. 적용 범위(이번 변경 대상 아님)

- 시나리오 HTML(`docs/scenarios/index.html`)·코드·스키마는 **수정하지 않는다**. 본 문서는 후속 HTML 갱신을 위한 명세다.
- S2(펌웨어)·S5(현장 운용)·S8(버전 업그레이드)는 본 명세의 정합 원칙(기관/노드 치환·책임 라우팅)을 동일하게 따르되, 핵심 변경은 S1·S3·S4·S6·S7에 집중한다.
