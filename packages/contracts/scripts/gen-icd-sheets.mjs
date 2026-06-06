/* ============================================================
   IF-P ICD 시트 생성 — profiles/wire/*.json(WireBinding) → docs/reference/protocols/IF-P-*.md
   프로토콜 페이로드 정의(산문 아님)를 시트로. 재생성: pnpm --filter @station/contracts icd
   ============================================================ */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WIRE = join(ROOT, "profiles", "wire");
const OUT = join(ROOT, "..", "..", "docs", "reference", "protocols");
mkdirSync(OUT, { recursive: true });

const fieldsCol = (e) =>
  e.fields?.length
    ? e.fields.map((f) => `${f.name}@${f.offset}:${f.type}${f.scale ? `×${f.scale}` : ""}${f.unit ? `(${f.unit})` : ""}`).join(", ")
    : "—";
const wireCol = (b, e) => (b.transport === "CAN" || b.transport === "SERIAL" ? `${e.frameId ?? "—"} · dlc ${e.dlc ?? "—"}` : `${e.topic ?? "—"}${e.msgType ? ` · ${e.msgType}` : ""}`);

const section = (b, title, arr, idCol) => {
  if (!arr?.length) return "";
  const rows = arr
    .map((e) => `| \`${e[idCol]}\` | ${wireCol(b, e)} | ${e.qos ?? "—"} | ${fieldsCol(e)} |`)
    .join("\n");
  return `\n### ${title}\n\n| ${idCol} | wire | QoS | 레이아웃 |\n|---|---|---|---|\n${rows}\n`;
};

let made = 0;
for (const f of readdirSync(WIRE).filter((f) => f.endsWith(".json"))) {
  const b = JSON.parse(readFileSync(join(WIRE, f), "utf8"));
  const md = `# ${b.interfaceId} — 페이로드 ICD (${b.transport})

> AUTO-GENERATED from \`packages/contracts/profiles/wire/${f}\` by scripts/gen-icd-sheets.mjs — DO NOT EDIT.
> 실 드라이버(socketcan/rclcpp/mosquitto)는 이 정의를 그대로 구현/코드젠한다.
${section(b, "Signals", b.signals, "channel")}${section(b, "Commands", b.commands, "verb")}${section(b, "Events", b.events, "code")}`;
  writeFileSync(join(OUT, `${b.interfaceId}.md`), md);
  console.log("✓", `${b.interfaceId}.md`);
  made++;
}
console.log(`\n${made} IF-P 시트 → docs/reference/protocols/`);
