# IF-P-TEL — 페이로드 ICD (MQTT)

> AUTO-GENERATED from `packages/contracts/profiles/wire/wire.telemetry.mqtt.json` by scripts/gen-icd-sheets.mjs — DO NOT EDIT.
> 실 드라이버(socketcan/rclcpp/mosquitto)는 이 정의를 그대로 구현/코드젠한다.

### Signals

| channel | wire | QoS | 레이아웃 |
|---|---|---|---|
| `env.greenhouse.temperature` | station/{site}/{robot}/tlm/env/temperature | QoS1 | — |
| `env.greenhouse.humidity` | station/{site}/{robot}/tlm/env/humidity | QoS1 | — |
| `env.greenhouse.co2` | station/{site}/{robot}/tlm/env/co2 | QoS1 | — |
| `machine.telemetry.cloud_connected` | station/{site}/{robot}/tlm/cloud_connected | QoS1 | — |

### Commands

| verb | wire | QoS | 레이아웃 |
|---|---|---|---|
| `telemetry.uplink.flush` | station/{site}/{robot}/cmd/uplink/flush | QoS1 | — |
