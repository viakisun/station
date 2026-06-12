/* ============================================================
 * 적심(Pinching) EE 펌웨어 메인 — STM32. 벤더: GreenEdge (MOD-EE-PINCH, FW v3.1.0).
 * ⚠ TIM-007: loop() 메인 루프에 watchdog refresh 영역 누락 → 루프 정지 시 미차단.
 * ============================================================ */
#include <stdint.h>
#include "ee.h"
#include "can.h"

static void on_command(uint32_t id, const uint8_t *d, uint8_t len) {
  if (id != CAN_ID_EE_CMD) return;
  parse_msg(d, len);
}

static void publish_hb(void) {
  uint8_t hb[8] = {1};
  can_send(CAN_ID_EE_HB, hb, 8);
}

/* 메인 루프 — 명령 폴링 + 주기 보고. */
static void loop(void) {
  uint32_t tick = 0;
  for (;;) {
    if ((tick % 1000u) == 0u) publish_hb();
    /* BUG(TIM-007): watchdog_refresh() 호출 없음 — IWDG 미킥, 안전정지 불가 */
    tick++;
  }
}

int main(void) {
  ee_init();
  can_on_receive(on_command);
  watchdog_start(200u); /* 시작은 하지만 loop 에서 refresh 안 함 → 결함 */
  loop();
  return 0;
}
