# mcu-stm32 — MCU 노드 펌웨어 스켈레톤 (C)

STM32 / Arduino Portenta Machine Control 베어메탈 펌웨어 골격. 실시간 하위제어 +
CAN 텔레메트리/명령. **빌드 가능한 완성품 아님** — `TODO` 가 실구현(HAL init·BMS ADC·
모터 드라이버·watchdog) 지점.

## 파일
- [`main.c`](main.c) — 20Hz 속도 발행 · 3단계 ACK · E-stop 보고 · 명령 처리
- [`can.h`](can.h) — CAN HAL 래퍼 인터페이스(보드별 구현)

## 계약 (시뮬과 동일)
| 방향 | 채널/verb | CAN id | 페이로드 |
|---|---|---|---|
| Signal | `machine.motion.speed` | `0x18FF5001` | int16 mm/s |
| Signal | `machine.battery.voltage` | `0x18FF5002` | uint16 mV |
| Event | `emergency_stop` | `0x18FFE000` | flag |
| Command | `motion.stop`·`motion.set_speed_limit` | `0x18EF5000` | verb+args |
| ACK | received/accepted/executed | `0x18FF50A0` | stage+cmd_id |

## 툴체인 (선택지)
- **STM32CubeIDE / Makefile + arm-none-eabi-gcc** (HAL)
- **PlatformIO** (`board = portenta_h7_m4` 또는 nucleo) — 권장: 의존 관리 용이
- **대안 언어 Zig** — `zig build-exe -target thumb-freestanding` 로 동일 골격 포팅 가능

## Agent 합류
보드는 CAN 으로만 말한다. **Agent Pi 의 CAN↔ws 브리지**(Waveshare RS485 CAN HAT + socketcan)가
CAN 프레임 ↔ `WireMsg`(ws://7100) 를 번역한다.
배포: [`docs/reference/rig-deploy-guide.md`](../../docs/reference/rig-deploy-guide.md).

## 안전
E-stop 은 **물리 NC 릴레이가 모터 전원을 차단**한다(이 SW 가 아님). 펌웨어는 `emergency_stop`
이벤트 *보고*만. watchdog(IWDG)이 루프 정지 시 모터를 차단. (sdv-rig-build-guide PANEL 4)
