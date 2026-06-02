# ADR-002 — Context Envelope 전송 방식

- 상태: **Proposed**
- 관련: [00 §7](../00-ux-common-standards.md)

## 맥락
제품 경계(다른 오리진)를 넘어 선택 컨텍스트(robot/work_session/incident/module/calibration ID + return_to)를 운반해야 한다. 단일 진실 원칙상 ID만 운반하고 대상이 재조회한다.

## 옵션
- A. 서명된 단일 `ctx` 쿼리 파라미터(base64url(JSON)+HMAC, 키=session_id). 백엔드 없이 지금 구현 가능.
- B. 서버 발급 `handoff_id`(POST로 envelope 저장→opaque id로 리다이렉트→타깃이 GET). URL/로그에 ID 비노출, 프로덕션 적합.

## 결정(제안)
**A 먼저 → 백엔드 도입 시 B로 승급.** Phase 0에서는 `ContextEnvelope` **타입만** 고정(HMAC 구현은 Phase 1+).

## 결과
무백엔드 환경에서 즉시 크로스앱 핸드오프 가능, 추후 보안 강화 경로 명확.
