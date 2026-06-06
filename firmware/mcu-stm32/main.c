/* ============================================================
 * MCU 노드 — STM32 / Arduino Portenta Machine Control (베어메탈/HAL).
 * 역할(금지 포함): 실시간 하위제어 — motor enable·speed exec·encoder·
 *   bumper·E-stop 입력·BMS 상태읽기·safe stop·watchdog (10~1000Hz).
 *   미션/AI 판단 금지(=ACU). 출처: docs/architecture/sdv-crop-growth-rig.md §02.
 *
 * 계약(시뮬 nodes/mcu/src/index.ts 와 동일):
 *   Signal   machine.motion.speed (m/s, 20Hz) · machine.battery.voltage
 *   Command  motion.stop · motion.set_speed_limit
 *   Event    emergency_stop
 *   ACK      received → accepted → executed (3단계)
 *
 * 전송: CAN 2.0B 500kbps. 신호는 *바이너리* 프레임(JSON 아님 — 8B/frame).
 *   arbitration id 예: 0x18FF50xx (proprietary, priority 6).
 *
 * 안전: E-stop 은 본 SW 가 아니라 물리 NC 릴레이가 모터 전원을 끊는다(권한 ① 물리).
 *   여기서는 *상태 보고*만 한다(docs/architecture/sdv-rig-build-guide.md PANEL 4).
 * ============================================================ */
#include <stdint.h>
#include "can.h" /* TODO: 보드 HAL CAN 래퍼(아래 can.h 골격) */

/* --- CAN arbitration IDs (J1939 톤) ----------------------- */
#define CAN_ID_MOTION_SPEED 0x18FF5001u /* telemetry: 속도 */
#define CAN_ID_BATTERY 0x18FF5002u      /* telemetry: BMS 전압 */
#define CAN_ID_EMERGENCY 0x18FFE000u    /* event: e-stop (최우선) */
#define CAN_ID_CMD_MOTION 0x18EF5000u   /* command in: motion.* */

/* --- command verb 코드(8B 페이로드 첫 바이트) ------------- */
#define VERB_MOTION_STOP 0x01u
#define VERB_SET_SPEED_LIMIT 0x02u

/* --- ACK stage 코드 --------------------------------------- */
#define ACK_RECEIVED 0x01u
#define ACK_ACCEPTED 0x02u
#define ACK_EXECUTED 0x03u
#define CAN_ID_ACK 0x18FF50A0u

static volatile uint8_t g_estop_latched = 0; /* E-stop GPIO 인터럽트가 set */
static float g_speed_mps = 1.2f;             /* 현재 구동 속도 */
static float g_speed_limit = 1.5f;

/* 속도(m/s)를 mm/s int16 로 패킹해 8B 프레임으로 — JSON 금지(레퍼런스 교훈). */
static void publish_speed(void) {
  uint8_t d[8] = {0};
  int16_t mmps = (int16_t)(g_speed_mps * 1000.0f);
  d[0] = (uint8_t)(mmps & 0xFF);
  d[1] = (uint8_t)((mmps >> 8) & 0xFF);
  can_send(CAN_ID_MOTION_SPEED, d, 8); /* TODO: 실 BMS/엔코더 값 채움 */
}

static void send_ack(uint32_t cmd_id, uint8_t stage) {
  uint8_t d[8] = {0};
  d[0] = stage;
  d[1] = (uint8_t)(cmd_id & 0xFF);
  can_send(CAN_ID_ACK, d, 8);
}

/* 명령 수신 ISR → 3단계 ACK. accepted 는 robot-side 안전조건 통과 후. */
static void on_command(uint32_t id, const uint8_t *d, uint8_t len) {
  if (id != CAN_ID_CMD_MOTION || len < 2) return;
  uint8_t verb = d[0];
  uint32_t cmd_id = d[1];
  send_ack(cmd_id, ACK_RECEIVED);
  if (g_estop_latched) return; /* 안전 미충족 → accepted 안 함 */
  switch (verb) {
    case VERB_MOTION_STOP:
      g_speed_mps = 0.0f; /* TODO: 모터 드라이버 enable=0 */
      send_ack(cmd_id, ACK_ACCEPTED);
      send_ack(cmd_id, ACK_EXECUTED);
      break;
    case VERB_SET_SPEED_LIMIT:
      g_speed_limit = (float)d[1] / 10.0f;
      send_ack(cmd_id, ACK_ACCEPTED);
      send_ack(cmd_id, ACK_EXECUTED);
      break;
    default:
      break; /* 미지원 verb */
  }
}

/* E-stop GPIO 인터럽트 — 물리 회로가 전원을 끊은 뒤, SW 는 보고만. */
void EXTI_EStop_IRQHandler(void) {
  g_estop_latched = 1;
  uint8_t d[8] = {1};
  can_send(CAN_ID_EMERGENCY, d, 8); /* event: emergency_stop */
}

int main(void) {
  /* TODO: HAL_Init() · SystemClock_Config() · GPIO/CAN/TIM init */
  can_init(500000u); /* 500 kbps */
  can_on_receive(on_command);
  /* TODO: watchdog(IWDG) 시작 — 루프가 멈추면 모터 차단 */

  uint32_t tick = 0;
  for (;;) {
    /* 20Hz 속도 발행 */
    if ((tick % 50u) == 0u) publish_speed();
    /* 1Hz BMS 전압(예시) */
    if ((tick % 1000u) == 0u) {
      uint8_t d[8] = {0};
      uint16_t mv = 24000; /* TODO: 실 BMS ADC */
      d[0] = (uint8_t)(mv & 0xFF);
      d[1] = (uint8_t)((mv >> 8) & 0xFF);
      can_send(CAN_ID_BATTERY, d, 8);
    }
    /* TODO: IWDG_Refresh() · 1ms delay(타이머 기반) */
    tick++;
  }
}
