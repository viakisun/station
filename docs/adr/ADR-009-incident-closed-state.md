# ADR-009 — Incident `closed` 상태 추가

- 상태: **Accepted**
- 관련: [00 §3](../00-ux-common-standards.md), 현재 mock = open/ack/progress/resolved/monitoring

## 맥락
SSOT C03 완료 기준은 "재발 확인 또는 waiver 후 장애 종료"를 요구하나, 현재 상태셋에 명시적 종료 상태가 없다.

## 결정
Incident 상태에 **`closed`** 추가: `… → resolved → closed`(재발 확인 또는 명시적 waiver + audit). `monitoring`에서
재발 감지 시 `in_progress`로 회귀.

## 결과
"재발 확인 후 종료" 폐루프 불변식을 상태로 표현. 폐쇄는 audit_log 대상(ADR-007).
