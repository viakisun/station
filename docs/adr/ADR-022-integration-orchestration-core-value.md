# ADR-022 — STATION 핵심 가치 = 통합 미들웨어 + 통합 오케스트레이션 (두 기둥)

- 상태: **Accepted**
- 관련: [ADR-011](ADR-011-node-org-ownership-model.md)(org 소유) · [ADR-015](ADR-015-reference-local-agent-first.md)(Local Agent 우선) · [ADR-016](ADR-016-software-defined-work-layer.md)(Work Layer) · [00-ux-common-standards](../00-ux-common-standards.md) · [01-integration-orchestration](../01-integration-orchestration.md)

## 맥락

STATION은 그동안 **역할별 제품 3종(Ops/Build/Field) + 런타임**으로 표현돼 왔다. 그 결과 화면은
"이미 통합이 끝난 로봇을 운용/관제"하는 도구로 보이고, **"누구를 위한 것인지·목표가 무엇인지"가 드러나지
않는다**. 그러나 컨소시엄(비아·에이지·메타·대동·KIRO·농과원)의 실제 고통은 운용이 아니라 **하나의 로봇을
여러 기관이 통합 조립하는 과정의 비가시성**이다 — 무엇이 준비됐고, 누구에게 막혔고, 무엇이 검증됐고,
무엇을 테스트/배포/발행해도 되는지를 한 화면에서 못 봐서 전화·메일 독촉으로 떨어진다.

## 결정

STATION의 핵심 가치를 **한 가치의 두 얼굴**로 명문화한다:

**① 통합 미들웨어 (Integration Fabric / RAL)** — *기술적* 통합.
Local Agent / Robot Gateway가 이질적 벤더 노드(CAN·ROS2·DDS·MQTT)를 **NodeAdapter로 흡수해 표준
Signal/Command/Event 한 면**으로 노출한다. 노드의 이질성이 여기서 사라진다. 새 노드 합류 = NodeAdapter
1개 + 매니페스트 1건. (기존 자산: [station-field-os §1·§7](../architecture/station-field-os.md), 계약
SSOT `@station/contracts`, gate·conformance·App Runtime. 실행 가능 구현 = `local-agent` + `run-rig`.)

**② 통합 오케스트레이션 (Integration Orchestration)** — *조직적* 통합.
컨소시엄 팀들의 **readiness·할당·릴리스**를 목표 중심(이 로봇을 통합·검증·발행)으로 조율한다.

**연결고리**: ①이 seam을 계약으로 정의하므로, ②의 readiness는 **자동 도출 가능**해진다(수기 보드 금지).
제품 3종은 이 두 기둥 *위에서* 각 역할이 자기 몫을 하는 계기(instrument)다.

## 의의 (왜 STATION이어야 하나)

역할별 대시보드는 차별점이 아니다(누구나 만든다). 차별점은 **기관 사이의 seam을 보이게·관리 가능하게**
만드는 것이고, STATION은 이미 그 seam을 정의하는 계약 기반(IF-P/L/X·blueprint·org 소유·conformance)을
가졌다. 따라서 통합 그래프·readiness를 *연산*할 수 있다 — 이것이 STATION이 *플랫폼*으로 존재할 근거다.

## 모델 (요지 — 상세는 [01-integration-orchestration](../01-integration-orchestration.md))

- **Readiness**: 산출물(node·module·firmware·app·blueprint) → 상태(기존 상태머신) → 소유 org →
  **다음 막힌 스텝의 책임자**(상태+의존+소유에서 자동 계산).
- **릴리스 채널**(신규): `draft → canary → beta → stable`. conformance 통과가 승급 조건.
- **할당**(신규): 산출물/스텝 → assignee(org/role/person). 기존 `Incident.owner` mock 의 1급화.
- **혼합 오케스트레이션**: blueprint+IF-L+conformance → 통합 그래프 자동 골격, 그 위 게이트/할당/채널 수동
  오버레이. **범용 워크플로우 빌더(자유 DAG)는 채택하지 않는다** — 노드=도메인 산출물, 엣지=계약 의존.

## 결과

- Hub = "제품군 런처" → **통합 오케스트레이션 Landing**([apps/hub](../../apps/hub/app/page.tsx)). 두 기둥과
  목표(이 로봇을 릴리스)·대상(컨소시엄 org×역할)을 즉시 전달. 핵심 수치는 계약에서 자동 도출.
- 비범위(후속): 오케스트레이션 런타임 엔진(할당 API·승인 큐·채널 승급 자동화)·릴리스 레지스트리·
  Ops/Build/Field readiness 연동. 본 ADR은 *핵심 가치 정의 + Landing*까지.
