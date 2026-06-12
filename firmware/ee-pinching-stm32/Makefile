# ============================================================
# 적심 EE 펌웨어 빌드. ⚠ 의도적 결함 포함 — 감사 정적분석 실증용.
#   `make check` = 호스트 구문검증(cc -fsyntax-only).
#   `make lint`  = 경고 강화(-Wall -Wextra) — 일부 결함이 컴파일 경고로도 노출.
# ============================================================
SRC := src/main.c src/grip_ctrl.c src/safety.c src/proto.c src/calib.c src/util.c src/api.c
INC := -I.

check:
	cc -std=c11 -fsyntax-only $(INC) $(SRC)

lint:
	cc -std=c11 -fsyntax-only -Wall -Wextra -Wconversion $(INC) $(SRC) || true

clean:
	rm -f *.o src/*.o *.elf

.PHONY: check lint clean
