/* ============================================================
   런타임 Ajv 검증기 — 노드/HMI 가 보낸 JSON 을 *런타임에* 계약으로 검증.
   현재 Ajv 는 CI 스크립트(validate.mjs)에서만 쓰고 버려졌다 → 여기서 1급 export.
   node-only(Ajv 의존) — apps 는 @station/contracts(".") 만 import 하므로 브라우저 미유입.
   local-agent register()/dispatch() 가 fail-fast 용으로 사용.
   ============================================================ */
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { CommandEnvelope, ModuleManifest, Signal } from "../src/generated/index";
import signalSchema from "../schema/signal.schema.json" with { type: "json" };
import commandEnvelopeSchema from "../schema/command-envelope.schema.json" with { type: "json" };
import moduleManifestSchema from "../schema/module-manifest.schema.json" with { type: "json" };

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const vSignal = ajv.compile(signalSchema);
const vCommand = ajv.compile(commandEnvelopeSchema);
const vManifest = ajv.compile(moduleManifestSchema);

export interface ValidationResult {
  ok: boolean;
  errors?: string[];
}

const toResult = (validate: ReturnType<typeof ajv.compile>, data: unknown): ValidationResult => {
  if (validate(data)) return { ok: true };
  return { ok: false, errors: (validate.errors ?? []).map((e) => `${e.instancePath || "/"} ${e.message}`) };
};

export const validateSignal = (s: unknown): ValidationResult => toResult(vSignal, s);
export const validateCommand = (c: unknown): ValidationResult => toResult(vCommand, c);
export const validateManifest = (m: unknown): ValidationResult => toResult(vManifest, m);

/** 타입 가드 — 검증 통과 시 좁힌 타입으로. */
export const isValidCommand = (c: unknown): c is CommandEnvelope => vCommand(c) as boolean;
export const isValidSignal = (s: unknown): s is Signal => vSignal(s) as boolean;
export const isValidManifest = (m: unknown): m is ModuleManifest => vManifest(m) as boolean;
