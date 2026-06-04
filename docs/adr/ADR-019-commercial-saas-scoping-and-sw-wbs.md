# ADR-019 — Commercial SaaS Scoping & Software Work-Breakdown (SW-WBS)

- 상태: **Accepted**
- 관련: [STATION SDV Reference Platform (마스터 기준서) Part H](../architecture/sdv-reference-platform.html), [station-field-os.md §12](../architecture/station-field-os.md), [ADR-001](ADR-001-product-split-strategy.md)(제품 분리 단계), [ADR-014](ADR-014-robot-blueprint-open-node-taxonomy.md)(개방형 NodeKind), [ADR-015](ADR-015-reference-local-agent-first.md)(Reference Local Agent), [ADR-016](ADR-016-software-defined-work-layer.md)(Work Layer)

## 맥락

M1~M5로 런타임(Reference Local Agent)·계약(`@station/contracts`)·원격 모니터링(HMI uplink, IF-L-HMI-AGG)이 굳었다. 이제 STATION을 **VIA 상업용 통합관제 SaaS 제품군**으로 재구성해야 하는데, 현재 웹/코드 구조에 세 가지 구조적 갭이 있다:

1. **미러 개념 부재** — 스펙상 HMI·Telemetry·Local Agent는 *on-robot 실체*이고 웹은 그 *원격 미러*여야 한다(권한 위계 cloud ④ < field HMI ③). 그러나 Local Agent 인스펙터가 Ops `/control/agent`에 놓여 개발자/SDK 고도가 운영자 고도로 누출되고, "미러"가 코드·UI에 1급 개념으로 존재하지 않으며, Telemetry가 read-only로 강제되지 않는다.
2. **멀티 프로젝트·로봇 미고려** — VIA는 통합관제 SaaS인데 project/site/fleet 식별자·데이터모델·스코핑이 없다. 단일 사이트·단일 에이전트 가정이며, 로봇 컨텍스트가 워크스페이스 이동마다 소실된다(ephemeral `robotId`).
3. **상업 제품 분리 미실행** — ADR-001이 Ops/Build 물리 분리를 단계적으로 결정(step 3)했으나 미실행.

또한 이 모든 작업을 **한 번에 구현하면 범위가 폭발**한다. 지금 필요한 것은 구현이 아니라, "상업 SaaS가 어떤 구조여야 하는가"를 **식별체계로 못박고**, 상세 구현은 식별자-TODO로 남겨 개발팀이 이어받게 하는 것이다.

## 결정

1. **SW-WBS 식별체계 채택** — 소프트웨어 개발 상세항목을 3 패밀리로 식별한다(마스터 Part H에 규정): **`SWC-*`**(Software Component, 코드/서브시스템 소유 단위, currentPath/plannedPath 분리) · **`SWS-*`**(Software Surface, 사용자 인지 제품 표면) · **`SWT-*`**(Software Task, 구현 가능 작업 단위). 관계 규칙(SWT는 ≥1 SWC, UI면 ≥1 SWS) · status 7종(done/partial/scaffold/planned/blocked/deprecated/**external**). 기존 UX 화면코드(C0x·H01·T01)는 폐기 아닌 **SWS로 흡수**. SW-WBS는 Part B L4(SW Unit)의 하위 확장.

2. **On-robot 실체 ↔ Cloud 미러를 1급 개념으로.** HMI·Telemetry·Local Agent = on-robot 실체, 웹(Ops·Build) = 원격 미러. 미러 seam = `AgentFacade`(in-process ↔ 원격 `RemoteAgentClient`). 권한 위계 ① 물리 > ② Agent Policy > ③ field HMI > ④ cloud > ⑤ autonomy를 **UI가 ④<③ 종속으로 표현**하고, 모든 cloud 명령은 robot-side `evaluateGate`를 통과한다. **Telemetry는 제어권 0(read-only)** — 미러 표면은 dispatch 경로 자체를 갖지 않는다.

3. **스코핑 위계 ORG → PRJ → SITE → RBT → NODE → MOD.** `PRJ-`(프로젝트)·`SITE-`(사이트)를 가산 식별자로 신설(마스터 B0). **Fleet은 식별자가 아니라 프로젝트 across 뷰**(별도 식별자 미생성 — cloud 권한 함의 회피). 멀티로봇은 **connection-scoped**: 1 로봇 = 1 Local Agent = 1 RemoteAgentClient. "어느 로봇"은 *어느 연결*로 해결.

4. **`CommandEnvelope` 불변(connection-scoped).** `CommandEnvelope`는 단일 Local Agent 연결 내부의 명령 계약으로 유지하며 `robot_id`를 주입하지 않는다. 멀티 로봇 선택은 cloud-side 연결 스코프(상위 연결 관리자, planned `SWC-FLEET`)에서 해결한다. 이로써 on-robot `command-router`·`node-registry` 계약을 변경하지 않고(한 연결 안에선 `target.node`가 kind-only로 충분), cloud fan-in을 상위 레이어에 가둔다. 이는 baseline 스펙의 "local-first, uplink secondary"와 정합한다.

5. **상업 제품 = Ops·Build·Field·Agent.** Ops(cloud·관제·④)·Build(cloud·통합/SDK·non-operational)·Field(on-robot·현장·③)는 사용자 제품, **Agent는 사용자 제품이 아니라 on-robot runtime product(②)**. Local Agent 인스펙터는 운영자(Ops)가 아니라 **통합자/SDK(Build) 고도**로 둔다. **ADR-001 timing supersede** — 계약이 M1~M5로 안정화됐으므로 Ops/Build 물리 분리(ADR-001 step 3)를 후속 MVP에서 실행한다(SWT-PRODUCT-002).

6. **본 결정(MVP-1)은 문서·식별체계 고정에 한한다 — 코드 0 변경.** 코드 주석 패스·스캐폴드·구현은 후속 MVP에서 SW-WBS 식별자에 따라 수행한다. **SWT 완료 ≠ 출시**: 출시는 전체 SWT lifecycle + `external` 트랙(cloud aggregation·tenant·auth/RLS·persistence) + 비기능 요건(테스트·보안·성능·배포·관측성)을 추가로 요구한다(Part H6).

## 결과

- **상업 SaaS 구조가 SSOT에 고정** — Part H가 제품(Ops/Build/Field/Agent)→표면(SWS)→컴포넌트(SWC)→작업(SWT)을 인덱싱하고, 구현/미구현(done vs planned/external)이 분리된다. 후속 개발자는 `grep SWT-`로 backlog를 따라 주석·스캐폴드·구현한다.
- **미러·권한 위계 명문화** — 웹이 로봇 실체가 아니라 원격 미러라는 점, cloud가 field HMI보다 낮다는 점이 표면 레지스트리(locus/authority/mirrorOf/controlMode)와 UI affordance로 박힌다.
- **멀티로봇이 계약 비파괴** — connection-scoped 덕에 `CommandEnvelope`·on-robot 런타임 계약 변경 0. 멀티로봇 로직은 cloud-side `SWC-FLEET` 한 곳에 갇힌다. 식별자는 Part B에 `PRJ-`·`SITE-` 가산(문서 선행, code-pending SWT-ID-001).
- **출시 경계 명확** — Definition of Done이 SWC/SWT 범위별로 구분되고, `external` 트랙·비기능 요건이 출시 게이트로 분리되어 "backlog 완료 = 출시" 오해를 방지한다.
- **로드맵 정렬** — MVP-1(구조 인덱스=본 결정) → MVP-2(UX/UI 상업 구조 목업 + 주석 패스) → MVP-3(핵심 수직 라이브) → MVP-4(출시 트랙). station-field-os §12에 기록.

## 대안 (기각)

- **지금 전부 구현(FleetManager·fan-in·앱 분리·미러 패키지)** — "상업 구조 목업" 단계에 과하고 범위가 폭발한다. 식별체계로 구조를 먼저 고정하고 구현은 SWT로 분배. 기각.
- **`CommandEnvelope`에 `robot_id` 주입(멀티로봇 명령 라우팅)** — 프로즌 on-robot 계약에 fleet 개념을 욱여넣어 Local Agent·CommandRouter 순수성을 깬다. baseline "local-first"와 충돌. 기각(connection-scoped 채택).
- **HMI/Telemetry/Agent 미러를 각각 별도 Next.js 앱으로** — 미러는 독립 백엔드가 없고 전부 한 Agent WS를 가리켜 "deploy 경계 연극"이 된다. 실제 경계는 robot(Agent) vs cloud(제품)뿐. 하이브리드(제품 내 surface + Agent 데몬 승격) 채택. 기각.
- **`FLEET-*` 식별자 신설** — Fleet은 addressable 엔티티가 아니라 뷰(프로젝트 across 쿼리)다. 식별자화하면 cloud 권한 함의가 생긴다(권한 ④ < field ③ 위배). 기각.
- **기존 UX 화면코드(C0x/H01/T01) 폐기 후 SWS 재작성** — 과업지시서·spec-gap·화면 설계 문맥이 끊긴다. SWS로 흡수·매핑. 기각.
- **SW-WBS를 별도 문서로 분리** — 마스터 기준서가 정본이므로 Part H로 직접 편입해 단일 SSOT 유지(사용자 결정). 기각.
