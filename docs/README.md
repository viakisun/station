# STATION 설계 문서 인덱스

STATION = **Ops·Build·Field 3제품 × 하나의 Platform Core / Integration Fabric**.
본 디렉터리는 본 개발 착수 전 UX/UI 구조를 확정하는 기준 자료다.

## 1. 단일 진실 공급원 (SSOT)
- **[00. UX/UI 공통 설계 기준서](00-ux-common-standards.md)** — 제품 구조·ID 스파인·상태 체계·디자인 DNA·Gate 4단계·Audit/Event·Context handoff·권한. **모든 과업지시서가 이 문서를 단일 참조.**

## 2. 제품별 UX/UI 과업지시서
- [01. Ops 관제 운영 시스템](tasks/01-ops-uxui-과업지시서.md) — C01 맵·경로·작업·실시간 + C03 장애 (21화면)
- [02. Build 개발·검증·배포 콘솔](tasks/02-build-uxui-과업지시서.md) — C02 Audit/DevKit + C04 펌웨어/OTA (22화면)
- [03. Field HMI·Telemetry 현장 운영](tasks/03-field-uxui-과업지시서.md) — H01 HMI + T01 Telemetry (23화면)
- **DOCX**(목차 포함): `tasks/01·02·03-…과업지시서.docx` + 합본(공통기준 00 포함) `tasks/STATION-UXUI-과업지시서-전체.docx`

## 3. 결정 기록 (ADR)
[adr/](adr/) — 001 제품 분리(단계적) · 002 Context 전송 · 003 실시간 프로토콜 · 004 ID 문법 ·
005 상태 색상 · 006 Gate 4단계 · 007 Audit/Event 분리 · 008 async 전환 · 009 Incident `closed`.

## 4. 수행 완료 보고서 (목업 스크린샷 포함)
- [04. Ops 수행 완료 보고서](reports/04-ops-수행완료보고서.md) — 폐루프 L1·L2, 신규 원인분류·재발·Close
- [05. Build 수행 완료 보고서](reports/05-build-수행완료보고서.md) — 폐루프 L4·L5, 승인·배포계획·롤백·운영전환
- [06. Field 수행 완료 보고서](reports/06-field-수행완료보고서.md) — 폐루프 L1·L3 + e-stop, Field 8원칙
- [reports/screenshots/](reports/screenshots/) — 목업 캡처 24컷 (Ops 8 · Build 9 · Field 6 · Hub 1)
- **DOCX**(스크린샷 임베드·목차 포함): `reports/04·05·06-수행완료보고서.docx` + 합본 `reports/STATION-UXUI-수행완료보고서-전체.docx`. 재생성: `cd docs/reports && pandoc <md> -o <docx> --resource-path=. --toc`

## 5. 근거 자료
- [spec-gap.md](spec-gap.md) — SSOT 66화면 대비 현재 골격(26화면, 39%) 커버리지 갭.

## 진행 단계
1. ✅ 공통 기준서(00) · 2. ✅ 3 과업지시서(01–03) · 3. ✅ 목업(폐루프 5종) · 4. ✅ 완료 보고서(04–06) ·
5. ⬜ 본 개발(Phase 0 Thin Contract + Core Spine).
