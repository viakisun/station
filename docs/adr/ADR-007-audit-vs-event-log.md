# ADR-007 — Audit Log vs Event Log 분리

- 상태: **Accepted**
- 관련: [00 §6](../00-ux-common-standards.md)

## 맥락
"모든 상태변경을 audit_log에 기록"은 로그가 과도하게 시끄러워짐. 의미 있는 행위만 감사 대상으로 제한 필요.

## 결정
- **Event Log**: 센서 이벤트·상태 변화·실시간 알림·command 결과·telemetry 이상.
- **Audit Log**(커밋 전 AuditEntry 생성): 사람의 승인·위험 액션·정책 우회·운영 반영(배포 승인·e-stop 해제·캘리브 저장·incident close·parameter apply).
- AuditEntry: `actor · action · target · reason · before/after · gate_results · result`.

## 결과
감사 로그가 "누가 왜 위험/승인 행위를 했나"에 집중. 화면에서도 두 로그를 분리 표현.
