# SDV 레퍼런스 리그 — 실물 제작·배치 가이드 (NotebookLM 인포그래픽 스크립트)

> **이 문서대로 보드를 베이스플레이트에 부착·배선하면 리그가 완성된다.** 개념 설명이 아니라 **실측 지시서**.
> 각 `PANEL`은 인포그래픽 한 블록 단위(headline + 핵심 수치 + 시각요소)로 작성 — NotebookLM 인포그래픽 소스로 그대로 사용 가능.
> 동반 도면: [sdv-rig-build-sheet.html](sdv-rig-build-sheet.html) / [PDF(A3)](sdv-rig-build-sheet.pdf) · 아키텍처: [sdv-crop-growth-rig.md](sdv-crop-growth-rig.md)

---

## PANEL 0 — 한눈 요약

**headline:** 노드 7개를 한 판에 부착한 "온로봇 SDV 개발 벤치" — 모터=MCU · 카메라=VPU · 미션=ACU · 통합/안전=Local Agent · 화면=HMI · 클라우드=Telemetry.

| 항목 | 값 |
| --- | --- |
| 판넬(베이스) | 알루미늄/복합 **600 × 400 × 4 mm** — **터치 디스플레이·카메라 포함 전 부품을 이 한 판넬에 부착**(외부 거치대 없음) |
| 보드 노드 | MCU · VPU+ACU · Local Agent · HMI · Telemetry (5 물리 + ACU 프로세스) |
| 컴퓨트 | Jetson Orin Nano ×1 · Raspberry Pi 5 ×2 · Portenta MC ×1 |
| 전원 | 24V DC 입력 → 12V/5V DC-DC · 물리 E-stop · 퓨즈 |
| 통신 | CAN/RS485(MCU) · Ethernet(Jetson·Agent·HMI) · USB-LTE · WiFi |
| 예상 조립 시간 | 1.5~2일 (배선·라벨 포함) |

**시각요소:** 7개 컬러 블록(기관색) + 중앙 Local Agent 허브 + 굵은 E-stop 빨강.

---

## PANEL 1 — 판넬 & 좌표계

**headline:** **평범한 판넬 1장(600 × 400)에 터치 디스플레이·카메라 포함 전부를 부착.** 좌상단 원점(0,0), 단위 mm.

- **판넬:** 600(W) × 400(H) × 4t mm 알루미늄/복합. **외부 거치대·별도 스탠드 없음** — 10.1" 디스플레이도 이 판넬에 면 브래킷으로 직접 부착.
- **고정 그리드:** M5 탭홀 **25mm 격자**. 보드는 M2.5/M3 스탠드오프(높이 11mm), 디스플레이는 면 브래킷, 카메라는 상단 전방 브래킷.
- **DIN 레일:** 상단 1줄(y=8mm, 길이 560mm) — 전원·단자대·릴레이용.
- **좌표 규칙:** 부품 위치 = **좌상단 모서리 (x, y)**. 케이블 채널은 판넬 4변 안쪽 15mm.

**시각요소:** mm 눈금자(0–600 / 0–400), 25mm 격자, 좌측을 크게 차지하는 디스플레이 + 우측 보드군.

---

## PANEL 2 — 부품 배치 좌표표 (실측)

**headline:** 아래 좌표 그대로 스탠드오프를 박고 보드를 올린다. (좌표=좌상단 모서리, mm)

| # | 부품 | 위치 (x, y) | 풋프린트 (W×H mm) | 고정 |
| --- | --- | --- | --- | --- |
| 1 | **터치 디스플레이 10.1"** | 20, 115 | 250 × 165 | **면 브래킷/M3 (판넬에 직접)** |
| 2 | **MCU — Portenta MC** | 300, 115 | 114 × 97 | M3 스탠드오프 ×4 |
| 3 | **VPU+ACU — Jetson Orin Nano** | 300, 228 | 105 × 90 | M3 스탠드오프 ×4 |
| 4 | **Local Agent — RPi5** | 435, 115 | 85 × 56 | M2.5 스탠드오프 ×4 |
| 5 | **HMI 컴퓨트 — RPi5** | 435, 185 | 85 × 56 | M2.5 스탠드오프 ×4 |
| 6 | LTE Telemetry 모뎀 | 435, 255 | 70 × 40 | 홀더/양면 |
| 7 | (옵션) LPU SBC + LiDAR/IMU | 435, 312 | 85 × 56 | M2.5 ×4 |
| 8 | **카메라 RGB/NIR** | 550, 16 | 42 × 62 | **전방 브래킷(판넬 상단)** |
| 9 | 단자대 + 퓨즈 블록 | 20, 18 | 90 × 46 | DIN 레일 |
| 10 | DC-DC 24→12V / 24→5V | 125,18 / 200,18 | 65 × 42 | M3 ×4 |
| 11 | **E-STOP (Ø22)** | 290, 18 | 50 × 50 | 패널 너트 |
| 12 | Ethernet switch / WiFi AP | 360,16 / 475,16 | 100×62 / 60×62 | M3/브래킷 |

> **모든 부품을 이 한 판넬에 부착** — 디스플레이·카메라도 외부 거치대 없이 판넬에 직접. 디스플레이가 좌측을 크게 차지하고, 컴퓨트(MCU·Jetson·RPi5×2·LTE)는 우측, 전원·안전·통신은 상단 띠에 배치.

**시각요소:** 플레이트 top-view에 14개 박스를 좌표대로 배치 + 치수선.

---

## PANEL 3 — 전원 배선 (24V 도메인)

**headline:** 24V 1점 입력 → 퓨즈 → **E-stop이 모터 전원만 차단** → DC-DC가 12V/5V 분기.

| from | to | 전선 | 비고 |
| --- | --- | --- | --- |
| 24V 배터리/어댑터 (+) | 퓨즈 블록 IN | 16 AWG 적색 | 메인 인입, XT60 |
| 퓨즈 OUT (10A) | **모터 전원 버스 (E-stop 도메인)** | 16 AWG 적색 | E-stop 릴레이 경유 |
| 퓨즈 OUT (5A) | DC-DC 24→12V IN | 18 AWG 적색 | 컴퓨트 도메인(상시) |
| 퓨즈 OUT (5A) | DC-DC 24→5V IN | 18 AWG 적색 | 컴퓨트 도메인(상시) |
| DC-DC 5V OUT | RPi5 ×2 (USB-C 5V/5A) | 18 AWG | 각 Pi 별도 라인 |
| DC-DC 5V OUT | Jetson Orin (DC jack 5V) | 18 AWG | DevKit 사양 따름 |
| DC-DC 12V OUT | 모터드라이버 로직 / 팬 | 20 AWG | — |
| 공통 GND | 단일 GND 버스바 | 16 AWG 흑색 | **star ground** 1점 접지 |

**원칙:** 모터 전원과 컴퓨트 전원 도메인을 **분리**. E-stop은 컴퓨트 GND/5V를 끊지 않는다(상태 보고 지속).

**시각요소:** 빨강(24V)·주황(12V)·노랑(5V)·검정(GND) 4색 배선 트리.

---

## PANEL 4 — E-stop 안전 회로 (물리 차단)

**headline:** E-stop은 **소프트웨어가 아니라 NC 접점 + 릴레이**로 모터 enable/전원을 끊는다. (권한 최상위)

- **E-stop 버튼:** Ø22 2NC(상시닫힘) 2채널.
- **채널 A (전력 차단):** 24V 모터 버스 → E-stop NC → **Safety Relay 코일** → 릴레이 접점이 모터드라이버 **enable/전원** 차단.
- **채널 B (보고):** E-stop NC → MCU `EMERGENCY_IN` 디지털 입력(풀업). MCU가 `machine.safety.estop` Event 발행 → Local Agent → HMI 표시.
- **복귀:** 버튼 트위스트 리셋 + HMI/MCU 재가동 시퀀스(safe-start) 후에만 enable 복원.

| 결선 | 내용 |
| --- | --- |
| E-stop NC1 | 24V 모터버스 ↔ Safety relay 코일 (전력 인터록) |
| E-stop NC2 | MCU EMERGENCY_IN ↔ GND (보고) |
| Safety relay 접점 | 모터드라이버 ENABLE 라인 (열리면 정지) |

**시각요소:** 빨강 점선 = SW 보고 경로, 빨강 실선 = 물리 차단 경로. "SW 죽어도 차단됨" 배지.

---

## PANEL 5 — 데이터 배선 (CAN · Ethernet · USB)

**headline:** MCU는 **CAN**, 컴퓨트는 **Ethernet**, LTE/카메라는 **USB**. 모든 데이터는 Local Agent로 모인다.

| from → to | 케이블/커넥터 | 비고 |
| --- | --- | --- |
| MCU(Portenta CAN) → Local Agent(RPi5 + CAN HAT) | **CAN twisted pair** (CANH/CANL/GND), DB9 또는 스크류 | **양 끝 120Ω 종단** |
| Jetson(VPU+ACU) → Ethernet switch | RJ45 Cat6 | — |
| Local Agent(RPi5) → Ethernet switch | RJ45 Cat6 | — |
| HMI(RPi5) → Ethernet switch (또는 WiFi) | RJ45 / WiFi | HMI는 Agent API만 |
| (옵션) LPU SBC → Ethernet switch | RJ45 | — |
| LTE 모뎀 → Local Agent(RPi5) | USB-A | telemetry-node |
| 카메라(RGB/NIR) → Jetson | USB3 / CSI(MIPI) | VPU에 직결 |

**CAN 핀맵(권장):** 1=GND, 2=CANL, 3=CANH (또는 DB9 표준: 2=CANL, 7=CANH, 3=GND). 버스 **선형 토폴로지**, 분기 짧게, 종단 2개.

**시각요소:** 주황(CAN)·초록(Ethernet)·파랑(USB) 3색 결선표 + 120Ω 종단 아이콘 양 끝.

---

## PANEL 6 — 조립 순서 (Step-by-Step)

**headline:** 전원 → 안전 → 컴퓨트 → 통신 → 라벨 → 점검 순으로 조립한다.

1. 베이스플레이트에 **DIN 레일 2줄** + 케이블 채널 부착, M5 그리드 확인.
2. **단자대·퓨즈·DC-DC·E-stop** 장착(PANEL 2 좌표). GND 버스바 1점 접지.
3. **전원 배선(PANEL 3)** → DC-DC 출력 전압 측정(12.0V/5.0V) **부하 없이** 먼저 확인.
4. **E-stop 안전 회로(PANEL 4)** 결선 → 버튼 누름 시 모터버스 차단되는지 테스터로 확인.
5. 스탠드오프로 **MCU·Jetson·RPi5 ×2** 고정 → 각 보드 전원만 인가해 부팅 확인.
6. **CAN/Ethernet/USB(PANEL 5)** 결선 + CAN 120Ω 종단.
7. 카메라·(옵션)LiDAR·LTE·디스플레이 연결.
8. **라벨링(PANEL 7)** → 전체 **점검 체크리스트(PANEL 8)** → 첫 통전.

**시각요소:** 8단계 번호 타임라인 + 단계별 아이콘.

---

## PANEL 7 — 라벨링 규칙

**headline:** 모든 케이블·단자·보드에 **표준 라벨**을 붙인다(정비·장애추적의 기본).

- 보드: `NODE-MCU-AGE` / `NODE-VPU-META` / `NODE-ACU-META` / `NODE-AGENT-VIA` / `NODE-HMI-VIA` / `NODE-TEL-VIA`.
- 전원선: `24V` / `12V` / `5V` / `GND` 색·텍스트 동시.
- 데이터선: `CAN` / `ETH-1..n` / `USB-LTE` / `USB-CAM`.
- 단자: 번호 + 신호명. E-stop 회로는 **빨강 라벨**.

---

## PANEL 8 — 통전 전 안전 체크리스트

**headline:** 첫 전원 인가 전 반드시 7개 확인.

- ☐ GND 1점 접지(star), 쇼트 없음(테스터 도통).
- ☐ DC-DC 출력 12.0V / 5.0V 정상(무부하).
- ☐ **E-stop 누름 → 모터버스 차단** 물리 확인.
- ☐ 퓨즈 정격(메인 10A, 분기 5A) 장착.
- ☐ CAN 양 끝 120Ω(버스 저항 ≈ 60Ω 측정).
- ☐ 보드별 전원 극성·전압 재확인.
- ☐ 모터 출력은 **분리 상태**로 첫 부팅(공회전).

**시각요소:** 체크박스 7개 + 빨강 경고 배지(E-stop).

---

## PANEL 9 — 소프트웨어 매핑 (어느 보드에 무엇)

**headline:** 2차 베이스 프로그램의 노드 런너가 **어느 보드에 올라가는지**.

| 보드 | 실행 (2차) | 전송 |
| --- | --- | --- |
| Portenta MC (MCU) | `nodes/mcu` (펌웨어 stand-in) | CAN |
| Jetson Orin Nano | `nodes/vpu` + `nodes/acu` (프로세스 분리) | Ethernet |
| RPi5 #1 | `packages/local-agent` + `nodes/telemetry` | 허브 |
| RPi5 #2 (HMI) | `apps/sdv` (web-kiosk) | WS/REST |
| (옵션) LPU SBC | `nodes/lpu` | Ethernet |

**시각요소:** 보드 → 코드 패키지 화살표 매핑.

---

## Appendix — BOM 체크 (구매)

| 부품 | 수량 | 비고 |
| --- | --- | --- |
| Arduino Portenta Machine Control | 1 | MCU (대안 STM32 Nucleo+CAN) |
| Jetson Orin Nano Super DevKit | 1 | VPU+ACU |
| Raspberry Pi 5 8GB | 2 | Local Agent · HMI |
| 10.1" HDMI 정전 터치 | 1 | HMI 디스플레이(판넬에 직접 부착) |
| USB LTE 모뎀 / Quectel EC25 | 1 | Telemetry |
| CAN HAT (Waveshare RS485 CAN) | 1 | RPi5용 |
| 5-port Ethernet switch · WiFi AP | 1·1 | — |
| 24V PSU/배터리 · DC-DC 12V·5V · 퓨즈블록 | 1·2·1 | 전원 |
| **Ø22 2NC E-stop · Safety relay** | 1·1 | **안전** |
| 알루미늄 플레이트 500×350×4 · DIN레일 · 단자대 · 스탠드오프 · 라벨 | set | 기구 |
| CAN twisted pair · Cat6 · 16/18/20AWG 전선 · 120Ω | set | 배선 |

---

*STATION SDV · 생육분석 로봇 레퍼런스 리그 실물 제작 가이드 · 비아 · 좌표·치수는 1차 설계도(sdv-crop-growth-rig) 기준 실측 권장값. 실제 보드 치수는 데이터시트로 최종 확인.*
