# ADR-021 — 중립 제품 정체성 · 안전색 잠금 · authority 명도 rank

- 상태: **Accepted**
- 관련: [ADR-020](ADR-020-industrial-sdv-token-system.md)(다크 토큰 — **본 ADR이 색 결정 일부 정정**), [Part H](../architecture/sdv-reference-platform.html), `packages/design-system/src/tokens.css`, `packages/app-kit/src/{shell,surface}.tsx`

## 맥락

ADR-020은 토큰 *이름*을 4축(product / authority / locus / state)으로 분리했으나, **값은 같은 4 hue(blue·violet·green·cyan)로 붕괴**해 있었다. 이름만의 분리는 의미를 보호하지 못한다:

- `green #16a34a` **4중 부킹** — `--state-normal` = `[data-theme=field] --product-accent` = `--authority-field` = `--locus-on-robot`. "안전/정상"이 제품·권한·위치와 색으로 구분 불가.
- **authority 값 = product 값** — cloud=ops blue, build=build violet, field=field green. 두 축이 값에서 동일.
- `authority-agent orange #f97316` ≈ `state-warning #d97706` 충돌.
- 좌측 컬러 보더(ProductCard·SurfaceHeader)·product-accent 풀필 버튼/칩/배지 → "rainbow dashboard"(AI-generated SaaS) 인상.

산업 관제 UI에서 green/amber/red는 **안전 신호 전용**이어야 한다. 이를 제품 브랜딩이 잠식하면 색이 신호로 신뢰될 수 없다.

## 결정

1. **제품 색 0 (완전 중립).** `[data-theme]`는 `--product-accent` hue를 바꾸지 않는다. `--product-accent`는 중립(`--text-primary` 계열). 제품 구분 = **라벨 + density + 아이콘 + 레이아웃**. 제품별 정보 밀도는 `[data-density]`(Field=touch·Build=compact)가 담당.
2. **안전 triad 잠금.** green/amber/red(`--state-*`)는 **상태 전용**. 어떤 제품·권한·위치 토큰도 이 hue를 참조하지 않는다. (유일 예외: `--authority-rank-physical` = E-stop 안전 적색, state-emergency 의도적 공유.)
3. **authority = 명도 rank 계단(hue 아님).** 권한 위계를 *밝기*로 인코딩: ② Agent(최강·가장 밝음) > ③ Field > ④ Cloud > readonly(최약·가장 흐림). 제품·상태 hue와 충돌 없는 중립 사다리. 배지는 **outline**(채움 금지) — ③이 ④보다 밝게 읽혀 위계가 색강도로 드러난다.
4. **locus = 아이콘(색 폐기).** `--locus-*` 색 토큰 삭제. ⌂ on-robot · ☁ cloud · ⚙ build · ↗ external 글리프 + mono 라벨.
5. **mirror = 중립 명도 강등 + 형태.** cyan hue 제거. mirror surface는 패널 명도 강등 + controlMode를 **테두리 스타일**(readonly=점선·assist=실선·inspect=2px·none=critical)로 표현. 화려한 색 아님.
6. **풀필·좌측 컬러 보더 제거.** `.btn.primary`·`.chip.active`·브랜드칩 = 중립 강조(명도). ProductCard 좌측 product 보더·SurfaceHeader 좌측 authority 보더 제거(중립 hairline). StubPanel TODO 라벨은 dev 표식이므로 중립.

## 결과

- **색 없이도 제품 이해** — Ops/Build/Field/Agent가 라벨·density·아이콘·레이아웃으로 구분(회색조 강제 시에도 식별).
- **green/amber/red 보호** — 상태 triad가 제품·권한 장식에 잠식되지 않아 안전 신호로 신뢰된다.
- **권한 위계 가시화** — ②>③>④가 명도로 직접 읽힌다(③ Field가 ④ Cloud보다 밝음).
- **미러 종속성** — cloud mirror가 on-robot 실체보다 명도↓ + 점선으로 종속적으로 보인다.
- **AI 패턴 제거** — rainbow 카드·좌측 컬러 보더·풀필/neon 배지 소거.

## 대안 (기각)

- **제품 hue 유지, 상태만 분리** — 제품/권한/위치가 여전히 같은 hue를 공유 → rainbow·축 혼동 잔존. 기각.
- **최소 메타 제품 도트 1개 유지** — 제품 색 0이 I-기준("색 없이 제품 이해")을 가장 강하게 충족. 기각(완전 중립 채택).
- **authority를 hue로 유지하되 state와 다른 색** — 가용 hue가 state triad와 충돌 회피하며 4단계 위계를 표현하기 어렵고, 색은 위계(순서)를 내재적으로 못 나타낸다. 명도 rank가 위계 표현에 우월. 기각.
- **physical authority도 중립화** — 물리/E-stop은 안전 최상위라 적색 공유가 의미적으로 정합. 단일 예외 허용.
