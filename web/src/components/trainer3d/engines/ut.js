// @ts-nocheck — plain-JS engine, functionally validated via harness (see media-build/trainer-harness)
/**
 * UT — Ultrasonic Testing method trainer engine for the NDTAcademy lesson player.
 *
 * Implements the TrainerMount contract (see ../contract.ts):
 *   export default mount(container, config, ctx) -> { dispose() }
 *   export const MANIFEST
 *
 * Modes:
 *   "thickness"  — straight-beam thickness gauging on a 4-step calibration block.
 *   "angle-flaw" — angle-beam (shear wave) flaw location on a welded plate with
 *                  hidden side-drilled holes, gated to the first leg.
 *   "wave-basics"— wavelength/velocity/frequency relationships in three media.
 *
 * Physics notes (kept honest, simplified where stated):
 *   - Thickness: round-trip time t = 2·d / v; backwall multiples decay geometrically.
 *   - Angle beam: refracted shear beam at θ from the surface normal; a side-drilled
 *     hole at depth z is insonified on the 1st leg when probe index x ≈ x_flaw − z·tanθ;
 *     sound path s = z / cosθ at shear velocity. Display is gated to the first leg.
 *   - Wave basics: λ = v / f; near field N = D²·f / (4·v). Real longitudinal
 *     velocities (steel 5920, aluminium 6320, water 1480 m/s); the animation is
 *     uniformly time-dilated (factor shown on screen) so relative speeds stay true.
 *
 * Plain ESM JavaScript with JSDoc types; imports bare "three"; no external CSS.
 */
import * as THREE from "three";

/** @typedef {import("../contract").TrainerConfig} TrainerConfig */
/** @typedef {import("../contract").TrainerCtx} TrainerCtx */
/** @typedef {import("../contract").TrainerHandle} TrainerHandle */

// ----------------------------------------------------------------------------
// MANIFEST
// ----------------------------------------------------------------------------
export const MANIFEST = {
  engine: "ut",
  modes: {
    thickness: {
      description:
        "Straight-beam thickness gauging on a stepped calibration block. Drag (or tap to place) the 0° probe along the top of a 4-step block; a live A-scan shows the initial pulse and backwall echo whose time of flight tracks the thickness under the probe. Record readings on three different steps, then identify the thinnest step.",
      params: {
        stepsMm:
          "Array of 3-5 step thicknesses in mm, each 5-100 (default [12.5, 25, 50, 75]); rendered left to right in the given order",
        velocityMps:
          "Longitudinal sound velocity of the block material in m/s, 1000-7000 (default 5920, carbon steel)",
        material:
          "Display label for the block material (default \"Carbon steel\")",
        stepWidthMm: "Width of each step along the scan axis in mm, 24-50 (default 32)",
      },
      taskIds: ["measure3", "identifyThinnest"],
    },
    "angle-flaw": {
      description:
        "Angle-beam flaw location on a welded plate containing hidden side-drilled holes. Slide the wedge along the scan line; the refracted shear beam (drawn as a first-leg path) returns an A-scan echo only when it intersects a hole, peaking when the beam centreline hits it. Press Mark within ±4 mm of each echo peak to log every flaw.",
      params: {
        flawCount: "Number of side-drilled holes, 2-3 (default 2)",
        depthsMm:
          "Array (length = flawCount) of hole depths below the scan surface in mm, each 5 to plateThicknessMm−5 (default [10, 18, 14])",
        plateThicknessMm: "Plate thickness in mm, 15-40 (default 25)",
        refractedAngleDeg: "Refracted shear-wave angle in degrees, one of 45 | 60 | 70 (default 60)",
        scanLengthMm: "Length of the scan track in mm, 140-260 (default 200)",
        shearVelocityMps:
          "Shear sound velocity in m/s, 2000-4000 (default 3230, carbon steel)",
        flawXsMm:
          "Optional array (length = flawCount) of hole positions along the scan axis in mm, each within ±(scanLengthMm/2 − 20); omit for auto-spread placement with well-separated echo peaks",
      },
      taskIds: ["findFlaw1", "findFlaw2", "findFlaw3"],
    },
    "wave-basics": {
      description:
        "Wavelength, frequency and velocity in a transparent slab. A repeating probe pulse travels through the material as a packet of wavefront crests spaced exactly λ = v/f apart (animation uniformly slowed; factor shown). Adjust frequency (1-10 MHz) and switch between steel, aluminium and water; readouts give λ and the near-field length. Tasks: get λ below 1 mm in steel, and observe the pulse in all three materials.",
      params: {
        materials:
          "Subset of [\"steel\",\"aluminum\",\"water\"] to offer, ≥2 entries (default all three)",
        startMaterial: "Initially selected material id (default \"steel\")",
        frequencyMHz: "Initial probe frequency in MHz, 1-10 (default 2)",
        probeDiameterMm: "Probe element diameter in mm, 6-25, used for the near-field readout (default 10)",
      },
      taskIds: ["setLambdaUnder1mm", "compareMaterials"],
    },
  },
};

// ----------------------------------------------------------------------------
// Brand palette + tiny DOM helpers (all inline styles; no external CSS)
// ----------------------------------------------------------------------------
const FONT = "Manrope, system-ui, -apple-system, 'Segoe UI', sans-serif";
const COL = {
  navy: "#0B1F3A",
  navyDeep: "#071527",
  blue: "#1E66F5",
  cyan: "#5fe0ff",
  text: "#dce8ff",
  dim: "#8aa3cf",
  panel: "rgba(120,170,255,.07)",
  border: "rgba(150,200,255,.22)",
  good: "#4ade80",
  bad: "#f87171",
};

/**
 * @param {string} tag
 * @param {Partial<CSSStyleDeclaration>} [styles]
 * @param {string} [text]
 * @returns {HTMLElement}
 */
function el(tag, styles, text) {
  const n = document.createElement(tag);
  if (styles) Object.assign(n.style, styles);
  if (text != null) n.textContent = text;
  return n;
}

/** @param {Partial<CSSStyleDeclaration>} [styles] */
function glassPanel(styles) {
  return el("div", Object.assign(
    {
      background: COL.panel,
      border: `1px solid ${COL.border}`,
      borderRadius: "12px",
      backdropFilter: "blur(6px)",
      padding: "10px 12px",
      color: COL.text,
      fontFamily: FONT,
      fontSize: "12px",
      pointerEvents: "auto",
      boxShadow: "0 6px 24px rgba(2,8,20,.45)",
    },
    styles || {},
  ));
}

/**
 * Brand button. setEnabled toggles a data-enabled attr (handy for tests/e2e).
 * @param {string} label
 * @param {() => void} onClick
 * @param {string} [dataId]
 */
function makeButton(label, onClick, dataId) {
  const b = /** @type {HTMLButtonElement} */ (el("button", {
    fontFamily: FONT,
    fontSize: "12.5px",
    fontWeight: "700",
    letterSpacing: ".02em",
    color: "#fff",
    background: `linear-gradient(180deg, ${COL.blue}, #1850c4)`,
    border: `1px solid rgba(150,200,255,.45)`,
    borderRadius: "9px",
    padding: "8px 14px",
    cursor: "pointer",
    pointerEvents: "auto",
    boxShadow: "0 2px 10px rgba(30,102,245,.4)",
  }, label));
  if (dataId) b.setAttribute("data-ut", dataId);
  b.addEventListener("click", onClick);
  const setEnabled = (/** @type {boolean} */ on) => {
    b.disabled = !on;
    b.setAttribute("data-enabled", on ? "1" : "0");
    b.style.opacity = on ? "1" : "0.38";
    b.style.cursor = on ? "pointer" : "default";
    b.style.filter = on ? "none" : "saturate(.4)";
  };
  setEnabled(true);
  return { btn: b, setEnabled };
}

/**
 * Labelled range slider with live value readout.
 * @param {string} label @param {number} min @param {number} max @param {number} step
 * @param {number} value @param {(v:number)=>string} fmt @param {(v:number)=>void} onInput
 * @param {string} [dataId]
 */
function makeSlider(label, min, max, step, value, fmt, onInput, dataId) {
  const root = el("div", { display: "flex", alignItems: "center", gap: "8px", pointerEvents: "auto" });
  root.appendChild(el("span", { color: COL.dim, fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap" }, label));
  const input = /** @type {HTMLInputElement} */ (document.createElement("input"));
  input.type = "range";
  input.min = String(min); input.max = String(max); input.step = String(step); input.value = String(value);
  Object.assign(input.style, { width: "130px", accentColor: COL.blue, cursor: "pointer" });
  if (dataId) input.setAttribute("data-ut", dataId);
  const valueEl = el("span", { color: COL.cyan, fontSize: "11.5px", fontWeight: "700", minWidth: "58px", fontVariantNumeric: "tabular-nums" }, fmt(value));
  input.addEventListener("input", () => {
    const v = parseFloat(input.value);
    valueEl.textContent = fmt(v);
    onInput(v);
  });
  root.appendChild(input); root.appendChild(valueEl);
  return { root, input, valueEl };
}

// ----------------------------------------------------------------------------
// Task tracker — emits each config task id once; onAllDone when set complete
// ----------------------------------------------------------------------------
/** @param {TrainerConfig} config @param {TrainerCtx} ctx */
function makeTaskTracker(config, ctx) {
  const wanted = new Set((config.tasks || []).map((t) => t.id));
  const done = new Set();
  let allFired = false;
  return {
    /** @param {string} id */
    complete(id) {
      if (!wanted.has(id) || done.has(id)) return;
      done.add(id);
      ctx.onTaskDone(id);
      if (!allFired && done.size === wanted.size) {
        allFired = true;
        ctx.onAllDone();
      }
    },
    /** @param {string} id */
    isDone(id) { return done.has(id); },
  };
}

// ----------------------------------------------------------------------------
// Stage — renderer/scene/camera scaffold with HUD layer, RAF, orbit, disposal
// ----------------------------------------------------------------------------
/**
 * @param {HTMLElement} container
 * @param {TrainerCtx} ctx
 * @param {{camPos:[number,number,number], camTarget:[number,number,number], fov?:number, orbitAmpDeg?:number, orbitPeriodS?:number}} opts
 */
function createStage(container, ctx, opts) {
  const disposers = /** @type {Array<() => void>} */ ([]);
  const listeners = /** @type {Array<[EventTarget,string,any,any?]>} */ ([]);
  const on = (/** @type {EventTarget} */ t, /** @type {string} */ type, /** @type {any} */ fn, /** @type {any} */ o) => {
    t.addEventListener(type, fn, o);
    listeners.push([t, type, fn, o]);
  };

  if (getComputedStyle(container).position === "static") container.style.position = "relative";

  const root = el("div", {
    position: "absolute", inset: "0", overflow: "hidden",
    background: `radial-gradient(120% 90% at 50% 10%, #122c52 0%, ${COL.navy} 55%, ${COL.navyDeep} 100%)`,
    fontFamily: FONT, borderRadius: "inherit", userSelect: "none", touchAction: "none",
  });
  root.setAttribute("data-ut-root", "1");
  container.appendChild(root);

  const W = Math.max(320, ctx.width || container.clientWidth || 800);
  const H = Math.max(240, ctx.height || container.clientHeight || 520);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(W, H, false);
  Object.assign(renderer.domElement.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block" });
  root.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(opts.fov || 36, W / H, 1, 4000);

  // Spherical orbit rig around a fixed target; slow sinusoidal auto-orbit ≤3°/s.
  const target = new THREE.Vector3(...opts.camTarget);
  const camPos = new THREE.Vector3(...opts.camPos);
  const offset = camPos.clone().sub(target);
  const sph = new THREE.Spherical().setFromVector3(offset);
  const baseTheta = sph.theta;
  const orbitAmp = THREE.MathUtils.degToRad(opts.orbitAmpDeg ?? 6);
  const orbitPeriod = opts.orbitPeriodS ?? 14;
  const state = { dragging: false, orbitEnabled: !ctx.reducedMotion, time: 0, userTheta: 0, userPhi: 0 };

  function applyCamera() {
    const t = state.time;
    const auto = state.orbitEnabled && !state.dragging ? Math.sin((t / orbitPeriod) * Math.PI * 2) * orbitAmp : 0;
    const s = new THREE.Spherical(
      sph.radius,
      THREE.MathUtils.clamp(sph.phi + state.userPhi, 0.45, 1.45),
      baseTheta + auto + state.userTheta,
    );
    camera.position.setFromSpherical(s).add(target);
    camera.lookAt(target);
  }
  applyCamera();

  // Lights — cool studio look on navy.
  scene.add(new THREE.AmbientLight(0x9db8e8, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(120, 260, 180);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x5fe0ff, 0.7);
  rim.position.set(-180, 120, -140);
  scene.add(rim);

  // HUD overlay (children opt back into pointer events).
  const hud = el("div", { position: "absolute", inset: "0", pointerEvents: "none", zIndex: "2" });
  root.appendChild(hud);

  // Resize handling.
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => {
    const w = Math.max(120, container.clientWidth), h = Math.max(100, container.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }) : null;
  if (ro) ro.observe(container);

  // RAF loop, paused while document.hidden.
  const frameCbs = /** @type {Array<(dt:number, t:number) => void>} */ ([]);
  let raf = 0, last = 0, disposed = false;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    state.time += dt;
    for (const cb of frameCbs) cb(dt, state.time);
    applyCamera();
    renderer.render(scene, camera);
  }
  function start() { if (!raf && !disposed) { last = 0; raf = requestAnimationFrame(loop); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  on(document, "visibilitychange", () => { document.hidden ? stop() : start(); });
  start();

  // Pointer → world ray helper.
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  /** @param {{clientX:number, clientY:number}} e */
  function setNdc(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    return raycaster;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    stop();
    if (ro) ro.disconnect();
    for (const [t, type, fn, o] of listeners) t.removeEventListener(type, fn, o);
    listeners.length = 0;
    for (const d of disposers) { try { d(); } catch (_e) { /* noop */ } }
    scene.traverse((o) => {
      const m = /** @type {any} */ (o);
      if (m.geometry && m.geometry.dispose) m.geometry.dispose();
      const mats = Array.isArray(m.material) ? m.material : (m.material ? [m.material] : []);
      for (const mat of mats) {
        for (const k of Object.keys(mat)) {
          const v = mat[k];
          if (v && v.isTexture) v.dispose();
        }
        mat.dispose && mat.dispose();
      }
    });
    renderer.dispose();
    try { renderer.forceContextLoss(); } catch (_e) { /* noop */ }
    root.remove();
  }

  return {
    root, hud, renderer, scene, camera, state, on, setNdc,
    onFrame: (/** @type {(dt:number,t:number)=>void} */ cb) => frameCbs.push(cb),
    addDisposer: (/** @type {() => void} */ d) => disposers.push(d),
    dispose,
  };
}

/** Title chip, top-left. @param {HTMLElement} hud @param {string} title @param {string} [sub] */
function addTitleChip(hud, title, sub) {
  const chip = glassPanel({ position: "absolute", top: "12px", left: "12px", maxWidth: "300px", pointerEvents: "none" });
  chip.appendChild(el("div", { fontWeight: "800", fontSize: "13px", color: COL.text, letterSpacing: ".01em" }, title));
  if (sub) chip.appendChild(el("div", { marginTop: "3px", color: COL.dim, fontSize: "11px", lineHeight: "1.45" }, sub));
  hud.appendChild(chip);
  return chip;
}

// ----------------------------------------------------------------------------
// A-scan instrument (2-D canvas in a glass panel)
// ----------------------------------------------------------------------------
/**
 * @param {HTMLElement} hud
 * @param {{title:string, w?:number, h?:number, right?:string, top?:string}} o
 */
function makeAScan(hud, o) {
  const w = o.w || 252, h = o.h || 168;
  const panel = glassPanel({ position: "absolute", right: o.right || "12px", top: o.top || "12px", padding: "8px 10px 6px" });
  panel.setAttribute("data-ut", "ascan-panel");
  const head = el("div", { display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "5px" });
  head.appendChild(el("span", { fontWeight: "800", fontSize: "11px", color: COL.cyan, letterSpacing: ".08em" }, o.title));
  const rightLbl = el("span", { fontWeight: "600", fontSize: "10.5px", color: COL.dim });
  head.appendChild(rightLbl);
  panel.appendChild(head);
  const cv = /** @type {HTMLCanvasElement} */ (document.createElement("canvas"));
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  Object.assign(cv.style, { width: w + "px", height: h + "px", display: "block", borderRadius: "7px" });
  panel.appendChild(cv);
  const foot = el("div", { display: "flex", justifyContent: "space-between", marginTop: "4px", color: COL.dim, fontSize: "10px", fontVariantNumeric: "tabular-nums" });
  const footL = el("span"), footR = el("span");
  foot.appendChild(footL); foot.appendChild(footR);
  panel.appendChild(foot);
  hud.appendChild(panel);
  const g = /** @type {CanvasRenderingContext2D} */ (cv.getContext("2d"));
  g.scale(dpr, dpr);

  let phase = 0;
  /** @param {Float32Array} tr @param {number} cx @param {number} amp @param {number} sigma @param {number} n */
  function addPeak(tr, cx, amp, sigma, n) {
    const r = Math.ceil(sigma * 3.5);
    for (let i = Math.max(0, Math.floor(cx - r)); i <= Math.min(n - 1, Math.ceil(cx + r)); i++) {
      const d = (i - cx) / sigma;
      const v = amp * Math.exp(-0.5 * d * d);
      if (v > tr[i]) tr[i] = v;
    }
  }
  /**
   * Draw trace. echoes: x in 0..1 (fraction of range), amp 0..1.
   * @param {Array<{x:number, amp:number}>} echoes
   * @param {{noise?:number}} [opt]
   */
  function draw(echoes, opt) {
    phase += 1;
    const noise = (opt && opt.noise) ?? 0.012;
    g.clearRect(0, 0, w, h);
    g.fillStyle = "rgba(4,12,26,.94)";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(95,224,255,.13)";
    g.lineWidth = 1;
    g.beginPath();
    for (let i = 1; i < 10; i++) { const x = (i / 10) * w; g.moveTo(x, 0); g.lineTo(x, h); }
    for (let i = 1; i < 5; i++) { const y = (i / 5) * h; g.moveTo(0, y); g.lineTo(w, y); }
    g.stroke();
    const base = h - 12;
    const n = w;
    const tr = new Float32Array(n);
    for (let i = 0; i < n; i++) tr[i] = noise * Math.abs(Math.sin(i * 12.9898 + phase * 0.7) * Math.sin(i * 78.233));
    // initial pulse at left edge with ring-down
    addPeak(tr, 0.018 * n, 0.97, 2.2, n);
    addPeak(tr, 0.018 * n + 4.5, 0.45, 2.0, n);
    addPeak(tr, 0.018 * n + 9, 0.18, 2.0, n);
    for (const e of echoes) {
      const px = e.x * n;
      addPeak(tr, px, e.amp, 2.6, n);
      addPeak(tr, px + 3.5, e.amp * 0.4, 2.2, n); // ring-down cycle
    }
    g.beginPath();
    g.moveTo(0, base);
    for (let i = 0; i < n; i++) g.lineTo(i, base - Math.min(1, tr[i]) * (h - 26));
    g.lineTo(n - 1, base);
    g.closePath();
    g.fillStyle = "rgba(30,102,245,.30)";
    g.fill();
    g.beginPath();
    for (let i = 0; i < n; i++) {
      const y = base - Math.min(1, tr[i]) * (h - 26);
      i ? g.lineTo(i, y) : g.moveTo(i, y);
    }
    g.strokeStyle = COL.cyan;
    g.lineWidth = 1.4;
    g.stroke();
    g.strokeStyle = "rgba(150,200,255,.4)";
    g.beginPath(); g.moveTo(0, base); g.lineTo(w, base); g.stroke();
  }
  return { panel, draw, footL, footR, rightLbl };
}

// ----------------------------------------------------------------------------
// Shared probe-drag along X: tap-to-place + drag on a vertical x/y plane (z=0).
// Returns helpers; calls setX(worldX) clamped to [minX, maxX].
// ----------------------------------------------------------------------------
/**
 * @param {ReturnType<typeof createStage>} stage
 * @param {{minX:number, maxX:number, setX:(x:number)=>void}} o
 */
function attachXDrag(stage, o) {
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // z = 0
  const hit = new THREE.Vector3();
  let active = false;
  /** @param {PointerEvent} e */
  function place(e) {
    const rc = stage.setNdc(e);
    if (rc.ray.intersectPlane(plane, hit)) {
      o.setX(THREE.MathUtils.clamp(hit.x, o.minX, o.maxX));
    }
  }
  stage.on(stage.renderer.domElement, "pointerdown", (/** @type {PointerEvent} */ e) => {
    if (e.button !== undefined && e.button !== 0) return;
    active = true;
    stage.state.dragging = true;
    try { stage.renderer.domElement.setPointerCapture(e.pointerId); } catch (_e) { /* noop */ }
    place(e);
  });
  stage.on(stage.renderer.domElement, "pointermove", (/** @type {PointerEvent} */ e) => {
    if (active) place(e);
  });
  const end = (/** @type {PointerEvent} */ e) => {
    if (!active) return;
    active = false;
    stage.state.dragging = false;
    try { stage.renderer.domElement.releasePointerCapture(e.pointerId); } catch (_e) { /* noop */ }
  };
  stage.on(stage.renderer.domElement, "pointerup", end);
  stage.on(stage.renderer.domElement, "pointercancel", end);
}

/** Steel-look PBR material. @param {number} color */
function steelMat(color) {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.62, roughness: 0.38 });
}

/** Subtle cyan edge lines for a mesh geometry. @param {THREE.BufferGeometry} geo */
function edgeLines(geo) {
  return new THREE.LineSegments(
    new THREE.EdgesGeometry(geo, 12),
    new THREE.LineBasicMaterial({ color: 0x5fe0ff, transparent: true, opacity: 0.28 }),
  );
}

/** Big readout panel (digital-gauge style). @param {HTMLElement} hud */
function makeGaugePanel(hud, titleTxt) {
  const p = glassPanel({ position: "absolute", right: "12px", top: "218px", width: "232px", padding: "9px 12px" });
  p.appendChild(el("div", { fontWeight: "800", fontSize: "10.5px", color: COL.cyan, letterSpacing: ".08em", marginBottom: "4px" }, titleTxt));
  const big = el("div", { fontWeight: "800", fontSize: "26px", color: COL.text, fontVariantNumeric: "tabular-nums", lineHeight: "1.1" }, "--.- mm");
  big.setAttribute("data-ut", "readout");
  p.appendChild(big);
  const sub = el("div", { color: COL.dim, fontSize: "10.5px", marginTop: "3px", fontVariantNumeric: "tabular-nums" }, "");
  sub.setAttribute("data-ut", "pos");
  p.appendChild(sub);
  const msg = el("div", { color: COL.dim, fontSize: "11px", marginTop: "6px", minHeight: "14px", fontWeight: "600" }, "");
  msg.setAttribute("data-ut", "msg");
  p.appendChild(msg);
  hud.appendChild(p);
  return { panel: p, big, sub, msg };
}

// ============================================================================
// MODE 1 — "thickness": stepped calibration block + 0° probe + live A-scan
// ============================================================================
/**
 * @param {HTMLElement} container @param {TrainerConfig} config @param {TrainerCtx} ctx
 * @returns {TrainerHandle}
 */
function mountThickness(container, config, ctx) {
  const P = config.params || {};
  const steps = (Array.isArray(P.stepsMm) && P.stepsMm.length >= 3 ? P.stepsMm : [12.5, 25, 50, 75])
    .map((v) => THREE.MathUtils.clamp(Number(v) || 25, 5, 100));
  const vel = THREE.MathUtils.clamp(Number(P.velocityMps) || 5920, 1000, 7000); // m/s
  const material = typeof P.material === "string" ? P.material : "Carbon steel";
  const stepW = THREE.MathUtils.clamp(Number(P.stepWidthMm) || 32, 24, 50);

  const blockLen = stepW * steps.length;
  const x0 = -blockLen / 2;
  const maxStep = Math.max(...steps);
  const thinIdx = steps.indexOf(Math.min(...steps));

  const stage = createStage(container, ctx, {
    camPos: [-30, maxStep * 2.4 + 70, blockLen * 1.45 + 60],
    camTarget: [0, maxStep * 0.42, 0],
    fov: 34,
  });
  const tasks = makeTaskTracker(config, ctx);

  // --- geometry -------------------------------------------------------------
  const grid = new THREE.GridHelper(560, 28, 0x1e66f5, 0x14305c);
  /** @type {THREE.Material} */ (grid.material).transparent = true;
  /** @type {THREE.Material} */ (grid.material).opacity = 0.33;
  grid.position.y = -0.01;
  stage.scene.add(grid);

  const depthZ = 46;
  for (let i = 0; i < steps.length; i++) {
    const h = steps[i];
    const geo = new THREE.BoxGeometry(stepW, h, depthZ);
    const mesh = new THREE.Mesh(geo, steelMat(0x76879f));
    mesh.position.set(x0 + stepW * (i + 0.5), h / 2, 0);
    stage.scene.add(mesh);
    const e = edgeLines(geo);
    e.position.copy(mesh.position);
    stage.scene.add(e);
  }

  // probe: body + wear face + couplant ring + sound column
  const probeR = 7;
  const probe = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(probeR, probeR, 16, 28), steelMat(0x232f44));
  body.position.y = 8 + 1.2;
  probe.add(body);
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(probeR + 0.35, probeR + 0.35, 2.6, 28),
    new THREE.MeshStandardMaterial({ color: 0x1e66f5, metalness: 0.3, roughness: 0.35, emissive: 0x1e66f5, emissiveIntensity: 0.45 }),
  );
  band.position.y = 13;
  probe.add(band);
  const face = new THREE.Mesh(new THREE.CylinderGeometry(probeR - 0.6, probeR - 0.6, 1.2, 28), new THREE.MeshStandardMaterial({ color: 0xb8442c, roughness: 0.6 }));
  face.position.y = 0.6;
  probe.add(face);
  const couplant = new THREE.Mesh(
    new THREE.CircleGeometry(probeR + 2.6, 30),
    new THREE.MeshBasicMaterial({ color: 0x5fe0ff, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false }),
  );
  couplant.rotation.x = -Math.PI / 2;
  couplant.position.y = 0.12;
  probe.add(couplant);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0x5fe0ff, transparent: true, opacity: 0.14, depthWrite: false });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 1, 14, 1, true), beamMat);
  probe.add(beam);
  const pulse = new THREE.Mesh(
    new THREE.TorusGeometry(2.9, 0.5, 8, 22),
    new THREE.MeshBasicMaterial({ color: 0x9fefff, transparent: true, opacity: 0.95, depthWrite: false }),
  );
  pulse.rotation.x = Math.PI / 2;
  probe.add(pulse);
  stage.scene.add(probe);

  // --- state ----------------------------------------------------------------
  let probeX = x0 + stepW * 0.5; // start on first step
  let lastMoveT = -1; // settled from t=0
  let curStep = 0, fullyOn = true;
  const recorded = new Set();

  function stepAt(/** @type {number} */ x) {
    const i = THREE.MathUtils.clamp(Math.floor((x - x0) / stepW), 0, steps.length - 1);
    const inset = Math.min(x - (x0 + stepW * i), x0 + stepW * (i + 1) - x);
    return { i, fullyOn: inset >= probeR + 0.8 };
  }

  function setProbeX(/** @type {number} */ x) {
    if (Math.abs(x - probeX) > 0.01) lastMoveT = stage.state.time;
    probeX = x;
  }
  attachXDrag(stage, { minX: x0 + probeR, maxX: x0 + blockLen - probeR, setX: setProbeX });

  // --- HUD -------------------------------------------------------------------
  addTitleChip(stage.hud, config.title || "Thickness gauging", "Drag the probe along the block. Record a reading on 3 different steps, then mark the thinnest one.");
  const range = Math.ceil((maxStep * 1.5) / 10) * 10; // mm of metal path shown
  const ascan = makeAScan(stage.hud, { title: "A-SCAN  ·  0° L-WAVE" });
  const usFull = (2 * range / 1000) / vel * 1e6; // µs across the screen
  ascan.footL.textContent = "0 µs";
  ascan.footR.textContent = `${usFull.toFixed(1)} µs  ·  0–${range} mm`;
  ascan.rightLbl.textContent = `${material} · ${vel} m/s`;

  const gauge = makeGaugePanel(stage.hud, "DIGITAL THICKNESS");

  const bar = glassPanel({ position: "absolute", left: "12px", bottom: "12px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", maxWidth: "70%" });
  const rec = makeButton("Record reading", onRecord, "record");
  const thin = makeButton("Mark thinnest", onThin, "thinnest");
  bar.appendChild(rec.btn);
  bar.appendChild(thin.btn);
  const chips = el("div", { display: "flex", gap: "6px", alignItems: "center" });
  chips.setAttribute("data-ut", "chips");
  bar.appendChild(chips);
  stage.hud.appendChild(bar);

  function flashMsg(/** @type {string} */ txt, /** @type {boolean} */ ok) {
    gauge.msg.textContent = txt;
    gauge.msg.style.color = ok ? COL.good : COL.bad;
  }

  function settled() {
    return fullyOn && (stage.state.time - lastMoveT) > 0.35;
  }

  function onRecord() {
    if (!settled()) { flashMsg("Hold the probe steady on one step", false); return; }
    if (recorded.has(curStep)) { flashMsg("Already recorded — try another step", false); return; }
    recorded.add(curStep);
    const chip = el("span", {
      background: "rgba(30,102,245,.25)", border: `1px solid ${COL.border}`, color: COL.text,
      borderRadius: "999px", padding: "3px 9px", fontSize: "10.5px", fontWeight: "700", fontVariantNumeric: "tabular-nums",
    }, `Step ${curStep + 1}: ${steps[curStep].toFixed(1)} mm`);
    chips.appendChild(chip);
    flashMsg(`Recorded ${steps[curStep].toFixed(1)} mm (${recorded.size}/3)`, true);
    if (recorded.size >= 3) tasks.complete("measure3");
  }

  function onThin() {
    if (!settled()) { flashMsg("Park the probe on the step you think is thinnest", false); return; }
    if (curStep === thinIdx) {
      flashMsg(`Correct — ${steps[thinIdx].toFixed(1)} mm is the minimum`, true);
      tasks.complete("identifyThinnest");
    } else {
      flashMsg("Echo says otherwise — compare the backwall positions", false);
    }
  }

  // --- frame loop -------------------------------------------------------------
  stage.onFrame((dt, t) => {
    const s = stepAt(probeX);
    curStep = s.i; fullyOn = s.fullyOn;
    const h = steps[curStep];
    probe.position.set(probeX, h, 0);
    // beam column probe face -> backwall
    beam.scale.y = h;
    beam.position.y = -h / 2;
    beam.visible = fullyOn;
    couplant.material.opacity = fullyOn ? (settled() ? 0.5 : 0.32) : 0.1;
    // pulse ring: round trip face->backwall->face (visual, slowed)
    if (!ctx.reducedMotion) {
      const period = Math.max(0.9, h / 38); // slower on thick steps
      const ph = (t % period) / period;
      const yy = ph < 0.5 ? ph * 2 : (1 - ph) * 2;
      pulse.position.y = -yy * h;
      pulse.visible = fullyOn;
      /** @type {THREE.MeshBasicMaterial} */ (pulse.material).opacity = 0.4 + 0.55 * (1 - yy);
    } else {
      pulse.visible = false;
    }

    // A-scan: backwall multiples at n·h while inside range
    const echoes = [];
    const ipFrac = 0.018; // screen offset of t0
    if (fullyOn) {
      let amp = 0.82;
      for (let m = 1; m <= 4; m++) {
        const d = h * m;
        if (d > range) break;
        echoes.push({ x: ipFrac + (d / range) * (1 - ipFrac), amp });
        amp *= 0.52;
      }
    } else {
      // bridging a step edge: poor coupling, two weak unstable echoes (honest)
      const j = Math.min(steps.length - 1, curStep + 1);
      const wob = 0.12 + 0.1 * Math.abs(Math.sin(t * 13));
      echoes.push({ x: ipFrac + (steps[curStep] / range) * (1 - ipFrac), amp: wob });
      if (j !== curStep) echoes.push({ x: ipFrac + (steps[j] / range) * (1 - ipFrac), amp: wob * 0.8 });
    }
    ascan.draw(echoes, { noise: fullyOn ? 0.012 : 0.05 });

    // readouts
    if (settled()) {
      gauge.big.textContent = `${h.toFixed(1)} mm`;
      gauge.big.style.color = COL.cyan;
    } else {
      gauge.big.textContent = "--.- mm";
      gauge.big.style.color = COL.dim;
    }
    gauge.sub.textContent = `index ${probeX.toFixed(1)} mm · step ${curStep + 1}/${steps.length}${fullyOn ? "" : " · edge!"}`;
    rec.setEnabled(settled() && !recorded.has(curStep));
    thin.setEnabled(settled());
  });

  return { dispose: stage.dispose };
}

// ============================================================================
// MODE 2 — "angle-flaw": angle-beam wedge, hidden SDHs, first-leg gate
// ============================================================================
/**
 * @param {HTMLElement} container @param {TrainerConfig} config @param {TrainerCtx} ctx
 * @returns {TrainerHandle}
 */
function mountAngleFlaw(container, config, ctx) {
  const P = config.params || {};
  const T = THREE.MathUtils.clamp(Number(P.plateThicknessMm) || 25, 15, 40);
  const angOpts = [45, 60, 70];
  const theta = angOpts.includes(Number(P.refractedAngleDeg)) ? Number(P.refractedAngleDeg) : 60;
  const thetaR = THREE.MathUtils.degToRad(theta);
  const tanT = Math.tan(thetaR), cosT = Math.cos(thetaR);
  const scanLen = THREE.MathUtils.clamp(Number(P.scanLengthMm) || 200, 140, 260);
  const vShear = THREE.MathUtils.clamp(Number(P.shearVelocityMps) || 3230, 2000, 4000);
  const flawCount = THREE.MathUtils.clamp(Math.round(Number(P.flawCount) || 2), 2, 3);
  const defDepths = [10, 18, 14];
  const depths = (Array.isArray(P.depthsMm) ? P.depthsMm : defDepths)
    .slice(0, flawCount)
    .map((d, i) => THREE.MathUtils.clamp(Number(d) || defDepths[i % 3], 5, T - 5));
  while (depths.length < flawCount) depths.push(defDepths[depths.length % 3]);
  // Hole x positions: explicit param or auto-spread so 1st-leg peaks are well separated.
  /** @type {number[]} */
  let flawXs;
  if (Array.isArray(P.flawXsMm) && P.flawXsMm.length >= flawCount) {
    flawXs = P.flawXsMm.slice(0, flawCount).map((x) => THREE.MathUtils.clamp(Number(x) || 0, -scanLen / 2 + 20, scanLen / 2 - 20));
  } else {
    const f0 = -0.30, f1 = 0.20; // peak-position fractions of scanLen
    flawXs = depths.map((d, i) => {
      const frac = flawCount === 1 ? 0 : f0 + (i * (f1 - f0)) / (flawCount - 1);
      return THREE.MathUtils.clamp(frac * scanLen + d * tanT, -scanLen / 2 + 20, scanLen / 2 - 20);
    });
  }
  // 1st-leg peak index positions + sound paths.
  const peaks = flawXs.map((fx, i) => fx - depths[i] * tanT);
  const paths = depths.map((d) => d / cosT);
  const sMin = Math.min(...paths);
  const peakAmp = paths.map((s) => THREE.MathUtils.clamp(0.95 * Math.pow(sMin / s, 0.7), 0.5, 0.95));
  const SIGMA = 3.5; // mm, beam-spread envelope of echo vs index offset

  const stage = createStage(container, ctx, {
    camPos: [-40, 150, scanLen * 1.1 + 60],
    camTarget: [0, -4, 0],
    fov: 34,
  });
  const tasks = makeTaskTracker(config, ctx);

  // --- geometry --------------------------------------------------------------
  const grid = new THREE.GridHelper(640, 32, 0x1e66f5, 0x14305c);
  /** @type {THREE.Material} */ (grid.material).transparent = true;
  /** @type {THREE.Material} */ (grid.material).opacity = 0.3;
  grid.position.y = -T - 0.05;
  stage.scene.add(grid);

  const depthZ = 64;
  const plateGeo = new THREE.BoxGeometry(scanLen + 24, T, depthZ);
  const plate = new THREE.Mesh(plateGeo, steelMat(0x6f8098));
  plate.position.set(0, -T / 2, 0);
  stage.scene.add(plate);
  const pe = edgeLines(plateGeo);
  pe.position.copy(plate.position);
  stage.scene.add(pe);

  // weld cap ridge along z on the far +x side (beam shoots toward it)
  const weldX = scanLen / 2 - 8;
  const weld = new THREE.Mesh(
    new THREE.CylinderGeometry(5.5, 5.5, depthZ, 18, 1, false, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x55657e, metalness: 0.5, roughness: 0.6 }),
  );
  weld.rotation.x = Math.PI / 2;
  weld.rotation.y = Math.PI / 2;
  weld.scale.y = 1; weld.scale.x = 1.6;
  weld.position.set(weldX, 0, 0);
  stage.scene.add(weld);

  // hidden SDHs: invisible until found; faint end circles on the front face (real blocks show hole ends)
  /** @type {THREE.Mesh[]} */
  const flawMeshes = [];
  for (let i = 0; i < flawCount; i++) {
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, depthZ - 4, 16),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x16a34a, emissiveIntensity: 0.9, roughness: 0.4, transparent: true, opacity: 0.95, depthTest: false }),
    );
    cyl.renderOrder = 9;
    cyl.rotation.x = Math.PI / 2;
    cyl.position.set(flawXs[i], -depths[i], 0);
    cyl.visible = false;
    stage.scene.add(cyl);
    flawMeshes.push(cyl);
    const end = new THREE.Mesh(
      new THREE.CircleGeometry(1.6, 14),
      new THREE.MeshBasicMaterial({ color: 0x0a1626, transparent: true, opacity: 0.55 }),
    );
    end.position.set(flawXs[i], -depths[i], depthZ / 2 + 0.06);
    stage.scene.add(end);
  }

  // scan line on top surface
  {
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-scanLen / 2 + 12, 0.06, 0),
      new THREE.Vector3(scanLen / 2 - 12, 0.06, 0),
    ]);
    const scanLine = new THREE.Line(lineGeo, new THREE.LineDashedMaterial({ color: 0x5fe0ff, transparent: true, opacity: 0.4, dashSize: 4, gapSize: 3 }));
    scanLine.computeLineDistances();
    stage.scene.add(scanLine);
  }

  // wedge + transducer
  const wedge = new THREE.Group();
  {
    // wedge body: box with sloped top (use Shape extrude for the classic wedge silhouette)
    const sh = new THREE.Shape();
    sh.moveTo(-12, 0); sh.lineTo(12, 0); sh.lineTo(12, 4); sh.lineTo(-4, 13); sh.lineTo(-12, 13); sh.closePath();
    const wgeo = new THREE.ExtrudeGeometry(sh, { depth: 16, bevelEnabled: false });
    wgeo.translate(0, 0, -8);
    const wmesh = new THREE.Mesh(wgeo, new THREE.MeshStandardMaterial({ color: 0xc2502e, roughness: 0.45, metalness: 0.05 }));
    wedge.add(wmesh);
    const probeCyl = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 11, 24), steelMat(0x232f44));
    // sits on the slope, tilted toward +x
    probeCyl.position.set(-7.2, 14.5, 0);
    probeCyl.rotation.z = -0.55;
    wedge.add(probeCyl);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(5.7, 5.7, 1.6, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e66f5, emissive: 0x1e66f5, emissiveIntensity: 0.5 }),
    );
    cap.position.set(-9.3, 17.8, 0);
    cap.rotation.z = -0.55;
    wedge.add(cap);
    // index-point tick on wedge flank
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.8, 0.4), new THREE.MeshBasicMaterial({ color: 0x5fe0ff }));
    tick.position.set(0, 1.4, 8.3);
    wedge.add(tick);
  }
  stage.scene.add(wedge);

  // beam V-path: leg 1 bright, leg 2 faint (gate is 1st leg)
  // Beam legs as thin glowing rods (depthTest:false so the schematic V-path
  // reads through the plate). Unit cylinders, posed each frame.
  const UP = new THREE.Vector3(0, 1, 0);
  function makeLeg(/** @type {number} */ radius, /** @type {number} */ opacity) {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, 1, 10, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x5fe0ff, transparent: true, opacity, depthTest: false, side: THREE.DoubleSide }),
    );
    m.renderOrder = 10;
    stage.scene.add(m);
    return m;
  }
  const leg1 = makeLeg(0.55, 0.75);
  const leg2 = makeLeg(0.4, 0.2);
  /** Pose a rod between two points. @param {THREE.Mesh} rod @param {THREE.Vector3} a @param {THREE.Vector3} b */
  function poseLeg(rod, a, b) {
    const dir = b.clone().sub(a);
    const len = dir.length();
    rod.scale.set(1, Math.max(0.001, len), 1);
    rod.position.copy(a).addScaledVector(dir, 0.5);
    rod.quaternion.setFromUnitVectors(UP, dir.normalize());
  }
  const pulseDot = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 10), new THREE.MeshBasicMaterial({ color: 0x9fefff, depthTest: false, transparent: true }));
  pulseDot.renderOrder = 11;
  stage.scene.add(pulseDot);

  // --- state -------------------------------------------------------------------
  const xMin = -scanLen / 2 + 12, xMax = scanLen / 2 - 12;
  let wedgeX = xMin + 4;
  const found = /** @type {Set<number>} */ (new Set());
  attachXDrag(stage, { minX: xMin, maxX: xMax, setX: (x) => { wedgeX = x; } });

  // --- HUD ----------------------------------------------------------------------
  addTitleChip(stage.hud, config.title || "Angle-beam flaw location",
    `Slide the ${theta}° wedge along the scan line. When a hole echo peaks on the A-scan, press Mark (±4 mm).`);
  const sRange = (T / cosT) * 1.3; // shown sound path, gated to 1st leg
  const ascan = makeAScan(stage.hud, { title: `A-SCAN · ${theta}° SHEAR` });
  ascan.rightLbl.textContent = `gate: 1st leg · ${vShear} m/s`;
  const usFull = (2 * sRange / 1000) / vShear * 1e6;
  ascan.footL.textContent = "0 µs";
  ascan.footR.textContent = `${usFull.toFixed(1)} µs · sound path 0–${sRange.toFixed(0)} mm`;

  const gauge = makeGaugePanel(stage.hud, "GATE A · ECHO HEIGHT");
  gauge.big.textContent = "0 %FSH";

  const bar = glassPanel({ position: "absolute", left: "12px", bottom: "12px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", maxWidth: "72%" });
  const mark = makeButton("Mark flaw", onMark, "mark");
  bar.appendChild(mark.btn);
  const chips = el("div", { display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" });
  chips.setAttribute("data-ut", "chips");
  bar.appendChild(chips);
  stage.hud.appendChild(bar);

  function echoAt(/** @type {number} */ x) {
    let best = { amp: 0, i: -1 };
    for (let i = 0; i < flawCount; i++) {
      const d = x - peaks[i];
      const amp = peakAmp[i] * Math.exp(-0.5 * (d / SIGMA) * (d / SIGMA));
      if (amp > best.amp) best = { amp, i };
    }
    return best;
  }

  function onMark() {
    const e = echoAt(wedgeX);
    const i = e.i;
    if (i < 0 || e.amp < 0.25 || Math.abs(wedgeX - peaks[i]) > 4) {
      gauge.msg.textContent = "No peaked echo here — maximise the signal first";
      gauge.msg.style.color = COL.bad;
      return;
    }
    if (found.has(i)) {
      gauge.msg.textContent = "Already logged this hole — keep scanning";
      gauge.msg.style.color = COL.bad;
      return;
    }
    found.add(i);
    flawMeshes[i].visible = true;
    const chip = el("span", {
      background: "rgba(74,222,128,.16)", border: "1px solid rgba(74,222,128,.45)", color: "#bdf5cf",
      borderRadius: "999px", padding: "3px 9px", fontSize: "10.5px", fontWeight: "700", fontVariantNumeric: "tabular-nums",
    }, `Flaw ${found.size}: depth ${depths[i].toFixed(1)} mm · path ${paths[i].toFixed(1)} mm`);
    chips.appendChild(chip);
    gauge.msg.textContent = `Hole logged at depth ${depths[i].toFixed(1)} mm (${found.size}/${flawCount})`;
    gauge.msg.style.color = COL.good;
    tasks.complete(`findFlaw${found.size}`);
  }

  // --- frame loop -------------------------------------------------------------
  stage.onFrame((dt, t) => {
    wedge.position.set(wedgeX, 0, 0);
    // V-path from index point
    const bounceX = wedgeX + T * tanT;
    const exitX = wedgeX + 2 * T * tanT;
    const endX = Math.min(exitX, scanLen / 2 + 12);
    const endY = endX === exitX ? 0 : -T + (endX - bounceX) / tanT;
    poseLeg(leg1, new THREE.Vector3(wedgeX, 0, 0), new THREE.Vector3(bounceX, -T, 0));
    poseLeg(leg2, new THREE.Vector3(bounceX, -T, 0), new THREE.Vector3(endX, endY, 0));
    if (!ctx.reducedMotion) {
      const ph = (t % 1.1) / 1.1;
      pulseDot.visible = true;
      pulseDot.position.set(wedgeX + ph * T * tanT, -ph * T, 0);
    } else {
      pulseDot.visible = false;
    }

    const e = echoAt(wedgeX);
    const echoes = [];
    if (e.i >= 0 && e.amp > 0.02) {
      const s = paths[e.i];
      echoes.push({ x: 0.018 + (s / sRange) * (1 - 0.018), amp: e.amp });
    }
    ascan.draw(echoes, { noise: 0.016 });

    gauge.big.textContent = `${Math.round(e.amp * 100)} %FSH`;
    gauge.big.style.color = e.amp > 0.5 ? COL.cyan : COL.dim;
    gauge.sub.textContent = `index ${wedgeX.toFixed(1)} mm · found ${found.size}/${flawCount}`;
    mark.setEnabled(true);
  });

  return { dispose: stage.dispose };
}

// ============================================================================
// MODE 3 — "wave-basics": λ = v/f in a transparent slab, three real materials
// ============================================================================
const WAVE_MATS = /** @type {Record<string, {label:string, v:number, color:number, opacity:number}>} */ ({
  steel:    { label: "Steel",     v: 5920, color: 0x2a4569, opacity: 0.30 },
  aluminum: { label: "Aluminium", v: 6320, color: 0x3d5d7e, opacity: 0.26 },
  water:    { label: "Water",     v: 1480, color: 0x1d4e8f, opacity: 0.36 },
});
const SLOW = 150000; // uniform time dilation for the wavefront animation

/**
 * @param {HTMLElement} container @param {TrainerConfig} config @param {TrainerCtx} ctx
 * @returns {TrainerHandle}
 */
function mountWaveBasics(container, config, ctx) {
  const P = config.params || {};
  const offered = (Array.isArray(P.materials) ? P.materials : ["steel", "aluminum", "water"])
    .filter((m) => typeof m === "string" && WAVE_MATS[m]);
  const mats = offered.length >= 2 ? offered : ["steel", "aluminum", "water"];
  let matId = typeof P.startMaterial === "string" && mats.includes(P.startMaterial) ? P.startMaterial : mats[0];
  let freq = THREE.MathUtils.clamp(Number(P.frequencyMHz) || 2, 1, 10); // MHz
  const probeD = THREE.MathUtils.clamp(Number(P.probeDiameterMm) || 10, 6, 25); // mm

  const H = 72, SW = 84, SD = 52; // slab dims (mm)
  const stage = createStage(container, ctx, {
    camPos: [95, 55, 150],
    camTarget: [0, -H * 0.42, 0],
    fov: 36,
    orbitAmpDeg: 7,
  });
  const tasks = makeTaskTracker(config, ctx);

  // --- geometry --------------------------------------------------------------
  const grid = new THREE.GridHelper(480, 24, 0x1e66f5, 0x14305c);
  /** @type {THREE.Material} */ (grid.material).transparent = true;
  /** @type {THREE.Material} */ (grid.material).opacity = 0.3;
  grid.position.y = -H - 0.05;
  stage.scene.add(grid);

  const slabGeo = new THREE.BoxGeometry(SW, H, SD);
  const slabMat = new THREE.MeshStandardMaterial({
    color: WAVE_MATS[matId].color, transparent: true, opacity: WAVE_MATS[matId].opacity,
    roughness: 0.25, metalness: 0.1, depthWrite: false, side: THREE.DoubleSide,
  });
  const slab = new THREE.Mesh(slabGeo, slabMat);
  slab.position.y = -H / 2;
  stage.scene.add(slab);
  const se = edgeLines(slabGeo);
  se.position.copy(slab.position);
  stage.scene.add(se);

  // probe on top
  const probe = new THREE.Group();
  const pBody = new THREE.Mesh(new THREE.CylinderGeometry(probeD / 2 + 1, probeD / 2 + 1, 15, 28), steelMat(0x232f44));
  pBody.position.y = 8.7;
  probe.add(pBody);
  const pFace = new THREE.Mesh(
    new THREE.CylinderGeometry(probeD / 2, probeD / 2, 2.2, 28),
    new THREE.MeshStandardMaterial({ color: 0x1e66f5, emissive: 0x1e66f5, emissiveIntensity: 0.4 }),
  );
  pFace.position.y = 1.1;
  probe.add(pFace);
  stage.scene.add(probe);

  // wavefront crest discs (a real pulse is a short packet of cycles)
  const NC = 5;
  const ENV = [0.5, 0.82, 1, 0.82, 0.5];
  /** @type {THREE.Mesh[]} */
  const crests = [];
  for (let k = 0; k < NC; k++) {
    const c = new THREE.Mesh(
      new THREE.CircleGeometry(1, 44),
      new THREE.MeshBasicMaterial({ color: 0x5fe0ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
    );
    c.rotation.x = -Math.PI / 2;
    stage.scene.add(c);
    crests.push(c);
  }

  // beam envelope guide: columnar to the near field N, then diverging at the
  // far-field half-angle γ = asin(1.22·λ/D). Rebuilt on parameter change only.
  const envMat = new THREE.MeshBasicMaterial({ color: 0x5fe0ff, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false });
  const nfMat = new THREE.MeshBasicMaterial({ color: 0x9fefff, transparent: true, opacity: 0.5, depthWrite: false });
  /** @type {THREE.Mesh|null} */ let envMesh = null;
  /** @type {THREE.Mesh|null} */ let nfRing = null;
  function rebuildEnvelope() {
    const v = WAVE_MATS[matId].v;
    const lambda = v / (freq * 1000);
    const nf = (probeD * probeD) / (4 * lambda);
    const gamma = Math.asin(Math.min(0.98, (1.22 * lambda) / probeD));
    const a = probeD / 2;
    const rEnd = Math.min(26, a + Math.max(0, H - nf) * Math.tan(gamma));
    const pts = [new THREE.Vector2(a, 0)];
    if (nf < H) pts.push(new THREE.Vector2(a, -nf));
    pts.push(new THREE.Vector2(rEnd, -H));
    const geo = new THREE.LatheGeometry(pts, 40);
    if (envMesh) { envMesh.geometry.dispose(); envMesh.geometry = geo; }
    else { envMesh = new THREE.Mesh(geo, envMat); stage.scene.add(envMesh); }
    const ringGeo = new THREE.TorusGeometry(a + 0.8, 0.28, 8, 36);
    if (nfRing) { nfRing.geometry.dispose(); nfRing.geometry = ringGeo; }
    else { nfRing = new THREE.Mesh(ringGeo, nfMat); nfRing.rotation.x = Math.PI / 2; stage.scene.add(nfRing); }
    nfRing.position.y = -Math.min(nf, H);
    nfRing.visible = nf < H; // near-field end marker (hint), only when inside the slab
  }
  rebuildEnvelope();

  // --- HUD ---------------------------------------------------------------------
  addTitleChip(stage.hud, config.title || "Wave basics", "λ = v / f.  Tune frequency, switch materials, and watch the pulse spacing and speed change.");

  const read = glassPanel({ position: "absolute", right: "12px", top: "12px", width: "224px", padding: "10px 12px" });
  read.appendChild(el("div", { fontWeight: "800", fontSize: "10.5px", color: COL.cyan, letterSpacing: ".08em", marginBottom: "4px" }, "WAVELENGTH  λ = v / f"));
  const lam = el("div", { fontWeight: "800", fontSize: "27px", color: COL.text, fontVariantNumeric: "tabular-nums", lineHeight: "1.1" }, "");
  lam.setAttribute("data-ut", "lambda");
  read.appendChild(lam);
  const rows = el("div", { marginTop: "7px", display: "grid", gridTemplateColumns: "auto 1fr", gap: "3px 10px", fontSize: "11px", color: COL.dim, fontVariantNumeric: "tabular-nums" });
  const mkRow = (/** @type {string} */ k, /** @type {string} */ dataId) => {
    rows.appendChild(el("span", {}, k));
    const v = el("span", { color: COL.text, fontWeight: "700", textAlign: "right" }, "");
    if (dataId) v.setAttribute("data-ut", dataId);
    rows.appendChild(v);
    return v;
  };
  const velRow = mkRow("velocity v", "vel");
  const freqRow = mkRow("frequency f", "freqout");
  const nfRow = mkRow("near field N", "nearfield");
  read.appendChild(rows);
  read.appendChild(el("div", { marginTop: "7px", fontSize: "10px", color: COL.dim }, `animation slowed ×${SLOW.toLocaleString()} — relative speeds are true`));
  const msg = el("div", { marginTop: "5px", fontSize: "11px", fontWeight: "600", minHeight: "14px", color: COL.dim }, "");
  msg.setAttribute("data-ut", "msg");
  read.appendChild(msg);
  stage.hud.appendChild(read);

  const bar = glassPanel({ position: "absolute", left: "12px", bottom: "12px", display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", maxWidth: "82%" });
  const slider = makeSlider("FREQUENCY", 1, 10, 0.1, freq, (v) => `${v.toFixed(1)} MHz`, (v) => { freq = v; rebuildEnvelope(); }, "freq");
  bar.appendChild(slider.root);
  const matWrap = el("div", { display: "flex", gap: "6px", alignItems: "center" });
  matWrap.appendChild(el("span", { color: COL.dim, fontSize: "11px", fontWeight: "600" }, "MATERIAL"));
  /** @type {Record<string, HTMLButtonElement>} */
  const matBtns = {};
  for (const m of mats) {
    const { btn } = makeButton(WAVE_MATS[m].label, () => setMaterial(m), `mat-${m}`);
    btn.style.padding = "6px 11px";
    matWrap.appendChild(btn);
    matBtns[m] = btn;
  }
  bar.appendChild(matWrap);
  stage.hud.appendChild(bar);

  function styleMatBtns() {
    for (const m of mats) {
      const sel = m === matId;
      matBtns[m].style.background = sel ? `linear-gradient(180deg, ${COL.blue}, #1850c4)` : "rgba(120,170,255,.10)";
      matBtns[m].style.boxShadow = sel ? "0 2px 10px rgba(30,102,245,.4)" : "none";
      matBtns[m].style.border = sel ? "1px solid rgba(150,200,255,.6)" : `1px solid ${COL.border}`;
    }
  }
  styleMatBtns();

  // --- tasks state ---------------------------------------------------------------
  const visited = /** @type {Set<string>} */ (new Set());
  let matSince = stage.state.time;
  let lambdaSince = -1;

  function setMaterial(/** @type {string} */ m) {
    if (m === matId) return;
    matId = m;
    matSince = stage.state.time;
    slabMat.color.setHex(WAVE_MATS[m].color);
    slabMat.opacity = WAVE_MATS[m].opacity;
    rebuildEnvelope();
    styleMatBtns();
  }

  // --- frame loop ------------------------------------------------------------------
  stage.onFrame((dt, t) => {
    const v = WAVE_MATS[matId].v;          // m/s
    const lambda = v / (freq * 1000);      // mm  (v[m/s] / f[MHz·1e6] · 1e3)
    const nf = (probeD * probeD) / (4 * lambda); // mm
    const vVis = (v * 1000) / SLOW;        // mm/s on screen

    lam.textContent = `${lambda.toFixed(2)} mm`;
    lam.style.color = lambda < 1 ? COL.cyan : COL.text;
    velRow.textContent = `${v} m/s`;
    freqRow.textContent = `${freq.toFixed(1)} MHz`;
    nfRow.textContent = `${nf.toFixed(1)} mm`;

    // pulse packet
    const packetLen = (NC - 1) * lambda;
    const cycle = (H + packetLen + 8) / vVis;
    const head = ctx.reducedMotion ? H * 0.55 : ((t % cycle) / cycle) * (H + packetLen + 8);
    const gamma = Math.asin(Math.min(0.98, (1.22 * lambda) / probeD)); // far-field divergence (first null)
    for (let k = 0; k < NC; k++) {
      const z = head - k * lambda;
      const c = crests[k];
      if (z <= 0.2 || z >= H) { /** @type {THREE.MeshBasicMaterial} */ (c.material).opacity = 0; continue; }
      const r = Math.min(26, probeD / 2 + Math.max(0, z - nf) * Math.tan(gamma));
      c.scale.setScalar(Math.max(0.6, r));
      c.position.set(0, -z, 0);
      const fadeIn = Math.min(1, z / 4);
      const decay = 1 - 0.4 * (z / H); // mild attenuation with travel (visual)
      /** @type {THREE.MeshBasicMaterial} */ (c.material).opacity = 0.62 * ENV[k] * fadeIn * decay;
    }
    // probe face flash on re-fire
    /** @type {THREE.MeshStandardMaterial} */ (pFace.material).emissiveIntensity =
      ctx.reducedMotion ? 0.4 : 0.35 + 0.8 * Math.max(0, 1 - (head / Math.max(lambda * 2, 4)));

    // task: λ < 1 mm in steel, sustained 0.5 s
    if (matId === "steel" && lambda < 1) {
      if (lambdaSince < 0) lambdaSince = t;
      if (t - lambdaSince > 0.5 && !tasks.isDone("setLambdaUnder1mm")) {
        tasks.complete("setLambdaUnder1mm");
        msg.textContent = `λ = ${lambda.toFixed(2)} mm in steel — sub-millimetre resolution`;
        msg.style.color = COL.good;
      }
    } else {
      lambdaSince = -1;
    }
    // task: dwell ≥0.4 s on each offered material while the pulse runs
    if (t - matSince > 0.4 && !visited.has(matId)) {
      visited.add(matId);
      if (!tasks.isDone("compareMaterials")) {
        msg.textContent = `Observed ${visited.size}/${mats.length} materials`;
        msg.style.color = visited.size === mats.length ? COL.good : COL.dim;
      }
      if (visited.size === mats.length) tasks.complete("compareMaterials");
    }
  });

  return { dispose: stage.dispose };
}

// ============================================================================
// mount dispatcher
// ============================================================================
/** @type {import("../contract").TrainerMount} */
export default function mount(container, config, ctx) {
  const mode = config && config.mode;
  if (mode === "thickness") return mountThickness(container, config, ctx);
  if (mode === "angle-flaw") return mountAngleFlaw(container, config, ctx);
  if (mode === "wave-basics") return mountWaveBasics(container, config, ctx);
  // Defensive: unknown mode — render an inline notice, return a no-op handle.
  const note = el("div", {
    display: "flex", alignItems: "center", justifyContent: "center", height: "100%",
    color: COL.dim, fontFamily: FONT, fontSize: "14px",
  }, `UT trainer: unknown mode "${String(mode)}"`);
  container.appendChild(note);
  return { dispose() { note.remove(); } };
}
