# firmware/ — 실 노드 SW 레퍼런스 스켈레톤

`nodes/{mcu,vpu,lpu,acu}` 의 TS **시뮬레이터**가 검증한 계약(Signal·Command·ACK)을,
**실 보드에서 도는 SW** 로 옮기기 위한 참조 골격이다. 빌드 가능한 완성품이 아니라
*계약 매핑이 명시된 시작점* — TODO 마커가 실구현 지점을 가리킨다.

| 스켈레톤 | 노드 | 보드 · 언어 | 전송 | 시뮬 대응 |
|---|---|---|---|---|
| [`mcu-stm32/`](mcu-stm32/) | MCU | STM32 / Portenta · **C** (베어메탈/HAL) | CAN 2.0B | [`nodes/mcu`](../nodes/mcu) |
| [`vpu-ros2/`](vpu-ros2/) | VPU | Jetson Orin · **Python** (rclpy) | ROS2/DDS | [`nodes/vpu`](../nodes/vpu) |
| (동일 패턴) | ACU·LPU | Jetson · Python/C++ (rclpy/rclcpp) | DDS/ROS2 | `nodes/acu`·`nodes/lpu` |

## 계약 불변

실 SW 도 시뮬과 **동일한 채널/verb** 를 쓴다. 예: MCU 는 `machine.motion.speed`(Signal)를
주기 발행하고 `motion.stop`(Command)에 3단계 ACK(`received→accepted→executed`)로 응답한다.
정의는 [`packages/contracts/schema`](../packages/contracts/schema) · 채널은
[`signal-channel`](../packages/contracts/src/generated/signal-channel.ts).

## Agent 합류 (the bridge)

보드는 매체(CAN/ROS2)로 말하고, **Agent Pi 의 브리지**가 매체 ↔ `WireMsg`(ws://7100, WsHub)를
번역한다 — 시뮬의 `ProfiledTransport` 자리:

```
[STM32] --CAN--> [CAN↔ws 브리지(Agent Pi)] --ws:7100--> [Local Agent]
[Jetson rclpy] --ROS2--> [ros2↔ws 브리지]   --ws:7100--> [Local Agent]
```

배포 절차: [`docs/reference/rig-deploy-guide.md`](../docs/reference/rig-deploy-guide.md).
실행 가능한 전체 레퍼런스: [`docs/reference/sdv-rig-reference.md`](../docs/reference/sdv-rig-reference.md).
