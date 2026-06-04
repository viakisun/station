# ADR-020 — Industrial SDV Control-Suite Design Tokens (Dark)

- 상태: **Accepted**
- 관련: [STATION SDV Reference Platform Part H](../architecture/sdv-reference-platform.html), [ADR-019](ADR-019-commercial-saas-scoping-and-sw-wbs.md)(상업 SaaS·SW-WBS), `packages/design-system/src/tokens.css`, `packages/app-kit`

## 맥락

기존 design-system 토큰은 라이트(paper/ink)·임의 색 중심의 **generic SaaS 대시보드 토큰**이라 STATION이 산업용 SDV 관제 *제품군*으로 읽히지 않았다("AI 디자인 패턴"). 이 시스템의 토큰은 단순 `primary/danger`가 아니라 **4개 축을 동시에** 표현해야 한다:

1. 제품군 — Hub / Ops / Build / Field
2. 권한 고도 — ② Agent · ③ Field · ④ Cloud · readonly (ADR-019 위계)
3. 미러 관계 — on-robot 실체 vs cloud mirror
4. 산업 상태 — normal / warning / critical / emergency / degraded / offline

## 결정

1. **토큰을 4계층 + 용도별 family로 재설계** — primitive → semantic → product theme → component. 색 이름(`--ops-blue`) 금지, **용도 이름**(`--product-accent`·`--state-*`·`--authority-*`·`--mirror-*`·`--locus-*`)만.
2. **다크 산업용 팔레트** — `--surface-canvas` gray-950 등 다크 관제실 톤. 상태/권한/미러 색이 다크 위에서 분별된다.
3. **축 분리** — 제품 구분=`[data-theme]`(product-accent: ops blue·build violet·field green·hub cyan) · 상태=`--state-*` · 권한=`[data-authority]`/`--authority-*` · 미러=`[data-mirror]`/`[data-control-mode]`/`--mirror-*` · 밀도=`[data-density=compact|default|touch]`. 상태색은 제품 theme와 **절대 섞지 않는다**(Ops가 blue라도 warning은 amber).
4. **Agent는 theme 없음** — 사용자 제품이 아니라 on-robot runtime(②). `--authority`/`--locus`로만 표현.
5. **밀도 = 제품별** — Field=touch(56px) · Build=compact · Ops/Hub=default. ProductShell이 `data-density` 부여.
6. **전면 rename(클린)** — 레거시 토큰명(`--ink`/`--st-*`/`--surface`/`--brand`/`--r-*`/`--tint-*`/`--font-ui`/`--pad-card`/`--control-h`)을 새 이름으로 active code(design-system·app-kit·apps) 전반 교체. alias 미유지. `apps/_legacy/*`는 아카이브라 미변경(스타일 stale 허용).
7. **컴포넌트 스레딩** — SurfaceHeader가 `data-mirror`/`data-control-mode`/`data-authority` 부여 + authority/mirror 토큰 사용. StubPanel은 `--stub-*`("구조 자리" 톤).

## 결과

- **산업용 제품군 정체성** — 다크 관제실 톤 + 제품/권한/미러/locus가 토큰으로 분리되어 "generic AI SaaS"에서 벗어난다.
- **구조가 색에 박힌다** — 화면만 봐도 어느 제품·권한·미러 관계인지 토큰으로 드러난다(SurfaceHeader badge).
- **확장성** — 제품·권한·상태·밀도가 독립 축이라 새 제품/권한/상태 추가가 국소적.
- **범위** — 이번은 토큰 체계 + 컴포넌트 스레딩. 화면별 레이아웃 재디자인·다크/라이트 토글은 후속.

## 대안 (기각)

- **라이트 유지, 색만 정리** — generic 톤이 남는다. 산업 관제실 정체성엔 다크가 효과적. 기각.
- **레거시 토큰명 alias 유지(저churn)** — 이름 혼재로 "용도 이름" 원칙이 흐려진다. 클린 rename 채택(고churn 감수). 기각.
- **`data-theme="agent"` 신설** — Agent는 사용자 제품이 아님(②, on-robot runtime). authority/locus로 표현. 기각.
- **상태색을 제품 accent와 통합** — warning이 제품색이 되면 산업 상태 분별이 깨진다. 상태/제품 축 분리. 기각.
