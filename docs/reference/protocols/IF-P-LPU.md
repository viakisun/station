# IF-P-LPU — 페이로드 ICD (DDS)

> AUTO-GENERATED from `packages/contracts/profiles/wire/wire.lpu.dds.json` by scripts/gen-icd-sheets.mjs — DO NOT EDIT.
> 실 드라이버(socketcan/rclcpp/mosquitto)는 이 정의를 그대로 구현/코드젠한다.

### Signals

| channel | wire | QoS | 레이아웃 |
|---|---|---|---|
| `machine.localization.pose` | rt/localization/pose · station_msgs/Pose | BEST_EFFORT | — |
| `machine.localization.map_match` | rt/localization/map_match · station_msgs/Signal | BEST_EFFORT | — |

### Commands

| verb | wire | QoS | 레이아웃 |
|---|---|---|---|
| `localization.relocalize` | rt/localization/relocalize · station_msgs/Command | RELIABLE | — |
