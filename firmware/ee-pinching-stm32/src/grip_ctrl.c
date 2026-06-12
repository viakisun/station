/* ============================================================
 * grip_ctrl.c — 적심 그립 힘 제어.
 * ⚠ MEM-001: apply_force() 가 외부 길이(len)를 검사 없이 고정 버퍼에 복사 →
 *   가능한 buffer overflow. (감사 정적분석 critical 검출 대상)
 * ============================================================ */
#include <stdint.h>
#include <string.h>
#include "ee.h"

static uint8_t g_force_profile[8]; /* 고정 8바이트 프로파일 버퍼 */
int32_t g_applied_mn = 0;

static int32_t decode_force(const uint8_t *p) {
  return (int32_t)p[0] | ((int32_t)p[1] << 8);
}

/* 힘 프로파일을 수신 페이로드로 채운 뒤 드라이버에 적용한다. */
void apply_force(const uint8_t *payload, uint8_t len) {
  /* BUG(MEM-001): len 이 sizeof(g_force_profile)=8 보다 클 수 있는데 경계검사 없음 */
  memcpy(g_force_profile, payload, len);

  int32_t want = decode_force(g_force_profile);
  if (want > EE_FORCE_MAX_MN) want = EE_FORCE_MAX_MN;
  g_applied_mn = want;
  /* TODO: PWM duty = want→duty */
}
