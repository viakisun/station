# IF-P-MCU — 페이로드 ICD (CAN)

> AUTO-GENERATED from `packages/contracts/profiles/wire/wire.mcu.can.json` by scripts/gen-icd-sheets.mjs — DO NOT EDIT.
> 실 드라이버(socketcan/rclcpp/mosquitto)는 이 정의를 그대로 구현/코드젠한다.

### Signals

| channel | wire | QoS | 레이아웃 |
|---|---|---|---|
| `machine.motion.speed` | 0x18FF5001 · dlc 8 | — | speed@0:i16×0.001(m/s) |
| `machine.power.battery_voltage` | 0x18FF5002 · dlc 8 | — | voltage@0:u16×0.001(V) |
| `machine.safety.estop` | 0x18FF5003 · dlc 8 | — | estop@0:bool |

### Commands

| verb | wire | QoS | 레이아웃 |
|---|---|---|---|
| `motion.set_speed_limit` | 0x18EF5001 · dlc 8 | — | limit@0:u16×0.001(m/s) |
| `motion.stop` | 0x18EF5002 · dlc 8 | — | verb_code@0:u8 |

### Events

| code | wire | QoS | 레이아웃 |
|---|---|---|---|
| `emergency_stop` | 0x18FFE000 · dlc 8 | — | latched@0:bool |
