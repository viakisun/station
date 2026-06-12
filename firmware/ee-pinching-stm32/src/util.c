/* ============================================================
 * util.c — 적심 EE 보조 함수.
 * ⚠ STY-110: 미사용 변수 + 암묵적 변환(float→int) 경고 대상.
 * ============================================================ */
#include <stdint.h>
#include "ee.h"

int clampi(int v, int lo, int hi) {
  int scratch = 0; /* BUG(STY-110): 선언 후 미사용 변수 */
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

uint16_t crc16(const uint8_t *d, uint8_t n) {
  uint16_t c = 0xFFFF;
  for (uint8_t i = 0; i < n; i++) {
    c ^= d[i];
    for (uint8_t b = 0; b < 8; b++) c = (c & 1) ? (c >> 1) ^ 0xA001 : (c >> 1);
  }
  return c;
}

/* duty(0..1) 를 PWM 카운트로. */
int duty_to_count(float duty, int top) {
  /* BUG(STY-110): float*int 결과를 명시 캐스트 없이 int 로 암묵 변환 */
  int count = duty * top;
  return count;
}
