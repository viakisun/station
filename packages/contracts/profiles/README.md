# profiles/ — 인스턴스 프로파일 (instance)

**Platform core ↔ Instance profile 분리.** STATION Field OS가 "모든 로봇을 SDV로"를 표방하려면,
계약 코어에 특정 로봇/도메인 가정이 없어야 한다.

- **`schema/`** = **platform core** (robot-agnostic). Organization·Node·**RobotBlueprint**·Signal·Command·Event·
  ModuleManifest·Gate 등 표준 계약. **온실/드론 같은 단어가 한 글자도 없다.**
- **`profiles/`** = **instance** (이 코어 위에 올라간 구체 배치). 로봇 종류별 **RobotBlueprint** 선언.

## 구성
```
profiles/
  greenhouse/        # 이번 과제(첫 적용 사례) 인스턴스
    blueprint.greenhouse-thin.json    # 적과 로봇 = 5노드 + 매니퓰·적과EE
    blueprint.greenhouse-pinch.json   # 적심 로봇 = thin과 동일 골격, 모듈만 교체
  reference/         # 비온실 참조(범용 증명)
    blueprint.spray-drone.json        # 방제 드론 = custom 노드 'FCU' + 비전 + 텔레메트리
```

## 핵심
- **로봇 = Blueprint 1개.** 새 로봇(물류 AMR·방제 드론·매니퓰 전용기)은 **Blueprint 추가**로 끝.
- **NodeKind 개방형** — 권장 표준 5종(MCU/VPU/ACU/Telemetry/LPU) + custom(예 드론 `FCU`). `src/node-kinds.ts` 참조.
- 온실 컨소시엄(에이지·메타·대동·KIRO·농과원)은 `greenhouse/` 프로파일 안에만 존재. 코어는 무관.

검증: `pnpm --filter @station/contracts validate` 가 `examples/` + `profiles/**/*.json` 전부를 스키마로 검사한다.
