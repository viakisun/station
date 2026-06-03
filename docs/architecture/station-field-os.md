# STATION Field OS — 통합 아키텍처

> 농업로봇용 **SDV/SDR(Software-Defined Robot)** 통합 플랫폼. 이기종 노드(에이지 MCU·메타 VPU/ACU·대동 LPU·비아 Telemetry)와 작업모듈을 **하나의 로봇·하나의 시스템**으로 잇는다.
>
> 관련: [ADR-010](../adr/ADR-010-contracts-ssot-json-schema.md) · [ADR-011](../adr/ADR-011-node-org-ownership-model.md) · [ADR-012](../adr/ADR-012-command-envelope-ack.md) · [ADR-013](../adr/ADR-013-signal-namespace.md) · [ADR-014](../adr/ADR-014-robot-blueprint-open-node-taxonomy.md) · [ADR-002](../adr/ADR-002-context-envelope-transport.md) · [ADR-003](../adr/ADR-003-realtime-protocol.md) · [ADR-006](../adr/ADR-006-gate-severity-model.md) · [ADR-007](../adr/ADR-007-audit-vs-event-log.md) · [시나리오 변경 명세](scenario-change-spec.md) · [통합 아키텍처 맵(HTML)](station-field-os-map.html) · [@station/contracts](../../packages/contracts/README.md)

---

## 1. 정체 — SDV에서 SDR로

자동차가 이기종 ECU를 **소프트웨어로 정의(SDV, Software-Defined Vehicle)** 했듯, STATION Field OS는 이기종 로봇 노드를 소프트웨어로 정의한다(**SDR, Software-Defined Robot**). 하드웨어 산출물의 소유는 기관에 흩어져 있지만, 운용·계약·경험은 하나의 OS 층으로 수렴한다.

> **비아의 진짜 역할 = 모든 로봇을 SDV로 개발할 토대다.** 온실 과제(적과/적심)는 이 플랫폼의 **첫 적용 사례(reference deployment)** 일 뿐이다. 물류 AMR, 방제 드론, 매니퓰레이터 전용기 등 어떤 로봇이든 같은 계약 코어 위에 올라간다. 따라서 계약 코어에는 온실 가정을 박지 않는다 — 온실은 `profiles/greenhouse/` 인스턴스에만 산다(§1.5·§2.5, [ADR-014](../adr/ADR-014-robot-blueprint-open-node-taxonomy.md)). 전체 그림은 [통합 아키텍처 맵(station-field-os-map.html)](station-field-os-map.html) — 비아 중심, RobotBlueprint 스트립 포함.

### 자동차 SDV ↔ STATION Field OS 대응표

| 자동차 SDV | STATION Field OS | 본 리포 구현 |
| --- | --- | --- |
| 이기종 ECU(공급사별) | 노드 MCU/VPU/ACU/Telemetry/LPU(기관별) | `node.schema.json` `kind` enum |
| VAL + SOA(서비스 추상화/오케스트레이션) | **Local Agent / Robot Gateway**(노드 프로토콜 흡수→표준화) | `runtime/local-agent.ts` (`LocalAgent`·`NodeAdapter`) |
| VSS(Vehicle Signal Specification) | **표준 신호 계약**(`machine.*`·`env.*` NS) | `signal-channel.schema.json`·`src/namespace.ts` |
| Android Automotive(인포테인먼트 OS·앱 런처) | **HMI 셸**(App Runtime·게이트·조작) | `manifest.requiredApps` + 3단계 HMI(3단계) |
| 커넥티드 텔레메트리/클라우드 | **Telemetry / 관제(Ops)** 업링크 | `Telemetry` 노드 · 비아(ORG-VIA) 소유 |

---

## 2. 3층 구조

```
┌─────────────────────────────────────────────────────────────┐
│ ③ 운영·경험층   HMI(조작·게이트) · Telemetry · 관제(Ops)        │  비아(ORG-VIA)
├─────────────────────────────────────────────────────────────┤
│ ② 계약층  STATION Contracts (@station/contracts)              │  언어중립 JSON Schema
│           Organization·Node·ModuleManifest·Signal·Command·    │  = SSOT = 이음새
│           Event·GateResult·ProtocolProfile·PolicyRule         │
├─────────────────────────────────────────────────────────────┤
│ ① 통합층  Local Agent / Robot Gateway (NodeAdapter)           │  비아(ORG-VIA)
│           노드 프로토콜 흡수 → Signal/Command/Event 표준화      │
└─────────────────────────────────────────────────────────────┘
        ▲ MCU      ▲ VPU·ACU       ▲ LPU        ▲ Telemetry
     에이지        메타파머스        대동         (게이트웨이)
```

- **① 통합층 (RAL)** — Local Agent / Robot Gateway가 노드별 transport(CAN·Modbus·ROS2·MQTT·DDS)를 NodeAdapter로 흡수해 표준 Signal/Command/Event로 노출한다. 노드의 이질성이 여기서 흡수된다.
- **② 계약층 = STATION Contracts** — `@station/contracts`. 언어중립 JSON Schema가 단일 진실 공급원(SSOT)이자 기관 사이의 **이음새**. 콘솔(TS)·HMI(Dart, 후속)·펌웨어가 한 계약을 공유한다([ADR-010](../adr/ADR-010-contracts-ssot-json-schema.md)).
- **③ 운영·경험층** — HMI(현장 조작·게이트), Telemetry(신호 업링크), 관제(Ops). 모두 비아(ORG-VIA)가 소유한다.

---

## 2.5. Platform core ↔ Instance profile

"모든 로봇을 SDV로"가 성립하려면 **계약 코어에 특정 로봇/도메인 가정이 없어야** 한다. 그래서 계약 패키지는 두 층으로 분리된다([profiles/README](../../packages/contracts/profiles/README.md), [ADR-014](../adr/ADR-014-robot-blueprint-open-node-taxonomy.md)).

| 층 | 경로 | 성격 | 내용 |
| --- | --- | --- | --- |
| **Platform core** | `packages/contracts/schema/` | **robot-agnostic** | Organization·Node·**RobotBlueprint**·Signal·Command·Event·ModuleManifest·Gate·PolicyRule 등 표준 계약. **온실/드론 같은 단어가 한 글자도 없다.** |
| **Instance profile** | `packages/contracts/profiles/` | instance(구체 배치) | 코어 위에 올라간 로봇 종류별 **RobotBlueprint** 선언. `greenhouse/`(이번 과제) · `reference/`(비온실 범용 증명). |

- 온실 컨소시엄(에이지·메타·대동·KIRO·농과원)은 `profiles/greenhouse/` 안에만 존재한다. **코어는 컨소시엄·온실과 무관**하다.
- 검증은 `pnpm --filter @station/contracts validate`가 `examples/`와 `profiles/**/*.json`을 모두 코어 스키마로 검사한다.

---

## 2.6. Robot Blueprint — 로봇 = 노드 조합

**어떤 로봇이든 Blueprint 1개로 정의된다.** `RobotBlueprint`(`schema/robot-blueprint.schema.json` → 타입 `RobotBlueprint`)는 로봇 한 종류를 **노드 + 작업모듈 + 표준계약의 조합**으로 선언한다.

```jsonc
RobotBlueprint = {
  blueprintId,        // ^blueprint\.[a-z0-9-]+$  (예 blueprint.greenhouse-thin)
  robotClass,         // 예 greenhouse-thinning-robot, spray-drone
  label, description?,
  profile?,           // 인스턴스 프로파일(도메인). 예 greenhouse. core 와 분리.
  nodes[]   { kind, ownerOrg, role? },        // 구성 컴퓨트 노드(kind 는 개방형 §2.7)
  modules[] { manifestRef, attachesToNode },  // 부착 작업모듈(ModuleManifest 참조)
  requiredContracts[]                          // 의존 표준 계약. 예 Signal·Command·Event·Calibration
}
```

### 예시 3종 (`profiles/`)

| Blueprint | robotClass | profile | nodes | modules | 비고 |
| --- | --- | --- | --- | --- | --- |
| [`blueprint.greenhouse-thin`](../../packages/contracts/profiles/greenhouse/blueprint.greenhouse-thin.json) | greenhouse-thinning-robot | greenhouse | MCU(AGE)·LPU(DAEDONG)·VPU(META)·ACU(META)·Telemetry(VIA) | manipulator + **thinning_ee** | 적과 로봇 |
| [`blueprint.greenhouse-pinch`](../../packages/contracts/profiles/greenhouse/blueprint.greenhouse-pinch.json) | greenhouse-pinching-robot | greenhouse | thin과 **동일 노드 골격** | manipulator + **pinching_ee** | 적심 — thin과 차이 = 모듈 1개 교체 |
| [`blueprint.spray-drone`](../../packages/contracts/profiles/reference/blueprint.spray-drone.json) | spray-drone | aerial | **FCU**(custom)·VPU·Telemetry(VIA) | sprayer | 비온실 참조 — 범용 증명 |

- **적과↔적심**은 노드 골격이 똑같고 작업모듈(EE)만 바뀐다 — 새 로봇 = 모듈만 교체한 **Blueprint 추가**.
- **방제 드론**은 온실 로봇이 아닌 전혀 다른 로봇도 같은 틀로 정의됨을 증명한다(custom 노드 `FCU` 사용, §2.7).
- **새 로봇 합류 = Blueprint 1개 추가.** 물류 AMR·매니퓰 전용기도 동일하다.

---

## 2.7. 개방형 NodeKind

노드 분류를 온실 5종에 가두면 "모든 로봇을 SDV로"가 무너진다. 그래서 `NodeKind`는 **개방형(open) taxonomy**다(`src/node-kinds.ts`, [ADR-014](../adr/ADR-014-robot-blueprint-open-node-taxonomy.md)).

- **권장 표준 5종** — `STANDARD_NODE_KINDS = ["MCU", "VPU", "ACU", "Telemetry", "LPU"]`(온실 멀티로봇 기준).
- **개방형 타입** — `type NodeKind = StandardNodeKind | (string & {})`. 표준 5종은 자동완성되고, 그 외 임의 문자열(custom)도 허용한다. 방제 드론의 `FCU`(flight control unit)가 그 예다.
- **판별자** — `isStandardNodeKind(kind): kind is StandardNodeKind`로 표준/custom을 구분한다.
- 스키마에서도 `Node.kind`·`RobotBlueprint.nodes[].kind`를 **string(개방형)** 으로 둔다(기존 닫힌 5-enum을 개방). 도메인 어댑터 `packages/domain/src/adapters/modules-to-nodes.ts`도 이 `NodeKind`를 `@station/contracts`에서 import해 쓴다.

제3자 노드(드론 FCU, 외부 벤더 컴퓨트)를 계약 변경 없이 수용한다.

---

## 3. 노드 ↔ 기관 ↔ 계약 모델

각 로봇은 여러 기관의 **독립 컴퓨트 노드**를 조립한 것이다. 노드/모듈마다 `ownerOrg`가 박혀 있고, 계약은 기관 사이의 **인계 경계**다([ADR-011](../adr/ADR-011-node-org-ownership-model.md)).

| 노드 | `kind` | 기관(`owner_org`) | 책임 |
| --- | --- | --- | --- |
| MCU(모바일 베이스·구동·조향·충전·비상정지·엔코더) | `MCU` | 에이지로보틱스 (`ORG-AGE`) | 이동·전원·안전정지 |
| 측위(LPS·맵) | `LPU` | 대동로보틱스 (`ORG-DAEDONG`) → 메타 ACU가 소비 | 위치·맵 신호 |
| 비전·AI 인식 | `VPU` | 메타파머스 (`ORG-META`) | 인식·검출 |
| 자율제어(미션·경로·작업시퀀스·안전전환) | `ACU` | 메타파머스 (`ORG-META`) | 로봇 지능·안전전환 |
| 매니퓰레이터 + 적과/적심 EE | `WorkModule`(ACU 부착) | 메타파머스 (`ORG-META`, KIRO/농과원 EE 변형) | 조작 작업 |
| 통신 게이트웨이 | `Telemetry` | 비아 (`ORG-VIA`) | 업링크 |

비아(`ORG-VIA`)는 로봇 컴퓨트 노드가 아니라 **운영·통합 계층**(Local Agent·계약·HMI·Telemetry·관제)을 소유한다(`platform:true`, `ownsNodes:["Telemetry"]`). KIRO(`ORG-KIRO`)·국립농업과학원(`ORG-NAS`)은 메타 작업모듈군의 EE 변형을 협력 공급한다(`ownsNodes:[]`).

### 계약 = 기관 인계면

- **에이지 MCU ↔ 메타 ACU** — Command(구동 명령)·Signal(상태·엔코더).
- **대동 LPU → 메타 ACU** — 측위 Signal(`machine.navigation.*`).
- **전 노드 → 비아 Telemetry/관제** — 표준 채널 업링크.
- **전 노드 ↔ 비아 HMI** — 조작·게이트(`GateResult`).

### 가공 벤더명 → 기관 정합 (`src/organizations.ts`)

| 가공 벤더(`VND-*`) | 기관(`ORG-*`) | 노드/모듈 |
| --- | --- | --- |
| `VND-OPTI` (OptiVision) | `ORG-META` | VPU(비전) |
| `VND-ARM` (ArmTech) | `ORG-META` | WorkModule(매니퓰레이터) |
| `VND-GREEN` (GreenEdge) | `ORG-META` | WorkModule(EE, KIRO/농과원 변형) |
| `VND-NAVI` (NaviCore) | `ORG-DAEDONG` | LPU(항법·측위) |

`VENDOR_TO_ORG`·`Organization.vendorAliases`·`ModuleManifest.vendorAlias`로 기존 목업 식별자를 비파괴 흡수한다.

---

## 4. 노드 분리 — 5종 독립 노드

`MCU`·`VPU`·`ACU`·`Telemetry`·`LPU`는 각각 독립 컴퓨트 노드다(모든 스키마의 `kind`/`node`/`target.node` enum 공통). 한 노드의 장애·배포·합류가 다른 노드에 새지 않도록, 노드는 Local Agent의 NodeAdapter 경계에서만 시스템과 만난다.

- `Node`(`node.schema.json`): `nodeId`(예 `NODE-MCU-AGE`·`NODE-VPU-META`)·`kind`·`ownerOrg`·`signals[]`·`commands[]`·`protocolRef`.

---

## 5. 데이터 경로 — Signal / Command / Event

### Signal (텔레메트리, 상향)
노드 어댑터 → `SignalStore` → HMI/관제 푸시.
- `Signal`(런타임 표본): `channel`(표준 NS)·`value`·`ts`·`quality`(good/warn/bad)·`source.node`·`source.rawKey`.
- `SignalChannel`(카탈로그): `channel`·`legacyId`(TCH-* alias)·`unit`·`node`·`ownerOrg`·`calibration`·`policy`(rate·warn·crit·`promote`). NS는 `machine.*`/`env.*`([ADR-013](../adr/ADR-013-signal-namespace.md)).

### Command (제어, 하향)
HMI/관제 → `CommandRouter` → 대상 노드. 3단계 ACK는 §6.

### Event (비동기 알람, 상향)
노드 → `EventBus.publish` → 임계 초과 시 Incident 승격(`promotedIncidentId`).
- `Event`: `ts`·`severity`(info/notice/warning/critical/emergency)·`source`·`node`·`code`(예 `CAM-FRAME-DROP`·`NAV-SAFETY-INTERLOCK`)·`message`·`channel`·`commandId`. 의미 분리는 [ADR-007](../adr/ADR-007-audit-vs-event-log.md).

---

## 6. Command 3단계 ACK

`CommandEnvelope` → `CommandRouter.dispatch(cmd, onAck)` → 노드. 진행은 `CommandAck.stage`로 흐른다([ADR-012](../adr/ADR-012-command-envelope-ack.md)).

```
received  → accepted → executed        (정상)
(게이트웨이 (권한·상태·   (완료)
 수신)      안전·큐잉)
            └─ rejected (code: SAFETY_LOCK …)   ─┐ 종단
            └─ timeout                            ─┘
```

- **CommandEnvelope**: `commandId`(예 `CMD-WKS-20260601-00045-0007`)·`verb`·`target.node`·`issuedBy.role`(operator/manager/maintainer/system)·`issuedAt` + `args`·`ack`·`timeoutMs`·`safety`(none/guarded/safety_critical).
- **CommandDescriptor**: 노드/매니페스트가 선언하는 받을 수 있는 명령(`verb`·`legacyVerb`·`ack`·`timeoutMs`·`safety`·`params`).
- 발행 전 `CommandRouter.evaluateGate(cmd)`가 `GateResult`(pass/warn/confirm_required/blocked, [ADR-006](../adr/ADR-006-gate-severity-model.md))로 권한·상태·안전을 평가한다.

---

## 7. NodeAdapter 개념

각 노드의 transport를 흡수해 표준 표면으로 노출하는 어댑터(`runtime/local-agent.ts`).

```ts
interface NodeAdapter {
  readonly manifest: ModuleManifest;
  start(): Promise<void>; stop(): Promise<void>;
  onSignal(cb): () => void;  onEvent(cb): () => void;
  send(cmd: CommandEnvelope): Promise<void>;
  onAck(cb): () => void;
}
```

`LocalAgent.register(adapter)`로 노드를 꽂으면, 그 노드의 Signal/Event/Command/Ack가 표준 `SignalStore`·`EventBus`·`CommandRouter`로 합류한다. 새 노드 추가 = NodeAdapter 1개 + 매니페스트 1건.

---

## 8. Module / Node Manifest (`owner_org`)

`ModuleManifest`(작업모듈/노드 산출물의 단일 매니페스트)는 **어느 기관이 만들었고 어느 노드에 붙으며 어떤 신호/명령/계약을 갖는지** 선언한다.
- 필수: `manifestId`(예 `meta.module.manipulator.v1`·`age.node.mcu.v1`)·`moduleType`·`version`·`ownerOrg`·`attachesToNode`.
- 선택: `vendorAlias`·`legacyModuleId`·`controller`·`protocol`(transport·`profileRef`)·`requiredDriver`·`requiredApps`·`signals[]`·`commands[]`·`calibration`·`firmwareRef`·`conformance`.

---

## 9. Policy / Safety 엔진

`PolicyEngine`이 `PolicyRule`을 평가해 안전·운영을 강제한다(2단계 런타임). 노드를 가로지르는 안전 폐루프 예:

```
VPU  machine.vision.worker_detected == true   (PolicyRule.when)
 └→ ACU  autonomy.slow_down                    (Command)
     └→ MCU  motion.speed_limit                (Command, safety: guarded)
         └→ HMI  알람                           (GateResult: confirm_required/blocked)
             └→ Telemetry  업로드               (Event → Incident 승격)
```

- `PolicyRule`: `id`(예 `P-WORKER-PROXIMITY`)·`when`·`require`·`gate`·`defaultSeverity`(pass/warn/confirm_required/blocked).
- 안전 동사(`isSafetyVerb`, `src/namespace.ts`): `ee.pinch`·`ee.release`·`arm.move`·`motion.stop`·`autonomy.pause`·`autonomy.slow_down` 등은 게이트 통과 후에만 실행.

---

## 10. App Runtime — 인포테인먼트 런처

HMI 셸은 자동차 인포테인먼트 OS의 앱 런처에 대응한다. 모듈 매니페스트의 `requiredApps`(App Runtime이 보장해야 할 모듈 앱: `id`·`minVersion`)를 HMI 셸이 **호스팅**한다. 새 작업모듈이 들어오면 셸은 그대로 두고 **앱만 추가**된다 — 노드/모듈 교체가 HMI 재작성으로 번지지 않는다.

---

## 11. 데이터 경로(전송)

- **HMI ↔ Local Agent**: REST(조작·조회) + WS(실시간 신호·ACK·이벤트). 실시간 추상화는 [ADR-003](../adr/ADR-003-realtime-protocol.md)(SSE/MQTT, mock→교체 한 곳).
- **Local Agent ↔ 노드**: CAN·Modbus(MCU) / ROS2·DDS(ACU·VPU·LPU) / MQTT(Telemetry). `ProtocolProfile`(transport·topics·ack·timeout·security)로 흡수.
- **Local Agent ↔ Cloud(관제·Telemetry)**: 표준 채널 업링크 + Event/Incident.
- 크로스앱 컨텍스트 핸드오프는 [ADR-002](../adr/ADR-002-context-envelope-transport.md).

---

## 12. 로드맵

| 단계 | 내용 | 산출물 | 상태 |
| --- | --- | --- | --- |
| **1단계** | STATION Contracts(스키마 SSOT) + 노드/기관 모델 + 런타임 인터페이스 + 본 문서 | `packages/contracts/{schema,src,runtime}` · ADR-010~013 · 본 문서 · [시나리오 변경 명세](scenario-change-spec.md) | ✅ 완료 |
| **2단계** | 참조 런타임 — Local Agent 구현 + 에이전트 앱(NodeAdapter·CommandRouter·App Runtime 실체) + 목업 런타임-백드 | `packages/local-agent` · `nodes/*` · `packages/domain/runtime` · `apps/console` | 🟡 진행(M1·M2·M3·M4) |
| **3단계** | Flutter HMI — `schema/`에서 Dart 모델 생성, App Runtime 셸 | Flutter HMI · Dart codegen | ⬜ 후속 |

1단계는 **계약과 문서**가 끝났다. 2단계는 **M1**(Reference Local Agent 코어 — SignalStore·EventBus·NodeRegistry·CommandRouter 3단계 ACK·Gate, ADR-015) → **M2**(NodeTransport + 다중 노드 분산 seam) → **M3**(App Runtime + 첫 작업 앱 `station.app.growth-scan`, ADR-016 — scan.start→ACU 미션+VPU capture→GrowthObservation(OBS-*) 합성) → **M4**(목업을 실제 런타임 위에 — `apps/console`의 `/control/agent`가 브라우저 인프로세스 `createLocalAgent()` + mock 노드 위에서 실 Signal·ACK·OBS 를 렌더; `@station/domain/runtime` provider/hooks, ws-free browser 서브패스, DB/JSON 영속화 seam 주석)까지 구현됨(`local-agent` test 20/20 green · console build·런타임 동작 검증). 남은 것: PolicyEngine 전체·Telemetry bridge·앱-레벨 데이터 런타임/DB 연결·`apps/agent` 상주화. HMI(경험층)는 같은 계약 위에 3단계로 올라간다.

---

## 13. `@station/contracts` 스키마·타입 참조

| 계약 | 스키마 | 생성 TS |
| --- | --- | --- |
| Organization | `schema/organization.schema.json` | `src/generated/organization.ts` |
| Node | `schema/node.schema.json` | `src/generated/node.ts` |
| ModuleManifest | `schema/module-manifest.schema.json` | `src/generated/module-manifest.ts` |
| SignalChannel / Signal | `schema/signal-channel.schema.json` · `schema/signal.schema.json` | `signal-channel.ts` · `signal.ts` |
| CommandDescriptor / CommandEnvelope / CommandAck | `command-descriptor` · `command-envelope` · `command-ack` `.schema.json` | 동명 `.ts` |
| Event | `schema/event.schema.json` | `src/generated/event.ts` |
| GateResult | `schema/gate-result.schema.json` | `src/generated/gate-result.ts` |
| ProtocolProfile | `schema/protocol-profile.schema.json` | `src/generated/protocol-profile.ts` |
| PolicyRule | `schema/policy-rule.schema.json` | `src/generated/policy-rule.ts` |

손작성: `src/organizations.ts`(`ORGANIZATIONS`·`VENDOR_TO_ORG`) · `src/namespace.ts`(`LEGACY_TO_NS`·`isSafetyVerb`) · `src/ids.ts`(`ID_PATTERNS`) · `runtime/local-agent.ts`(`LocalAgent`·`NodeAdapter`·`SignalStore`·`EventBus`·`CommandRouter`).
