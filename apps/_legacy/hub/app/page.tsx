"use client";
/* ============================================================
   STATION hub landing — console launcher
   (원본: _reference/.../index.html — 마크업/스크립트 1:1 이식,
    콘솔 카드 링크만 실제 console/field 앱으로 재지정)
   ============================================================ */
import { useEffect } from "react";

const CONSOLE_URL = process.env.NEXT_PUBLIC_CONSOLE_URL || "http://localhost:7331";
const FIELD_URL = process.env.NEXT_PUBLIC_FIELD_URL || "http://localhost:7332";

export default function HubPage() {
  useEffect(() => {
    // ---- ASCII wordmark (ANSI-shadow style) ----
    const asciiEl = document.getElementById("asciiWm");
    if (asciiEl)
      asciiEl.textContent = [
        " ___  ____  ____  ____  __  _____  _  _ ",
        "/ __)(_  _)(  _ \\(_  _)(  )(  _  )( \\( )",
        "\\__ \\  )(   )(_) )  )(   )(  )(_)(  )  ( ",
        "(___/ (__) (____/  (__) (__)(_____)(_)\\_)",
      ].join("\n");

    function copyTxt(t: string, el: HTMLElement) {
      navigator.clipboard && navigator.clipboard.writeText(t);
      const o = el.textContent;
      el.textContent = "copied ✓";
      setTimeout(() => (el.textContent = o), 1200);
    }
    (window as unknown as { copyTxt: typeof copyTxt }).copyTxt = copyTxt;

    // ---- keys ----
    const KEYS = [
      { tag: "SESSION_KEY", val: "sk_demo_xxxxxxxxxxxxxxxxxxxxxxxxxxxx", scope: "session · 24h ttl", masked: false, live: true },
      { tag: "API_KEY", val: "api_demo_xxxxxxxxxxxxxxxxxxxxxxxxxxxx", scope: "robots:read · telemetry:read · commands:write", masked: false, live: true },
      { tag: "SECRET_KEY", val: "whdemo_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", scope: "webhook signing · server-side only", masked: true, live: true },
      { tag: "DEVICE_KEY", val: "dev_demo_xxxxxxxxxxxxxxxxxxxxxxxxxxxx", scope: "HMI-FIELD-07 · commissioning", masked: false, live: false },
    ];
    function renderKeys() {
      const wrap = document.getElementById("keysBody");
      if (!wrap) return;
      wrap.innerHTML = "";
      KEYS.forEach((k) => {
        const row = document.createElement("div");
        row.className = "keyrow";
        const masked = k.masked;
        const shown = masked ? "•".repeat(34) : k.val;
        row.innerHTML =
          '<span class="ktag">' + k.tag + "</span>" +
          '<span class="sdot" style="background:' + (k.live ? "var(--brand-live)" : "var(--ink-3)") + '"></span>' +
          '<span class="keyval ' + (masked ? "masked" : "") + '" data-full="' + k.val + '" data-masked="' + masked + '">' + shown + "</span>" +
          '<span class="kscope">' + k.scope + "</span>" +
          '<button class="kbtn reveal">' + (masked ? "reveal" : "hide") + "</button>" +
          '<button class="kbtn copy">copy</button>' +
          '<button class="kbtn rotate">rotate</button>';
        wrap.appendChild(row);
        const valEl = row.querySelector(".keyval") as HTMLElement;
        let isMasked = masked;
        (row.querySelector(".reveal") as HTMLElement).onclick = () => {
          isMasked = !isMasked;
          valEl.textContent = isMasked ? "•".repeat(34) : k.val;
          valEl.classList.toggle("masked", isMasked);
          (row.querySelector(".reveal") as HTMLElement).textContent = isMasked ? "reveal" : "hide";
        };
        (row.querySelector(".copy") as HTMLElement).onclick = (e) => copyTxt(k.val, e.target as HTMLElement);
        (row.querySelector(".rotate") as HTMLElement).onclick = (e) => {
          const t = e.target as HTMLElement;
          t.textContent = "rotating…";
          setTimeout(() => (t.textContent = "rotated ✓"), 900);
        };
      });
    }
    renderKeys();

    // ---- consoles ----
    const MODS = [
      { idx: "01", name: "Fleet Control", code: "C01", ep: "/v1/robots · /v1/work-sessions", href: CONSOLE_URL + "/control",
        desc: "Realtime map, work sessions, route & multi-robot orchestration for registered heterogeneous robots.",
        meta: "desktop · live", dot: "var(--brand-live)", metaText: "10 robots online", wide: false },
      { idx: "02", name: "Verify & Release", code: "C02·C04", ep: "/v1/audit · /v1/firmware", href: CONSOLE_URL + "/audit",
        desc: "Conformance test runner, Audit Package builder, firmware static analysis, compatibility matrix & OTA rollout.",
        meta: "desktop · ci", dot: "var(--st-warning)", metaText: "1 release blocked", wide: false },
      { idx: "03", name: "Commissioning HMI", code: "H01", ep: "/v1/devices · /v1/registry", href: FIELD_URL + "/hmi",
        desc: "Field tablet wizard — pair the robot, identify modules with a dev key, match compatible versions, register to control.",
        meta: "tablet · field", dot: "var(--ink-3)", metaText: "commission wizard", wide: false },
      { idx: "04", name: "Telemetry Setup", code: "T01", ep: "/v1/channels · /v1/quality", href: FIELD_URL + "/telemetry",
        desc: "Map raw signals to standard channels, calibrate sensors, set sampling & thresholds, diagnose data quality.",
        meta: "tablet · edge", dot: "var(--brand-live)", metaText: "quality 96.3%", wide: false },
      { idx: "05", name: "Incidents & Quality", code: "C03", ep: "/v1/incidents · /v1/events", href: CONSOLE_URL + "/incident",
        desc: "Where events from all four consoles converge. Live event stream, unified root-cause timeline across work/command/telemetry/HMI/firmware, and standard action guides.",
        meta: "desktop · ops", dot: "var(--st-critical)", metaText: "2 critical · 1 SLA breach", wide: true },
    ];
    function renderMods() {
      const wrap = document.getElementById("mods");
      if (!wrap) return;
      wrap.innerHTML = "";
      MODS.forEach((m) => {
        const a = document.createElement("a");
        a.className = "mod" + (m.wide ? " mod-wide" : "");
        a.href = m.href;
        a.innerHTML =
          '<div class="mod-top"><span class="mod-idx">' + m.idx + '</span><span class="mod-name">' + m.name + '</span><span class="mod-code">' + m.code + "</span></div>" +
          '<div class="mod-ep"><span class="m">SDK</span> ' + m.ep + "</div>" +
          '<div class="mod-desc"' + (m.wide ? ' style="max-width:660px"' : "") + ">" + m.desc + "</div>" +
          '<div class="mod-foot"><span class="mod-meta"><span class="sdot" style="background:' + m.dot + '"></span>' + m.metaText + "</span>" +
          '<span class="mod-open">open ↗</span></div>';
        wrap.appendChild(a);
      });
    }
    renderMods();

    function typeInto(el: HTMLElement, lines: [string, string][], caret: boolean) {
      el.innerHTML = "";
      let i = 0;
      function next() {
        if (i >= lines.length) {
          if (caret) {
            const c = document.createElement("span");
            c.className = "caret";
            c.textContent = "█";
            c.style.color = "var(--term-green)";
            el.appendChild(c);
          }
          return;
        }
        const [txt, cls] = lines[i]!;
        const d = document.createElement("div");
        if (cls) d.className = cls;
        d.textContent = txt;
        el.appendChild(d);
        el.scrollTop = el.scrollHeight;
        i++;
        setTimeout(next, txt.startsWith("$") ? 360 : 150);
      }
      next();
    }

    // ---- hero terminal (typed boot sequence) ----
    const heroLines: [string, string][] = [
      ["$ station login", "l-green"],
      ["  ✓ authenticated — org=greenhouse-jinju region=ap-southeast-2", "l-dim"],
      ["$ station robots list --status=online", "l-green"],
      ["  RBT-THIN-0001   thinning   GH-A   working    78%", ""],
      ["  RBT-PINCH-0003  pinching   GH-A   paused     41%", ""],
      ["  RBT-THIN-0005   thinning   GH-B   working    64%", ""],
      ["  … 7 more", "l-dim"],
      ["$ station events tail --severity=warn+", "l-green"],
      ["  [08:51:22] NAV-SAFETY-INTERLOCK  RBT-THIN-0008  emergency", "l-red"],
      ["  [08:48:10] CAM-FRAME-DROP        RBT-PINCH-0004 critical", "l-amber"],
      ["  streaming…", "l-dim"],
    ];
    const heroTerm = document.getElementById("heroTerm");
    if (heroTerm) typeInto(heroTerm, heroLines, true);

    // ---- live debug/log stream ----
    const SAMPLES: [string, string, string][] = [
      ["POST /v1/robots/RBT-THIN-0001/commands {resume}", "200", "l-green"],
      ["evt CAM-FRAME-DROP RBT-PINCH-0004 dropRate=0.18", "critical", "l-amber"],
      ["GET /v1/channels/TCH-gh-humidity value=74.2", "200", "l-dim"],
      ["deploy OTA FW-CAM-2.4.2 canary 3/6", "202", "l-blue"],
      ["evt NAV-SAFETY-INTERLOCK RBT-THIN-0008", "emergency", "l-red"],
      ["POST /v1/incidents promote INC-...0229", "201", "l-green"],
      ["hmi HMI-A-01 calibration.snapshot saved", "200", "l-dim"],
      ["analysis FW-EEP-3.1.0 critical=2 → blocked", "409", "l-red"],
      ["GET /v1/work-sessions?status=running n=4", "200", "l-dim"],
      ["evt EE-FORCE-DRIFT RBT-THIN-0001 force=11.8N", "warning", "l-amber"],
    ];
    let logN = 0;
    const dbg = document.getElementById("debugTerm");
    const pad2 = (n: number) => (n < 10 ? "0" + n : "" + n);
    const ts = () => {
      const d = new Date();
      return pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
    };
    function pushLog() {
      if (!dbg) return;
      const s = SAMPLES[Math.floor(Math.random() * SAMPLES.length)]!;
      const d = document.createElement("div");
      if (s[2]) d.className = s[2];
      d.textContent = ts() + "  " + s[1].padEnd(9) + "  " + s[0];
      dbg.appendChild(d);
      while (dbg.children.length > 60) dbg.removeChild(dbg.firstChild!);
      dbg.scrollTop = dbg.scrollHeight;
      logN++;
      const lc = document.getElementById("logCount");
      if (lc) lc.textContent = logN + " events";
    }
    for (let i = 0; i < 10; i++) pushLog();
    const iv = setInterval(pushLog, 1500);
    return () => clearInterval(iv);
  }, []);

  return (
    <>
      {/* ░░ top bar ░░ */}
      <div className="topbar">
        <div className="wrap">
          <span className="wm">
            station<span className="dimx">/hub</span>
          </span>
          <span className="region">
            <span className="sdot" style={{ background: "var(--brand-live)" }}></span> ap-southeast-2 · Sydney
          </span>
          <div style={{ flex: 1 }}></div>
          <a className="navlink" href="#consoles">Consoles</a>
          <a className="navlink" href="#keys">Keys</a>
          <a className="navlink" href="#logs">Logs</a>
          <a className="navlink" href="#" style={{ fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>Docs ↗</a>
          <button className="ghost-btn ink-btn">$ station login</button>
        </div>
      </div>

      <div className="wrap">
        {/* ░░ hero ░░ */}
        <section className="hero">
          <div>
            <pre className="ascii ascii-wm" id="asciiWm"></pre>
            <div className="eyebrow">
              <span className="pulse-dot live-pulse"></span> v2.0 · GLOBAL DEVELOPER PLATFORM
            </div>
            <h1 className="title">
              Build your own control surface
              <br />
              <em>for heterogeneous farm-robot fleets.</em>
            </h1>
            <p className="lede">
              STATION gives you the primitives — device identity, capability profiles, telemetry channels, command
              contracts, incident streams — behind a single API. We ship the building blocks and reference consoles.{" "}
              <strong>You build the UI you actually want.</strong>
            </p>
            <div className="cta-row">
              <button
                className="ghost-btn ink-btn"
                style={{ height: 38, fontSize: 13 }}
                onClick={() => document.getElementById("consoles")?.scrollIntoView({ behavior: "smooth" })}
              >
                Open a console →
              </button>
              <button className="ghost-btn" style={{ height: 38, fontSize: 13 }}>
                Read the docs
              </button>
            </div>
            <div className="install">
              <span className="pmt">$</span>
              <span className="cmd" id="installCmd">npm i @station/sdk</span>
              <span
                className="copy"
                onClick={(e) =>
                  (window as unknown as { copyTxt: (t: string, el: HTMLElement) => void }).copyTxt?.(
                    "npm i @station/sdk",
                    e.currentTarget,
                  )
                }
              >
                copy
              </span>
            </div>
          </div>
          <div className="term hero-term">
            <div className="term-head">
              <span className="term-dot" style={{ background: "#f0584b" }}></span>
              <span className="term-dot" style={{ background: "#f5be4f" }}></span>
              <span className="term-dot" style={{ background: "#5fc454" }}></span>
              <span style={{ marginLeft: 6 }}>station — bash</span>
              <span style={{ marginLeft: "auto" }} className="l-dim">80×24</span>
            </div>
            <div className="term-body" id="heroTerm"></div>
          </div>
        </section>

        {/* ░░ keys ░░ */}
        <a id="keys"></a>
        <div className="sec-label">credentials</div>
        <div className="keys-panel">
          <div className="keys-head">
            <div>
              <h3>API &amp; access keys</h3>
              <div className="sub">Authenticate the SDK, your own UI, and field devices against the STATION control plane.</div>
            </div>
            <button className="kbtn" style={{ height: 30 }}>
              <span style={{ fontSize: 13 }}>+</span> Create key
            </button>
          </div>
          <div className="keys-body" id="keysBody"></div>
        </div>

        {/* ░░ consoles ░░ */}
        <a id="consoles"></a>
        <div className="sec-label">reference consoles · bring-your-own-UI</div>
        <div className="mods" id="mods"></div>

        {/* ░░ debug/log console ░░ */}
        <a id="logs"></a>
        <div className="sec-label">live event stream · control plane</div>
        <div className="term debug-wrap">
          <div className="term-head">
            <span className="sdot live-pulse" style={{ background: "var(--brand-live)" }}></span>
            <span>GET /v1/events?stream=true</span>
            <span style={{ marginLeft: "auto" }} className="l-dim" id="logCount">0 events</span>
            <span className="l-dim" style={{ marginLeft: 14 }}>region=ap-southeast-2</span>
          </div>
          <div className="term-body" id="debugTerm"></div>
        </div>

        <footer>
          <span>STATION · multi-robot developer platform · made in Australia 🇦🇺</span>
          <span>
            <a href="#">status</a> · <a href="#">docs</a> · <a href="#">sdk</a> · v2.0.0 · region ap-southeast-2
          </span>
        </footer>
      </div>
    </>
  );
}
