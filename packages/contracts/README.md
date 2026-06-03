# @station/contracts — STATION Contracts

**STATION Field OS**의 계약층(이음새). 컨소시엄 기관이 만든 이기종 노드(MCU/VPU/ACU/Telemetry/LPU)와
작업모듈을 **하나의 로봇·하나의 시스템**으로 잇는 **언어중립 표준 계약**의 단일 진실 공급원(SSOT).

## 규약: 스키마가 진실, TS/Dart는 생성물
- **SSOT = `schema/*.json`** (JSON Schema draft 2020-12). 사람·머신·TS·Dart 모두 이것을 본다.
- **TS 타입 = `src/generated/*.ts`** — `schema/`에서 codegen으로 **생성**(손수정 금지). 리포에 커밋한다.
- **Dart 모델**(후속, Flutter HMI)도 같은 `schema/`에서 생성 → 콘솔(TS)·HMI(Dart)·펌웨어가 한 계약 공유.

## 구성
- `schema/` — **platform core**(robot-agnostic) 표준 계약 스키마: organization · node · **robot-blueprint** · module-manifest · signal · command(+3단계 ACK) · event · protocol-profile · gate · namespace · id-spine. 온실/드론 같은 단어가 한 글자도 없다.
- `profiles/` — **instance** 프로파일. 로봇 종류별 **RobotBlueprint** 선언: `greenhouse/`(적과/적심, 이번 과제) · `reference/`(방제 드론, 비온실 범용 증명). [profiles/README](profiles/README.md).
- `examples/` — 스키마를 통과하는 픽스처(조직·노드·매니페스트·신호·명령·이벤트).
- `src/generated/` — codegen 산출 TS 타입(커밋).
- `src/node-kinds.ts` — **개방형 NodeKind**: `STANDARD_NODE_KINDS`(권장 5종 MCU/VPU/ACU/Telemetry/LPU) + `type NodeKind = StandardNodeKind | (string & {})`(custom 허용) + `isStandardNodeKind()`.
- `src/organizations.ts` — 컨소시엄 6기관(ORG-*) 상수 + 가공 벤더명(VND-*)→ORG-* alias.
- `src/namespace.ts` — 표준 신호/명령 네임스페이스(`machine.*`/`env.*`) + TCH-* legacy alias 매퍼.
- `src/ids.ts` — ID 문법 검증기(RBT/MOD/WKS/CMD/...).
- `runtime/` — Local Agent 런타임 **인터페이스/타입만**(구현은 STATION Field OS 2단계).

## Robot Blueprint — 로봇 = 노드 조합

"모든 로봇을 SDV로"의 핵심 일반화: **어떤 로봇이든 Blueprint 1개로 정의된다.** `RobotBlueprint`(`schema/robot-blueprint.schema.json`)는 로봇 한 종류를 **노드 + 작업모듈 + 표준계약의 조합**(`blueprintId`·`robotClass`·`profile?`·`nodes[]`·`modules[]`·`requiredContracts[]`)으로 선언한다. 노드 `kind`는 개방형(`src/node-kinds.ts`) — 권장 5종 + custom(예 방제 드론 `FCU`). 예시 3종은 `profiles/`(greenhouse-thin·greenhouse-pinch·spray-drone). **새 로봇 합류 = Blueprint 1개 추가.** 온실 과제는 첫 적용 사례(reference deployment)다([ADR-014](../../docs/adr/ADR-014-robot-blueprint-open-node-taxonomy.md)).

## 사용
```bash
pnpm --filter @station/contracts validate   # examples/* 를 schema 로 검증
pnpm --filter @station/contracts codegen     # schema/* → src/generated/*.ts (재생성)
pnpm --filter @station/contracts typecheck
```

## 노드 ↔ 기관 소유 (요약)
| 노드 | kind | 기관(owner_org) |
| --- | --- | --- |
| 모바일 베이스 | MCU | 에이지로보틱스 (ORG-AGE) |
| 측위 | LPU | 대동로보틱스 (ORG-DAEDONG) |
| 비전 | VPU | 메타파머스 (ORG-META) |
| 자율제어 | ACU | 메타파머스 (ORG-META) |
| 매니퓰레이터+엔드이펙터 | WorkModule | 메타파머스 (KIRO/농과원 변형) |
| 통신 게이트웨이 | Telemetry | 비아 (ORG-VIA) |

비아(ORG-VIA)는 로봇 컴퓨트 노드가 아니라 **운영·통합 계층**(Local Agent·계약·HMI·Telemetry·관제)을 소유한다.
