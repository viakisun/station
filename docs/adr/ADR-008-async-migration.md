# ADR-008 — 동기 mock → 비동기 데이터 전환 방식

- 상태: **Proposed**
- 관련: 현재 `packages/domain/selectors.ts`(동기 mock = API seam)

## 맥락
화면은 현재 `getRobots()` 동기 셀렉터를 사용. 추후 Platform Core API로 교체 시 화면 마크업이 바뀌면 안 됨.

## 옵션
- 훅(`useRobots()`)으로 래핑 — 명시적 `loading/error`, 점진 도입.
- Suspense 캐시(`use()`) — 호출부 동기처럼 유지, `<Suspense>` 경계 필요.

## 결정(제안)
**하이브리드**: 리스트/상세 화면 = 훅(초기엔 동기 셀렉터 즉시 반환→무변화), 공유 셸 KPI = Suspense 캐시(셸은 스피너 없음). Phase 0은 **read hook 시그니처만** 고정.

## 결과
mock→network 전환이 화면 변경 없이 가능.
