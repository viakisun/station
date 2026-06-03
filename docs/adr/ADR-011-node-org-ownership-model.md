# ADR-011 — 노드 분류 · 기관 소유(owner_org) 모델

- 상태: **Accepted**
- 관련: [station-field-os §노드↔기관↔계약](../architecture/station-field-os.md), [ADR-010](ADR-010-contracts-ssot-json-schema.md), [organization.schema](../../packages/contracts/schema/organization.schema.json), [node.schema](../../packages/contracts/schema/node.schema.json)

## 맥락
초기 목업은 산출물을 가공 벤더명(VND-OPTI·VND-ARM·VND-GREEN·VND-NAVI)으로 묶었다. 실제 컨소시엄은 벤더가 아니라 **기관**(에이지·메타·대동·비아·KIRO·농과원)이 노드/모듈을 소유하고, 계약은 기관 사이의 **인계 경계**다. 누가 무엇을 책임지는지가 모델에 박혀 있어야 장애·배포·합류를 라우팅할 수 있다.

## 결정
- **노드 분류 5종**(`kind` enum, 모든 스키마 공통): `MCU` · `VPU` · `ACU` · `Telemetry` · `LPU`. 각 노드는 Local Agent가 NodeAdapter로 흡수해 표준 Signal/Command/Event로 노출하는 **독립 컴퓨트 노드**다.
- **Organization 레지스트리**(`src/organizations.ts`, `ORGANIZATIONS`): ORG-VIA(비아, `platform:true`)·ORG-AGE(에이지)·ORG-META(메타)·ORG-DAEDONG(대동)·ORG-KIRO·ORG-NAS. 각 기관은 `ownsNodes`로 소유 노드를 선언한다(비아는 컴퓨트 노드 비소유=`["Telemetry"]`만, 운영·통합 계층 소유).
- **owner_org**: `Node.ownerOrg`·`ModuleManifest.ownerOrg`·`SignalChannel.ownerOrg`가 산출물을 만든 기관을 가리킨다(`^ORG-[A-Z]+$`). 모듈 매니페스트는 `attachesToNode`로 어느 노드에 붙는지 선언한다.
- **계약 = 기관 인계면**: 에이지 MCU↔메타 ACU(Command/Signal), 대동 LPU→메타 ACU(측위 Signal), 전 노드→비아 Telemetry/관제·비아 HMI. 인계는 표준 계약을 통해서만 일어난다.
- **가공 벤더 alias 비파괴 정합**: `VENDOR_TO_ORG`(VND-OPTI→ORG-META, VND-ARM→ORG-META, VND-GREEN→ORG-META, VND-NAVI→ORG-DAEDONG)와 `Organization.vendorAliases`·`ModuleManifest.vendorAlias`로 기존 목업 ID를 기관으로 흡수한다. 기존 VND-*/MOD-* 식별자는 폐기하지 않는다.

## 결과
산출물·신호·명령마다 "어느 기관 책임인가"가 계약에 박힌다. 장애는 노드/기관으로 라우팅되고(S6), 신규 기관/노드는 레지스트리 1행 + 매니페스트 1건으로 합류한다(S7). 벤더 시절 데이터는 alias로 그대로 살아 있다.
