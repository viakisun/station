# IF-P-ACU — 페이로드 ICD (DDS)

> AUTO-GENERATED from `packages/contracts/profiles/wire/wire.acu.dds.json` by scripts/gen-icd-sheets.mjs — DO NOT EDIT.
> 실 드라이버(socketcan/rclcpp/mosquitto)는 이 정의를 그대로 구현/코드젠한다.

### Signals

| channel | wire | QoS | 레이아웃 |
|---|---|---|---|
| `machine.autonomy.state` | rt/autonomy/state · station_msgs/Signal | RELIABLE | — |
| `machine.autonomy.mode` | rt/autonomy/mode · station_msgs/Signal | RELIABLE | — |
| `machine.navigation.deviation` | rt/navigation/deviation · station_msgs/Signal | BEST_EFFORT | — |

### Commands

| verb | wire | QoS | 레이아웃 |
|---|---|---|---|
| `autonomy.mission.start` | rt/mission/cmd · station_msgs/Command | RELIABLE | — |
| `autonomy.pause` | rt/mission/cmd · station_msgs/Command | RELIABLE | — |
| `autonomy.slow_down` | rt/mission/cmd · station_msgs/Command | RELIABLE | — |
