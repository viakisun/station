/* ============================================================
 * can.h — 보드 CAN HAL 래퍼(골격). STM32 HAL(bxCAN/FDCAN) 또는
 *   Arduino Portenta MC CAN 라이브러리로 구현한다. 종단 ACK 없음(at_most_once).
 * ============================================================ */
#ifndef STATION_MCU_CAN_H
#define STATION_MCU_CAN_H
#include <stdint.h>

typedef void (*can_rx_cb)(uint32_t id, const uint8_t *data, uint8_t len);

/** 비트레이트로 CAN 주변장치 초기화(예 500000). TODO: 필터/IRQ 설정. */
void can_init(uint32_t bitrate);

/** 확장(29-bit) 프레임 송신. len<=8. 비차단(메일박스). */
void can_send(uint32_t ext_id, const uint8_t *data, uint8_t len);

/** 수신 콜백 등록 — RX FIFO 인터럽트에서 호출. */
void can_on_receive(can_rx_cb cb);

#endif /* STATION_MCU_CAN_H */
