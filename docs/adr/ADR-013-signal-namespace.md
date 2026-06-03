# ADR-013 — 표준 신호 네임스페이스(machine.* · env.*) ↔ TCH-* legacy alias

- 상태: **Accepted**
- 관련: [station-field-os §Signal 데이터경로](../architecture/station-field-os.md), [ADR-007](ADR-007-audit-vs-event-log.md), [signal.schema](../../packages/contracts/schema/signal.schema.json), [signal-channel.schema](../../packages/contracts/schema/signal-channel.schema.json)

## 맥락
기존 Telemetry는 채널을 `TCH-*` ID로 식별했다(예 `TCH-cam-fps`·`TCH-gh-temp`). 이기종 노드의 원천 신호를 한 카탈로그로 모으려면 의미가 드러나는 **계층적 표준 이름**이 필요하지만, 이미 데이터·화면에 박힌 `TCH-*`를 폐기하면 회귀가 난다.

## 결정
- **표준 NS 2뿌리**: `machine.*`(로봇 자신, 예 `machine.vision.fps`·`machine.arm.joint_temp`·`machine.power.battery_voltage`·`machine.navigation.deviation`)·`env.*`(환경, 예 `env.greenhouse.temperature`·`env.greenhouse.co2`). 채널 ID 문법은 `ID_PATTERNS.channel`(`^[a-z]+(\.[a-z0-9_]+)+$`).
- `SignalChannel.channel`(표준 NS)이 정본, `SignalChannel.legacyId`(예 `TCH-cam-fps`)가 호환 alias. 런타임 표본 `Signal.channel`도 표준 NS를 쓴다.
- **비파괴 매퍼**(`src/namespace.ts`): `LEGACY_TO_NS`(TCH-* → NS)와 역방향 `NS_TO_LEGACY`, 함수 `toNamespace(legacyId)`·`toLegacy(channel)`. 기존 `TCH-*` 채널은 표준 NS의 alias로 **유지**된다(폐기 0).

## 결과
신호 카탈로그가 의미 있는 계층 이름으로 통일되면서, 기존 `TCH-*`를 쓰는 화면·데이터·픽스처가 그대로 동작한다. 노드별 원천 키(`Signal.source.rawKey`)→표준 채널 정합이 한 곳에 모인다.
