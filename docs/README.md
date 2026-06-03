# STATION 설계 문서 인덱스

STATION = **Ops·Build·Field 3제품 × 하나의 Platform Core / Integration Fabric**.
본 디렉터리는 본 개발 착수 전 UX/UI 구조를 확정하는 기준 자료다.

## 1. 단일 진실 공급원 (SSOT)
- **[00. UX/UI 공통 설계 기준서](00-ux-common-standards.md)** — 제품 구조·ID 스파인·상태 체계·디자인 DNA·Gate 4단계·Audit/Event·Context handoff·권한. **모든 과업지시서가 이 문서를 단일 참조.**

## 1.5. STATION Field OS 통합 아키텍처
- **[architecture/station-field-os.md](architecture/station-field-os.md)** — 농업로봇 SDV/SDR 통합 플랫폼 3층(통합/계약/운영) · 노드↔기관↔계약 모델 · Command 3단계 ACK · App Runtime · 1~3단계 로드맵. 계약 SSOT = [`@station/contracts`](../packages/contracts/README.md). ADR-010~014 비준.
- **[architecture/station-field-os-map.html](architecture/station-field-os-map.html)** — 비아 중심 통합 아키텍처 시각 맵(**Robot Blueprint** 스트립 포함). **Robot Blueprint**(로봇=노드 조합, 새 로봇=Blueprint 1개)·**개방형 NodeKind**(표준 5종 + custom, 드론 FCU)·**platform core↔instance profile** 분리는 [ADR-014](adr/ADR-014-robot-blueprint-open-node-taxonomy.md). 온실 과제는 첫 적용 사례(reference deployment).
- **★ STATION SDV Reference Platform — Technical Baseline (통합 기술 기준서, SSOT)** — **[HTML](architecture/sdv-reference-platform.html) / [PDF(A3, 18p)](architecture/sdv-reference-platform.pdf)** · 문서번호 `STATION-SDV-SPEC-2026-001` Rev A. 생육분석 로봇 SDV의 **단일 기준서**: Front matter(Scope·Org registry·ID 규약) + **Part A 소프트웨어 아키텍처** + **Part B STATION SDV Identifier System**(Master Prefix Registry(전 식별자 ~24 family)·Namespace Map·Naming&Governance·10-레이어·정본 레지스트리·Deployment Matrix·Asset-tag) + **Part C 프로토콜·메시지**(2-tier transport·ProtocolProfile registry·transport matrix·pub/sub·3단계 ACK·Gate·교환 시퀀스) + **Part D 리그**(RIG-1 평면 패널 · **RIG-2 프로파일 로버** · 공통 전원/E-stop) + **Part E 운용**(run loop·HMI·OTA) + **Part F Module Interfaces (ICD)**(3-class IF-P/IF-L/IF-X·인터페이스 맵·**16 인터페이스 풀 시트**·provider/consumer 매트릭스·heartbeat·클라우드 토픽 트리·명령 인가 경로) + Annex A–H(계약 JSON·ID 문법·도면 색인·**코드 정합 변경안**·요구사항 레지스터·도표 목록·변경이력). 2색(ink+안전 적색)·드라이 용어. **아래 3개 문서를 통합·대체**(deprecated). *(UI 체계 정리 = 추후 별도 트랙.)*
  - <s>[1차 설계도 HTML](architecture/sdv-crop-growth-rig.html) / [MD](architecture/sdv-crop-growth-rig.md) / [PDF](architecture/sdv-crop-growth-rig.pdf)</s> · <s>[제작·배치 가이드 MD](architecture/sdv-rig-build-guide.md)</s> · <s>[Build Sheet HTML](architecture/sdv-rig-build-sheet.html) / [PDF](architecture/sdv-rig-build-sheet.pdf)</s> — **deprecated**, 마스터로 이관. (2차 = packages/local-agent·nodes/*·apps/sdv 기본 베이스 프로그램.)
- **[architecture/scenario-change-spec.md](architecture/scenario-change-spec.md)** — 통합 시나리오를 노드/기관 분해로 갱신하는 변경 명세(가공 벤더→실제 기관 정합표). **적용 완료**: S1·S3·S4·S6·S7 + 구성기·추적성(owner_org·node 컬럼)을 기관/노드 표기로 정합.
- **STATION Field OS 목업 화면(console)** — [Local Agent 런타임 시뮬](reports/screenshots/ops/13-agent-live.png)(`/control/agent`: 노드 신호 스트림·명령 3단계 ACK·Policy 안전 룰) · [노드 적합성·SDK](reports/screenshots/build/17-node-sdk.png)(`/audit/sdk`: Conformance suites·신규 custom 노드 FCU 합류). 실제 런타임 아님 — fake 데이터 시연.

## 2. 제품별 UX/UI 과업지시서
- [01. Ops 관제 운영 시스템](tasks/01-ops-uxui-과업지시서.md) — C01 맵·경로·작업·실시간 + C03 장애 (21화면)
- [02. Build 개발·검증·배포 콘솔](tasks/02-build-uxui-과업지시서.md) — C02 Audit/DevKit + C04 펌웨어/OTA (22화면)
- [03. Field HMI·Telemetry 현장 운영](tasks/03-field-uxui-과업지시서.md) — H01 HMI + T01 Telemetry (23화면)
- **DOCX**(목차 포함): `tasks/01·02·03-…과업지시서.docx` + 합본(공통기준 00 포함) `tasks/STATION-UXUI-과업지시서-전체.docx`

## 3. 결정 기록 (ADR)
[adr/](adr/) — 001 제품 분리(단계적) · 002 Context 전송 · 003 실시간 프로토콜 · 004 ID 문법 ·
005 상태 색상 · 006 Gate 4단계 · 007 Audit/Event 분리 · 008 async 전환 · 009 Incident `closed` ·
**010 Contracts SSOT(JSON Schema)** · **011 노드/기관 소유 모델** · **012 CommandEnvelope+3단계 ACK** · **013 신호 NS(machine.*/env.*)** · **014 Robot Blueprint·개방형 NodeKind·platform/profile 분리**.

## 4. 수행 완료 보고서 (목업 스크린샷 포함)
- [04. Ops 수행 완료 보고서](reports/04-ops-수행완료보고서.md) — 폐루프 L1·L2, 신규 원인분류·재발·Close
- [05. Build 수행 완료 보고서](reports/05-build-수행완료보고서.md) — 폐루프 L4·L5, 승인·배포계획·롤백·운영전환
- [06. Field 수행 완료 보고서](reports/06-field-수행완료보고서.md) — 폐루프 L1·L3 + e-stop, Field 8원칙
- [reports/screenshots/](reports/screenshots/) — 목업 캡처 24컷 (Ops 8 · Build 9 · Field 6 · Hub 1)
- **DOCX**(스크린샷 임베드·목차 포함): `reports/04·05·06-수행완료보고서.docx` + 합본 `reports/STATION-UXUI-수행완료보고서-전체.docx`. 재생성: `cd docs/reports && pandoc <md> -o <docx> --resource-path=. --toc`

## 5. 통합 시나리오 (인터랙티브 HTML)
- **[scenarios/index.html](scenarios/index.html)** — 이기종 산출물을 표준 계약으로 잇는 통합 시스템.
  6종 표준 계약·통합 비용 모델(O(N²)→O(N))·**조합 구성기**(벤더/모듈 선택→호환성 자동 검증)·추적성 매트릭스.
- 시나리오 8종(장소·순서): S1 산출물 표준 온보딩 · S2 펌웨어 통합 배포 · S3 가상 통합 시험가동 ·
  S4 이기종 다중 로봇 통합 관제 · S5 현장 운용 · S6 문제 추적·복구 · S7 신규 벤더 무중단 합류 · S8 버전 업그레이드.

## 6. 근거 자료
- [spec-gap.md](spec-gap.md) — SSOT 66화면 대비 현재 골격(30화면, 45%) + 정부 R&D 시제품 3종(JJ-P01·P02·Registry) 커버리지 갭.
- [_reference/plans/plan.pdf](../_reference/plans/plan.pdf) — 정부 R&D 연구개발계획서(RS-2025-02219411). 비아 = 통합관제 SaaS 담당.

## 진행 단계
1. ✅ 공통 기준서(00) · 2. ✅ 3 과업지시서(01–03) · 3. ✅ 목업(폐루프 5종) · 4. ✅ 완료 보고서(04–06) ·
5. ⬜ 본 개발(Phase 0 Thin Contract + Core Spine).
