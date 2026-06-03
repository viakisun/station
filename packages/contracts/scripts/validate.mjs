/* ============================================================
   STATION Contracts validate — examples/* + profiles/** 를 schema 로 검증 (CI 게이트)
   실행: pnpm --filter @station/contracts validate
   ============================================================ */
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA = join(ROOT, "schema");
const EX = join(ROOT, "examples");
const PROFILES = join(ROOT, "profiles");

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const validators = {};
for (const f of readdirSync(SCHEMA).filter((f) => f.endsWith(".schema.json"))) {
  const s = JSON.parse(readFileSync(join(SCHEMA, f), "utf8"));
  validators[f.replace(".schema.json", "")] = ajv.compile(s);
}

// 파일명 prefix → schema 이름
const schemaFor = (name) => {
  if (name.startsWith("org.")) return "organization";
  if (name.startsWith("node.")) return "node";
  if (name.startsWith("manifest.")) return "module-manifest";
  if (name.startsWith("app.")) return "app-manifest";
  if (name.startsWith("panel.")) return "panel-host";
  if (name.startsWith("blueprint.")) return "robot-blueprint";
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

const walk = (dir) => {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (e.endsWith(".json")) out.push(p);
  }
  return out;
};

let ok = 0,
  fail = 0;
const check = (path) => {
  const name = basename(path);
  const schema = schemaFor(name);
  const validate = schema && validators[schema];
  if (!validate) {
    console.log("? no schema mapping for", name);
    fail++;
    return;
  }
  const data = JSON.parse(readFileSync(path, "utf8"));
  if (validate(data)) {
    ok++;
    console.log("✓", name, "→", schema);
  } else {
    fail++;
    console.log("✗", name, "→", schema, JSON.stringify(validate.errors, null, 2));
  }
};

for (const f of readdirSync(EX).filter((f) => f.endsWith(".json"))) check(join(EX, f));
for (const p of walk(PROFILES)) check(p);

console.log(`\n${ok} ok · ${fail} fail`);
if (fail) process.exit(1);
