/* ============================================================
 * can.h — 적심 EE 보드 CAN HAL + watchdog 래퍼(골격).
 * ============================================================ */
#ifndef STATION_EEP_CAN_H
#define STATION_EEP_CAN_H
#include <stdint.h>

typedef void (*can_rx_cb)(uint32_t id, const uint8_t *data, uint8_t len);

void can_init(uint32_t bitrate);
void can_send(uint32_t ext_id, const uint8_t *data, uint8_t len);
void can_on_receive(can_rx_cb cb);
void watchdog_start(uint32_t timeout_ms);
void watchdog_refresh(void);

#endif /* STATION_EEP_CAN_H */
