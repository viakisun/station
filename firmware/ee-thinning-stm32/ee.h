/* ============================================================
 * ee.h — 적과(Thinning) 엔드이펙터 공용 정의.
 *   부착: ACU 매니퓰레이터 끝단(EE). 전송: CAN 2.0B 500kbps.
 *   벤더: GreenEdge (MOD-EE-THIN). 계약: machine.ee.* + ee.* 명령.
 * ============================================================ */
#ifndef STATION_EE_THINNING_H
#define STATION_EE_THINNING_H
#include <stdint.h>

/* CAN arbitration IDs (J1939 톤, EE = 0x..51..) */
#define CAN_ID_EE_STATE 0x18FF5101u  /* telemetry: tool_state */
#define CAN_ID_EE_FORCE 0x18FF5102u  /* telemetry: grip force (mN) */
#define CAN_ID_EE_HB 0x18FF51F0u     /* heartbeat.ee (1Hz) */
#define CAN_ID_EE_CMD 0x18EF5100u    /* command in: ee.* */
#define CAN_ID_EE_ACK 0x18FF51A0u    /* 3-stage ACK */

/* command verbs (payload[0]) */
#define VERB_EE_ACTUATE 0x10u /* 적과 동작(cut) */
#define VERB_EE_HOME 0x11u
#define VERB_EE_CALIBRATE 0x12u

/* ACK stages */
#define ACK_RECEIVED 0x01u
#define ACK_ACCEPTED 0x02u
#define ACK_EXECUTED 0x03u

/* tool state enum */
typedef enum { EE_IDLE = 0, EE_HOMING = 1, EE_ACTUATING = 2, EE_FAULT = 3 } ee_state_t;

#define EE_FORCE_MAX_MN 8000 /* 안전 상한: 8N */

#endif /* STATION_EE_THINNING_H */
