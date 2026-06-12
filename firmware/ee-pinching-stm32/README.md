# 적심(Pinching) EE 펌웨어 — MOD-EE-PINCH (FW v3.1.0)

벤더: GreenEdge · 부착: ACU 매니퓰레이터 · 전송: CAN 2.0B 500kbps.

> ⚠ **이 모듈은 감사 차단(FW-EEP-3.1.0) 실증용 — 의도적 결함을 포함**합니다.
> `@station/audit-kit` 의 정적분석기가 아래 결함을 **실제로 검출**해 G2(배포) 게이트를 차단합니다.

## 빌드
```bash
make check   # 호스트 구문검증(cc -fsyntax-only)
make lint    # 경고 강화(-Wall -Wextra -Wconversion)
```

## 시드된 결함 (감사 대상)
| rule | 파일 | 함수 | 내용 |
|---|---|---|---|
| MEM-001 (critical) | src/grip_ctrl.c | `apply_force()` | 외부 길이 검사 없는 `memcpy` → buffer overflow |
| CON-014 (critical) | src/safety.c | `release_lock()` | `if(force)` 경로가 interlock 검증 우회 |
| MEM-003 (critical) | src/proto.c | `parse_msg()` | `free()` 후 포인터 재사용(use-after-free) |
| STY-220 (warning) | src/calib.c | `to_mm()` | 큰 float → int16 narrowing(정수 오버플로) |
| STY-110 (low) | src/util.c | `clampi`/`duty_to_count` | 미사용 변수 · 암묵적 float→int |
| DOC-001 (info) | src/api.c | `ee_init`/`ee_stop` | 공개 함수 doc 누락 |

감사 실행: Build 앱 → Projects → 김제 토마토 → **적심 EE** 패키지 → [감사 실행].
