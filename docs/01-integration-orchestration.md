# 01. STATION 통합 오케스트레이션 — 핵심 가치 모델 (SSOT 보강)

> STATION = 컨소시엄이 하나의 SDV를 **통합·검증·릴리스**하는 플랫폼. 두 기둥으로 정의한다.
> 결정 근거: [ADR-022](adr/ADR-022-integration-orchestration-core-value.md). UX 기준: [00-ux-common-standards](00-ux-common-standards.md).
> 이 문서가 Landing([apps/hub](../apps/hub/app/page.tsx))이 렌더하는 모델의 단일 출처.

## 0. 한 줄

여러 기관이 각자 노드/모듈을 만들어 **하나의 로봇**으로 통합한다. STATION은 그 통합을 **① 기술 미들웨어**와
**② 조직 오케스트레이션**으로 보이게·관리 가능하게 한다.

## 1. 두 기둥

### ① 통합 미들웨어 (Integration Fabric / RAL)
이질적 벤더 노드를 **표준 계약 한 면**으로 흡수하는 기술층.
- **흡수**: NodeAdapter가 CAN(MCU)·ROS2(VPU)·DDS(LPU·ACU)·MQTT(Telemetry)를 표준 Signal/Command/Event로.
- **거버넌스**: 3단계 ACK·Gate·Policy·Conformance·App Runtime.
- **실행 가능**: `local-agent` + `run-rig`(5노드 합류) + `/transport`(전송 흡수 가시화) + conformance 러너.
- 자산: [station-field-os §1·§7](architecture/station-field-os.md), `@station/contracts`, ADR-015/016.

### ② 통합 오케스트레이션 (Integration Orchestration)
컨소시엄 팀들의 **readiness·할당·릴리스**를 목표 중심으로 조율하는 조직층. ①의 계약에서 자동 도출된다.

## 2. 핵심 개념

| 개념 | 정의 | 출처(자동 도출) |
|---|---|---|
| **산출물(artifact)** | 통합 대상 단위 — node·module·firmware·app·blueprint | manifest·blueprint |
| **Readiness** | `verified · in_progress · blocked` | conformance(F7) + 상태머신 |
| **소유(owner)** | 산출물을 책임지는 org | [ORGANIZATIONS](../packages/contracts/src/organizations.ts) |
| **다음 책임자** | 막힌 스텝을 풀 주체 | 상태+의존(IF-L)+소유에서 계산 |
| **릴리스 채널** | `draft → canary → beta → stable` (신규 프리미티브) | 검증 통과 → 승급 규칙 |
| **할당(assignee)** | 산출물/스텝 → org·role·person (신규, `Incident.owner` 1급화) | 수동 오버레이 |
| **의존(dependency)** | 산출물 간 "누가 누구를 기다리나" | [IF-L provider/consumer](../packages/contracts/src/generated/interfaces.ts) |

## 3. 통합 라이프사이클

`ready(납품) → test(합류·흡수) → verify(conformance) → deploy(OTA·gate) → audit(승인) → publish(채널 승급)`

각 단계의 게이트는 기존 G1~G7([gates.ts](../packages/domain/src/gates.ts))·conformance·audit 상태머신
([release.ts](../packages/domain/src/data/release.ts))을 재사용한다.

## 4. 혼합 오케스트레이션 (자동 + 수동)

- **자동 도출(계약에서)**: blueprint→통합 스텝, IF-L→스텝 의존, conformance→검증 게이트.
- **수동 오버레이(사람이)**: 게이트(승인/확인) · 할당(담당) · 채널(stable/beta 발행).
- **범용 워크플로우 빌더 아님**: 노드=도메인 산출물, 엣지=계약 의존. 자유 DAG/n8n 경쟁 금지(수기 유지 = 사망).

## 5. 페르소나 × 공동 목표

| 역할 | 기관 예 | 통합에서의 몫 |
|---|---|---|
| 펌웨어 개발자 | 에이지(MCU)·대동(LPU) | 노드 납품·conformance 통과 |
| 통합/SDK | 비아(Build) | 계약·인스펙션·릴리스 |
| 관제 | 비아(Ops) | 배포·운용·인시던트 |
| 현장 | 비아(Field) | 조작·보정·안전 |
| 작업모듈 | 메타·KIRO·농과원 | VPU/ACU·EE 변형 납품 |

**공동 목표**: "이 로봇(blueprint)을 통합·검증해 beta/stable로 릴리스." 모든 역할이 이 목표의 한 조각을 본다.

## 6. 범위

- **이번**: 핵심 가치 명문화(본 문서 + ADR-022) + Landing 한 장(두 기둥 가시화, 자동 도출 수치).
- **후속**: 오케스트레이션 런타임(할당 API·승인 큐·채널 승급 자동화·서버 재검증)·릴리스 레지스트리
  (published as stable/beta 기록·attestation)·Ops/Build/Field readiness 연동.
