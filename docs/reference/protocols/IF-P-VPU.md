# IF-P-VPU — 페이로드 ICD (ROS2)

> AUTO-GENERATED from `packages/contracts/profiles/wire/wire.vpu.ros2.json` by scripts/gen-icd-sheets.mjs — DO NOT EDIT.
> 실 드라이버(socketcan/rclcpp/mosquitto)는 이 정의를 그대로 구현/코드젠한다.

### Signals

| channel | wire | QoS | 레이아웃 |
|---|---|---|---|
| `machine.vision.fps` | rt/vision/fps · station_msgs/Signal | BEST_EFFORT | — |
| `machine.vision.framedrop` | rt/vision/framedrop · station_msgs/Signal | BEST_EFFORT | — |
| `machine.vision.worker_detected` | rt/vision/worker_detected · station_msgs/Signal | RELIABLE | — |

### Commands

| verb | wire | QoS | 레이아웃 |
|---|---|---|---|
| `vision.capture.start` | rt/vision/capture · station_msgs/Command | RELIABLE | — |
| `vision.capture.stop` | rt/vision/capture · station_msgs/Command | RELIABLE | — |
| `vision.calibrate` | rt/vision/calibrate · station_msgs/Command | RELIABLE | — |

### Events

| code | wire | QoS | 레이아웃 |
|---|---|---|---|
| `disease.suspected` | rt/vision/disease · station_msgs/Event | RELIABLE | — |
