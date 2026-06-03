# ADR-014 — Robot Blueprint 계약 · 개방형 NodeKind · platform/profile 분리

- 상태: **Accepted**
- 관련: [station-field-os §2.5~2.7](../architecture/station-field-os.md), [ADR-010](ADR-010-contracts-ssot-json-schema.md), [ADR-011](ADR-011-node-org-ownership-model.md), [robot-blueprint.schema](../../packages/contracts/schema/robot-blueprint.schema.json), [node-kinds.ts](../../packages/contracts/src/node-kinds.ts), [profiles/README](../../packages/contracts/profiles/README.md)

## 맥락

[ADR-011](ADR-011-node-org-ownership-model.md)은 노드 분류를 닫힌 5-enum(`MCU`·`VPU`·`ACU`·`Telemetry`·`LPU`)으로 고정하고, 계약 스키마에 온실 컨소시엄(에이지·메타·대동·KIRO·농과원)을 직접 묻혔다. 이는 온실 과제 한 건에는 충분하다.

그러나 비아의 진짜 역할은 **모든 로봇을 SDV로 개발할 토대**를 만드는 것이고, 온실 과제(적과/적심)는 그 **첫 적용 사례(reference deployment)** 일 뿐이다. 모든 로봇을 SDV로 정의하려면:

- 노드 분류를 **온실 5종에 가두면 안 된다.** 방제 드론은 `FCU`(비행제어), 매니퓰 전용기는 다른 노드를 쓴다.
- 계약 **코어에 온실/특정 도메인 가정이 박히면 안 된다.** 코어는 robot-agnostic이어야 한다.
- "로봇 한 종류"를 선언하는 **1급 계약**이 없어 로봇 추가가 암묵지에 머문다.

## 결정

1. **Robot Blueprint 계약 도입** — `schema/robot-blueprint.schema.json`(타입 `RobotBlueprint`). 로봇 한 종류 = `{ blueprintId, robotClass, label, profile?, nodes[]{kind,ownerOrg,role?}, modules[]{manifestRef,attachesToNode}, requiredContracts[] }` 조합. **어떤 로봇이든 Blueprint 1개**로 정의된다. 예시 3종: `blueprint.greenhouse-thin`(적과)·`blueprint.greenhouse-pinch`(적심, thin과 동일 노드 골격·모듈만 교체)·`blueprint.spray-drone`(비온실 참조, custom 노드 `FCU`).

2. **NodeKind 개방형(open) taxonomy** — `src/node-kinds.ts`. `STANDARD_NODE_KINDS = ["MCU","VPU","ACU","Telemetry","LPU"]`(권장 5종)와 `type NodeKind = StandardNodeKind | (string & {})`(개방형) + `isStandardNodeKind()` 판별자. 스키마의 `Node.kind`·`RobotBlueprint.nodes[].kind`를 닫힌 enum에서 **string으로 개방**. 드론 `FCU` 등 custom 노드를 계약 변경 없이 수용. 도메인 어댑터 `packages/domain/src/adapters/modules-to-nodes.ts`도 이 `NodeKind`를 import.

3. **Platform core ↔ Instance profile 분리** — `schema/` = **platform core**(robot-agnostic, 온실 단어 0), `profiles/` = **instance**(`greenhouse/`·`reference/`의 RobotBlueprint 선언). 온실 컨소시엄은 `profiles/greenhouse/` 안에만 존재하고 코어는 무관. `validate`가 `examples/`와 `profiles/**/*.json`을 모두 코어 스키마로 검사.

## 결과

- **새 로봇 합류 = Blueprint 1개 추가.** 물류 AMR·방제 드론·매니퓰 전용기 모두 동일. 적과↔적심처럼 노드 골격이 같으면 모듈만 교체한 Blueprint를 더한다.
- **제3자 노드 수용** — 드론 `FCU` 등 표준 5종 밖 노드를 enum 수정 없이 받는다.
- **코어 무온실** — `schema/`는 robot-agnostic으로 유지되어, 온실은 첫 적용 사례로만 남고 플랫폼은 범용으로 선다.
- 비파괴 — 기존 5종은 `STANDARD_NODE_KINDS`로 권장 표준으로 살아 있고, 닫힌 enum 시절 `examples/`는 그대로 통과한다.

## 대안 (기각)

- **닫힌 5-enum 유지([ADR-011] 원안)** — 온실 한 건에는 단순하나, 드론 `FCU` 같은 노드를 받을 때마다 코어 enum을 고쳐야 한다. "모든 로봇을 SDV로"라는 정체와 충돌하고, 온실 가정이 코어에 누적된다. 기각.
