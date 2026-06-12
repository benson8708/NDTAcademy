// @ts-nocheck — plain-JS engine, functionally validated via harness (see media-build/trainer-harness)
// pt.js — Liquid Penetrant Testing (PT) trainer engine for NDTAcademy Trainer3D.
// Implements the TrainerMount contract (see ../contract.ts) as plain ESM + JSDoc.
//
//   export default mount(container, config, ctx) -> { dispose() }
//   export const MANIFEST
//
// Modes:
//   "process"     — perform the six PT stations in order on a plate with a
//                   hidden crack; wrong order / cut-short dwell gently resets.
//   "capillarity" — cutaway crack cross-section; capillary fill follows
//                   Washburn dynamics (depth ∝ √t, time-to-fill ∝ viscosity).
//
// Physics notes (simplified but honest):
// * Penetrant enters surface-breaking flaws by capillary action (driving
//   pressure ≈ 2γcosθ/w for a slot) — slow for tight, contaminated real
//   flaws, hence dwell times of minutes; the sim compresses time and says so.
// * Washburn: L(t) = sqrt(γ·w·cosθ·t / 3μ)  →  depth grows with √time and
//   time-to-depth scales linearly with viscosity μ. The capillarity mode uses
//   exactly this scaling.
// * Excess surface penetrant must be removed before developer, otherwise
//   background fluorescence masks indications; developer then draws trapped
//   penetrant back out (blotter action) so the indication is wider than the
//   actual flaw — that amplification is why PT works.
// * Fluorescent (Type I) indications are viewed under UV-A in a darkened
//   booth; under white light they are nearly invisible.

import * as THREE from "three";

/** @type {import("../contract").EngineManifest} */
export const MANIFEST = {
  engine: "pt",
  modes: {
    process: {
      description:
        "Run a fluorescent liquid penetrant inspection on a steel plate with a hidden crack. Work the six stations in order — Pre-clean, Apply penetrant, Dwell (timer ring), Remove excess (drag-wipe the surface), Apply developer, Inspect under UV-A — then click the glowing bleedout indication. Wrong order or a cut-short dwell gently resets the part with a coaching line.",
      params: {
        dwellSec:
          "Length of the dwell timer in real seconds (stands in for ~10 min of shop dwell). Range 3-30, default 12.",
        wipeCoverage:
          "Fraction of the surface penetrant that must be drag-wiped off to finish the removal station. Range 0.5-0.95, default 0.8.",
        crackSeed:
          "Integer 1-9999 that varies the hidden crack's position, length and angle on the plate. Default 7.",
        bleedSec:
          "Seconds for the indication to bleed out through the developer after it is applied. Range 1-8, default 3.",
      },
      taskIds: ["fullSequence", "properDwell", "findIndication"],
    },
    capillarity: {
      description:
        "Magnified cutaway of a surface-breaking crack. Apply penetrant and watch capillary action pull it down the crack with depth growing as sqrt(time) (Washburn). A viscosity slider sets the penetrant grade — time to fill scales with viscosity — and a live depth-time chart records each run so thin and thick penetrants can be compared.",
      params: {
        fillSecBase:
          "Sim seconds to completely fill the crack at the LOWEST viscosity. Range 2-12, default 5.",
        viscMinCst:
          "Viscosity at the slider's thin end, in cSt. Range 1-10, default 3 (typical penetrant oils are ~3-10 cSt).",
        viscMaxCst:
          "Viscosity at the slider's thick end, in cSt. Must exceed viscMinCst. Range 2-30, default 8.",
        crackDepthMm:
          "Crack depth shown on the gauge readouts, in mm. Range 2-10, default 5.",
      },
      taskIds: ["fillCrack", "compareViscosity"],
    },
  },
};

// ---------------------------------------------------------------------------
// shared helpers
// ---------------------------------------------------------------------------

const FONT = 'Manrope, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const COL = {
  navy: "#0B1F3A",
  blue: "#1E66F5",
  cyan: "#5fe0ff",
  text: "#dbe7ff",
  dim: "#8fa9d6",
  glass: "rgba(120,170,255,.07)",
  border: "rgba(150,200,255,.22)",
};

function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }

/** Deterministic small PRNG. @param {number} seed */
function mulberry32(seed) {
  let a = (seed >>> 0) || 1;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Read a numeric param with default + clamp. */
function numParam(params, key, def, min, max) {
  const v = params && typeof params[key] === "number" && isFinite(params[key]) ? params[key] : def;
  return clamp(v, min, max);
}

/** Tiny DOM helper. */
function el(tag, css, text) {
  const n = document.createElement(tag);
  if (css) n.style.cssText = css;
  if (text != null) n.textContent = text;
  return n;
}

function svgEl(name, attrs) {
  const n = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}

const STYLE_TEXT = `
.pt-root{position:absolute;inset:0;overflow:hidden;font-family:${FONT};color:${COL.text};pointer-events:none;user-select:none;-webkit-user-select:none}
.pt-panel{pointer-events:auto;background:${COL.glass};border:1px solid ${COL.border};border-radius:12px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.pt-solid{background:linear-gradient(rgba(8,18,36,.88),rgba(8,18,36,.88)),${COL.glass}}
.pt-btn{pointer-events:auto;display:inline-flex;align-items:center;gap:7px;padding:8px 13px;border-radius:10px;border:1px solid ${COL.border};background:rgba(11,31,58,.72);color:${COL.text};font:600 12px/1.2 ${FONT};letter-spacing:.02em;cursor:pointer;transition:background .15s,border-color .15s,transform .08s}
.pt-btn:hover{background:rgba(94,224,255,.13)}
.pt-btn:active{transform:translateY(1px)}
.pt-btn .pt-n{display:inline-grid;place-items:center;width:17px;height:17px;border-radius:50%;border:1px solid ${COL.border};font-size:10px;color:${COL.dim}}
.pt-btn.done{background:rgba(30,102,245,.28);border-color:${COL.blue}}
.pt-btn.done .pt-n{background:${COL.blue};border-color:${COL.blue};color:#fff}
.pt-btn.next{border-color:${COL.cyan};animation:ptPulse 1.6s ease-out infinite}
.pt-btn.uvon{background:rgba(122,60,255,.32);border-color:#a06bff;color:#e9dcff}
@keyframes ptPulse{0%{box-shadow:0 0 0 0 rgba(95,224,255,.45)}70%{box-shadow:0 0 0 9px rgba(95,224,255,0)}100%{box-shadow:0 0 0 0 rgba(95,224,255,0)}}
.pt-feedback{padding:9px 13px;font:500 12.5px/1.45 ${FONT};max-width:430px;border-left:3px solid ${COL.cyan};border-radius:10px}
.pt-feedback.flash{animation:ptFlash .55s ease}
@keyframes ptFlash{0%{background:rgba(95,224,255,.30)}100%{background:${COL.glass}}}
.pt-chip{padding:6px 11px;font:600 11.5px/1.2 ${FONT};border-radius:9px}
.pt-slider{pointer-events:auto;width:100%;accent-color:${COL.blue};cursor:pointer}
.pt-title{font:700 13px/1.2 ${FONT};letter-spacing:.04em}
.pt-sub{font:500 11px/1.4 ${FONT};color:${COL.dim}}
`;

/**
 * Shared three.js scaffolding: renderer, scene, camera, orbit, RAF (paused
 * when document.hidden), pointer plumbing, resize handling, and disposal.
 */
function setupThree(container, ctx, opts) {
  const cleanups = [];
  const prevPosition = container.style.position;
  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
    cleanups.push(() => { container.style.position = prevPosition; });
  }
  // wipe any stale telemetry from a previous mount
  for (const k of Object.keys(container.dataset)) {
    if (k.indexOf("pt") === 0) delete container.dataset[k];
  }

  const style = document.createElement("style");
  style.textContent = STYLE_TEXT;
  document.head.appendChild(style);
  cleanups.push(() => style.remove());

  const W0 = container.clientWidth || ctx.width || 860;
  const H0 = container.clientHeight || ctx.height || 540;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(W0, H0);
  const canvas = renderer.domElement;
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab;";
  container.appendChild(canvas);
  cleanups.push(() => canvas.remove());

  const hud = el("div");
  hud.className = "pt-root";
  container.appendChild(hud);
  cleanups.push(() => hud.remove());

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(opts.bg || 0x0a1424);
  const camera = new THREE.PerspectiveCamera(opts.fov || 40, W0 / H0, 0.1, 60);

  const orbit = {
    az: opts.az, el: opts.el, r: opts.r,
    az0: opts.az,
    target: opts.target || new THREE.Vector3(0, 0, 0),
    elMin: opts.elMin != null ? opts.elMin : 0.18,
    elMax: opts.elMax != null ? opts.elMax : 1.15,
    azClamp: opts.azClamp || 0,          // 0 = free
    auto: !ctx.reducedMotion,
    autoRate: opts.autoRate != null ? opts.autoRate : 0.03, // rad/s (~1.7°/s, under the 3°/s cap)
    swing: opts.swing || 0,              // if >0: oscillate ±swing rad instead of spinning
    autoPaused: false,
  };
  function applyCamera() {
    const ce = Math.cos(orbit.el), se = Math.sin(orbit.el);
    camera.position.set(
      orbit.target.x + orbit.r * ce * Math.sin(orbit.az),
      orbit.target.y + orbit.r * se,
      orbit.target.z + orbit.r * ce * Math.cos(orbit.az),
    );
    camera.lookAt(orbit.target);
  }
  applyCamera();

  // ---- RAF loop, paused when hidden -------------------------------------
  const frameCbs = [];
  let raf = 0, running = false, last = 0, elapsed = 0;
  function tick(tms) {
    raf = requestAnimationFrame(tick);
    const t = tms / 1000;
    const dt = last ? Math.min(0.05, t - last) : 0.016;
    last = t;
    elapsed += dt;
    if (orbit.auto && !orbit.autoPaused && !drag) {
      if (orbit.swing > 0) orbit.az = orbit.az0 + orbit.swing * Math.sin(elapsed * (orbit.autoRate / orbit.swing));
      else orbit.az += orbit.autoRate * dt;
    }
    applyCamera();
    for (let i = 0; i < frameCbs.length; i++) frameCbs[i](dt, elapsed);
    renderer.render(scene, camera);
  }
  function start() { if (!running) { running = true; last = 0; raf = requestAnimationFrame(tick); } }
  function stop() { running = false; cancelAnimationFrame(raf); }
  const onVis = () => { if (document.hidden) stop(); else start(); };
  document.addEventListener("visibilitychange", onVis);
  cleanups.push(() => { document.removeEventListener("visibilitychange", onVis); stop(); });

  // ---- pointer plumbing ---------------------------------------------------
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function raycast(clientX, clientY, objects) {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return [];
    ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    return ray.intersectObjects(objects, false);
  }

  let drag = null; // {x0,y0,x,y,moved,mode}
  function onDown(e) {
    if (e.isPrimary === false) return;
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    drag = { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, moved: 0, mode: null };
    if (opts.onPointerDown) opts.onPointerDown(e, drag);
    if (!drag.mode) drag.mode = "orbit";
    e.preventDefault();
  }
  function onMove(e) {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    if (drag.mode === "orbit") {
      orbit.az -= dx * 0.005;
      if (orbit.azClamp) orbit.az = clamp(orbit.az, orbit.az0 - orbit.azClamp, orbit.az0 + orbit.azClamp);
      orbit.el = clamp(orbit.el + dy * 0.005, orbit.elMin, orbit.elMax);
    } else if (opts.onPointerMove) opts.onPointerMove(e, drag);
    drag.x = e.clientX; drag.y = e.clientY;
  }
  function onUp(e) {
    if (!drag) return;
    const d = drag; drag = null;
    if (opts.onPointerUp) opts.onPointerUp(e, d);
  }
  function onCancel() { drag = null; }
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onCancel);
  cleanups.push(() => {
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onCancel);
  });

  // ---- resize -------------------------------------------------------------
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth || W0, h = container.clientHeight || H0;
      if (w < 2 || h < 2) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);
    cleanups.push(() => ro.disconnect());
  }

  start();

  let disposed = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
      for (const m of mats) {
        for (const k in m) { const v = m[k]; if (v && v.isTexture) v.dispose(); }
        m.dispose();
      }
    });
    renderer.dispose();
    if (renderer.forceContextLoss) { try { renderer.forceContextLoss(); } catch (_) {} }
    for (let i = cleanups.length - 1; i >= 0; i--) { try { cleanups[i](); } catch (_) {} }
  }

  return {
    renderer, scene, camera, canvas, hud, orbit, raycast,
    onFrame: (fn) => frameCbs.push(fn),
    addCleanup: (fn) => cleanups.push(fn),
    dispose,
  };
}

/** Task bookkeeping: report achievements, fire onAllDone for the config set. */
function makeTasks(config, modeTaskIds, ctx) {
  const wanted = [];
  const cfg = Array.isArray(config.tasks) ? config.tasks : [];
  for (const t of cfg) {
    if (t && typeof t.id === "string" && modeTaskIds.indexOf(t.id) >= 0 && wanted.indexOf(t.id) < 0) wanted.push(t.id);
  }
  const effective = wanted.length ? wanted : modeTaskIds.slice();
  const seen = new Set();
  let allFired = false;
  return {
    done(id) {
      if (seen.has(id)) return;
      seen.add(id);
      ctx.onTaskDone(id);
      if (!allFired && effective.every((x) => seen.has(x))) { allFired = true; ctx.onAllDone(); }
    },
    has: (id) => seen.has(id),
  };
}

/** Title + feedback line HUD shared by both modes. */
function makeTopHud(hud, config, subtitle) {
  const wrap = el("div", "position:absolute;top:12px;left:12px;display:flex;flex-direction:column;gap:8px;max-width:60%;");
  const title = el("div");
  title.className = "pt-panel";
  title.style.cssText += "padding:8px 13px;display:flex;flex-direction:column;gap:2px;";
  const t1 = el("div", "", config.title || "Liquid Penetrant Trainer");
  t1.className = "pt-title";
  const t2 = el("div", "", subtitle);
  t2.className = "pt-sub";
  title.appendChild(t1); title.appendChild(t2);
  const fb = el("div");
  fb.className = "pt-panel pt-feedback";
  wrap.appendChild(title); wrap.appendChild(fb);
  hud.appendChild(wrap);
  function feedback(msg) {
    fb.textContent = msg;
    fb.classList.remove("flash");
    void fb.offsetWidth; // restart animation
    fb.classList.add("flash");
  }
  feedback(config.intro || "");
  return { feedback };
}

// ---------------------------------------------------------------------------
// MODE 1 — "process": the six-station PT method
// ---------------------------------------------------------------------------

function mountProcess(container, config, ctx) {
  const P = config.params || {};
  const dwellSec = numParam(P, "dwellSec", 12, 3, 30);
  const wipeCoverage = numParam(P, "wipeCoverage", 0.8, 0.5, 0.95);
  const crackSeed = Math.round(numParam(P, "crackSeed", 7, 1, 9999));
  const bleedSec = numParam(P, "bleedSec", 3, 1, 8);

  const tasks = makeTasks(config, MANIFEST.modes.process.taskIds, ctx);

  const core = setupThree(container, ctx, {
    bg: 0x0a1424,
    az: -0.55, el: 0.62, r: 4.7, target: new THREE.Vector3(0, 0.05, 0),
    elMin: 0.3, elMax: 1.05, autoRate: 0.03,
    onPointerDown: pointerDown, onPointerMove: pointerMove, onPointerUp: pointerUp,
  });
  const { scene, camera, hud } = core;
  const ds = container.dataset;

  // ----- lighting (white-light vs UV booth) -------------------------------
  const hemi = new THREE.HemisphereLight(0x9db8ff, 0x1a2030, 0.85);
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(4, 6, 3);
  const rim = new THREE.DirectionalLight(0x9fd9ff, 0.7); rim.position.set(-4, 3, -4);
  const uvHemi = new THREE.HemisphereLight(0x4a25b8, 0x05030d, 0); // UV booth wash
  const uvPoint = new THREE.PointLight(0x7a3cff, 0, 14); uvPoint.position.set(0.6, 2.6, 1.2);
  scene.add(hemi, key, rim, uvHemi, uvPoint);

  // ----- geometry ----------------------------------------------------------
  const bench = new THREE.Mesh(
    new THREE.CircleGeometry(4.2, 40).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x0d1b33, roughness: 0.95, metalness: 0.05 }),
  );
  bench.position.y = -0.005;
  scene.add(bench);

  const plateMat = new THREE.MeshStandardMaterial({ color: 0x99a3b0, metalness: 0.62, roughness: 0.42 });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(3, 0.36, 2), plateMat);
  plate.position.y = 0.18;
  scene.add(plate);

  // overlay canvas plane covering the plate top (penetrant / developer / UV view)
  const OV_W = 768, OV_H = 512;
  const ovCanvas = document.createElement("canvas");
  ovCanvas.width = OV_W; ovCanvas.height = OV_H;
  const og = ovCanvas.getContext("2d");
  const ovTex = new THREE.CanvasTexture(ovCanvas);
  ovTex.colorSpace = THREE.SRGBColorSpace;
  ovTex.anisotropy = 2;
  const overlay = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 2).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: ovTex, transparent: true, depthWrite: false }),
  );
  overlay.position.y = 0.365;
  scene.add(overlay);

  // wipe mask: opaque = penetrant still present
  const MK_W = 192, MK_H = 128;
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = MK_W; maskCanvas.height = MK_H;
  const mg = maskCanvas.getContext("2d", { willReadFrequently: true });
  function maskReset() { mg.globalCompositeOperation = "source-over"; mg.fillStyle = "#fff"; mg.fillRect(0, 0, MK_W, MK_H); }
  maskReset();

  // world (x on [-1.5,1.5], z on [-1,1]) -> overlay canvas px
  function worldToPx(x, z, W, H) { return [((x + 1.5) / 3) * W, ((z + 1) / 2) * H]; }

  // ----- the hidden crack --------------------------------------------------
  const rnd = mulberry32(crackSeed);
  const crack = (() => {
    const x0 = lerp(-0.7, 0.55, rnd());
    const z0 = lerp(-0.72, -0.18, rnd());
    const len = lerp(0.75, 1.1, rnd());
    const slope = lerp(-0.28, 0.28, rnd()); // dx per dz
    const pts = [];
    const n = 16;
    for (let i = 0; i <= n; i++) {
      const z = clamp(z0 + (len * i) / n, -0.92, 0.92);
      const x = clamp(x0 + slope * (z - z0) + (rnd() - 0.5) * 0.045, -1.38, 1.38);
      pts.push([x, z]);
    }
    const mid = pts[Math.floor(n / 2)];
    return { pts, cx: mid[0], cz: mid[1], len, dir: Math.atan2(slope, 1) };
  })();

  // generous invisible hit volume for the findIndication click
  const crackHit = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.3, crack.len + 0.35),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  crackHit.position.set(crack.cx, 0.38, crack.cz);
  crackHit.rotation.y = -crack.dir;
  scene.add(crackHit);

  // pre-rendered developer noise (white light + UV variants)
  function makeNoise(base, dot, dotAlpha) {
    const c = document.createElement("canvas");
    c.width = OV_W; c.height = OV_H;
    const g2 = c.getContext("2d");
    g2.fillStyle = base; g2.fillRect(0, 0, OV_W, OV_H);
    const r2 = mulberry32(crackSeed + 99);
    g2.fillStyle = dot; g2.globalAlpha = dotAlpha;
    for (let i = 0; i < 2600; i++) {
      g2.fillRect(r2() * OV_W, r2() * OV_H, 1 + r2() * 2.2, 1 + r2() * 2.2);
    }
    g2.globalAlpha = 1;
    return c;
  }
  const devWhite = makeNoise("#edeadf", "#cfccba", 0.5);
  const devUv = makeNoise("#150e38", "#241a55", 0.7);

  // ----- state machine ------------------------------------------------------
  const ORDER = ["preclean", "penetrant", "dwell", "remove", "developer", "inspect"];
  const LABELS = {
    preclean: "Pre-clean", penetrant: "Apply penetrant", dwell: "Dwell",
    remove: "Remove excess", developer: "Apply developer", inspect: "Inspect (UV)",
  };
  const st = {
    idx: 0,
    dwelling: false, dwellStart: 0, dwellDone: false,
    wiping: false, wipeFrac: 0, wipeFinishAnim: 0,
    developed: false, developerAt: 0, bleed: 0,
    uvOn: false, sequenceDone: false, found: false,
    penetrantOn: false, coatAnim: 0,
    resets: 0,
  };

  const topHud = makeTopHud(hud, config, "Method: PT · fluorescent (Type I), solvent-removable");
  const feedback = topHud.feedback;

  // station buttons
  const bar = el("div", "position:absolute;left:0;right:0;bottom:12px;display:flex;justify-content:center;gap:7px;flex-wrap:wrap;padding:0 10px;");
  hud.appendChild(bar);
  const btns = {};
  ORDER.forEach((id, i) => {
    const b = el("button");
    b.className = "pt-btn";
    b.setAttribute("data-pt-st", id);
    const n = el("span", "", String(i + 1)); n.className = "pt-n";
    b.appendChild(n);
    b.appendChild(document.createTextNode(LABELS[id]));
    b.addEventListener("click", () => station(id));
    bar.appendChild(b);
    btns[id] = b;
  });

  // dwell timer ring
  const RING_R = 24, RING_C = 2 * Math.PI * RING_R;
  const ringWrap = el("div", "position:absolute;top:14px;left:50%;transform:translateX(-50%);display:none;flex-direction:column;align-items:center;gap:4px;padding:10px 14px;");
  ringWrap.className = "pt-panel";
  const ringSvg = svgEl("svg", { width: 64, height: 64, viewBox: "0 0 64 64" });
  ringSvg.appendChild(svgEl("circle", { cx: 32, cy: 32, r: RING_R, fill: "none", stroke: "rgba(150,200,255,.18)", "stroke-width": 5 }));
  const ringArc = svgEl("circle", {
    cx: 32, cy: 32, r: RING_R, fill: "none", stroke: COL.cyan, "stroke-width": 5,
    "stroke-linecap": "round", "stroke-dasharray": RING_C, "stroke-dashoffset": RING_C,
    transform: "rotate(-90 32 32)",
  });
  ringSvg.appendChild(ringArc);
  const ringText = svgEl("text", { x: 32, y: 37, "text-anchor": "middle", fill: COL.text, "font-size": 15, "font-family": FONT, "font-weight": 700 });
  ringSvg.appendChild(ringText);
  const ringCap = el("div", "", "Dwell — capillary action needs time");
  ringCap.className = "pt-sub";
  ringWrap.appendChild(ringSvg); ringWrap.appendChild(ringCap);
  hud.appendChild(ringWrap);

  // wipe progress chip + UV badge
  const wipeChip = el("div", "position:absolute;top:14px;right:12px;display:none;");
  wipeChip.className = "pt-panel pt-chip";
  hud.appendChild(wipeChip);
  const uvBadge = el("div", "position:absolute;top:14px;right:12px;display:none;color:#cdb4ff;border-color:#7a3cff;", "UV-A 365 nm · booth dark");
  uvBadge.className = "pt-panel pt-chip";
  hud.appendChild(uvBadge);

  function updateButtons() {
    ORDER.forEach((id, i) => {
      const b = btns[id];
      b.classList.toggle("done", i < st.idx || (id === "inspect" && st.sequenceDone));
      const isNext = i === st.idx && !st.dwelling && !st.wiping;
      b.classList.toggle("next", isNext && !(id === "inspect" && st.uvOn));
      if (id === "inspect") {
        b.classList.toggle("uvon", st.uvOn);
        b.lastChild.nodeValue = st.uvOn ? "UV light ON" : LABELS.inspect;
      }
    });
  }

  // ----- overlay drawing ----------------------------------------------------
  const crackPx = crack.pts.map(([x, z]) => worldToPx(x, z, OV_W, OV_H));

  function strokeCrack(alpha, width, glow) {
    og.save();
    og.lineJoin = "round"; og.lineCap = "round";
    if (glow > 0) { og.shadowColor = `rgba(214,255,80,${0.85 * glow})`; og.shadowBlur = 16 * glow; }
    og.strokeStyle = `rgba(198,255,54,${alpha})`;
    og.lineWidth = width;
    og.beginPath();
    crackPx.forEach(([x, y], i) => (i ? og.lineTo(x, y) : og.moveTo(x, y)));
    og.stroke();
    if (glow > 0) {
      og.strokeStyle = `rgba(240,255,190,${alpha})`;
      og.lineWidth = Math.max(1, width * 0.4);
      og.stroke();
    }
    og.restore();
  }

  function drawFoundRing() {
    const xs = crackPx.map((p) => p[0]), ys = crackPx.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const rx = (Math.max(...xs) - Math.min(...xs)) / 2 + 34, ry = (Math.max(...ys) - Math.min(...ys)) / 2 + 34;
    og.save();
    og.strokeStyle = "rgba(95,224,255,.95)";
    og.lineWidth = 3; og.setLineDash([10, 7]);
    og.beginPath(); og.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); og.stroke();
    og.restore();
  }

  function redraw() {
    og.clearRect(0, 0, OV_W, OV_H);
    if (st.developed) {
      if (st.uvOn) {
        og.drawImage(devUv, 0, 0);
        if (st.bleed > 0.02) strokeCrack(clamp(st.bleed, 0, 1) * 0.95, 2 + 6 * st.bleed, st.bleed);
        if (st.found) drawFoundRing();
      } else {
        og.drawImage(devWhite, 0, 0);
        // fluorescent dye is barely visible in white light — keep it honest-faint
        if (st.bleed > 0.05) strokeCrack(0.10 * st.bleed, 2 + 5 * st.bleed, 0);
      }
    } else if (st.penetrantOn) {
      const a = 0.62 * clamp(st.coatAnim, 0, 1);
      const grad = og.createLinearGradient(0, 0, OV_W, OV_H);
      grad.addColorStop(0, `rgba(156,196,40,${a})`);
      grad.addColorStop(0.5, `rgba(138,182,34,${a * 0.92})`);
      grad.addColorStop(1, `rgba(165,205,48,${a})`);
      og.fillStyle = grad;
      og.fillRect(0, 0, OV_W, OV_H);
      og.globalCompositeOperation = "destination-in";
      og.drawImage(maskCanvas, 0, 0, OV_W, OV_H);
      og.globalCompositeOperation = "source-over";
    }
    ovTex.needsUpdate = true;
  }
  redraw();

  function applyLighting() {
    const uv = st.uvOn;
    hemi.intensity = uv ? 0.05 : 0.85;
    key.intensity = uv ? 0.10 : 1.6;
    rim.intensity = uv ? 0.06 : 0.7;
    uvHemi.intensity = uv ? 0.5 : 0;
    uvPoint.intensity = uv ? 2.4 : 0;
    scene.background.set(uv ? 0x050312 : 0x0a1424);
    bench.material.color.set(uv ? 0x070514 : 0x0d1b33);
    uvBadge.style.display = uv ? "block" : "none";
  }

  // ----- sequencing ---------------------------------------------------------
  function gentleReset(msg) {
    st.idx = 0;
    st.dwelling = false; st.dwellDone = false;
    st.wiping = false; st.wipeFrac = 0; st.wipeFinishAnim = 0;
    st.developed = false; st.bleed = 0;
    st.penetrantOn = false; st.coatAnim = 0;
    st.found = false;
    if (st.uvOn) { st.uvOn = false; applyLighting(); }
    st.resets++;
    ds.ptResets = String(st.resets);
    ds.ptStep = "0";
    maskReset();
    redraw();
    ringWrap.style.display = "none";
    wipeChip.style.display = "none";
    core.orbit.autoPaused = false;
    updateButtons();
    feedback(msg + " (Part re-cleaned — start again from station 1.)");
  }

  function wrongOrder(id) {
    let msg;
    if (id === "penetrant") msg = "Pre-clean first — oil, water or dirt on the surface keeps penetrant out of the flaw.";
    else if (id === "dwell") msg = "Nothing to dwell yet — apply the penetrant first.";
    else if (id === "remove") {
      if (st.dwelling) msg = "Dwell cut short! Capillary action is slow — the penetrant hadn't finished seeping into the flaw.";
      else if (st.idx === 2) msg = "Give the penetrant its dwell before wiping — it hasn't had time to soak in.";
      else msg = "There's no penetrant on the part to remove yet.";
    } else if (id === "developer") {
      if (st.idx === 3) msg = "Wipe off the excess first — developer over surface penetrant fluoresces everywhere and hides real indications.";
      else msg = "Developer comes after penetrant, dwell and removal of the excess.";
    } else msg = "Inspection is the last station — there's nothing to see before developer draws the trapped penetrant back out.";
    gentleReset(msg);
  }

  function station(id) {
    const want = ORDER.indexOf(id);
    if (id === "inspect") {
      if (st.idx < 5) { wrongOrder(id); return; }
      st.uvOn = !st.uvOn;
      applyLighting();
      redraw();
      updateButtons();
      if (st.uvOn) {
        if (!st.sequenceDone) {
          st.sequenceDone = true;
          tasks.done("fullSequence");
          feedback("Booth dark, UV-A on. Process complete — now scan the part and click the glowing indication.");
        } else feedback(st.found ? "UV-A on." : "UV-A on — click the glowing indication.");
      } else feedback("White light — fluorescent indications all but disappear without UV. Toggle it back on to inspect.");
      return;
    }
    if (want < st.idx) {
      feedback("That station is done — next up: " + LABELS[ORDER[st.idx]] + ".");
      return;
    }
    if (want > st.idx) { wrongOrder(id); return; }
    // want === st.idx
    if (id === "preclean") {
      st.idx = 1;
      feedback("Surface degreased and dried. A clean, dry surface is mandatory — contamination blocks capillary entry.");
      sheen();
    } else if (id === "penetrant") {
      st.penetrantOn = true; st.coatAnim = 0.0001;
      st.idx = 2;
      feedback("Fluorescent penetrant applied over the whole area. Now it needs dwell time to wick into any flaws.");
    } else if (id === "dwell") {
      if (st.dwelling) { feedback("Dwelling — hold tight."); return; }
      st.dwelling = true; st.dwellStart = nowSec;
      ringWrap.style.display = "flex";
      feedback("Dwell running… " + dwellSec + " s here stands for ~10 minutes on the shop floor.");
    } else if (id === "remove") {
      if (st.wiping) { feedback("Keep wiping — drag back and forth across the part."); return; }
      st.wiping = true;
      core.orbit.autoPaused = true;
      wipeChip.style.display = "block";
      wipeChip.textContent = "Wiped 0%";
      feedback("Drag across the part to wipe off the excess. Penetrant trapped inside the crack stays put — that's the point.");
    } else if (id === "developer") {
      st.developed = true; st.developerAt = nowSec; st.bleed = 0;
      st.idx = 5;
      redraw();
      feedback("Developer on — the white blotter coat is drawing trapped penetrant back out of the flaw…");
    }
    updateButtons();
  }

  function sheen() {
    const s = el("div", "position:absolute;left:20%;right:20%;top:30%;height:34%;pointer-events:none;border-radius:18px;background:linear-gradient(100deg,transparent 30%,rgba(190,230,255,.28) 50%,transparent 70%);filter:blur(2px);opacity:0;transition:opacity .18s;");
    hud.appendChild(s);
    requestAnimationFrame(() => { s.style.opacity = "1"; });
    const t1 = setTimeout(() => { s.style.opacity = "0"; }, 420);
    const t2 = setTimeout(() => s.remove(), 720);
    core.addCleanup(() => { clearTimeout(t1); clearTimeout(t2); s.remove(); });
  }

  // ----- wiping --------------------------------------------------------------
  let lastWipePt = null;
  let wipeCalcAt = 0;
  function paintWipe(wx, wz, connect) {
    mg.globalCompositeOperation = "destination-out";
    mg.strokeStyle = "rgba(0,0,0,1)";
    mg.fillStyle = "rgba(0,0,0,1)";
    const lw = MK_W * 0.13;
    const [bx, by] = worldToPx(wx, wz, MK_W, MK_H);
    if (connect && lastWipePt) {
      mg.lineWidth = lw; mg.lineCap = "round";
      mg.beginPath(); mg.moveTo(lastWipePt[0], lastWipePt[1]); mg.lineTo(bx, by); mg.stroke();
    } else {
      mg.beginPath(); mg.arc(bx, by, lw / 2, 0, Math.PI * 2); mg.fill();
    }
    mg.globalCompositeOperation = "source-over";
    lastWipePt = [bx, by];
  }
  function computeWipeFrac() {
    const d = mg.getImageData(0, 0, MK_W, MK_H).data;
    let cleared = 0, total = 0;
    for (let i = 3; i < d.length; i += 16) { total++; if (d[i] < 110) cleared++; }
    return total ? cleared / total : 0;
  }
  function finishWipe() {
    st.wiping = false;
    st.wipeFinishAnim = nowSec || 0.001;
    core.orbit.autoPaused = false;
    wipeChip.style.display = "none";
    st.idx = 4;
    feedback("Excess removed with a final solvent-damp pass. Surface looks bare — but the flaw still holds penetrant.");
    updateButtons();
  }

  // ----- pointer hooks --------------------------------------------------------
  function pointerDown(e, drag) {
    if (st.wiping) {
      drag.mode = "wipe";
      lastWipePt = null;
      const hit = core.raycast(e.clientX, e.clientY, [overlay]);
      if (hit.length) { paintWipe(hit[0].point.x, hit[0].point.z, false); redraw(); }
    }
  }
  function pointerMove(e, drag) {
    if (drag.mode !== "wipe" || !st.wiping) return;
    const hit = core.raycast(e.clientX, e.clientY, [overlay]);
    if (hit.length) {
      paintWipe(hit[0].point.x, hit[0].point.z, true);
      if (nowSec - wipeCalcAt > 0.12) {
        wipeCalcAt = nowSec;
        st.wipeFrac = computeWipeFrac();
        ds.ptWipe = st.wipeFrac.toFixed(3);
        wipeChip.textContent = "Wiped " + Math.round(st.wipeFrac * 100) + "%";
        if (st.wipeFrac >= wipeCoverage) finishWipe();
      }
      redraw();
    } else lastWipePt = null;
  }
  function pointerUp(e, drag) {
    if (drag.mode === "wipe") {
      if (st.wiping) {
        st.wipeFrac = computeWipeFrac();
        ds.ptWipe = st.wipeFrac.toFixed(3);
        wipeChip.textContent = "Wiped " + Math.round(st.wipeFrac * 100) + "%";
        if (st.wipeFrac >= wipeCoverage) finishWipe();
      }
      redraw();
      return;
    }
    if (drag.moved < 7) {
      // click — only meaningful during UV inspection
      if (st.idx >= 5 && st.uvOn && st.bleed > 0.45 && !st.found) {
        const hits = core.raycast(e.clientX, e.clientY, [crackHit, overlay, plate]);
        if (hits.length && hits[0].object === crackHit) {
          st.found = true;
          tasks.done("findIndication");
          redraw();
          feedback("Indication found! A tight, continuous line like this is crack-like — in a real cert task you'd now measure it, evaluate against the acceptance criteria and report.");
        } else if (hits.length) {
          feedback("No indication there — scan for the thin yellow-green glowing line.");
        }
      }
    }
  }

  // ----- per-frame -------------------------------------------------------------
  let nowSec = 0;
  const projV = new THREE.Vector3();
  let lastDsAt = -1;
  core.onFrame((dt, t) => {
    nowSec = t;
    // penetrant coat fade-in
    if (st.penetrantOn && !st.developed && st.coatAnim > 0 && st.coatAnim < 1) {
      st.coatAnim = Math.min(1, st.coatAnim + dt / 0.6);
      redraw();
    }
    // wipe finish: fade out remaining residue
    if (st.wipeFinishAnim) {
      const k = (t - st.wipeFinishAnim) / 0.5;
      mg.globalCompositeOperation = "destination-out";
      mg.fillStyle = "rgba(0,0,0,0.22)";
      mg.fillRect(0, 0, MK_W, MK_H);
      mg.globalCompositeOperation = "source-over";
      redraw();
      if (k >= 1) {
        st.wipeFinishAnim = 0;
        mg.globalCompositeOperation = "destination-out";
        mg.fillStyle = "#000";
        mg.fillRect(0, 0, MK_W, MK_H);
        mg.globalCompositeOperation = "source-over";
        redraw();
      }
    }
    // dwell ring
    if (st.dwelling) {
      const elapsed = t - st.dwellStart;
      const p = clamp(elapsed / dwellSec, 0, 1);
      ringArc.setAttribute("stroke-dashoffset", String(RING_C * (1 - p)));
      ringText.textContent = String(Math.max(0, Math.ceil(dwellSec - elapsed)));
      if (p >= 1) {
        st.dwelling = false; st.dwellDone = true; st.idx = 3;
        ringWrap.style.display = "none";
        tasks.done("properDwell");
        feedback("Full dwell done — penetrant has been drawn deep into any surface-breaking flaws. Now wipe off the excess.");
        updateButtons();
      }
    }
    // developer bleedout
    if (st.developed && st.bleed < 1) {
      st.bleed = clamp((t - st.developerAt) / bleedSec, 0, 1);
      if (Math.floor(t * 10) !== Math.floor((t - dt) * 10) || st.bleed >= 1) redraw(); // ~10 fps refresh
    }
    // telemetry (throttled)
    if (t - lastDsAt > 0.1) {
      lastDsAt = t;
      ds.ptStep = String(st.idx);
      ds.ptWipe = st.wipeFrac.toFixed(3);
      ds.ptBleed = st.bleed.toFixed(2);
      ds.ptUv = st.uvOn ? "1" : "0";
      ds.ptDwelling = st.dwelling ? "1" : "0";
      projV.set(crack.cx, 0.38, crack.cz);
      projV.project(camera);
      const cw = core.canvas.clientWidth || 1, ch = core.canvas.clientHeight || 1;
      ds.ptCrackX = ((projV.x * 0.5 + 0.5) * cw).toFixed(1);
      ds.ptCrackY = ((-projV.y * 0.5 + 0.5) * ch).toFixed(1);
      ds.ptCrackVisible = st.idx >= 5 && st.uvOn && st.bleed > 0.45 ? (st.found ? "2" : "1") : "0";
    }
  });

  ds.ptResets = "0";
  ds.ptStep = "0";
  ds.ptWipe = "0.000";
  updateButtons();

  return { dispose: core.dispose };
}

// ---------------------------------------------------------------------------
// MODE 2 — "capillarity": Washburn fill of a crack cross-section
// ---------------------------------------------------------------------------

function mountCapillarity(container, config, ctx) {
  const P = config.params || {};
  const fillSecBase = numParam(P, "fillSecBase", 5, 2, 12);
  const viscMin = numParam(P, "viscMinCst", 3, 1, 10);
  const viscMax = Math.max(viscMin + 0.5, numParam(P, "viscMaxCst", 8, 2, 30));
  const crackDepthMm = numParam(P, "crackDepthMm", 5, 2, 10);

  const tasks = makeTasks(config, MANIFEST.modes.capillarity.taskIds, ctx);

  const core = setupThree(container, ctx, {
    bg: 0x0a1424,
    az: 0.16, el: 0.30, r: 3.55, target: new THREE.Vector3(-0.28, 0.05, 0),
    elMin: 0.08, elMax: 0.8, azClamp: 0.55, swing: 0.2, autoRate: 0.028,
  });
  const { scene, hud } = core;
  const ds = container.dataset;

  const hemi = new THREE.HemisphereLight(0x9db8ff, 0x1a2030, 0.9);
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(3, 5, 4);
  const rim = new THREE.DirectionalLight(0x9fd9ff, 0.6); rim.position.set(-4, 2.5, -3);
  scene.add(hemi, key, rim);

  const bench = new THREE.Mesh(
    new THREE.CircleGeometry(4, 40).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x0d1b33, roughness: 0.95 }),
  );
  bench.position.y = -0.76;
  scene.add(bench);

  // ----- cutaway block with canvas cross-section on the front face ----------
  const BW = 2.4, BH = 1.5, BD = 1.05;
  const FW = 640, FH = 400;
  const face = document.createElement("canvas");
  face.width = FW; face.height = FH;
  const fg = face.getContext("2d");
  const faceTex = new THREE.CanvasTexture(face);
  faceTex.colorSpace = THREE.SRGBColorSpace;
  faceTex.anisotropy = 2;

  const steel = new THREE.MeshStandardMaterial({ color: 0x77828f, metalness: 0.55, roughness: 0.5 });
  const steelTop = new THREE.MeshStandardMaterial({ color: 0x8b96a3, metalness: 0.55, roughness: 0.45 });
  const faceMat = new THREE.MeshBasicMaterial({ map: faceTex });
  // BoxGeometry material order: +x, -x, +y, -y, +z, -z
  const block = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, BD), [steel, steel, steelTop, steel, faceMat, steel]);
  scene.add(block);

  // penetrant pool resting on the top face
  const pool = new THREE.Mesh(
    new THREE.BoxGeometry(BW * 0.997, 0.05, BD * 0.997),
    new THREE.MeshStandardMaterial({ color: 0x86c41e, transparent: true, opacity: 0, emissive: 0x223600, roughness: 0.25 }),
  );
  pool.position.y = BH / 2 + 0.025;
  scene.add(pool);

  // ----- crack profile on the face canvas ------------------------------------
  const SURF_Y = Math.round(FH * 0.115);            // surface line (px)
  const CRACK_LEN = Math.round(FH * 0.76);          // crack depth (px)
  const rnd = mulberry32(41);
  const crackPath = (() => {
    const pts = [];
    const n = 22;
    for (let i = 0; i <= n; i++) {
      const y = SURF_Y + (CRACK_LEN * i) / n;
      const x = FW * 0.46 + Math.sin(i * 1.7) * 6 + (rnd() - 0.5) * 9 + i * 0.6;
      const w = lerp(17, 2.6, Math.pow(i / n, 0.8));
      pts.push({ x, y, w });
    }
    return pts;
  })();

  function crackOutline(g2) {
    g2.beginPath();
    for (let i = 0; i < crackPath.length; i++) {
      const p = crackPath[i];
      if (i === 0) g2.moveTo(p.x - p.w / 2, p.y); else g2.lineTo(p.x - p.w / 2, p.y);
    }
    for (let i = crackPath.length - 1; i >= 0; i--) {
      const p = crackPath[i];
      g2.lineTo(p.x + p.w / 2, p.y);
    }
    g2.closePath();
  }

  // static base (metal + air band + crevice + ruler), cached
  const baseFace = document.createElement("canvas");
  baseFace.width = FW; baseFace.height = FH;
  (function drawBase() {
    const g2 = baseFace.getContext("2d");
    const grad = g2.createLinearGradient(0, SURF_Y, 0, FH);
    grad.addColorStop(0, "#768496");
    grad.addColorStop(1, "#46505f");
    g2.fillStyle = grad;
    g2.fillRect(0, SURF_Y, FW, FH - SURF_Y);
    // machining striations
    g2.globalAlpha = 0.16;
    const r2 = mulberry32(7);
    for (let i = 0; i < 90; i++) {
      const y = SURF_Y + r2() * (FH - SURF_Y);
      g2.fillStyle = r2() > 0.5 ? "#9aa6b4" : "#39424f";
      g2.fillRect(0, y, FW, 1);
    }
    g2.globalAlpha = 1;
    // air band above the surface
    g2.fillStyle = "#070d1a";
    g2.fillRect(0, 0, FW, SURF_Y);
    g2.fillStyle = "#202b3d";
    g2.fillRect(0, SURF_Y - 2, FW, 2.5);
    // crevice
    g2.save();
    crackOutline(g2);
    g2.fillStyle = "#13181f";
    g2.fill();
    g2.strokeStyle = "rgba(20,24,30,.8)";
    g2.lineWidth = 1.5;
    g2.stroke();
    g2.restore();
    // depth ruler (left of the crack): crackDepthMm over CRACK_LEN px
    const pxPerMm = CRACK_LEN / crackDepthMm;
    g2.strokeStyle = "rgba(205,228,255,.65)";
    g2.fillStyle = "rgba(215,235,255,.9)";
    g2.font = "600 13px " + FONT;
    g2.textAlign = "right";
    const rx = FW * 0.30;
    g2.beginPath(); g2.moveTo(rx, SURF_Y); g2.lineTo(rx, SURF_Y + CRACK_LEN); g2.stroke();
    for (let mm = 0; mm <= crackDepthMm; mm++) {
      const y = SURF_Y + mm * pxPerMm;
      g2.beginPath(); g2.moveTo(rx, y); g2.lineTo(rx - (mm % 5 === 0 ? 12 : 7), y); g2.stroke();
      if (crackDepthMm <= 6 || mm % 2 === 0) g2.fillText(mm + " mm", rx - 17, y + 4);
    }
    // gap label at the mouth
    g2.fillStyle = "rgba(205,228,255,.8)";
    g2.font = "600 12px " + FONT;
    g2.textAlign = "left";
    g2.fillText("gap ≈ 2 µm (not to scale)", FW * 0.52, SURF_Y + 22);
  })();

  let pooled = false;
  function drawFace(frac) {
    fg.clearRect(0, 0, FW, FH);
    fg.drawImage(baseFace, 0, 0);
    if (pooled) {
      // the whole band above the surface is the penetrant pool (no air gap)
      const pg = fg.createLinearGradient(0, 0, 0, SURF_Y);
      pg.addColorStop(0, "rgba(134,182,32,.96)");
      pg.addColorStop(1, "rgba(168,214,52,.96)");
      fg.fillStyle = pg;
      fg.fillRect(0, 0, FW, SURF_Y);
      fg.fillStyle = "rgba(228,255,140,.4)";
      fg.fillRect(0, SURF_Y - 3, FW, 3);
    }
    if (frac > 0) {
      const fy = SURF_Y + CRACK_LEN * frac;
      fg.save();
      crackOutline(fg);
      fg.clip();
      const grad = fg.createLinearGradient(0, SURF_Y, 0, Math.max(fy, SURF_Y + 1));
      grad.addColorStop(0, "rgba(168,220,46,.95)");
      grad.addColorStop(1, "rgba(196,240,80,.95)");
      fg.fillStyle = grad;
      fg.fillRect(0, 0, FW, fy);
      // meniscus glow at the advancing front
      const p = crackPath[Math.min(crackPath.length - 1, Math.floor(frac * (crackPath.length - 1)))];
      const rg = fg.createRadialGradient(p.x, fy, 0, p.x, fy, 16);
      rg.addColorStop(0, "rgba(235,255,150,.9)");
      rg.addColorStop(1, "rgba(235,255,150,0)");
      fg.fillStyle = rg;
      fg.fillRect(p.x - 16, fy - 16, 32, 32);
      fg.restore();
    }
    faceTex.needsUpdate = true;
  }
  drawFace(0);

  // ----- HUD -------------------------------------------------------------------
  const topHud = makeTopHud(hud, config, "Capillary action · Washburn dynamics · magnified cross-section");
  const feedback = topHud.feedback;

  const panel = el("div", "position:absolute;right:12px;top:12px;width:254px;display:flex;flex-direction:column;gap:9px;padding:13px 14px;");
  panel.className = "pt-panel pt-solid";
  hud.appendChild(panel);

  const head = el("div", "", "Penetrant properties");
  head.className = "pt-title";
  panel.appendChild(head);

  const slider = document.createElement("input");
  slider.type = "range"; slider.min = "0"; slider.max = "100"; slider.step = "1"; slider.value = "50";
  slider.className = "pt-slider";
  slider.setAttribute("data-pt-ctl", "visc");
  panel.appendChild(slider);
  const sliderEnds = el("div", "display:flex;justify-content:space-between;margin-top:-5px;");
  sliderEnds.className = "pt-sub";
  sliderEnds.appendChild(el("span", "", "thin (fast wick)"));
  sliderEnds.appendChild(el("span", "", "thick (slow)"));
  panel.appendChild(sliderEnds);

  const muLine = el("div", "font:700 13px " + FONT + ";color:" + COL.cyan + ";");
  panel.appendChild(muLine);
  const fixLine = el("div", "", "γ ≈ 30 mN/m · θ ≈ 5° · gap ≈ 2 µm · depth " + crackDepthMm + " mm");
  fixLine.className = "pt-sub";
  panel.appendChild(fixLine);
  const predLine = el("div");
  predLine.className = "pt-sub";
  panel.appendChild(predLine);

  const runBtn = el("button");
  runBtn.className = "pt-btn";
  runBtn.style.cssText += `justify-content:center;background:${COL.blue};border-color:${COL.blue};color:#fff;font-size:13px;`;
  runBtn.textContent = "Apply penetrant & dwell";
  runBtn.setAttribute("data-pt-ctl", "run");
  panel.appendChild(runBtn);

  const statusLine = el("div", "min-height:15px;");
  statusLine.className = "pt-sub";
  panel.appendChild(statusLine);

  const chips = el("div", "display:flex;gap:7px;");
  const chipLow = el("div", "", "thin run —");
  chipLow.className = "pt-panel pt-chip";
  const chipHigh = el("div", "", "thick run —");
  chipHigh.className = "pt-panel pt-chip";
  chips.appendChild(chipLow); chips.appendChild(chipHigh);
  panel.appendChild(chips);

  // depth-vs-time chart (SVG, so the WebGL canvas stays the only <canvas>)
  const CHW = 224, CHH = 132, CHL = 30, CHB = 22;
  const chart = svgEl("svg", { width: CHW, height: CHH, viewBox: `0 0 ${CHW} ${CHH}`, style: "margin-top:2px" });
  chart.appendChild(svgEl("line", { x1: CHL, y1: 6, x2: CHL, y2: CHH - CHB, stroke: COL.border, "stroke-width": 1 }));
  chart.appendChild(svgEl("line", { x1: CHL, y1: CHH - CHB, x2: CHW - 4, y2: CHH - CHB, stroke: COL.border, "stroke-width": 1 }));
  const yLab = svgEl("text", { x: 8, y: 12, fill: COL.dim, "font-size": 9, "font-family": FONT });
  yLab.textContent = "depth";
  chart.appendChild(yLab);
  const xLab = svgEl("text", { x: CHW - 6, y: CHH - 7, fill: COL.dim, "font-size": 9, "font-family": FONT, "text-anchor": "end" });
  chart.appendChild(xLab);
  chart.appendChild(svgEl("line", { x1: CHL, y1: 8, x2: CHW - 4, y2: 8, stroke: "rgba(150,200,255,.25)", "stroke-dasharray": "3 3" }));
  panel.appendChild(chart);

  const note = el("div", "", "Washburn: L(t) = √(γ·w·cosθ·t / 3μ) — depth grows with √t, so the last millimetre takes the longest. Sim time is compressed: real flaws are tighter and contaminated, which is why shop dwells run 5–30 minutes.");
  note.className = "pt-sub";
  note.style.fontSize = "10.5px";
  panel.appendChild(note);

  // ----- run model ----------------------------------------------------------
  const run = { running: false, t0: 0, tFull: 1, visc: 0.5, frac: 0, sampled: false, poly: null, pts: [] };
  let lowDone = false, highDone = false, anyFull = false;
  let tMax = Math.max(6, fillSecBase * (viscMax / viscMin) * 1.05);
  const curves = [];

  function muOf(v) { return lerp(viscMin, viscMax, v); }
  function tFullOf(v) { return fillSecBase * (muOf(v) / viscMin); } // Washburn: t ∝ μ
  function sliderV() { return clamp(Number(slider.value) / 100, 0, 1); }

  function refreshReadouts() {
    const v = sliderV();
    const mu = muOf(v);
    muLine.textContent = "μ = " + mu.toFixed(1) + " cSt " + (v <= 0.3 ? "(thin)" : v >= 0.7 ? "(thick)" : "(medium)");
    predLine.textContent = "Predicted full-fill dwell ≈ " + tFullOf(v).toFixed(1) + " s (sim) — t ∝ μ";
    xLab.textContent = "time (s) → " + tMax.toFixed(0);
  }
  refreshReadouts();
  const onSlide = () => { if (!run.running) refreshReadouts(); ds.ptVisc = sliderV().toFixed(2); };
  slider.addEventListener("input", onSlide);
  core.addCleanup(() => slider.removeEventListener("input", onSlide));

  function chartXY(t, frac) {
    const x = CHL + (t / tMax) * (CHW - 4 - CHL);
    const y = (CHH - CHB) - frac * (CHH - CHB - 8);
    return x.toFixed(1) + "," + y.toFixed(1);
  }
  function rescaleCurves() {
    for (const c of curves) c.poly.setAttribute("points", c.pts.map((p) => chartXY(p[0], p[1])).join(" "));
  }

  function startRun() {
    if (run.running) { feedback("Dwell in progress — watch the fill front."); return; }
    const v = sliderV();
    run.running = true;
    run.t0 = nowSec;
    run.visc = v;
    run.tFull = tFullOf(v);
    run.frac = 0;
    run.sampled = false;
    run.pts = [];
    if (run.tFull * 1.05 > tMax) { tMax = run.tFull * 1.05; rescaleCurves(); refreshReadouts(); }
    const color = v <= 0.3 ? COL.cyan : v >= 0.7 ? "#ffb454" : "#9d8bff";
    run.poly = svgEl("polyline", { fill: "none", stroke: color, "stroke-width": 2, points: "" });
    chart.appendChild(run.poly);
    curves.push({ poly: run.poly, pts: run.pts });
    if (curves.length > 4) { const old = curves.shift(); old.poly.remove(); }
    pooled = true;
    pool.material.opacity = 0.78;
    slider.disabled = true;
    runBtn.style.opacity = "0.55";
    statusLine.textContent = "Dwelling… penetrant wicking in.";
    feedback(
      (anyFull ? "Part re-cleaned, fresh penetrant applied. " : "Penetrant applied — capillary pressure (≈ 2γcosθ/w) pulls it into the crack; at this scale gravity is irrelevant, so orientation doesn't matter. ") +
      "μ = " + muOf(v).toFixed(1) + " cSt → full fill in ≈ " + run.tFull.toFixed(1) + " s.",
    );
    ds.ptRunning = "1";
    drawFace(0);
  }
  runBtn.addEventListener("click", startRun);
  core.addCleanup(() => runBtn.removeEventListener("click", startRun));

  function recordBucket(v) {
    if (v <= 0.3 && !lowDone) { lowDone = true; chipLow.textContent = "thin run ✓"; chipLow.style.borderColor = COL.cyan; }
    if (v >= 0.7 && !highDone) { highDone = true; chipHigh.textContent = "thick run ✓"; chipHigh.style.borderColor = "#ffb454"; }
    ds.ptLow = lowDone ? "1" : "0";
    ds.ptHigh = highDone ? "1" : "0";
    if (lowDone && highDone) tasks.done("compareViscosity");
  }

  function endRun() {
    run.running = false;
    slider.disabled = false;
    runBtn.style.opacity = "1";
    statusLine.textContent = "Crack full — penetrant held in place by capillary pressure.";
    anyFull = true;
    tasks.done("fillCrack");
    recordBucket(run.visc);
    ds.ptRunning = "0";
    if (lowDone && highDone) {
      feedback("Comparison complete: time-to-fill scaled with viscosity (t ∝ μ), and every curve bends over — depth ∝ √t. That's exactly why dwell time and penetrant grade matter.");
    } else if (run.visc <= 0.3) {
      feedback("Filled. Now drag the slider to the THICK end and run again — watch how much longer the same depth takes.");
    } else if (run.visc >= 0.7) {
      feedback("Filled — slowly. Now drag the slider to the THIN end and run again to compare.");
    } else {
      feedback("Filled. For a real comparison, run the slider EXTREMES — thin end, then thick end.");
    }
  }

  // ----- per-frame -------------------------------------------------------------
  let nowSec = 0;
  let lastDraw = 0, lastPt = 0;
  core.onFrame((dt, t) => {
    nowSec = t;
    if (run.running) {
      const tEl = t - run.t0;
      run.frac = Math.min(1, Math.sqrt(tEl / run.tFull)); // Washburn: L ∝ √t
      if (t - lastDraw > 0.05) { lastDraw = t; drawFace(run.frac); }
      if (t - lastPt > 0.09) {
        lastPt = t;
        run.pts.push([tEl, run.frac]);
        run.poly.setAttribute("points", run.poly.getAttribute("points") + " " + chartXY(tEl, run.frac));
      }
      const mmNow = (run.frac * crackDepthMm).toFixed(1);
      statusLine.textContent = "t = " + tEl.toFixed(1) + " s · depth " + mmNow + " mm (" + Math.round(run.frac * 100) + "%)";
      if (!run.sampled && run.frac >= 0.6) { run.sampled = true; recordBucket(run.visc); }
      ds.ptFill = run.frac.toFixed(3);
      if (run.frac >= 1) { drawFace(1); endRun(); }
    }
  });

  ds.ptRunning = "0";
  ds.ptFill = "0";
  ds.ptLow = "0";
  ds.ptHigh = "0";
  ds.ptVisc = sliderV().toFixed(2);

  return { dispose: core.dispose };
}

// ---------------------------------------------------------------------------
// entry point
// ---------------------------------------------------------------------------

/** @type {import("../contract").TrainerMount} */
export default function mount(container, config, ctx) {
  config = config || {};
  const safeCtx = {
    onTaskDone: ctx && typeof ctx.onTaskDone === "function" ? ctx.onTaskDone.bind(ctx) : function () {},
    onAllDone: ctx && typeof ctx.onAllDone === "function" ? ctx.onAllDone.bind(ctx) : function () {},
    reducedMotion: !!(ctx && ctx.reducedMotion),
    width: (ctx && ctx.width) || 0,
    height: (ctx && ctx.height) || 0,
  };
  const mode = config.mode && MANIFEST.modes[config.mode] ? config.mode : "process";
  if (mode === "capillarity") return mountCapillarity(container, config, safeCtx);
  return mountProcess(container, config, safeCtx);
}
