# Rig 배포 가이드 — 시뮬 → 실 보드

실행 가능 시뮬([sdv-rig-reference.md](sdv-rig-reference.md))을 물리 리그로 옮기는 절차.
**계약(Signal·Command·ACK·Gate)은 불변** — 노드 SW 와 전송 드라이버만 교체한다.
HW/배선/BOM: [sdv-rig-build-guide.md](../architecture/sdv-rig-build-guide.md).

## 배포 맵

| 노드 | 보드 | SW 스켈레톤 | 매체 | Agent 합류 경로 |
|---|---|---|---|---|
| MCU | STM32/Portenta | [`firmware/mcu-stm32`](../../firmware/mcu-stm32) (C) | CAN 500kbps | CAN → **CAN↔ws 브리지**(Agent Pi, socketcan) → ws:7100 |
| VPU | Jetson Orin | [`firmware/vpu-ros2`](../../firmware/vpu-ros2) (rclpy) | ROS2 | ROS2 → **ros2↔ws 브리지** → ws:7100 |
| ACU | Jetson(공유) | vpu-ros2 패턴 (DDS) | DDS | ros2↔ws 브리지 → ws:7100 |
| LPU | SBC | vpu-ros2 패턴 (BEST_EFFORT) | ROS2 | ros2↔ws 브리지 → ws:7100 |
| Local Agent | RPi5 8GB | [`packages/local-agent`](../../packages/local-agent) (그대로) | — | WsHub 호스트 |
| HMI | RPi5 + 10.1" 터치 | [`apps/field`](../../apps/field) (Chromium 키오스크) | ws:7101 | HmiHub 접속 |

## 단계

1. **Local Agent 기동** (RPi5): `pnpm --filter @station/local-agent start:rig`
   — 시뮬 노드 대신 **WsHub(7100)** 만 열고 실 노드 합류를 대기하도록 `run-rig.ts` 의
   in-process 노드 루프를 끄거나, 별도 `run-agent-bare` 진입점을 추가(후속).
2. **브리지 기동** (Agent Pi):
   - CAN↔ws: socketcan(`can0`) ↔ ws:7100. CAN id ↔ 채널 매핑은
     [`firmware/mcu-stm32/main.c`](../../firmware/mcu-stm32/main.c) 의 id 표.
   - ros2↔ws: rclpy 구독 → `WireMsg` 변환 → ws:7100.
3. **노드 SW 플래시/실행**:
   - MCU: STM32CubeIDE/PlatformIO 빌드 → 플래시.
   - VPU/ACU/LPU: Jetson 에서 `ros2 run …`.
4. **HMI 키오스크** (RPi5): Chromium full-screen → Field 앱(`apps/field`).
5. **안전 점검**: E-stop 물리 회로 — 버튼 누름 시 **모터버스 차단**을 테스터로 확인
   (SW 와 무관, [sdv-rig-build-guide PANEL 4](../architecture/sdv-rig-build-guide.md)).

## 검증 (시뮬 ↔ 실물 동치)

브리지가 살아 있으면, 실 노드를 띄운 직후 **시뮬과 동일하게** Build `/transport` 에 매체 트래픽이,
`/agent` Runtime Inspector 에 실 Signal/ACK 가 나타나야 한다. 차이(프레임수·지연·손실)는
실측치로 바뀌고, [`ProtocolModel`](../../packages/node-kit/src/profiles/model.ts) 의 추정값을
보정하는 기준이 된다.

## 남은 작업 (후속 트랙)
- `run-agent-bare` — in-process 시뮬 노드 없이 WsHub 만 여는 진입점.
- 브리지 2종(CAN↔ws · ros2↔ws) 실구현.
- `station_msgs` colcon 패키지(ROS2 커스텀 메시지 = 계약 미러).
