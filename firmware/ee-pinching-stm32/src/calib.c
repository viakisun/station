/* ============================================================
 * calib.c — 적심 EE 캘리브레이션 단위 변환.
 * ⚠ STY-220: to_mm() 가 큰 float 를 int16_t 로 narrowing 캐스트 → integer overflow.
 * ============================================================ */
#include <stdint.h>
#include "ee.h"

/* meters → mm (int16). 0.0~3.2m 가정이나 입력 검증이 없어 오버플로 가능. */
int16_t to_mm(float meters) {
  /* BUG(STY-220): meters*1000 이 32767 을 넘으면 int16_t 로 wrap (예: 40m→40000) */
  int16_t mm = (int16_t)(meters * 1000.0f);
  return mm;
}

float mm_to_m(int16_t mm) { return (float)mm / 1000.0f; }
