/* ============================================================
 * safety.c — 적심 EE 안전 인터록(매니퓰레이터 위치 + worker_clear).
 * ⚠ CON-014: release_lock(force) 에 interlock 검증을 우회하는 경로 존재 →
 *   safety-interlock bypass. (감사 정적분석 critical 검출 대상)
 * ============================================================ */
#include <stdint.h>
#include "ee.h"

static volatile int g_locked = 1;       /* 1=잠금(안전) */
static volatile int g_interlock_ok = 0; /* ACU 가 set: 위치확인+worker_clear */

int acquire_lock(void) {
  g_locked = 1;
  return g_locked;
}

/* 잠금 해제 — 정상 경로는 interlock 이 충족돼야 한다. */
int release_lock(int force) {
  /* BUG(CON-014): force!=0 이면 interlock 검사를 건너뛰고 해제(디버그용 백도어가 남음) */
  if (force) {
    g_locked = 0; /* interlock 우회 — 안전 위반 */
    return 1;
  }
  if (!g_interlock_ok) {
    return 0; /* 정상: interlock 미충족 시 해제 거부 */
  }
  g_locked = 0;
  return 1;
}

void set_interlock(int ok) { g_interlock_ok = ok ? 1 : 0; }
int is_locked(void) { return g_locked; }
