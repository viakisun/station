/* ============================================================
   STATION Contracts validate — examples/* 를 schema 로 검증 (CI 게이트)
   실행: pnpm --filter @station/contracts validate
   ============================================================ */
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA = join(ROOT, "schema");
const EX = join(ROOT, "examples");

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const validators = {};
for (const f of readdirSync(SCHEMA).filter((f) => f.endsWith(".schema.json"))) {
  const s = JSON.parse(readFileSync(join(SCHEMA, f), "utf8"));
  validators[f.replace(".schema.json", "")] = ajv.compile(s);
}

// example 파일 prefix → schema 이름
const schemaFor = (name) => {
  if (name.startsWith("org.")) return "organization";
  if (name.startsWith("node.")) return "node";
  if (name.startsWith("manifest.")) return "module-manifest";
  if (name.startsWith("signal-channel.")) return "signal-channel";
  if (name.startsWith("signal.")) return "signal";
  if (name.startsWith("command-envelope.")) return "command-envelope";
  if (name.startsWith("command-ack.")) return "command-ack";
  if (name.startsWith("command-descriptor.")) return "command-descriptor";
  if (name.startsWith("event.")) return "event";
  if (name.startsWith("protocol.")) return "protocol-profile";
  if (name.startsWith("gate.")) return "gate-result";
  if (name.startsWith("policy.")) return "policy-rule";
  return null;
};

let ok = 0,
  fail = 0;
for (const f of readdirSync(EX).filter((f) => f.endsWith(".json"))) {
  const name = schemaFor(f);
  const validate = name && validators[name];
  if (!validate) {
    console.log("? no schema mapping for", f);
    fail++;
    continue;
  }
  const data = JSON.parse(readFileSync(join(EX, f), "utf8"));
  if (validate(data)) {
    ok++;
    console.log("✓", f, "→", name);
  } else {
    fail++;
    console.log("✗", f, "→", name, JSON.stringify(validate.errors, null, 2));
  }
}
console.log(`\n${ok} ok · ${fail} fail`);
if (fail) process.exit(1);
