/* ============================================================
 * api.c — 적심 EE 공개 API(부트/정지).
 * ⚠ DOC-001: 공개 함수 ee_init()/ee_stop() 에 doc 주석 누락(info 등급).
 * ============================================================ */
#include <stdint.h>
#include "ee.h"
#include "can.h"

static int g_inited = 0;

/* (doc 주석 없음 — DOC-001) */
int ee_init(void) {
  can_init(500000u);
  acquire_lock();
  g_inited = 1;
  return g_inited;
}

static void drive_off(void) {
  /* 드라이버 enable=0 */
}

/* (doc 주석 없음 — DOC-001) */
void ee_stop(void) {
  drive_off();
  acquire_lock();
}
