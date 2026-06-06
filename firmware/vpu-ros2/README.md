# vpu-ros2 — VPU 노드 ROS2 스켈레톤 (Python/rclpy)

Jetson Orin Nano 생육분석 노드 골격. ACU·LPU 도 같은 패턴(rclpy/rclcpp, 토픽만 다름).
**빌드 가능한 완성품 아님** — `TODO` 가 카메라·CUDA 추론 등 실구현 지점.

## 계약 (시뮬 nodes/vpu 와 동일)
| 방향 | 채널/verb | ROS2 토픽 | QoS |
|---|---|---|---|
| Signal | `crop.growth.*` · `vision.fps` | `rt/crop/growth` | RELIABLE |
| Event | `disease.suspected` | `rt/disease/suspected` | RELIABLE |
| Command | `vision.capture`·`scan`·`calibrate` | `rt/vision/capture` | RELIABLE |

> ACU = `rt/autonomy/state`·`rt/mission/cmd`(DDS RELIABLE) · LPU = `rt/localization/pose`(BEST_EFFORT, 고주기).

## 실행 (Jetson · ROS2 Humble)
```bash
# TODO: 실제로는 colcon 패키지(station_msgs 커스텀 메시지 포함)
ros2 run station_vpu vpu_node     # 또는: python3 vpu_node.py
```

## Agent 합류
ROS2 토픽 ↔ `WireMsg`(ws://7100) 를 잇는 **ros2↔ws 브리지**가 필요(Agent Pi 또는 Jetson).
DDS-Security(X.509)는 운영 시 on. 배포: [`docs/reference/rig-deploy-guide.md`](../../docs/reference/rig-deploy-guide.md).
