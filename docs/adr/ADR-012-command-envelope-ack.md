# ADR-012 — CommandEnvelope + 3단계 ACK

- 상태: **Accepted**
- 관련: [station-field-os §Command 3단계 ACK](../architecture/station-field-os.md), [ADR-006](ADR-006-gate-severity-model.md), [command-envelope.schema](../../packages/contracts/schema/command-envelope.schema.json), [command-ack.schema](../../packages/contracts/schema/command-ack.schema.json)

## 맥락
HMI/관제가 노드(MCU·ACU 등)에 명령을 보낼 때, "보냈다"와 "됐다" 사이가 비어 있으면 안전 액션(EE pinch·arm move·e-stop)을 신뢰할 수 없다. 게이트웨이 수신·정책 통과·실제 완료를 구분해 운반해야 하고, 거부/타임아웃은 명확한 종단이어야 한다.

## 결정
- **CommandEnvelope**(런타임 명령 1 인스턴스): `commandId`(예 `CMD-WKS-20260601-00045-0007`)·`verb`(표준 NS 동사)·`target.node`(MCU/VPU/ACU/Telemetry/LPU, `target.module` 선택)·`issuedBy.role`(operator/manager/maintainer/system)·`issuedAt` 필수. 선택: `workSessionId`·`args`·`ack`·`timeoutMs`·`safety`(none/guarded/safety_critical). HMI/관제 → Local Agent `CommandRouter` → 대상 노드.
- **CommandAck**(3단계 ACK 한 틱): `stage` enum = `received`(게이트웨이 수신) → `accepted`(권한·상태·안전 통과·큐잉) → `executed`(완료). `rejected`/`timeout`은 종단. 거부 시 `code`(표준 에러코드, 예 `SAFETY_LOCK`)·`detail`.
- **CommandDescriptor**(매니페스트/노드가 선언하는 받을 수 있는 명령): `verb`·`ack`·`timeoutMs`·`safety` + `params`·`legacyVerb`(기존 SCREAMING 동사 병기, 예 `PINCH`).
- 런타임 라우팅: `CommandRouter.dispatch(cmd, onAck)`가 `received`를 즉시 반환하고 `accepted`/`executed`/`rejected`는 onAck 스트림으로 흘린다. 발행 전 `evaluateGate(cmd)`가 권한·상태·안전(Policy)을 4단계(ADR-006)로 평가한다.
- **conformance TS-CMDACK 정합**: 노드/매니페스트의 명령은 이 3단계 ACK 계약을 충족해야 적합 판정한다(2단계 런타임의 conformance suite).

## 결과
모든 명령이 received→accepted→executed의 동일 생애주기를 갖고, 거부/타임아웃이 표준 코드로 종단된다. 안전 액션의 진행 상태가 HMI·관제·감사에서 일관되게 표현된다.
