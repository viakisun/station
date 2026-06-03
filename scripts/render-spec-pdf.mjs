// Render the STATION SDV master spec HTML → A3 landscape PDF.
// Two-pass: pass-1 renders to locate each section's page, then injects page
// numbers into the Table of Contents placeholders, then pass-2 renders final.
// Running header (doc no · title) + footer page numbers. Source HTML stays clean.
// Usage: node scripts/render-spec-pdf.mjs [input.html] [output.pdf]
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';

const input = process.argv[2] || 'docs/architecture/sdv-reference-platform.html';
const output = process.argv[3] || 'docs/architecture/sdv-reference-platform.pdf';
const absIn = path.resolve(process.cwd(), input);
const dir = path.dirname(absIn);
const tmpPdf = path.join('/tmp', 'spec-pass1.pdf');
const tmpHtml = path.join(dir, '.spec-tmp.html');

const hdrFtr = (left, right) =>
  `<div style="font-size:8px;color:#8a8a8a;width:100%;padding:0 10mm;display:flex;` +
  `justify-content:space-between;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-print-color-adjust:exact">` +
  `<span>${left}</span><span>${right}</span></div>`;
const pdfOpts = {
  format: 'A3', landscape: true, printBackground: true, displayHeaderFooter: true,
  headerTemplate: hdrFtr('STATION-SDV-SPEC-2026-001 · Rev A', 'STATION SDV Reference Platform — Technical Baseline'),
  footerTemplate: hdrFtr('ORG-VIA / R&amp;D · 2026-06-03', 'page <span class="pageNumber"></span> / <span class="totalPages"></span>'),
  margin: { top: '16mm', bottom: '13mm', left: '10mm', right: '10mm' },
};

const norm = s => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&')
  .replace(/[^a-z0-9가-힣]+/gi, ' ').trim().toLowerCase().replace(/\s+/g, ' ');
const headingOf = (html, id) => {
  const i = html.indexOf(`id="${id}"`);
  if (i < 0) return null;
  const m = html.slice(i, i + 1400).match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/);
  return m ? norm(m[1]) : null;
};

async function render(page, fileUrl, out) {
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: out, ...pdfOpts });
}

const html = readFileSync(absIn, 'utf8');
const anchors = [...html.matchAll(/class="toc-pg" data-anchor="([^"]+)"/g)].map(m => m[1]);

const b = await chromium.launch();
const p = await b.newPage();
const errs = [];
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

// pass 1 (source has empty placeholders → pagination == final)
await render(p, 'file://' + absIn, tmpPdf);

// locate each anchor's page via pdftotext
let pageMap = {};
try {
  const txt = execSync(`pdftotext -layout "${tmpPdf}" -`, { maxBuffer: 64 * 1024 * 1024 }).toString();
  const pages = txt.split('\f').map(norm);
  const tocPage = pages.findIndex(t => t.includes('table of contents')) + 1;
  for (const a of anchors) {
    const key = headingOf(html, a);
    if (!key) continue;
    const hits = [];
    pages.forEach((t, i) => { if (t.includes(key)) hits.push(i + 1); });
    const pg = hits.find(h => h !== tocPage) ?? (hits.includes(tocPage) ? tocPage : null);
    if (pg) pageMap[a] = pg;
  }
} catch (e) { console.warn('pdftotext page mapping skipped:', e.message); }

// inject page numbers + pass 2
let out = html;
for (const [a, pg] of Object.entries(pageMap)) {
  out = out.replace(`class="toc-pg" data-anchor="${a}"></span>`,
    `class="toc-pg" data-anchor="${a}">${pg}</span>`);
}
const mapped = Object.keys(pageMap).length;
if (mapped) {
  writeFileSync(tmpHtml, out);
  await render(p, 'file://' + tmpHtml, output);
  unlinkSync(tmpHtml);
} else {
  await render(p, 'file://' + absIn, output);
}
await b.close();
console.log(`rendered ${output} · TOC pages mapped: ${mapped}/${anchors.length} · console errors:`, errs.join(' | ') || 'none');
