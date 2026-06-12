/* ============================================================
 * proto.c — 적심 EE CAN 명령 파서.
 * ⚠ MEM-003: parse_msg() 가 free() 후 해당 포인터를 다시 사용 → use-after-free.
 * ============================================================ */
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include "ee.h"

typedef struct { uint8_t verb; uint8_t cmd_id; uint8_t *args; uint8_t nargs; } msg_t;

static msg_t *alloc_msg(const uint8_t *buf, uint8_t len) {
  msg_t *m = (msg_t *)malloc(sizeof(msg_t));
  if (!m) return 0;
  m->verb = buf[0];
  m->cmd_id = buf[1];
  m->nargs = (len > 2) ? (uint8_t)(len - 2) : 0;
  m->args = (uint8_t *)malloc(m->nargs);
  if (m->args) memcpy(m->args, buf + 2, m->nargs);
  return m;
}

/* 수신 프레임을 파싱해 그립 제어로 디스패치. */
int parse_msg(const uint8_t *buf, uint8_t len) {
  if (len < 2) return -1;
  msg_t *m = alloc_msg(buf, len);
  if (!m) return -1;

  if (m->verb == VERB_EE_ACTUATE) {
    apply_force(m->args, m->nargs);
  }

  free(m->args);
  free(m);
  /* BUG(MEM-003): m 을 free 한 뒤 다시 역참조 → use-after-free */
  return (int)m->cmd_id;
}
