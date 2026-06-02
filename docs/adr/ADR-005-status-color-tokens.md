# ADR-005 — 상태 색상 토큰 (SSOT vs 프로토타입)

- 상태: **Proposed**
- 관련: [00 §3·§4](../00-ux-common-standards.md), [spec-gap §2.6](../spec-gap.md)

## 맥락
SSOT §4는 고채도 상태색(normal #2E7D32 / notice #1976D2 / warning #F9A825 / critical #E65100 / emergency #B71C1C)을
지정하나, 프로토타입 `tokens.css`는 더 절제된 값(`--st-normal #3a7d4a` 등)을 사용. 프로젝트 원칙 = 프로토타입 디자인 100% 보존.

## 결정(제안)
**기본 = 프로토타입 절제값 유지.** primitives 토큰에 `--st-*`와 `--st-*-ssot`를 병기해 1줄로 전환 가능.
검토 포인트: Field 안전 맥락(critical/emergency)만 SSOT 고채도 적용은 별도 사인오프(§4.1 DNA 일부 완화).

## 결과
디자인 일관성 유지 + 색 정합 결정의 비용을 1줄로 축소.
