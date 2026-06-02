# ADR-006 — Gate 판정 모델 (4단계)

- 상태: **Accepted**
- 관련: [00 §5](../00-ux-common-standards.md)

## 맥락
초기 게이트는 통과/차단 2단계로 모델됐으나, 실제 운영은 경고·확인 단계가 필요(예: parameter 버전 불일치는 경고+확인).

## 결정
```
GateSeverity = pass | warn | confirm_required | blocked
GateResult   = { gate, severity, reason?, blocks?[] }
```
UI 매핑: pass=사용가능 / warn=주의 후 진행 / confirm_required=hold-to-confirm / blocked=진행 불가(+차단 사유·해결 행동).
클라이언트=UX, 서버=동일 정책 재검증.

## 결과
모든 제품이 같은 4단계 의미를 공유, UI 표현이 일관.
