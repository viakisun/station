# ADR-004 — ID 문법 (Firmware/Deployment/Command)

- 상태: **Proposed**
- 관련: [00 §2](../00-ux-common-standards.md). SSOT §5는 RBT-/MOD-/TCH-/WKS-/CAL-/AUD-만 정의.

## 맥락
SSOT 미정의 ID(Firmware·Deployment·Command)가 필요. Command는 작업 스파인 추적성을 위해 work_session 연계가 바람직.

## 옵션 / 결정(제안)
- Firmware: `FW-<MODTYPE>-<semver>` (예 `FW-CAM-2.4.2`).
- Deployment: `DEP-YYYYMMDD-NNNN`.
- Command: `CMD-<WKS>-NNNN` — **work_session_id 임베드**로 command→session 추적 강화.

## 결과
모든 ID가 cross-product join key로 일관. 비준 후 `id.ts` 검증기에 반영.
