# ADR-010 — STATION Contracts = JSON Schema 단일 진실 공급원

- 상태: **Accepted**
- 관련: [station-field-os §계약층](../architecture/station-field-os.md), [packages/contracts/README](../../packages/contracts/README.md), [ADR-002](ADR-002-context-envelope-transport.md)

## 맥락
이기종 노드(에이지 MCU·메타 VPU/ACU·대동 LPU·비아 Telemetry)와 작업모듈을 하나의 로봇으로 이으려면, 콘솔(TS)·HMI(Dart, 후속)·펌웨어·머신·사람이 **같은 계약**을 봐야 한다. 계약을 어느 한 언어 타입(TS interface 등)에 두면 나머지가 종속·표류한다. 이음새(계약)는 언어중립이어야 한다.

## 결정
- **SSOT = `packages/contracts/schema/*.json`** (JSON Schema draft 2020-12). 사람·머신·TS·Dart가 모두 이 파일을 본다.
- **TS 타입 = `src/generated/*.ts`** — `schema/`에서 codegen으로 **생성**(손수정 금지)하고 리포에 커밋한다. **Dart 모델**(Flutter HMI, 3단계)도 같은 `schema/`에서 생성한다.
- 손작성 로직은 계약과 분리: `src/organizations.ts`(기관 레지스트리·벤더 alias)·`src/namespace.ts`(NS·legacy alias)·`src/ids.ts`(ID 문법). 공개 표면은 `src/index.ts`.
- 검증·생성은 패키지 스크립트로 강제: `validate`(examples/* 를 schema로 검증)·`codegen`(schema→generated)·`typecheck`.

## 결과
한 계약을 콘솔·HMI·펌웨어가 공유하고, 스키마만 고치면 전 산출물이 한 곳에서 재생성된다. 계약이 코드보다 먼저 존재하므로 신규 기관/노드는 "스키마를 통과하는 매니페스트 1건"만으로 합류한다(ADR-011).
