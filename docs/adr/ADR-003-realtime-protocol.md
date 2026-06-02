# ADR-003 — 실시간 프로토콜 전략

- 상태: **Proposed**
- 관련: [00 §6](../00-ux-common-standards.md). 현재 이벤트는 가짜 setInterval(EventStrip·hub·러너).

## 맥락
이벤트 스트림·OTA 진행·conformance 러너가 setInterval로 가짜. 단일 `RealtimeClient.subscribe(topic, cb)`로 추상화 필요.

## 옵션
- SSE: 단방향·HTTP·브라우저 팬아웃 단순.
- MQTT v5: 양방향·QoS/ack(SSOT §9 UI 노출), 엣지/디바이스 적합.

## 결정(제안)
**역할 분리** — 브라우저 이벤트 팬아웃 = SSE, 엣지 게이트웨이/디바이스 = MQTT. Phase 0은 `RealtimeClient` **인터페이스 + MockClient**만(실 프로토콜은 Phase 3).

## 결과
UI는 transport 무관. mock→SSE/MQTT 교체가 한 곳.
