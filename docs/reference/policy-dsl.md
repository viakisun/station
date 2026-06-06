# Policy DSL — 안전·운영 룰

Local Agent PolicyEngine 이 평가하는 룰 문법. `eval` 없는 구조화 조건 — SignalStore latest
값 + 컨텍스트 state 를 비교. 스키마: [`policy-rule.schema.json`](../../packages/contracts/schema/policy-rule.schema.json).
엔진: [`policy-engine.ts`](../../packages/local-agent/src/policy-engine.ts). CommandRouter `evaluateGate`
의 base 게이트 위에 overlay(base blocked 면 우선, 아니면 정책 적용).

## 룰 구조

```jsonc
{
  "id": "POL-WORKER-SAFETY",
  "applies": ["autonomy.*"],                         // 적용 verb(glob 접두 *)
  "when": { "signal": "machine.vision.worker_detected", "op": "==", "value": true },
  "effect": "blocked",                               // pass|warn|confirm_required|blocked
  "gate": "G-Safety",
  "reason": "작업자 근접 — 자율주행 차단"
}
```

## 조건(when)

- 단일 비교: `{ "signal": "<채널>" | "state": "<키>", "op": "== != < > <= >=", "value": ... }`
  - `signal` = SignalStore latest 채널값 · `state` = 엔진 주입 컨텍스트 변수.
  - 값이 없으면(undefined) **미충족**(안전: 모르면 트리거 안 함).
- 합성: `{ "all": [조건…] }`(AND) · `{ "any": [조건…] }`(OR), 중첩 가능.

## effect

| effect | 결과 |
|---|---|
| `blocked` | 명령 거부(rejected, code=gate) |
| `confirm_required` | 확인 필요 — `args.__confirmed=true` 재발행 시 통과(확인 플로) |
| `warn` | 통과하되 경고 게이트 |
| `pass` | 무효(통과) |

## 기본 룰(reference)

[`profiles/policy/`](../../packages/contracts/profiles/policy/):
- `POL-WORKER-SAFETY` — `worker_detected==true` → `autonomy.*` blocked.
- `POL-ESTOP-MOTION` — `safety.estop==true` → `motion.set_speed_limit`·`autonomy.mission.start` blocked.
- `POL-LOWBATT-CONFIRM` — `battery_voltage<21.5` → `autonomy.mission.start` confirm_required.

## 확인 플로(confirm_required)

1. 명령 dispatch → 정책이 `confirm_required` → CommandRouter 가 `rejected`(code `G-Confirm`, detail=이유).
2. HMI/콘솔이 `G-Confirm` 거부를 감지 → 확인 모달(design-system `ConfirmModal`).
3. 사용자 확인 → `args.__confirmed=true` 로 **재발행** → 정책이 통과 → 정상 dispatch.

> 엔진·라우터 측 메커니즘은 구현·테스트 완료. Field/Ops 확인 모달 UI 와이어링은 후속(얇은 UI 작업).
