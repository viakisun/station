# ADR-018 — Contracts SSOT 정합 (동결 해제)

- 상태: **Accepted**
- 관련: [STATION SDV Reference Platform (마스터 기준서)](../architecture/sdv-reference-platform.html) Annex E, [@station/contracts](../../packages/contracts/README.md), [ADR-010](ADR-010-contracts-ssot-json-schema.md), [ADR-014](ADR-014-robot-blueprint-open-node-taxonomy.md), [ADR-016](ADR-016-software-defined-work-layer.md), [ADR-017](ADR-017-open-source-sdv-reference.md)

## 맥락

설계 baseline(마스터 기준서)이 Part G(작업 레이어)·오픈 레퍼런스 포지셔닝까지 갖춰지면서, SSOT(`@station/contracts`)와 문서 사이의 불일치가 누적됐다. 그동안은 **계약 동결** 원칙으로 모든 불일치를 Annex E에 "변경안(pending)"으로만 적어 미뤄왔다. 점검 결과 그 불일치는 두 종류였다:

- **과도한 계약(over-specification)** — 닫힌 enum·하드코딩 grammar가 개방형 SDV 모델과 충돌. 예: `ids.ts robot: ^RBT-(THIN|PINCH)-\d{4}$`(작업 2종 하드코딩), `transport enum: ["MQTT","ROS2","DDS"]`(리그가 쓰는 CAN·WS·SERIAL 배제).
- **업데이트 누락(staleness)** — 설계 baseline이 normative로 쓰는데 SSOT에 없는 것. 예: `SCN·OBS·RT·MAP·INC·appId` 패턴 미등록, node 예시 `protocolRef` stale, `meta.module.pinching_ee.v1` 예시 부재, AppManifest·panel-host 계약 부재.

설계 기준서로서의 완성도를 위해 **동결을 해제하고 SSOT를 baseline에 정합**한다. (이건 "코드를 돌린다"가 아니라 "기준서가 가리키는 정본이 기준서와 일치한다"를 보장하는 작업이다.)

## 결정

1. **과도한 계약 개방** — `ids.ts robot`을 `^RBT-[A-Z0-9]+-\d{4}$`로 일반화(작업 enum 제거). `protocol-profile`·`module-manifest`의 `transport` enum에 `CAN·SERIAL·WS` 추가. (개방형 노드/Blueprint는 이미 올바르게 열려 있어 건드리지 않는다.)

2. **누락 보정** — `ids.ts ID_PATTERNS`에 `appId(station.app.*)·scanSession·observation·route·map·incident` 등록. node 예시 `protocolRef` 정합(MCU→PRT-CAN-v1·VPU→PRT-ROS-v1·ACU→PRT-DDS-v1). `meta.module.pinching_ee.v1` 예시 신설(thinning_ee 대칭, ACU/DDS). 참조만 되던 `PRT-{CAN,WS,DDS,ROS,MQTT}` 5종 ProtocolProfile 예시 신설.

3. **신규 계약면(Part G)** — `app-manifest.schema.json`(AppManifest, G1 필드) + `panel-host.schema.json`(PanelDescriptor, G8/E8 멀티벤더 HMI host-agnostic 렌더) 신설. codegen으로 `src/generated/*.ts` 생성.

4. **계약으로 옮기지 않는 것(문서/런타임 트랙 유지)** — `CommandCatalog`는 런타임 전용(계약 미변경, evaluateGate 입력). 물리 `module bay`는 HW 트랙. AGENT·HMI는 host pseudo-node로 유지(STANDARD 미편입 — 의도된 개방형). 이들은 결함이 아니라 의도적으로 계약 밖에 둔다.

5. **검증 게이트** — 모든 변경은 `codegen → validate(ajv) → typecheck → test`를 통과해야 한다. 본 정합 결과: codegen 15 types · validate 25 examples · workspace typecheck all green · local-agent test 10 pass. conformance harness 테스트는 "stale 검출"에서 "정합 확인 + 의도적 불일치 검출"로 갱신.

## 결과

- **기준서 ↔ SSOT 일치** — Annex E가 "변경안(pending)"에서 "적용 내역"으로 전환. 문서가 가리키는 정본이 실제로 문서와 일치한다.
- **개방형 SDV 정합** — 작업 종류·transport를 enum으로 가두지 않아, 7+ 작업·다양한 물리 링크·멀티벤더가 코어 변경 없이 표현된다(ADR-014·016·017과 정합).
- **작업 레이어 계약화** — AppManifest·panel-host가 1급 계약이 되어, 앱·패널 conformance(F7)가 실재한다(이전엔 이름만 존재).
- **하위호환** — enum 확장·grammar 일반화·패턴 추가·예시 데이터는 기존 유효값을 깨지 않는다(ripple: `isId`는 channel에만 쓰이고, RBT-* 사용처는 비검증 mock 데이터).

## 대안 (기각)

- **동결 유지(Annex E 변경안으로 영구 보류)** — 기준서가 가리키는 정본이 기준서와 불일치한 채 남아 "설계 기준서로서 미완성". 기각.
- **enum을 완전 개방 string으로** — 검증 가치를 잃는다. transport는 bounded set이므로 **enum 확장**(실사용 6종)이 적정. 기각.
- **CommandCatalog·module bay까지 계약화** — 전자는 런타임 데이터 구조, 후자는 HW 트랙. 계약(정적 선언)에 넣으면 과적. 문서/런타임 트랙 유지. 기각.
