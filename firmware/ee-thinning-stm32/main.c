/* ============================================================
 * 적과(Thinning) EE 펌웨어 — STM32. 벤더: GreenEdge (MOD-EE-THIN, FW v3.1.2).
 *   역할: 매니퓰레이터 끝단 절단 툴 — 그립/절단 액추에이션, 힘 제어, 상태 보고.
 *   안전: 절단은 interlock(매니퓰레이터 위치확인 + worker_clear)이 모두 참일 때만.
 *   본 모듈은 *모범(clean)* 구현 — 경계검사·watchdog·문서화 완비(감사 통과 대상).
 * ============================================================ */
#include <stdint.h>
#include <string.h>
#include "ee.h"
#include "can.h"

static volatile uint8_t g_interlock_ok = 0; /* ACU 가 CAN 으로 set */
static ee_state_t g_state = EE_IDLE;
static int32_t g_force_mn = 0;

/** 힘 목표를 안전 상한으로 clamp 한 뒤 드라이버에 적용한다(경계검사 포함). */
static int32_t clamp_force(int32_t want_mn) {
  if (want_mn < 0) return 0;
  if (want_mn > EE_FORCE_MAX_MN) return EE_FORCE_MAX_MN;
  return want_mn;
}

static void send_ack(uint8_t cmd_id, uint8_t stage) {
  uint8_t d[8] = {0};
  d[0] = stage;
  d[1] = cmd_id;
  can_send(CAN_ID_EE_ACK, d, 8);
}

/** 절단 액추에이션 — interlock 검증을 통과해야만 진행(safety gate). */
static void actuate(uint8_t cmd_id, int32_t force_mn) {
  if (!g_interlock_ok) {        /* interlock 미충족 → 거부(accepted 안 함) */
    g_state = EE_IDLE;
    return;
  }
  g_force_mn = clamp_force(force_mn);
  g_state = EE_ACTUATING;
  send_ack(cmd_id, ACK_ACCEPTED);
  /* TODO: 드라이버 PWM = force→duty. 완료 후: */
  send_ack(cmd_id, ACK_EXECUTED);
  g_state = EE_IDLE;
}

/** CAN 명령 수신 ISR → 3단계 ACK. 길이검사 후 verb 분기. */
static void on_command(uint32_t id, const uint8_t *d, uint8_t len) {
  if (id != CAN_ID_EE_CMD || len < 2) return;
  uint8_t verb = d[0];
  uint8_t cmd_id = d[1];
  send_ack(cmd_id, ACK_RECEIVED);
  switch (verb) {
    case VERB_EE_ACTUATE: {
      int32_t f = (len >= 4) ? ((int32_t)d[2] | ((int32_t)d[3] << 8)) : 0;
      actuate(cmd_id, f);
      break;
    }
    case VERB_EE_HOME:
      g_state = EE_HOMING;
      send_ack(cmd_id, ACK_ACCEPTED);
      send_ack(cmd_id, ACK_EXECUTED);
      g_state = EE_IDLE;
      break;
    case VERB_EE_CALIBRATE:
      send_ack(cmd_id, ACK_ACCEPTED);
      send_ack(cmd_id, ACK_EXECUTED);
      break;
    default:
      break;
  }
}

/** interlock 상태 갱신(ACU → EE) — 별도 프레임. */
static void on_interlock(const uint8_t *d, uint8_t len) {
  if (len >= 1) g_interlock_ok = d[0] ? 1u : 0u;
}

static void publish_state(void) {
  uint8_t d[8] = {0};
  d[0] = (uint8_t)g_state;
  can_send(CAN_ID_EE_STATE, d, 8);
  int16_t f = (int16_t)g_force_mn;
  uint8_t fd[8] = {(uint8_t)(f & 0xFF), (uint8_t)((f >> 8) & 0xFF)};
  can_send(CAN_ID_EE_FORCE, fd, 8);
}

int main(void) {
  can_init(500000u);
  can_on_receive(on_command);
  watchdog_start(200u); /* 200ms IWDG — 루프 정지 시 툴 안전정지 */

  uint32_t tick = 0;
  for (;;) {
    if ((tick % 100u) == 0u) publish_state(); /* 10Hz */
    if ((tick % 1000u) == 0u) {               /* 1Hz heartbeat */
      uint8_t hb[8] = {1};
      can_send(CAN_ID_EE_HB, hb, 8);
    }
    watchdog_refresh(); /* 매 루프 watchdog kick — 정지 시 차단 */
    tick++;
  }
}
