/* ============================================================
   STATION Contracts codegen — schema/*.schema.json → src/generated/*.ts
   SSOT는 JSON Schema. TS 타입은 여기서 생성(커밋). 손수정 금지.
   재생성: pnpm --filter @station/contracts codegen
   ============================================================ */
import { compileFromFile } from "json-schema-to-typescript";
import { readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA = join(ROOT, "schema");
const OUT = join(ROOT, "src", "generated");
mkdirSync(OUT, { recursive: true });

const BANNER =
  "/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.\n   재생성: pnpm --filter @station/contracts codegen */";

const files = readdirSync(SCHEMA)
  .filter((f) => f.endsWith(".schema.json"))
  .sort();

const indexLines = [];
for (const f of files) {
  const base = f.replace(".schema.json", "");
  const ts = await compileFromFile(join(SCHEMA, f), {
    bannerComment: BANNER,
    additionalProperties: false,
    style: { singleQuote: false },
  });
  writeFileSync(join(OUT, base + ".ts"), ts);
  indexLines.push(`export * from "./${base}";`);
  console.log("✓", base + ".ts");
}
writeFileSync(join(OUT, "index.ts"), BANNER + "\n" + indexLines.join("\n") + "\n");
console.log(`\n${files.length} types generated → src/generated/`);
