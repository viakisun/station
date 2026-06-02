# STATION — 멀티로봇 온실 통합 관제 플랫폼 (monorepo)

진주 스마트팜 멀티로봇(적과 `RBT-THIN` / 적심 `RBT-PINCH`) 통합 관제 플랫폼 **STATION**.
`_reference/farm-multi-robot`의 UX/UI SSOT 프로토타입(빌드 없는 React 18 목업)을
**디자인 100% 그대로 보존**하면서 실제 프레임워크 골격으로 이식한 결과물이다.

## 기술 스택

- **Turborepo + pnpm workspaces** 모노레포
- **Next.js 15 (App Router) + TypeScript** (3개 앱)
- **디자인 토큰**: `tokens.css` 무수정 이식 + 인라인 스타일 1:1 보존 (Tailwind 미사용)
- 패키지는 빌드 없이 TS 소스를 직접 소비(JIT, `transpilePackages`)

## 구조

```
apps/
  hub/        STATION 랜딩 (포트 3000) — 콘솔 런처, console/field로 딥링크
  console/    데스크톱 통합 콘솔 (포트 3001) — 통합 셸 + C01·C02·C03·C04
  field/      현장 태블릿 앱 (포트 3002) — H01 HMI · T01 Telemetry
packages/
  design-system/  tokens.css + 베이스 UI (Icon, StatusBadge, KpiCard, Sparkline,
                  ConfirmModal, ProgressBar, …)
  domain/         도메인 타입 + 상태 메타 + mock SSOT 데이터 + 동기 셀렉터(API 교체 seam)
  shell/          통합 셸(TopBar/LeftNav/EventStrip) + RobotDrawer + ShellContext
  tsconfig/       공유 tsconfig 프리셋
  eslint-config/  공유 ESLint 프리셋
```

## 워크스페이스 ↔ 라우트

| 코드 | 워크스페이스 | 앱 | 라우트 |
| --- | --- | --- | --- |
| C01 | 관제·맵·경로·작업 | console | `/control`(대시보드) · `/control/map` · `/control/maps` · `/control/work-plan` · `/control/sessions/[id]` |
| C02 | Audit / Dev kit | console | `/audit` · `/audit/conformance` · `/audit/package` |
| C03 | 장애·오류·품질 | console | `/incident` · `/incident/list` · `/incident/stream` · `/incident/[id]` · `/incident/[id]/action` · `/incident/reports` |
| C04 | 펌웨어 / OTA | console | `/firmware` · `/firmware/static-analysis` · `/firmware/compatibility` · `/firmware/ota` |
| H01 | HMI 현장 커미셔닝 | field | `/hmi` |
| T01 | Telemetry 설정 | field | `/telemetry` |

console 좌측 내비의 HMI·Telemetry 항목은 field 앱으로 크로스링크된다
(`NEXT_PUBLIC_FIELD_URL`, 기본 `http://localhost:3002`). hub 콘솔 카드도 동일.

## 실행

```bash
pnpm install
pnpm dev         # turbo — hub(3000) · console(3001) · field(3002) 동시 기동
pnpm build       # 3개 앱 프로덕션 빌드
pnpm typecheck   # 전 패키지/앱 tsc --noEmit
pnpm lint        # next lint
```

개별 실행: `pnpm --filter @station/console dev` 등.

## 환경 변수

크로스앱 링크용(미설정 시 localhost 기본값 사용):

- `NEXT_PUBLIC_CONSOLE_URL` (hub용, 기본 `http://localhost:3001`)
- `NEXT_PUBLIC_FIELD_URL` (hub·console용, 기본 `http://localhost:3002`)

## 데이터 / 백엔드 seam

현 단계는 `packages/domain`의 mock SSOT 데이터(`CONTROL`/`INCIDENT`/`TELEMETRY`/`RELEASE`/`HMI`)를
동기 셀렉터(`getRobots()`, `getIncidents()` …)로 감싸 반환한다. 추후 Platform Core API
클라이언트로 이 셀렉터 구현만 교체하면 화면 변경 없이 실데이터로 전환된다.

## 디자인 충실도 원칙

- `tokens.css`는 레퍼런스 원본을 무수정 복사(md5 일치).
- 모든 화면의 인라인 스타일·색상·px·클래스명·텍스트를 1:1 보존.
- 프로토타입 편집 도구(`tweaks-panel.jsx`, `EDITMODE` 프로토콜)는 화면에 보이지 않으므로 미이식.
  단 초기 렌더값(`density: regular`, `accent: #14151a`)은 고정 반영.
- 빌드는 타입 검증으로 게이팅하며, 마크업 보존을 위해 스타일 린트로 빌드를 막지 않는다(`pnpm lint` 별도).
