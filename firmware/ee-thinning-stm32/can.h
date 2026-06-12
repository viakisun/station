/* ============================================================
 * can.h — EE 보드 CAN HAL + watchdog 래퍼(골격). STM32 HAL 로 구현.
 * ============================================================ */
#ifndef STATION_EE_CAN_H
#define STATION_EE_CAN_H
#include <stdint.h>

typedef void (*can_rx_cb)(uint32_t id, const uint8_t *data, uint8_t len);

void can_init(uint32_t bitrate);
void can_send(uint32_t ext_id, const uint8_t *data, uint8_t len);
void can_on_receive(can_rx_cb cb);

/** 독립 워치독(IWDG) — timeout_ms 내 refresh 없으면 리셋(툴 안전정지). */
void watchdog_start(uint32_t timeout_ms);
void watchdog_refresh(void);

#endif /* STATION_EE_CAN_H */
