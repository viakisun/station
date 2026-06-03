# ADR-017 — Open-source SDV Reference & Standardization

- 상태: **Accepted (거버넌스 항목은 Open)**
- 관련: [STATION SDV Reference Platform (마스터 기준서)](../architecture/sdv-reference-platform.html) §0.1·Part F·Part G, [@station/contracts](../../packages/contracts/README.md), [ADR-010](ADR-010-contracts-ssot-json-schema.md), [ADR-011](ADR-011-node-org-ownership-model.md), [ADR-014](ADR-014-robot-blueprint-open-node-taxonomy.md), [ADR-016](ADR-016-software-defined-work-layer.md)

## 맥락

본 프로젝트의 목적은 **VIA가 로봇(부품)을 파는 것**이 아니다. 목적은 **"하나의 SDV를 어떻게 만드는가"를 오픈소스 레퍼런스로 제공**하는 것이다 — 다른 제조사·소프트웨어 개발사가 이를 참고·채택·준수해 각자의 SDV를 만들 수 있도록.

이 의도는 지금까지의 산출물 곳곳에 암묵적으로 깔려 있었지만(문서 이름이 "**Reference** Platform"이다) **명시적으로 선언된 적이 없다.** 마스터 §0.1 Scope는 "이 로봇의 기준"으로 읽히고, 표준·레퍼런스·conformance라는 세 축이 하나의 위치 선언으로 묶여 있지 않다. 오픈 레퍼런스라는 성격은 기술 결정(언어 중립 계약, conformance 게이트)뿐 아니라 **거버넌스 결정**(라이선스·버저닝·인증 주체)을 요구하는데, 이것이 미정인 채로 남아 있다.

## 결정

1. **VIA는 표준 + 레퍼런스 구현 + conformance 체제를 연다.**
   - **표준(Standard)** = 언어 중립 계약(`@station/contracts`, JSON Schema SSOT — [ADR-010](ADR-010-contracts-ssot-json-schema.md)) · 인터페이스 규격(IF-P/IF-L/IF-X 시트, Part F) · 식별자 체계(Part B) · 레이어링 원칙(Part A·G) · 결정 근거(ADR).
   - **레퍼런스 구현(Reference Implementation)** = `packages/local-agent` · `packages/node-kit` · `nodes/*`(M1/M2). "이렇게 만들면 된다"를 보여주는 동작하는 예시이자 fork·참고 대상.
   - **conformance** = IF-P 시트(노드) · AppManifest(앱) · 적합성 suite(F7). 제3자가 "표준을 따른다"를 증명하는 1급 산출물.

2. **플랫폼은 부품이 아니라 통합 규제(integration regime)를 소유한다.** Node·Module·App·HMI·Base 벤더는 모두 교체·복수 채용 가능하며, VIA는 그 **이음새(표준 계약 + conformance 게이트)**를 소유한다(Part G G8).

3. **마스터 §0.1 Scope/Positioning을 재정의**한다 — "우리 로봇의 기준"이 아니라 **"SDV 구축 오픈 레퍼런스 표준 + 레퍼런스 구현, 제3자 채택·준수용"**으로. 표준·레퍼런스·conformance 3축과 언어 중립성을 명시한다.

4. **거버넌스 항목은 Open Issue로 명시한다(미결).** 기술 아키텍처는 이미 오픈 레퍼런스를 지원하지만(언어 중립 계약·conformance 게이트·레퍼런스 impl), 다음은 별도 결정이 필요하다:
   - **(a) 라이선스** — 예: Apache-2.0(특허 grant 포함) 등. 미정.
   - **(b) 표준 버저닝·stable-API 경계** — 계약·인터페이스의 semver 정책과 fork가 의존할 안정 경계. 일부는 F7에 있으나 표준 전체 차원은 미정.
   - **(c) conformance 인증 주체** — 누가 "준수" 도장을 찍는가(self-cert vs VIA-cert vs 제3자). 미정.
   - **(d) 기여·RFC 절차** — 외부 기여를 표준에 반영하는 경로. 미정.

## 결과

- **목적의 명문화** — "오픈 SDV 레퍼런스"가 문서의 위치 선언으로 박혀, 마스터·Part G가 "VIA 내부 기능"이 아니라 "제3자가 채택하는 표준"으로 읽힌다.
- **conformance의 격상** — 적합성 증명이 부차적 검증이 아니라 1급 산출물로 자리잡는다(F7·IF-P·AppManifest).
- **거버넌스 가시화** — 라이선스·버저닝·인증·기여라는 미결 결정이 숨지 않고 Open Issue로 추적된다 — 표준을 공개하기 전 반드시 닫아야 할 항목.

## 대안 (기각)

- **내부 제품으로 한정** — "우리 로봇의 기준"으로 두면 계약·인터페이스를 굳이 언어 중립·conformance 가능하게 유지할 이유가 약해지고, 멀티벤더 모델(ADR-016 G8)의 근거가 사라진다. 프로젝트 목적과 충돌. 기각.
- **거버넌스까지 지금 확정** — 라이선스·인증 주체는 사업·법무 판단이 필요하며 기술 설계가 선결이다. 지금 임의 확정하면 번복 비용이 크다. **Open Issue로 명시하고 보류**한다.
- **표준만(레퍼런스 구현 없이)** — 계약 문서만 공개하면 채택자가 "어떻게 도는지"를 추론해야 해 드리프트가 생긴다. 동작하는 레퍼런스 impl을 함께 연다. 기각.
