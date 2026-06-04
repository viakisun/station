# STATION — 멀티로봇 온실 통합 관제 플랫폼

진주 스마트팜 멀티로봇(적과 `RBT-THIN` / 적심 `RBT-PINCH`) 통합 관제 플랫폼 **STATION**.
`_reference/farm-multi-robot`의 UX/UI SSOT 프로토타입(빌드 없는 React 18 목업)을 **디자인 100% 보존**하며
실제 프레임워크로 이식하고, 그 위에 **3제품 구조 + 폐루프 목업**을 구현한 모노레포다.

## 제품 구조 — 3제품 × 하나의 연결 조직

STATION은 "한 콘솔"이 아니라 사용자·디바이스·디자인 방향이 다른 **3개 제품**이며, 공유 도메인·ID 스파인·
Gate·Context 핸드오프로 유기적으로 연결된다. (상세: [`docs/00-ux-common-standards.md`](docs/00-ux-common-standards.md))

| 제품 | 워크스페이스 | 사용자 | 디바이스 | 앱 (포트) |
| --- | --- | --- | --- | --- |
| **Ops (관제)** | C01 맵·경로·작업·실시간 + C03 장애 | 운영관리자·관제 오퍼레이터 | Desktop 1440×900 | `console` (7331) `/control` `/incident` |
| **Build (개발·릴리즈)** | C02 Audit/DevKit + C04 펌웨어/OTA | 제조사 개발자·통합담당·배포관리자 | Desktop | `console` (7331) `/audit` `/firmware` |
| **Field (현장)** | H01 HMI + T01 Telemetry | 현장 오퍼레이터·유지보수 | Tablet/HMI 1024×768·600·480 | `field` (7332) `/hmi` `/telemetry` |

`hub` (7330) = 3제품 진입 랜딩. 제품별 시각 차이는 `data-theme="ops|build|field"`(Ops 고밀도 / Build 콘솔 /
Field 큰 터치·고대비)로, 공통 DNA(상태 배지·mono 숫자·live dot·ink)는 불변.

## 기술 스택
- **Turborepo + pnpm workspaces** 모노레포
- **Next.js 15 (App Router) + TypeScript** (3개 앱)
- 디자인 토큰: 3-tier (`primitive → semantic → product theme`), `tokens.css` 원본 보존 + 제품 테마 레이어
- 패키지는 빌드 없이 TS 소스 직접 소비(`transpilePackages`)

## 구조
```
apps/
  hub/      STATION 랜딩 (7330) — 콘솔 런처
  console/  데스크톱 (7331) — Ops(C01·C03) + Build(C02·C04), data-theme 분기
  field/    현장 (7332) — H01 HMI · T01 Telemetry
packages/
  design-system/  토큰 + UI(StatusBadge·KpiCard·ConfirmModal …) + 목업 프리미티브
                  (GateNotice 4단계·HoldButton·ContextChip·SafetyBanner·KVStack)
  domain/         타입 + 상태 메타 + mock SSOT + 동기 셀렉터(seam) + gates·ctx
  shell/          통합 셸(TopBar/LeftNav/EventStrip) + RobotDrawer + ShellContext
  tsconfig/ · eslint-config/   공유 프리셋
docs/   설계 문서 (아래 §설계 문서)
scripts/capture-screenshots.mjs   목업 스크린샷 캡처(Playwright)
_reference/   이식 근거(원본 SSOT 프로토타입)
```

## 실행
```bash
pnpm install
pnpm dev         # turbo — hub(7330) · console(7331) · field(7332) 동시 기동
pnpm build       # 3개 앱 프로덕션 빌드
pnpm typecheck   # 전 패키지/앱 tsc --noEmit
pnpm lint        # next lint
```
접속: 랜딩 http://localhost:7330 · 콘솔 http://localhost:7331 · 현장 http://localhost:7332
개별 실행: `pnpm --filter @station/console dev` 등.

## 주요 라우트
- **Ops**: `/control` 대시보드 · `/control/map` · `/control/work-plan` · `/incident` · `/incident/[id]` · `/incident/[id]/cause` · `/incident/[id]/close` · `/incident/recurrence`
- **Build**: `/firmware` · `/firmware/[id]/approve` · `/firmware/[id]/deploy-plan` · `/firmware/[id]/rollback` · `/audit` · `/audit/approve` · `/firmware/compatibility` · `/firmware/ota`
- **Field**: `/hmi`(홈) · `/hmi/operate` · `/hmi/calibrate` · `/hmi/estop` · `/hmi/commission` · `/telemetry`

핵심 폐루프 5종(작업·장애·캘리브·펌웨어·audit)이 화면으로 닫히며, Gate 4단계(`pass/warn/confirm_required/blocked`)·
hold-to-confirm·Audit 고지·제품 간 Context 핸드오프(`ctx` 쿼리)를 시연한다.

## 환경 변수 (크로스앱 링크, 미설정 시 localhost 기본값)
- `NEXT_PUBLIC_CONSOLE_URL` (기본 `http://localhost:7331`)
- `NEXT_PUBLIC_FIELD_URL` (기본 `http://localhost:7332`)

## 설계 문서 ([`docs/`](docs/README.md))
- **공통 기준서**: [`00-ux-common-standards.md`](docs/00-ux-common-standards.md) (SSOT — 제품 구조·ID·상태·Gate·Audit·권한)
- **과업지시서 3종**: [`tasks/01·02·03`](docs/tasks/) (+ `.docx`)
- **결정 기록**: [`adr/ADR-001~020`](docs/adr/) (최신: **ADR-020** 산업용 SDV 토큰 체계(다크))
- **마스터 기준서**: [`architecture/sdv-reference-platform.html`](docs/architecture/sdv-reference-platform.html) — Part A~**H**(H=SW-WBS 식별체계·상업 SaaS 구조)
- **수행 완료 보고서 3종**: [`reports/04·05·06`](docs/reports/) — 목업 스크린샷 24컷 + `.docx`
- **커버리지**: [`spec-gap.md`](docs/spec-gap.md)

## 데이터 / 백엔드 seam
`packages/domain`의 mock SSOT(`CONTROL`/`INCIDENT`/`TELEMETRY`/`RELEASE`/`HMI`)를 동기 셀렉터(`getRobots()` …)로
반환한다. 추후 Platform Core API 클라이언트로 셀렉터 구현만 교체하면 화면 변경 없이 실데이터로 전환된다.
게이트(`gates.ts`)·Context Envelope(`ctx.ts`)는 현재 UX 표현용(서버 재검증·실시간은 후속).

## 디자인 충실도 원칙
- `tokens.css` 원본 보존 + 제품 테마는 `data-theme` 레이어. DNA(상태색·배지·mono 숫자·live dot·ink) 불변.
- 이식 화면의 인라인 스타일·색상·px·텍스트 1:1 보존. 빌드는 타입 검증으로 게이팅(`pnpm lint` 별도).

## 현황
typecheck all green · 전 라우트 200. UX/UI 과업(공통기준→과업지시서→목업→완료보고서) 완료.
**참조 런타임 트랙**: M1(Local Agent 코어) · M2(다중 노드 transport) · M3(App Runtime + `station.app.growth-scan`) · M4(목업을 실제 런타임 위에) · **M5(원격 모니터링 — Local Agent app(`pnpm --filter @station/local-agent start:agent`, HmiHub WS :7101)을 로컬에 띄우면 `/control/agent`가 `RemoteAgentClient`로 원격 접속해 실 Signal·ACK·scan→OBS 모니터링·명령. 인프로세스는 폴백 모드)**. `local-agent` test 20/20. 상세 로드맵 = [docs/architecture/station-field-os.md §12](docs/architecture/station-field-os.md).

**상업 SaaS 재구성 트랙**(SW-WBS · [ADR-019](docs/adr/ADR-019-commercial-saas-scoping-and-sw-wbs.md) · 마스터 Part H): STATION을 VIA 통합관제 SaaS(Ops·Build·Field·Agent)로 재구성하는 식별체계를 SSOT에 고정. **MVP-1 = 구조 인덱스 문서화(완료, 코드 0 변경)** → MVP-2 UX/UI 상업 구조 목업 → MVP-3 핵심 수직 라이브 → MVP-4 출시 트랙. on-robot 실체↔cloud 미러(권한 ④<③)·ORG→PRJ→SITE→RBT 스코핑·`CommandEnvelope` 불변(connection-scoped).
