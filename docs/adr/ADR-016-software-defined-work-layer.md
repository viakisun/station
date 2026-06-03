# ADR-016 — Software-Defined Work Layer: Application · App Runtime · 모듈 교체 로딩

- 상태: **Accepted**
- 관련: [STATION SDV Reference Platform (마스터 기준서)](../architecture/sdv-reference-platform.html) Part G, [module-manifest.schema.json](../../packages/contracts/schema/module-manifest.schema.json), [robot-blueprint.schema.json](../../packages/contracts/schema/robot-blueprint.schema.json), [runtime/local-agent.ts](../../packages/contracts/runtime/local-agent.ts), [ADR-012](ADR-012-command-envelope-ack.md), [ADR-014](ADR-014-robot-blueprint-open-node-taxonomy.md), [ADR-015](ADR-015-reference-local-agent-first.md)

## 맥락

같은 로봇 플랫폼은 **작업 모듈을 교체**해 서로 다른 일을 한다 — 생육분석·적과·적심·방제·파종·청소·이송. 모듈을 바꾸면 **그 모듈의 작업 프로그램(소프트웨어)이 플랫폼에 로딩**되어야 한다. 이것이 "Software-Defined Robot"의 핵심이다: 하드웨어가 아니라 **소프트웨어가 로봇이 하는 일을 정의**한다.

그런데 지금까지의 문서·코드를 점검하면 **이 레이어가 존재하지 않는다.**

- `ModuleManifest.requiredApps`(예 `station.app.ee-control`)와 "App Runtime"이 **이름만 등장하고 정의·구현이 0**이다.
- 마스터 Part A–F는 모듈을 **설계타임 정적 선언**으로만 다룬다 — 런타임에 "작업이 무엇이고 어떻게 로딩되는가"가 빠져 있다.
- `RobotBlueprint`는 노드·모듈 조합을 고정하지만, 그 위에서 도는 **작업 프로그램의 단위·식별·생명주기·권한**을 규정하지 않는다.

즉 SDV의 정의(소프트웨어가 작업을 정의)와 산출물(정적 모듈 선언만 존재) 사이에 빈 칸이 있다. 본 ADR은 이 빈 칸을 **1급 개념으로 먼저 정의**한다. (구현은 후속 phase — 본 결정은 설계 확정이다.)

## 결정

1. **5 레이어로 분리.** Platform(Agent + base nodes, robot-agnostic) / **Node**(compute 참여자) / **Work Module**(HW 페이로드) / **Application**(NEW — 작업 프로그램) / **App Runtime**(로더). Node·Module·Capability·Application·Blueprint는 **상호 비중첩** 용어로 정의한다(Part G G0 glossary).

2. **Application = 1 작업 단위, 2 실행면(face).**
   - **Work Execution Face** — 로봇측 program(미션 상태머신) + Agent aggregator(관측 합성). *주 면.*
   - **Operator Interaction Face** — HMI panel(운영자 표시·조작). 기존 HMI-framed `requiredApps`의 가시면.
   - 한 작업(예: 생육분석)은 하나의 Application으로 묶이고, 그 안에 program·aggregator·panel이 들어간다.

3. **앱은 작업을 *선언·제공*하되 플랫폼 권한을 갖지 않는다(불변 원칙).** 앱이 추가하는 명령도 **CommandCatalog에 등록**된 뒤 Local Agent `evaluateGate` + Safety Policy를 통과해야 실행된다. **앱이 선언한 safety 등급은 참고값(비신뢰)**이며 최종 판단은 플랫폼 정책·conformance gate가 한다. 물리 안전(E-stop 회로)이 최후 보루다. ACU에서 program이 돌더라도 MCU/VPU/LPU에 **직접 명령하지 않고** 반드시 Agent CommandRouter를 경유한다(REQ-A02를 앱에 적용).

4. **앱은 Blueprint가 아니라 매니페스트에서 파생한다.** App Runtime이 `ModuleManifest.requiredApps` ∪ `Node.requiredApps`의 합집합에서 로드할 앱을 **derive**한다 — `RobotBlueprint`에 `applications[]`를 추가하지 않는다(Blueprint·계약 불변). 생육분석은 외부 작업기 모듈이 아니라 **VPU의 카메라/AI 기능을 쓰는 SW 작업**이므로 초기엔 VPU Node의 `requiredApps`에서 `station.app.growth-scan`을 파생한다(카메라가 교체형 HW bay로 분리되면 모듈 매니페스트로 전환 — HW TBD).

5. **AppManifest = 신규 스키마(설계 — 코드 동결).** `requiredApps[].id`가 `AppManifest.appId`를 가리킨다(프로즌 `ModuleManifest` 불변). 식별자는 `station.app.<kebab>`(platform 네임스페이스, 버전은 매니페스트에). 작업별 개별 앱: `station.app.{growth-scan, thin-control, pinch-control, spray-control, seed-control, clean-control, conveyor-control}` — **"모듈 교체 = 앱 교체"**가 식별자 수준에서 분명하다. 필드·pseudo-schema는 마스터 Annex E.

6. **App Runtime = Agent측 서비스.** `ReferenceLocalAgent`에 가산하며 M1/M2 코어를 깨지 않는다. 트리거는 **blueprint(부팅, 주) + node hello(런타임 모듈 교체, 부)** — 자동감지가 아니다. 생명주기: discovered→resolving→loaded→gating→**active** / **gate_blocked**(미보정 등 휴지) →deactivating→unloaded. `resolving`은 단순 union이 아니라 **버전·command verb·provided signal/observation 충돌과 required node/module 존재를 검증**한다.

7. **명령 거버넌스 = CommandCatalog(런타임 전용).** 앱이 선언한 verb를 `verb·ownerAppId·targetNodeKind·safetyClass·requiredState·requiredRole·ackPolicy·timeoutMs·idempotency·gateRefs`로 등록하고, `evaluateGate`는 이 카탈로그를 **입력으로만** 참조한다. 계약(`@station/contracts`)은 변경하지 않으며 권한모델 변화는 Annex E 텍스트로 남긴다.

8. **벤더 번들 채용 모델.** 제조사는 **번들 = {ModuleManifest + Driver(노드측 HW 제어) + App(behavior) + panel?}**을 제공하고, 로봇 회사는 **번들 설치(SW)**로 채용한다. 구조가 다른 제조사의 모듈도 표준 계약 1면 + 개방 NS + CommandCatalog로 **코어 변경 0** 수용한다. 단 번들은 바로 active가 아니라 **적합성 suite(F7) + 플랫폼 안전 allowlist + gate_blocked/commissioning**을 거친다. 플랫폼 내부는 **Driver ⟂ App ⟂ Panel**로 분리하되(번들은 하나), 레퍼런스 빌드는 mock 노드라 Driver Runtime 구현은 연기하고 개념만 문서화한다. 멀티벤더는 work module만이 아니라 **Node 레벨에도 대칭 적용**된다(노드 벤더 → IF-P 시트 conformance) — 상세는 Part G G8.

## 결과

- **SDV 정의의 충족** — "소프트웨어가 작업을 정의"가 Application·App Runtime으로 1급화되어, 모듈 교체 = 앱 교체가 식별자·생명주기·게이트 수준에서 규정된다.
- **계약·Blueprint 불변** — 앱을 매니페스트에서 파생하므로 프로즌 계약을 건드리지 않는다. 스키마 추가는 Annex E 변경안으로만 예약된다.
- **안전 경계 명확** — 앱은 권한을 갖지 않고, 모든 앱 명령은 CommandCatalog→evaluateGate→Platform Policy를 통과한다. 3rd-party 번들도 allowlist·conformance 게이트 뒤에서만 active다.
- **멀티벤더 생태계** — 번들 모델로 구조가 다른 제조사 모듈·노드를 코어 변경 없이 채용한다. 플랫폼은 부품이 아니라 **통합 규제(integration regime)**를 소유한다.
- **구현 경로 정렬** — App Runtime은 Agent측 가산이므로 M1/M2(ADR-015) 위에 비파괴로 얹힌다. 첫 앱(`station.app.growth-scan`)이 후속 Step5다.

## 구현

- **M3 (2026-06-04) — App Runtime + 첫 작업 앱 구현.** 본 ADR의 5층·생명주기·CommandCatalog·파생 모델이 `packages/local-agent`에 코드로 실현됨(M1/M2 코어 비파괴 가산).
  - `app-runtime.ts` — `WorkApp`·`AppContext`(샌드박스 면)·`AppRegistry`(managed-load, `resolve()` 경계)·`AppRuntime`(derive→resolving→loaded→gating→**active/gate_blocked**→unloaded). 트리거 = 명시 `deriveAndLoad()`(노드 안정 후, 결정적).
  - `command-catalog.ts` — verb→`{ownerAppId·targetNodeKind·safetyClass·requiredRole·gateRefs·handler}` 런타임 등록(계약 미변경). `evaluateGate`가 입력으로만 참조.
  - `command-router.ts` — 옵셔널 `catalog?` 주입 시 앱 verb를 노드 경로 *앞에서* 분기(앱 active·requiredRole·gateRefs(보정) 판정, 노드 registry 미요구). 핸들러는 Agent-hosted(노드 직결 0, REQ-A02). 미주입 경로(M1/M2)는 바이트 동일 — 회귀 10/10 green.
  - `apps/growth-scan.ts` — `station.app.growth-scan` 실체. `scan.start`→세션 open(SCN-*)+ACU 미션+VPU capture(둘 다 게이트 경유)→aggregator(`crop.growth.ndvi` 도착 트리거)가 pose⊕crop⊕autonomy state 스냅샷→**GrowthObservation(OBS-*)** 합성→`ObservationStore`.
  - 검증: `test/app-runtime.scan.test.ts` 10 케이스(derive→active · scan 슬라이스 · OBS 합성 · **gate_blocked**(보정 누락) · 의존 노드 게이트 · **모듈 교체**=unload→verb deregister→rejected · 미등록 verb rejected). 데모 `run-scan.ts`.
- **이번 범위 밖(후속):** 실 OTA `AppRegistry`(static factory 유지) · HMI/panel 렌더 · OBS 클라우드 업링크 · Driver Runtime(mock) · 2nd 앱(thin/pinch)에서 resolving 충돌해소·다중 앱 우선순위 본검증 · ACU-hosted program(레퍼런스=Agent-hosted, G6).

## 대안 (기각)

- **앱을 `ModuleManifest`에 과적** — 프로즌 계약을 깨고, 작업 behavior·생명주기를 정적 선언에 욱여넣어 거버넌스가 사라진다. 기각(파생 모델 채택).
- **`Blueprint.applications[]` 추가** — Blueprint는 노드·모듈 조합의 안정 식별자여야 한다. 작업을 여기 박으면 모듈 교체마다 Blueprint가 흔들린다. 기각(매니페스트 파생).
- **node-to-node 직결 작업 명령** — 허브-스포크(REQ-A02/F01)와 충돌하고 안전 게이트를 우회한다. 기각(CommandRouter 경유 강제).
- **플랫폼에 작업 하드코딩** — 생육분석을 코어에 박으면 적과·방제로 교체할 때 코어를 재작성한다. SDV 목적과 정면 충돌. 기각.
- **앱에 플랫폼 권한 부여(앱 선언 safety 신뢰)** — 3rd-party 앱이 자기 안전등급을 스스로 정하면 게이트가 무력화된다. 기각(앱 선언 safety = 비신뢰, 플랫폼 정책이 기준).
- **Plug & Play 자동감지를 1차 모델로** — 노드 hello만으로 임의 앱을 active하면 안전·충돌 검증을 건너뛴다. P&P는 연기하고 **managed-load**를 1차 모델로 한다(경계 = `AppRegistry.resolve()`).
