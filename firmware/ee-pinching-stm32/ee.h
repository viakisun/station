/* ============================================================
 * ee.h — 적심(Pinching) 엔드이펙터 공용 정의. 벤더: GreenEdge (MOD-EE-PINCH, FW v3.1.0).
 *   부착: ACU 매니퓰레이터. 전송: CAN 2.0B 500kbps.
 *   ⚠ 본 모듈은 감사 차단(FW-EEP-3.1.0) 케이스 — 의도적 결함 포함(정적분석 실증용).
 * ============================================================ */
#ifndef STATION_EE_PINCH_H
#define STATION_EE_PINCH_H
#include <stdint.h>

#define CAN_ID_EE_STATE 0x18FF5201u
#define CAN_ID_EE_FORCE 0x18FF5202u
#define CAN_ID_EE_HB 0x18FF52F0u
#define CAN_ID_EE_CMD 0x18EF5200u
#define CAN_ID_EE_ACK 0x18FF52A0u

#define VERB_EE_ACTUATE 0x10u
#define VERB_EE_HOME 0x11u
#define VERB_EE_CALIBRATE 0x12u

#define ACK_RECEIVED 0x01u
#define ACK_ACCEPTED 0x02u
#define ACK_EXECUTED 0x03u

#define EE_FORCE_MAX_MN 6000
#define EE_MSG_MAX 16

typedef enum { EE_IDLE = 0, EE_ACTUATING = 2, EE_FAULT = 3 } ee_state_t;

/* public API (api.c) */
int ee_init(void);
void ee_stop(void);

/* grip control (grip_ctrl.c) */
void apply_force(const uint8_t *payload, uint8_t len);

/* safety interlock (safety.c) */
int acquire_lock(void);
int release_lock(int force);

/* protocol (proto.c) */
int parse_msg(const uint8_t *buf, uint8_t len);

/* calibration (calib.c) */
int16_t to_mm(float meters);

#endif /* STATION_EE_PINCH_H */
