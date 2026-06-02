# ADR-001 — 제품 분리 전략 (Ops/Build 물리 분리 시점)

- 상태: **Accepted**
- 관련: [00 §1](../00-ux-common-standards.md), Build 워크스페이스(C02/C04)는 현재 `apps/console`에 존재

## 맥락
STATION은 Ops·Build·Field 3제품. 현재 C01–C04가 한 `apps/console` 셸에 묶여 있다. 제품별 디자인 방향·셸·
사용자가 다르므로 분리가 맞으나, 지금 즉시 물리 분리하면 Platform Core/Context 계약 미정 상태에서 개발 속도 저하.

## 옵션
- A. 지금 `apps/ops`·`apps/build`로 물리 분리.
- B. console 내부에 product boundary(`/ops`·`/build`, `data-theme`, 셸/nav/permission 분리) 먼저 → 계약 안정화 → 후에 물리 분리.

## 결정
**B (단계적).** 1) console 내부 경계 분리 → 2) Platform Core·Context·Audit·Policy 계약 안정화 → 3) `apps/ops`·`apps/build` 물리 분리. Field/Hub는 현행 유지.

## 결과
초기 churn 최소화, 계약이 굳은 뒤 안전하게 분리. 디자인 테마는 `data-theme`로 즉시 차별화 가능.
