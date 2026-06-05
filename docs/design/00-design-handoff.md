# STATION 디자인 핸드오프 — 전문적 비주얼 품질

> **이 문서의 목적**: STATION 목업 14화면의 현재 시각 품질을 진단하고, "전문적 비주얼 품질"을
> 끌어올리는 후속 디자인 작업의 SSOT(단일 출처)로 쓴다. claude design 세션은 이 문서 →
> 우선순위 백로그(§5) 순으로 집어들면 된다.
>
> - 캡처 기준: `main` @ `261c731` (2026-06-05, 다크 토큰 대개편 + ADR-021 반영 직후)
> - 스크린샷: [`screens/`](screens/) — 14컷 전부 신선(기존 `docs/reports/screenshots`는 6/3자 stale, 사용 금지)
> - 불변 제약(절대 깨지 않음): §6 참조

---

## 1. 화면 인벤토리 (4앱 · 14화면)

밀도(density)는 제품별로 다르다: Ops=`default` · Build=`compact` · Field=`touch`. 색은 제품별로
바뀌지 않는다(ADR-021 — 중립). 제품 구분은 라벨·밀도·아이콘·레이아웃으로만.

| 앱 (포트·밀도) | 라우트 | 화면 | 성숙도 | 스크린샷 |
|---|---|---|---|---|
| **Hub** 7330 · launcher | `/` | 제품군 런처 (4 제품 카드) | 🟡 단순·완결 | [hub-home](screens/hub-home.png) |
| **Ops** 7331 · default | `/fleet` | project→site→robot 트리 | 🟢 실콘텐츠 | [ops-fleet](screens/ops-fleet.png) |
| | `/robot` | 로봇 상세 | 🔴 빈 화면(미선택 empty) | [ops-robot](screens/ops-robot.png) |
| | `/command` | 명령 요청 + ACK 타임라인 | 🔴 stub | [ops-command](screens/ops-command.png) |
| | `/hmi-mirror` | 현장 HMI cloud 미러 | 🔴 빈 화면 | [ops-hmi-mirror](screens/ops-hmi-mirror.png) |
| | `/telemetry` | 채널 모니터 | 🟢 실콘텐츠 | [ops-telemetry](screens/ops-telemetry.png) |
| **Build** 7333 · compact | `/agent` | Runtime Inspector | 🟢 실콘텐츠 | [build-agent](screens/build-agent.png) |
| | `/agent-status` | 에이전트 상태 | 🟡 stub | [build-agent-status](screens/build-agent-status.png) |
| | `/firmware` | 펌웨어/OTA 표 | 🟢 실콘텐츠 | [build-firmware](screens/build-firmware.png) |
| | `/manifests` | 매니페스트 | 🟡 stub | [build-manifests](screens/build-manifests.png) |
| | `/conformance` | 적합성 | 🟡 stub | [build-conformance](screens/build-conformance.png) |
| **Field** 7332 · touch | `/hmi` | 조작 패널 | 🟢 **최고 완성도** | [field-hmi](screens/field-hmi.png) |
| | `/safety` | E-stop · 인터록 | 🟢 완성도 높음 | [field-safety](screens/field-safety.png) |
| | `/telemetry` | 현장 텔레메트리 | 🟢 실콘텐츠 | [field-telemetry](screens/field-telemetry.png) |

성숙도: 🟢 실콘텐츠 · 🟡 표/단순 stub · 🔴 빈 화면/골격

---

## 2. 진단 — "전문적이지 않다"의 구체적 원인

우선순위순. 같은 정보를 담고도 "완성된 SDV 관제 제품"이 아니라 "개발 중 디버그 화면"으로
읽히게 만드는 요인들.

### D1. 내부 디버그 메타데이터가 UI로 새어나옴 ★최우선
[ops-command](screens/ops-command.png)·[ops-hmi-mirror](screens/ops-hmi-mirror.png) 참조.
- `SWS-OPS-COMMAND`, `TODO(SWT-ACK-001)`, `structure stub`, 우상단에 떠 있는 빨간 `MIRROR`
  텍스트, 모든 헤더에 monospace로 줄지어 박힌 `④ Cloud mirror` / `cloud` / `≠ CommandRouter`
  / `request` 칩.
- 이건 식별체계(SWS/SWC/SWT)·아키텍처 주석이 **그대로 화면에 노출**된 것. 운영자/데모 관객에게는
  의미 없는 노이즈이고, 제품을 "미완성 내부 도구"로 보이게 만드는 1순위 원인.
- **방향**: dev 메타는 (a) 개발 모드 플래그 뒤로 토글, 또는 (b) 디자인된 "lineage" 라벨 하나로
  압축(예: 작은 ⓘ 호버 → SWS/authority 노출). 화면 표면에서 식별자·TODO·stub 문구 제거.

### D2. 절반이 빈 화면 / stub
[ops-robot](screens/ops-robot.png)·[ops-command](screens/ops-command.png)·[ops-hmi-mirror](screens/ops-hmi-mirror.png)
- 거대한 검은 캔버스에 중앙 텍스트 한 줄. 데모를 켜면 "완성도"보다 "빈칸"이 먼저 보인다.
- empty state조차 디자인이 없다(아이콘 + 평문). [`EmptyNote`](../../packages/design-system/src/components.tsx)가
  이미 있는데 활용도가 낮음.
- **방향**: 최소한 빈 화면을 (a) 의미 있는 fixture 데이터로 채우거나 (b) 디자인된 empty state
  (다음 행동 CTA·미니 일러스트·컨텍스트)로 승격.

### D3. 시각적 위계 · 밀도 약함 (Ops/Build default·compact)
[ops-fleet](screens/ops-fleet.png)·[ops-telemetry](screens/ops-telemetry.png)
- 넓은 데스크톱에 좁은 단일 컬럼. 제목(13px)이 본문(12px)보다 거의 안 큼 → 위계 평탄.
- 전부 hairline 보더 평면 패널, 저대비. 스캔 포인트(어디를 먼저 볼지)가 없다.
- 화면 상단에 KPI 요약 밴드가 없어 "지금 상태 한눈"이 안 됨.
- **방향**: 타입 스케일 실제 적용(섹션 헤더↑), 다단 그리드, 상단 KPI 밴드([`KpiCard`](../../packages/design-system/src/components.tsx) 활용), surface 깊이(raised/elevated) 차등.

### D4. 데이터 시각화 레이어 부재
[ops-telemetry](screens/ops-telemetry.png) — trend가 손톱만 한 스파크라인.
- 관제 제품인데 차트·게이지·시계열이 거의 없다. [`Sparkline`](../../packages/design-system/src/components.tsx)·[`MiniBars`](../../packages/design-system/src/components.tsx)는 있으나 작게/드물게 쓰임.
- **방향**: 텔레메트리·플릿 상태에 제대로 된 시계열/분포 시각화. 차트 컴포넌트(품질·지연·드리프트)
  표준화.

### D5. 밀도 스케일 불일치 (제품 간 다듬어짐 격차)
- [field-hmi](screens/field-hmi.png)·[field-safety](screens/field-safety.png) (touch)는 **잘 나왔다** —
  큰 버튼, 명확한 위계, 충분한 여백, 안전 적색의 절제된 사용.
- 반면 Ops/Build(default·compact)는 작고 빽빽해 상대적으로 덜 다듬어져 보임. 같은 제품군인데
  완성도 편차가 큼.
- **방향**: Field가 도달한 위계·여백 수준을 default 밀도에도 비례 적용(스케일만 다르고 품질은 동일).

---

## 3. 살릴 강점 (건드리지 말 것)

- **다크 산업용 토큰 체계** — `tokens.css` 4계층(primitive→semantic→theme→component) 일관됨.
- **상태/배지 DNA** — StatusBadge·live dot·mono 숫자, 상태색 규칙.
- **Field 터치 화면(HMI·Safety)** — 전문적 비주얼 품질의 *기준점*. 나머지를 여기 수준으로 끌어올린다.
- **authority(명도 rank)·mirror 개념** — 사려 깊은 정보 모델. 표현만 덜 노출하면 됨(D1).
- **ADR-021 중립 제품 정체성·안전색 잠금** — 이 결정 자체는 유지(§6).

---

## 4. 디자인 시스템 현황 — 컴포넌트는 있다, 화면이 안 쓴다

핵심 문제는 "컴포넌트 부재"가 아니라 **이미 있는 컴포넌트를 화면이 일관되게 안 쓰는 것**.

**`@station/design-system`** ([`components.tsx`](../../packages/design-system/src/components.tsx) · [`ux.tsx`](../../packages/design-system/src/ux.tsx))
- 보유: `StatusBadge` `RobotTypeTag` `Battery` `KpiCard` `Sparkline` `MiniBars` `PanelHead`
  `ConfirmModal` `ProgressBar` `EmptyNote` · `GateNotice` `HoldButton` `ContextChip`
  `SafetyBanner` `KVStack` · `Icon` `Wizard`
- 부족(추가 후보): `DataTable`(정렬·밀도 통일 표), `ChartFrame`(시계열 표준), `SectionHeader`
  (위계용), `KpiBand`(상단 요약 밴드), 디자인된 `EmptyState`(CTA 포함).

**`@station/app-kit`** ([shell.tsx](../../packages/app-kit/src/shell.tsx) · [surface.tsx](../../packages/app-kit/src/surface.tsx))
- `ProductShell` `ProductNav` `ProductCard` · `SurfaceHeader` `AuthorityBadge` `MirrorBadge` `StubPanel`
- `SurfaceHeader`가 dev 메타 노출의 진원지(D1) — 여기서 표면 노출을 제어하면 전 화면 일괄 개선.

---

## 5. 우선순위 백로그 — 전문 비주얼 품질 중심

claude design 세션은 위에서부터 집어든다. 각 항목은 독립적으로 작업 가능.

### P0 — 비전문성의 직접 원인 제거
- **P0-1 dev 메타 표면 정리(D1)**: `SurfaceHeader`/`StubPanel`/`ProductShell`에서 SWS/SWT/TODO/
  `structure stub`/floating `MIRROR` 표면 노출 제거 또는 dev 토글 뒤로. lineage가 필요하면
  디자인된 ⓘ 1개로 압축. → 전 14화면 동시 개선, 가성비 최고.
- **P0-2 빈 화면 3종 처리(D2)**: `/robot`·`/command`·`/hmi-mirror`를 fixture 콘텐츠 또는
  디자인된 empty state(CTA 포함)로 승격.

### P1 — 위계·밀도·시각화로 "전문 제품" 외형 확보
- **P1-1 위계/그리드(D3)**: Ops 화면(fleet·telemetry)에 타입 스케일·다단 그리드·상단 KPI 밴드 적용.
  Field(touch)가 도달한 품질을 default 밀도로 비례 이식(D5).
- **P1-2 데이터 시각화(D4)**: 텔레메트리·플릿에 제대로 된 시계열/게이지. `ChartFrame` 표준화.
- **P1-3 surface 깊이**: panel/raised/elevated 대비를 실제 차등(현재 거의 평면).

### P2 — 디자인 시스템 갭 메우기(P1 작업 중 자연 발생)
- `DataTable`·`KpiBand`·`SectionHeader`·디자인된 `EmptyState`를 design-system으로 추출.
- Build의 stub 화면(`/agent-status`·`/manifests`·`/conformance`)을 표준 표/패턴으로 통일.

---

## 6. 불변 제약 (절대 깨지 않음)

후속 디자인 작업은 아래를 전제로 한다. 위반 시 ADR 재논의 필요.

- **ADR-021 — 중립 제품 정체성**: 제품은 hue로 구분하지 않는다. 색은 상태·권한·안전 전용.
  강조는 *명도*로. `[data-theme]`는 색을 바꾸지 않는다(라벨/밀도만).
  ([ADR-021](../adr/ADR-021-neutral-product-identity-and-safety-color-lock.md))
- **안전색 잠금**: 적색(`--state-emergency`)은 물리/E-stop/danger 전용. 장식·강조에 적색 금지.
- **토큰 보존**: 색·간격·타입은 [`tokens.css`](../../packages/design-system/src/tokens.css) 토큰으로만.
  인라인 hex 신규 추가 금지(기존 이식 화면 제외).
- **authority 위계**: 밝을수록 고권한(② Agent > ③ Field > ④ Cloud > readonly). 배지는 outline(채움 금지).
- **데이터 seam 불변**: 화면은 `@station/domain` 동기 셀렉터만 소비. 디자인 작업이 데이터 계약을 바꾸지 않음.

---

## 7. 빠른 시작 (claude design 세션용)

```bash
pnpm install
pnpm dev        # hub:7330 · ops:7331 · field:7332 · build:7333 동시 기동
pnpm typecheck  # 변경 후 게이트
```

화면 재캡처(이 문서 스크린샷 갱신):
```bash
node scripts/capture-design-screens.mjs   # (P0 작업 시 capture.mjs를 신구조로 갱신 권장)
```

> 현 `scripts/capture.mjs`는 구 구조(console 7331) 기준이라 동작 안 함 — 신구조(ops/build/field)로
> 갱신하거나, 이 핸드오프 캡처에 쓴 라우트 목록(§1)을 사용.
