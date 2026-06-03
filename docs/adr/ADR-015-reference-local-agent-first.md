# ADR-015 — 첫 구현 단위는 Reference Local Agent (HMI는 하류)

- 상태: **Accepted**
- 관련: [STATION SDV Reference Platform (마스터 기준서)](../architecture/sdv-reference-platform.html) Part C·E·F, [runtime/local-agent.ts](../../packages/contracts/runtime/local-agent.ts), [ADR-010](ADR-010-contracts-ssot-json-schema.md), [ADR-012](ADR-012-command-envelope-ack.md), [ADR-014](ADR-014-robot-blueprint-open-node-taxonomy.md)

## 맥락

2차 베이스 프로그램(`packages/local-agent` · `nodes/*` · `apps/sdv`)에 착수할 때, 직관적으로 **HMI(`apps/sdv`)부터** 만들고 싶어진다 — 화면이 가장 손에 잡히기 때문이다. 그러나 지금까지 확정한 문서가 그 직관을 반박한다.

- 마스터 기준서의 구조는 **허브-스포크**다. 두 노드는 직접 통신하지 않고 **모든 교환이 Local Agent를 경유**한다(F0, REQ-A02).
- HMI는 `IF-L-HMI-AGG`로 **Agent aggregate만 구독**하는 교체 가능한 thin client다(Part F). 즉 **Agent가 정규화된 Signal/Event/ACK를 내놓기 전엔 HMI가 그릴 데이터가 없다.**
- 안전·권한도 "HMI 없이도 Agent가 안전정책·node health를 유지"(REQ-A05)로, **Agent가 본체, HMI는 부속**임을 못박는다.
- 계약(`@station/contracts`)은 SSOT이지만 아직 **"설계"일 뿐 실행되지 않는다.** 무엇이 먼저든, 계약을 *도는 레퍼런스*로 만드는 것이 선결이다.

따라서 "먼저 만들 것"은 HMI가 아니라 **허브 = Local Agent**이고, 그것을 어떻게 1급 구현 단위로 정의하느냐가 본 ADR의 결정이다.

## 결정

1. **첫 구현 단위 = Reference Local Agent + Node Conformance Harness.** [`runtime/local-agent.ts`](../../packages/contracts/runtime/local-agent.ts)의 인터페이스를 실제 구현한다: **SignalStore · EventBus · CommandRouter(3단계 ACK + `evaluateGate`) · NodeRegistry · HealthMonitor.** 여기에 **`NodeAdapter`를 구현한 mock 노드 1개 + `NodeTransport` 스탠드인**을 붙여 계약이 실제로 도는지 증명한다.

2. **첫 산출물 = vertical slice 1개.** 다음 한 줄기를 끝에서 끝까지 통과시킨다:
   - **Signal up**: 노드가 Signal 1개를 (mock) transport로 발행 → Agent SignalStore 흡수 → Agent API로 노출.
   - **Command down**: 소비자가 Command 1개 하향 → CommandRouter `evaluateGate`(권한·상태·안전) → ACK `received → accepted → executed` → mock 노드 실행.
   - 이 슬라이스가 돌면 **Part C(메시지)·Part F(인터페이스)·F7(conformance)이 코드로 검증**된다.

3. **빌드 순서(2차 Step과 동일)** — **Step1 SignalStore + EventBus → Step2 NodeRegistry + HealthMonitor → Step3 CommandRouter + ACK + Gate** 가 "첫 번째 덩어리"다. Step4 PolicyEngine · Step5 ScanSession/GrowthObservation · Step6 Telemetry bridge 는 후속. `nodes/*` 다중 노드와 `apps/sdv` HMI 확장은 **seam이 안정된 뒤**.

4. **seam 우선** — 두 경계를 먼저 박는다: **노드측 `NodeAdapter`** 와 **소비자측 Agent API**(HMI·관제). 이 둘이 고정되면 노드팀(MCU/VPU/LPU/ACU/TEL)과 HMI팀이 **각자 seam에 대고 병렬 개발**할 수 있다.

5. **mock ⟂ transport 분리(스탠드인)** — `MockSource`(데이터 생성)와 `NodeTransport`(전송)를 분리하고, 후속에 `Real*`(RealCanSource·RealRos2Source·RealCameraInferenceSource 등)로 무중단 스왑한다. **real 코드 + mock 데이터**로 시작한다(ADR-014의 robot-agnostic 코어 위에서).

## 결과

- **계약의 실행화** — 설계 문서가 *도는 레퍼런스*가 된다. Annex E의 동결 불일치(MCU/VPU/ACU `protocolRef`)가 harness에서 실제로 드러나, 코드 정합 시점을 판단할 근거가 생긴다.
- **병렬 작업 언블록** — seam(NodeAdapter + Agent API)이 먼저 서면 각 노드팀·HMI팀이 독립 개발한다.
- **HMI는 후순위 뷰** — `apps/sdv`는 안정된 Agent API 위의 표현 계층으로 정의되어 재작업 위험이 사라진다.
- **conformance 기준 확정** — F7의 "노드 `manifest`(signals ∪ commands) ∪ `protocolRef` == IF-P 시트"를 harness가 자동 검사하는 출발점이 된다.

## 대안 (기각)

- **HMI를 먼저** — 그릴 데이터가 없어 mock UI를 임시로 만들게 되고, 이후 실제 Agent API와 따로 놀아 **재작업**이 발생한다. 허브-스포크·`IF-L-HMI-AGG` 정의와 충돌. 기각.
- **전 노드 동시 구현** — seam이 불안정한 상태에서 5개 노드를 병렬로 만들면 **계약 드리프트**가 누적된다. 먼저 1개 노드로 seam을 고정한 뒤 확장. 기각.
- **계약 코드부터 수정(Annex E 실행)** — 동결 해제는 harness가 불일치를 *실증*한 뒤가 안전하다. 지금은 설계 인용만 유지. 보류.
