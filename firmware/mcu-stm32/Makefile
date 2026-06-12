# ============================================================
# MCU 노드 펌웨어 빌드 — STM32 (arm-none-eabi) 또는 호스트 컴파일(구문검증).
#   실 보드: arm-none-eabi-gcc + CMSIS/HAL. 여기서는 HAL 골격(can.h)만 stub.
#   호스트 구문검증: `make check` (cc -fsyntax-only) — 툴체인 없이 CI 에서 통과.
# ============================================================
CROSS   ?= arm-none-eabi-
CC      := $(CROSS)gcc
MCU     := -mcpu=cortex-m4 -mthumb -mfpu=fpv4-sp-d16 -mfloat-abi=hard
CFLAGS  := -std=c11 -Wall -Wextra -Os -ffunction-sections -fdata-sections $(MCU)
SRC     := main.c
OBJ     := $(SRC:.c=.o)
TARGET  := mcu-node.elf

all: $(TARGET)

$(TARGET): $(OBJ)
	$(CC) $(CFLAGS) -Wl,--gc-sections -o $@ $^

%.o: %.c can.h
	$(CC) $(CFLAGS) -c -o $@ $<

# 툴체인 없이 구문만 검증(호스트 cc) — 감사/CI 용.
check:
	cc -std=c11 -fsyntax-only -Wall -Wextra main.c

clean:
	rm -f $(OBJ) $(TARGET)

.PHONY: all check clean
