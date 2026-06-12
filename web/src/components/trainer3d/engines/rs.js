// @ts-nocheck — plain-JS engine, functionally validated via harness (see media-build/trainer-harness)
/**
 * rs.js — Radiation Safety method trainer (NDTAcademy trainer3d engine).
 *
 * Implements the TrainerMount contract (see ../contract.ts):
 *   export default mount(container, config, ctx) -> { dispose() }
 *   export const MANIFEST
 *
 * Modes:
 *   "tds"    — Time / Distance / Shielding bay. A gamma source sits on a stand;
 *              the student drags a worker marker (dose-rate meter obeys the
 *              inverse-square law), stacks shielding slabs (each = 1 half-value
 *              layer, halving the rate), and plans an exposure time so the
 *              accumulated dose stays under the job limit.
 *   "survey" — Radiation boundary survey. The student walks a survey meter to
 *              3 marked stakes on a rope boundary and records each reading
 *              (the Record button accepts only once the reading is stable).
 *              One stake reads over the posting limit; the student drags that
 *              stake outward along its radial until the rate there equals the
 *              limit.
 *
 * Physics (simplified but honest):
 *   - Point-source gamma dose rate:  rate(mR/h) = Γ·A·1000 / d²
 *     with Γ in R·m²/(Ci·h) (Ir-192 0.48, Co-60 1.32, Cs-137 0.33),
 *     A in Ci, d in metres (detector at chest height, 1 m).
 *   - Shielding: n stacked slabs of 1 HVL each => transmission 2^-n.
 *     (Slab thickness drawn exaggerated for visibility; the true HVL in lead is
 *     stated on the HUD. Buildup neglected — stated on the HUD.)
 *   - Dose: for gamma, 1 mR exposure ≈ 1 mrem deep dose, so
 *     dose(mrem) = rate(mR/h) × time(h).
 *   - Survey mode models the source inside a shielded exposure device:
 *     effective output = Γ·A·1000 × deviceFactor at 1 m, inverse-square beyond.
 *
 * Plain ESM JavaScript with JSDoc. No DOM assumptions beyond `container`.
 */

import * as THREE from "three";

/** @typedef {import("../contract").TrainerConfig} TrainerConfig */
/** @typedef {import("../contract").TrainerCtx} TrainerCtx */
/** @typedef {import("../contract").TrainerHandle} TrainerHandle */

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------

export const MANIFEST = {
  engine: "rs",
  modes: {
    tds: {
      description:
        "Time–Distance–Shielding bay. Gamma source on a stand; drag the worker marker (meter follows the inverse-square law), stack 1-HVL shielding slabs (each halves the rate), and set the exposure-time slider so the planned dose stays under the limit. Rate = Γ·Ci·1000/d² × 2^-slabs (mR/h); dose(mrem) = rate × hours. Tasks: distanceHalf (with zero slabs, double your start distance so the rate falls 4×), shieldToLimit (stack HVL slabs until the fixed boundary post reads under boundaryLimit), planExposure (set the time slider so planned dose ≤ doseLimit with time ≥ minWorkMin).",
      params: {
        curies: "Source activity in curies. Number, range 1–200, default 30.",
        isotope:
          'Gamma source isotope: "Ir-192" | "Co-60" | "Cs-137". Sets gamma constant Γ (0.48 / 1.32 / 0.33 R·m²·Ci⁻¹·h⁻¹) and the lead HVL shown on the HUD (4.8 / 12.5 / 6.5 mm). Default "Ir-192".',
        boundaryLimit:
          "Dose-rate limit in mR/h at the fixed boundary post (bay door, ≈12.9 m from the source; the HUD shows the exact distance). Number, range 0.5–20, default 2.",
        doseLimit:
          "Planned-job dose limit in mrem for the planExposure task. Number, range 2–500, default 20.",
        minWorkMin:
          "Minimum job duration in minutes the exposure plan must cover (planExposure needs time ≥ this AND dose ≤ doseLimit). Number, range 1–60, default 10.",
      },
      taskIds: ["distanceHalf", "shieldToLimit", "planExposure"],
    },
    survey: {
      description:
        "Boundary survey around a shielded exposure device. Drag the survey meter to stakes A, B, C on the rope boundary; hold still until the reading stabilises, then press Record (button only accepts a stable reading). Stake B reads over the limit: drag it outward along its radial until the rate there equals the posting limit, then release. Rate = Γ·Ci·1000·deviceFactor/d² (mR/h). Tasks: surveyAll (record all 3 points), postBoundary (release stake B where rate is within −15 %/+5 % of limit).",
      params: {
        curies: "Source activity in curies inside the device. Number, range 1–200, default 30.",
        isotope: '"Ir-192" | "Co-60" | "Cs-137" (sets Γ as in tds). Default "Ir-192".',
        deviceFactor:
          "Fraction of bare-source output escaping the shielded exposure device (models device shielding so a realistic boundary fits in the yard). Number, range 0.0005–0.1, default 0.01.",
        limit:
          "Posted-boundary dose-rate limit in mR/h. The fix is accepted when the rate at stake B is within −15 %/+5 % of this. Number, range 0.5–20, default 2.",
      },
      taskIds: ["surveyAll", "postBoundary"],
    },
  },
};

// ---------------------------------------------------------------------------
// Constants + small helpers
// ---------------------------------------------------------------------------

/** Exposure-rate constants Γ in R·m²/(Ci·h) and lead HVLs (mm). */
const ISOTOPES = {
  "Ir-192": { gamma: 0.48, hvlPbMm: 4.8 },
  "Co-60": { gamma: 1.32, hvlPbMm: 12.5 },
  "Cs-137": { gamma: 0.33, hvlPbMm: 6.5 },
};

const COL = {
  bgDeep: 0x081427,
  cyan: 0x5fe0ff,
  cyanCss: "#5fe0ff",
  blueCss: "#1E66F5",
  ink: "#dfe9ff",
  dim: "rgba(202,222,255,.62)",
  panelBg: "rgba(120,170,255,.07)",
  panelBorder: "1px solid rgba(150,200,255,.22)",
  ok: "#4ee397",
  warn: "#ffb454",
  bad: "#ff6473",
};

const FONT = '"Manrope", system-ui, -apple-system, "Segoe UI", sans-serif';

function clampNum(v, lo, hi, dflt) {
  const n = Number(v);
  if (!Number.isFinite(n)) return dflt;
  return Math.min(hi, Math.max(lo, n));
}

/** Create a styled DOM element. */
function el(parent, tag, css, html) {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (html !== undefined) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}

function fmtRate(mRh) {
  if (!Number.isFinite(mRh)) return "—";
  if (mRh >= 1000) return (mRh / 1000).toFixed(2) + " R/h";
  if (mRh >= 100) return mRh.toFixed(0) + " mR/h";
  if (mRh >= 10) return mRh.toFixed(1) + " mR/h";
  return mRh.toFixed(2) + " mR/h";
}

/** Canvas-texture text sprite (labels in the 3-D scene). */
function makeTextSprite(text, opts) {
  const o = Object.assign({ size: 44, color: "#bfe0ff", bg: null, pad: 16, worldH: 0.5 }, opts || {});
  const cv = document.createElement("canvas");
  let c = cv.getContext("2d");
  c.font = `700 ${o.size}px ${FONT}`;
  const w = Math.ceil(c.measureText(text).width) + o.pad * 2;
  const h = o.size + o.pad * 2;
  cv.width = w;
  cv.height = h;
  c = cv.getContext("2d");
  if (o.bg) {
    c.fillStyle = o.bg;
    c.beginPath();
    if (c.roundRect) c.roundRect(1, 1, w - 2, h - 2, 12);
    else c.rect(1, 1, w - 2, h - 2);
    c.fill();
  }
  c.font = `700 ${o.size}px ${FONT}`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = o.color;
  c.fillText(text, w / 2, h / 2 + 1);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set((o.worldH * w) / h, o.worldH, 1);
  return sp;
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

/**
 * @param {HTMLElement} container
 * @param {TrainerConfig} config
 * @param {TrainerCtx} ctx
 * @returns {TrainerHandle}
 */
export default function mount(container, config, ctx) {
  const mode = config && config.mode === "survey" ? "survey" : "tds";
  const P = (config && config.params) || {};

  const isotope = ISOTOPES[P.isotope] ? String(P.isotope) : "Ir-192";
  const iso = ISOTOPES[isotope];
  const curies = clampNum(P.curies, 1, 200, 30);
  /** Bare-source output at 1 m in mR/h. */
  const bareOut1m = iso.gamma * curies * 1000;

  // tds params
  const boundaryLimit = clampNum(P.boundaryLimit, 0.5, 20, 2);
  const doseLimit = clampNum(P.doseLimit, 2, 500, 20);
  const minWorkMin = clampNum(P.minWorkMin, 1, 60, 10);
  // survey params
  const deviceFactor = clampNum(P.deviceFactor, 0.0005, 0.1, 0.01);
  const surveyLimit = clampNum(P.limit, 0.5, 20, 2);
  const surveyOut1m = bareOut1m * deviceFactor;

  // --- task plumbing --------------------------------------------------------
  const tasks = Array.isArray(config && config.tasks) ? config.tasks : [];
  const wantedIds = tasks.map((t) => t.id);
  const done = new Set();
  let allFired = false;
  let disposed = false;

  function award(id) {
    if (disposed || done.has(id)) return;
    done.add(id);
    try {
      ctx.onTaskDone(id);
    } catch (e) {
      /* player error must not kill the engine */
    }
    if (!allFired && wantedIds.length && wantedIds.every((w) => done.has(w))) {
      allFired = true;
      try {
        if (ctx.onAllDone) ctx.onAllDone();
      } catch (e) {
        /* noop */
      }
    }
    refreshChips();
  }

  // --- DOM scaffold ----------------------------------------------------------
  const prevPosition = container.style.position;
  if (getComputedStyle(container).position === "static") container.style.position = "relative";

  const root = el(
    container,
    "div",
    `position:absolute;inset:0;overflow:hidden;font-family:${FONT};color:${COL.ink};` +
      "background:radial-gradient(120% 90% at 50% 0%, rgba(16,41,82,0) 0%, #06101f 100%), #081427;" +
      "user-select:none;-webkit-user-select:none;"
  );

  const canvas = el(
    root,
    "canvas",
    "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab;"
  );

  el(
    root,
    "div",
    "position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 100% at 50% 38%, transparent 55%, rgba(3,8,18,.55) 100%);"
  );

  const panelCss =
    `position:absolute;background:${COL.panelBg};border:${COL.panelBorder};border-radius:14px;` +
    "backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);padding:12px 14px;pointer-events:none;" +
    "box-shadow:0 8px 30px rgba(2,8,20,.45);";

  // top-left: instrument panel
  const meterPanel = el(root, "div", panelCss + "left:14px;top:14px;min-width:250px;max-width:320px;");
  el(
    meterPanel,
    "div",
    `font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${COL.dim};margin-bottom:2px;`,
    mode === "tds" ? "Radiation Safety · Time / Distance / Shielding" : "Radiation Safety · Boundary Survey"
  );
  el(
    meterPanel,
    "div",
    `font-size:12px;color:${COL.dim};margin-bottom:8px;`,
    mode === "tds"
      ? `${isotope} · ${curies.toFixed(0)} Ci · Γ = ${iso.gamma} R·m²/Ci·h`
      : `${isotope} · ${curies.toFixed(0)} Ci in shielded device (×${deviceFactor})`
  );
  const bigRate = el(
    meterPanel,
    "div",
    `font-size:30px;font-weight:800;color:${COL.cyanCss};line-height:1.05;text-shadow:0 0 18px rgba(95,224,255,.35);`,
    "—"
  );
  el(
    meterPanel,
    "div",
    `font-size:11px;color:${COL.dim};margin-bottom:8px;`,
    mode === "tds" ? "at worker (drag the worker)" : "survey meter (drag the meter)"
  );
  const lines = el(meterPanel, "div", "font-size:12.5px;line-height:1.65;");
  el(
    meterPanel,
    "div",
    `font-size:10.5px;color:${COL.dim};margin-top:8px;border-top:1px solid rgba(150,200,255,.14);padding-top:6px;`,
    mode === "tds"
      ? "Ḋ = Γ·A / d² × ½ⁿ &nbsp;·&nbsp; point source, buildup neglected"
      : "Ḋ = Γ·A·f<sub>device</sub> / d² &nbsp;·&nbsp; point source model"
  );

  // top-right: objectives
  const chipPanel = el(root, "div", panelCss + "right:14px;top:14px;max-width:300px;padding:10px 12px;");
  el(
    chipPanel,
    "div",
    `font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${COL.dim};margin-bottom:6px;`,
    "Objectives"
  );
  const chipWrap = el(chipPanel, "div", "display:flex;flex-direction:column;gap:5px;");
  /** @type {Record<string, HTMLElement>} */
  const chipEls = {};
  for (const t of tasks) {
    chipEls[t.id] = el(
      chipWrap,
      "div",
      `font-size:12px;display:flex;gap:7px;align-items:flex-start;color:${COL.ink};`,
      `<span data-tick style="flex:0 0 auto;width:14px;height:14px;border-radius:50%;border:1.5px solid rgba(150,200,255,.45);display:inline-block;margin-top:1px;"></span><span>${t.label || t.id}</span>`
    );
  }
  function refreshChips() {
    for (const id of Object.keys(chipEls)) {
      const tick = chipEls[id].querySelector("[data-tick]");
      if (!tick) continue;
      if (done.has(id)) {
        tick.style.background = COL.ok;
        tick.style.borderColor = COL.ok;
        tick.style.boxShadow = "0 0 10px rgba(78,227,151,.6)";
      }
    }
  }

  // bottom-left: controls
  const ctrlPanel = el(root, "div", panelCss + "left:14px;bottom:14px;min-width:288px;max-width:362px;");

  const btnCss =
    `pointer-events:auto;cursor:pointer;background:${COL.blueCss};border:1px solid rgba(150,200,255,.35);` +
    `color:#eaf3ff;font-family:${FONT};font-weight:700;font-size:13px;border-radius:10px;padding:8px 13px;` +
    "box-shadow:0 4px 16px rgba(30,102,245,.35);";
  const btnGhostCss =
    `pointer-events:auto;cursor:pointer;background:rgba(120,170,255,.10);border:${COL.panelBorder};` +
    `color:${COL.ink};font-family:${FONT};font-weight:600;font-size:13px;border-radius:10px;padding:8px 13px;`;

  // --- three.js core ---------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "low-power" });
  renderer.setClearColor(COL.bgDeep, 1);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(COL.bgDeep, 26, 60);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 130);
  const camTarget = new THREE.Vector3();
  let camRadius = 12.5;
  let camPolar = 1.06; // angle from +Y
  let camAz = 0;

  function applyCamera() {
    camera.position.set(
      camTarget.x + camRadius * Math.sin(camPolar) * Math.sin(camAz),
      camTarget.y + camRadius * Math.cos(camPolar),
      camTarget.z + camRadius * Math.sin(camPolar) * Math.cos(camAz)
    );
    camera.lookAt(camTarget);
  }

  scene.add(new THREE.HemisphereLight(0x9db9e8, 0x0a1426, 1.05));
  const keyLight = new THREE.DirectionalLight(0xcfe2ff, 1.15);
  keyLight.position.set(6, 12, 7);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x3a6bd8, 0.5);
  rimLight.position.set(-8, 6, -9);
  scene.add(rimLight);

  /** Extra GPU resources to free on dispose (textures etc. are also swept by traverse). */
  const disposables = [];
  function geo(g) {
    disposables.push(g);
    return g;
  }
  function mat(m) {
    disposables.push(m);
    return m;
  }
  function trackSprite(sp) {
    disposables.push(sp.material.map, sp.material);
    return sp;
  }

  // ground
  const groundSize = mode === "tds" ? [16, 22] : [30, 30];
  const ground = new THREE.Mesh(
    geo(new THREE.PlaneGeometry(groundSize[0], groundSize[1])),
    mat(new THREE.MeshStandardMaterial({ color: 0x0d2140, roughness: 0.95, metalness: 0.05 }))
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  scene.add(ground);

  // --- shared interaction state ----------------------------------------------
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const tmpV = new THREE.Vector3();

  /** @type {{name:string, grab:THREE.Object3D, onDrag:(p:THREE.Vector3)=>void, onDrop?:()=>void}[]} */
  const grabbables = [];
  let dragging = null;
  let frames = 0;
  let simT = 0;

  function pointerNdc(ev) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -(((ev.clientY - r.top) / r.height) * 2 - 1));
  }
  function rayFloor(ev) {
    pointerNdc(ev);
    raycaster.setFromCamera(ndc, camera);
    return raycaster.ray.intersectPlane(floorPlane, tmpV) ? tmpV.clone() : null;
  }

  function onPointerDown(ev) {
    if (disposed) return;
    pointerNdc(ev);
    raycaster.setFromCamera(ndc, camera);
    for (const g of grabbables) {
      const hits = raycaster.intersectObject(g.grab, true);
      if (hits.length) {
        dragging = g;
        canvas.style.cursor = "grabbing";
        try {
          canvas.setPointerCapture(ev.pointerId);
        } catch (e) {
          /* noop */
        }
        ev.preventDefault();
        const p = rayFloor(ev);
        if (p) g.onDrag(p);
        return;
      }
    }
  }
  function onPointerMove(ev) {
    if (disposed || !dragging) return;
    const p = rayFloor(ev);
    if (p) dragging.onDrag(p);
    ev.preventDefault();
  }
  function onPointerUp(ev) {
    if (disposed) return;
    if (dragging) {
      if (dragging.onDrop) dragging.onDrop();
      dragging = null;
    }
    canvas.style.cursor = "grab";
    try {
      canvas.releasePointerCapture(ev.pointerId);
    } catch (e) {
      /* noop */
    }
  }
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);

  // --- shared builders ---------------------------------------------------------
  function buildFigure(color) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      geo(new THREE.CapsuleGeometry(0.21, 0.62, 4, 12)),
      mat(new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.15 }))
    );
    body.position.y = 0.78;
    g.add(body);
    const head = new THREE.Mesh(
      geo(new THREE.SphereGeometry(0.155, 16, 12)),
      mat(new THREE.MeshStandardMaterial({ color: 0xf5d9b8, roughness: 0.6 }))
    );
    head.position.y = 1.36;
    g.add(head);
    const hat = new THREE.Mesh(
      geo(new THREE.SphereGeometry(0.175, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)),
      mat(new THREE.MeshStandardMaterial({ color: 0xffc23d, roughness: 0.4 }))
    );
    hat.position.y = 1.4;
    g.add(hat);
    const meterBox = new THREE.Mesh(
      geo(new THREE.BoxGeometry(0.24, 0.16, 0.1)),
      mat(new THREE.MeshStandardMaterial({ color: 0x16335e, roughness: 0.4 }))
    );
    meterBox.position.set(0, 0.95, 0.3);
    g.add(meterBox);
    const screen = new THREE.Mesh(geo(new THREE.PlaneGeometry(0.18, 0.09)), mat(new THREE.MeshBasicMaterial({ color: COL.cyan })));
    screen.position.set(0, 0.96, 0.355);
    g.add(screen);
    const baseRing = new THREE.Mesh(
      geo(new THREE.TorusGeometry(0.42, 0.035, 8, 36)),
      mat(new THREE.MeshBasicMaterial({ color: COL.cyan, transparent: true, opacity: 0.85 }))
    );
    baseRing.rotation.x = -Math.PI / 2;
    baseRing.position.y = 0.02;
    g.add(baseRing);
    // generous invisible grab volume
    const grab = new THREE.Mesh(
      geo(new THREE.SphereGeometry(0.95, 10, 8)),
      mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }))
    );
    grab.position.y = 0.8;
    g.add(grab);
    return { group: g, grab };
  }

  function buildSourceGlow(pos, r) {
    const grp = new THREE.Group();
    grp.add(new THREE.Mesh(geo(new THREE.SphereGeometry(r, 18, 14)), mat(new THREE.MeshBasicMaterial({ color: 0xbfff9a }))));
    const halo = new THREE.Mesh(
      geo(new THREE.SphereGeometry(r * 2.4, 18, 14)),
      mat(new THREE.MeshBasicMaterial({ color: 0x9dffb0, transparent: true, opacity: 0.18, depthWrite: false }))
    );
    grp.add(halo);
    const light = new THREE.PointLight(0xa9ffba, 12, 14, 2);
    grp.add(light);
    grp.position.copy(pos);
    scene.add(grp);
    return { grp, halo, light };
  }

  // ===========================================================================
  // Mode state (read by the HUD + the __debug test surface)
  // ===========================================================================
  const S = {
    workerRate: 0,
    boundaryRate: 0,
    distance: 0,
    slabs: 0,
    timeMin: 30,
    doseMrem: 0,
    d0: 0,
    touchedTime: false,
    meterRate: 0,
    displayRate: 0,
    stable: false,
    nearStake: null,
    recorded: {},
    stakeBRate: 0,
    stakeBRadius: 0,
    movedStakeB: false,
    posted: false,
  };

  let updateMode = function (dt) {};
  let idleMode = function (t) {};
  let hudUpdate = function (dt) {};
  /** mode-specific extras merged into the debug surface */
  const dbg = {};

  if (mode === "tds") {
    // ---- layout (metres) ----
    const SRC = new THREE.Vector3(0, 1.0, -6); // source pellet centre
    const POST = new THREE.Vector3(0, 1.0, 6.9); // boundary post measuring point (bay door)
    const dPost = SRC.distanceTo(POST);

    camTarget.set(0, 0.4, 0.2);
    camRadius = 14.2;
    camPolar = 0.98;

    const grid = new THREE.GridHelper(14, 14, 0x1d4076, 0x12294e);
    grid.position.y = 0.002;
    scene.add(grid);
    disposables.push(grid.geometry, grid.material);

    // low walls
    const wallMat = mat(new THREE.MeshStandardMaterial({ color: 0x123057, roughness: 0.9 }));
    for (const [w, h, d, x, y, z] of [
      [16, 1.1, 0.3, 0, 0.55, -8.2],
      [0.3, 1.1, 22, -7.0, 0.55, 0],
      [0.3, 1.1, 22, 7.0, 0.55, 0],
    ]) {
      const wall = new THREE.Mesh(geo(new THREE.BoxGeometry(w, h, d)), wallMat);
      wall.position.set(x, y, z);
      scene.add(wall);
    }

    // distance rings centred under the source
    for (const rr of [2, 4, 6]) {
      const ring = new THREE.Mesh(
        geo(new THREE.RingGeometry(rr - 0.03, rr + 0.03, 96)),
        mat(new THREE.MeshBasicMaterial({ color: COL.cyan, transparent: true, opacity: 0.18, depthWrite: false }))
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(SRC.x, 0.012, SRC.z);
      scene.add(ring);
      const lbl = trackSprite(makeTextSprite(rr + " m", { size: 40, color: "rgba(160,210,255,.9)", worldH: 0.34 }));
      lbl.position.set(SRC.x + 0.5, 0.16, SRC.z + rr);
      scene.add(lbl);
    }

    // source stand + pellet
    const stand = new THREE.Mesh(
      geo(new THREE.CylinderGeometry(0.07, 0.1, 1.0, 10)),
      mat(new THREE.MeshStandardMaterial({ color: 0x39507a, roughness: 0.5, metalness: 0.6 }))
    );
    stand.position.set(SRC.x, 0.5, SRC.z);
    scene.add(stand);
    const src = buildSourceGlow(SRC, 0.14);
    const srcLbl = trackSprite(makeTextSprite("☢ SOURCE", { size: 42, color: "#ffd34d", bg: "rgba(40,28,4,.72)", worldH: 0.42 }));
    srcLbl.position.set(SRC.x, 2.65, SRC.z);
    scene.add(srcLbl);

    // beam cone — visual transmission cue (dims as slabs stack)
    const beamMat = mat(
      new THREE.MeshBasicMaterial({ color: 0x9dffb0, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide })
    );
    const beam = new THREE.Mesh(geo(new THREE.ConeGeometry(3.4, 12, 24, 1, true)), beamMat);
    beam.rotation.x = -Math.PI / 2;
    beam.position.set(SRC.x, 1.0, SRC.z + 6);
    scene.add(beam);

    // shield rack + slabs (kept clear of the worker corridor, z ≥ -3.2)
    const rackZ = -5.4;
    const rack = new THREE.Mesh(
      geo(new THREE.BoxGeometry(3.0, 0.1, 2.1)),
      mat(new THREE.MeshStandardMaterial({ color: 0x1a3a66, roughness: 0.8 }))
    );
    rack.position.set(0, 0.05, rackZ + 0.85);
    scene.add(rack);
    const slabMat = mat(new THREE.MeshStandardMaterial({ color: 0x93a2bd, roughness: 0.5, metalness: 0.2 }));
    const slabGeo = geo(new THREE.BoxGeometry(2.7, 1.95, 0.12));
    const slabEdgeGeo = geo(new THREE.EdgesGeometry(slabGeo));
    const slabEdgeMat = mat(new THREE.LineBasicMaterial({ color: COL.cyan, transparent: true, opacity: 0.7 }));
    /** @type {THREE.Object3D[]} */
    const slabMeshes = [];
    const MAX_SLABS = 10;

    function setSlabs(n) {
      n = Math.max(0, Math.min(MAX_SLABS, n));
      while (slabMeshes.length < n) {
        const i = slabMeshes.length;
        const s = new THREE.Mesh(slabGeo, slabMat);
        s.position.set(0, 1.08, rackZ + 0.22 + i * 0.19);
        s.add(new THREE.LineSegments(slabEdgeGeo, slabEdgeMat));
        scene.add(s);
        slabMeshes.push(s);
      }
      while (slabMeshes.length > n) scene.remove(slabMeshes.pop());
      S.slabs = n;
    }

    // boundary post + door line
    const post = new THREE.Mesh(
      geo(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8)),
      mat(new THREE.MeshStandardMaterial({ color: 0xd8c63d, roughness: 0.5 }))
    );
    post.position.set(POST.x, 0.75, POST.z);
    scene.add(post);
    const postLbl = trackSprite(makeTextSprite("BOUNDARY POST", { size: 38, color: "#ffe27a", bg: "rgba(40,32,4,.7)", worldH: 0.26 }));
    postLbl.position.set(POST.x, 1.55, POST.z);
    scene.add(postLbl);
    const doorLine = new THREE.Mesh(
      geo(new THREE.PlaneGeometry(9, 0.16)),
      mat(new THREE.MeshBasicMaterial({ color: 0xd8c63d, transparent: true, opacity: 0.5 }))
    );
    doorLine.rotation.x = -Math.PI / 2;
    doorLine.position.set(0, 0.013, POST.z);
    scene.add(doorLine);

    // worker
    const fig = buildFigure(0x2f6df0);
    fig.group.position.set(0, 0, -3.2); // start distance d0 = 2.8 m
    scene.add(fig.group);
    const workerLbl = trackSprite(makeTextSprite("WORKER — drag me", { size: 36, color: "#bfe7ff", bg: "rgba(8,22,44,.7)", worldH: 0.32 }));
    workerLbl.position.set(0, 1.95, 0);
    fig.group.add(workerLbl);

    grabbables.push({
      name: "worker",
      grab: fig.grab,
      onDrag(p) {
        fig.group.position.x = Math.max(-4.5, Math.min(4.5, p.x));
        fig.group.position.z = Math.max(-3.2, Math.min(6.6, p.z));
      },
    });

    const meterPoint = new THREE.Vector3();
    function workerDistance() {
      meterPoint.set(fig.group.position.x, 1.0, fig.group.position.z);
      return SRC.distanceTo(meterPoint);
    }

    S.d0 = workerDistance();
    const quarterRate = bareOut1m / (S.d0 * S.d0) / 4;

    // ---- controls ----
    el(
      ctrlPanel,
      "div",
      `font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${COL.dim};margin-bottom:8px;`,
      "Shielding & exposure plan"
    );
    const rowSlab = el(ctrlPanel, "div", "display:flex;gap:8px;align-items:center;margin-bottom:10px;");
    const btnPlus = el(rowSlab, "button", btnCss, "+ Shield slab");
    btnPlus.setAttribute("data-rs", "slabPlus");
    const btnMinus = el(rowSlab, "button", btnGhostCss, "− slab");
    btnMinus.setAttribute("data-rs", "slabMinus");
    const slabInfo = el(rowSlab, "div", `font-size:12px;color:${COL.dim};`, "0 HVL");
    btnPlus.addEventListener("click", () => setSlabs(S.slabs + 1));
    btnMinus.addEventListener("click", () => setSlabs(S.slabs - 1));

    const rowTime = el(ctrlPanel, "div", "margin-bottom:6px;");
    const timeLbl = el(rowTime, "div", "font-size:12px;margin-bottom:4px;", "");
    const slider = el(rowTime, "input", `pointer-events:auto;width:100%;accent-color:${COL.blueCss};cursor:pointer;`);
    slider.type = "range";
    slider.min = "1";
    slider.max = "60";
    slider.step = "1";
    slider.value = String(S.timeMin);
    slider.setAttribute("data-rs", "time");
    slider.addEventListener("input", () => {
      S.timeMin = Number(slider.value);
      S.touchedTime = true;
    });

    const doseRow = el(ctrlPanel, "div", "margin-top:4px;");
    const doseTxt = el(doseRow, "div", "font-size:12.5px;margin-bottom:4px;", "");
    const doseBarOuter = el(
      doseRow,
      "div",
      "height:8px;border-radius:5px;background:rgba(10,24,48,.9);border:1px solid rgba(150,200,255,.18);overflow:hidden;"
    );
    const doseBar = el(doseBarOuter, "div", `height:100%;width:0%;background:${COL.ok};transition:width .12s linear;`);

    updateMode = function () {
      const d = workerDistance();
      const att = Math.pow(0.5, S.slabs);
      S.distance = d;
      S.workerRate = (bareOut1m / (d * d)) * att;
      S.boundaryRate = (bareOut1m / (dPost * dPost)) * att;
      S.doseMrem = S.workerRate * (S.timeMin / 60);

      beamMat.opacity = 0.018 + 0.07 * Math.pow(att, 0.4);

      if (S.slabs === 0 && S.workerRate <= quarterRate * 1.08) award("distanceHalf");
      if (S.slabs >= 1 && S.boundaryRate <= boundaryLimit) award("shieldToLimit");
      if (S.touchedTime && S.timeMin >= minWorkMin && S.doseMrem <= doseLimit) award("planExposure");
    };

    let hudT = 1;
    hudUpdate = function (dt) {
      hudT += dt;
      if (hudT < 0.08) return;
      hudT = 0;
      const att = Math.pow(0.5, S.slabs);
      bigRate.textContent = fmtRate(S.workerRate);
      lines.innerHTML =
        `Distance to source: <b style="color:${COL.cyanCss}">${S.distance.toFixed(2)} m</b><br>` +
        `Boundary post (${dPost.toFixed(1)} m): <b style="color:${S.boundaryRate <= boundaryLimit ? COL.ok : COL.bad}">${fmtRate(S.boundaryRate)}</b>` +
        ` <span style="color:${COL.dim}">/ limit ${boundaryLimit} mR/h</span><br>` +
        `Shield stack: <b>${S.slabs} HVL</b> <span style="color:${COL.dim}">(1 HVL ${isotope} ≈ ${iso.hvlPbMm} mm Pb · ×½ each)</span>`;
      slabInfo.textContent = `${S.slabs} HVL → ×${att < 0.001 ? att.toExponential(1) : att.toFixed(3)}`;
      timeLbl.innerHTML = `Exposure time: <b style="color:${COL.cyanCss}">${S.timeMin} min</b> <span style="color:${COL.dim}">(job needs ≥ ${minWorkMin} min)</span>`;
      const over = S.doseMrem > doseLimit;
      doseTxt.innerHTML = `Planned dose: <b style="color:${over ? COL.bad : COL.ok}">${
        S.doseMrem >= 100 ? S.doseMrem.toFixed(0) : S.doseMrem.toFixed(2)
      } mrem</b> <span style="color:${COL.dim}">/ limit ${doseLimit} mrem</span>`;
      doseBar.style.width = Math.min(100, (S.doseMrem / doseLimit) * 100) + "%";
      doseBar.style.background = over ? COL.bad : COL.ok;
    };

    idleMode = function (t) {
      if (ctx.reducedMotion) return;
      const k = 0.85 + 0.25 * Math.sin(t * 3.1);
      src.halo.scale.setScalar(k);
      src.light.intensity = 10 + 4 * Math.sin(t * 3.1);
    };
  } else {
    // =========================================================================
    // survey mode
    // =========================================================================
    const DEV = new THREE.Vector3(0, 0.55, 0); // device measuring centre

    camTarget.set(0, 0.2, 4.0);
    camRadius = 18.5;
    camPolar = 0.82;

    const polar = new THREE.PolarGridHelper(12, 12, 6, 72, 0x16386b, 0x12294e);
    polar.position.y = 0.005;
    scene.add(polar);
    disposables.push(polar.geometry, polar.material);

    // exposure device
    const dev = new THREE.Group();
    const devBody = new THREE.Mesh(
      geo(new THREE.BoxGeometry(1.0, 0.62, 0.66)),
      mat(new THREE.MeshStandardMaterial({ color: 0xd9a823, roughness: 0.45, metalness: 0.3 }))
    );
    devBody.position.y = 0.42;
    dev.add(devBody);
    const devCap = new THREE.Mesh(
      geo(new THREE.CylinderGeometry(0.16, 0.16, 0.34, 14)),
      mat(new THREE.MeshStandardMaterial({ color: 0x32405c, metalness: 0.7, roughness: 0.35 }))
    );
    devCap.rotation.z = Math.PI / 2;
    devCap.position.set(0.62, 0.42, 0);
    dev.add(devCap);
    const tre = trackSprite(makeTextSprite("☢", { size: 64, color: "#231a02", bg: "rgba(255,213,74,.95)", worldH: 0.34 }));
    tre.position.set(0, 0.5, 0.4);
    dev.add(tre);
    const devLbl = trackSprite(makeTextSprite("EXPOSURE DEVICE", { size: 38, color: "#ffd34d", bg: "rgba(40,28,4,.72)", worldH: 0.4 }));
    devLbl.position.set(0, 1.45, 0);
    dev.add(devLbl);
    scene.add(dev);
    const devGlow = buildSourceGlow(new THREE.Vector3(0.82, 0.42, 0), 0.05);
    devGlow.light.intensity = 5;

    // stakes
    const stakeDefs = [
      { id: "A", ang: (-38 * Math.PI) / 180, r: 9.5 },
      { id: "B", ang: (8 * Math.PI) / 180, r: 6.0 },
      { id: "C", ang: (42 * Math.PI) / 180, r: 10.0 },
    ];
    const stakeMat = mat(new THREE.MeshStandardMaterial({ color: 0xd8c63d, roughness: 0.5 }));
    const stakeGeoC = geo(new THREE.CylinderGeometry(0.045, 0.06, 1.0, 8));
    /** @type {Record<string, {def:any, grp:THREE.Group, flag:THREE.Mesh}>} */
    const stakes = {};
    for (const def of stakeDefs) {
      const grp = new THREE.Group();
      const postM = new THREE.Mesh(stakeGeoC, stakeMat);
      postM.position.y = 0.5;
      grp.add(postM);
      const flag = new THREE.Mesh(
        geo(new THREE.PlaneGeometry(0.5, 0.32)),
        mat(new THREE.MeshBasicMaterial({ color: 0xffc23d, side: THREE.DoubleSide, transparent: true, opacity: 0.95 }))
      );
      flag.position.set(0.27, 0.86, 0);
      grp.add(flag);
      const lbl = trackSprite(makeTextSprite("POINT " + def.id, { size: 44, color: "#ffe8a3", bg: "rgba(38,28,4,.75)", worldH: 0.42 }));
      lbl.position.set(0, 1.55, 0);
      grp.add(lbl);
      grp.position.set(def.r * Math.sin(def.ang), 0, def.r * Math.cos(def.ang));
      scene.add(grp);
      stakes[def.id] = { def, grp, flag };
    }
    S.stakeBRadius = stakeDefs[1].r;

    // stake B grab volume (B is the fix point)
    const bGrab = new THREE.Mesh(
      geo(new THREE.SphereGeometry(0.85, 10, 8)),
      mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }))
    );
    bGrab.position.y = 0.6;
    stakes.B.grp.add(bGrab);
    const bDir = new THREE.Vector3(Math.sin(stakeDefs[1].ang), 0, Math.cos(stakeDefs[1].ang));

    // boundary rope through anchors + stakes (with sag midpoints)
    const anchorL = new THREE.Vector3(10.2 * Math.sin((-62 * Math.PI) / 180), 0, 10.2 * Math.cos((-62 * Math.PI) / 180));
    const anchorR = new THREE.Vector3(10.8 * Math.sin((64 * Math.PI) / 180), 0, 10.8 * Math.cos((64 * Math.PI) / 180));
    for (const a of [anchorL, anchorR]) {
      const postM = new THREE.Mesh(stakeGeoC, stakeMat);
      postM.position.set(a.x, 0.5, a.z);
      scene.add(postM);
    }
    const ropeGeo = geo(new THREE.BufferGeometry());
    const rope = new THREE.Line(ropeGeo, mat(new THREE.LineBasicMaterial({ color: 0xffd34d, transparent: true, opacity: 0.9 })));
    scene.add(rope);
    function ropeUpdate() {
      const chain = [anchorL, stakes.A.grp.position, stakes.B.grp.position, stakes.C.grp.position, anchorR];
      const pts = [];
      const H = 0.62;
      for (let i = 0; i < chain.length - 1; i++) {
        const a = chain[i];
        const b = chain[i + 1];
        pts.push(new THREE.Vector3(a.x, H, a.z));
        pts.push(new THREE.Vector3((a.x + b.x) / 2, H - 0.13, (a.z + b.z) / 2));
      }
      const last = chain[chain.length - 1];
      pts.push(new THREE.Vector3(last.x, H, last.z));
      ropeGeo.setFromPoints(pts);
    }
    ropeUpdate();

    const postedSign = trackSprite(
      makeTextSprite("POSTED ✓ RADIATION AREA", { size: 40, color: "#08230f", bg: "rgba(78,227,151,.95)", worldH: 0.5 })
    );
    postedSign.visible = false;
    scene.add(postedSign);

    // surveyor figure with meter
    const fig = buildFigure(0x35b2c9);
    fig.group.position.set(-1.6, 0, 3.4);
    scene.add(fig.group);
    const meterLbl = trackSprite(makeTextSprite("SURVEY METER — drag me", { size: 36, color: "#bfe7ff", bg: "rgba(8,22,44,.7)", worldH: 0.34 }));
    meterLbl.position.set(0, 1.95, 0);
    fig.group.add(meterLbl);

    let meterStill = 0;
    const lastMeterPos = fig.group.position.clone();

    grabbables.push({
      name: "meter",
      grab: fig.grab,
      onDrag(p) {
        let x = Math.max(-11.5, Math.min(11.5, p.x));
        let z = Math.max(-3.0, Math.min(11.8, p.z));
        const r = Math.hypot(x, z);
        if (r < 1.15) {
          const s = 1.15 / Math.max(r, 1e-4);
          x *= s;
          z *= s;
        }
        fig.group.position.x = x;
        fig.group.position.z = z;
      },
    });
    grabbables.push({
      name: "stakeB",
      grab: bGrab,
      onDrag(p) {
        const rad = Math.max(4.4, Math.min(11.9, p.x * bDir.x + p.z * bDir.z));
        stakes.B.grp.position.set(bDir.x * rad, 0, bDir.z * rad);
        S.movedStakeB = true;
        ropeUpdate();
      },
    });

    function rateAt(v3) {
      const d = DEV.distanceTo(tmpV.set(v3.x, 1.0, v3.z)); // meter held at 1 m height
      return surveyOut1m / (d * d);
    }

    // ---- controls ----
    el(ctrlPanel, "div", `font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${COL.dim};margin-bottom:8px;`, "Survey log");
    const rowRec = el(ctrlPanel, "div", "display:flex;gap:8px;align-items:center;margin-bottom:9px;");
    const recBtn = el(rowRec, "button", btnCss, "Record reading");
    recBtn.setAttribute("data-rs", "record");
    const stableBadge = el(rowRec, "div", `font-size:11px;font-weight:700;letter-spacing:.06em;color:${COL.dim};`, "MOVE TO A POINT");
    const logWrap = el(ctrlPanel, "div", "display:flex;gap:7px;margin-bottom:7px;");
    /** @type {Record<string, HTMLElement>} */
    const logChips = {};
    for (const def of stakeDefs) {
      logChips[def.id] = el(
        logWrap,
        "div",
        `flex:1;text-align:center;font-size:12px;padding:7px 4px;border-radius:9px;background:rgba(10,24,48,.65);border:${COL.panelBorder};`,
        `<b>${def.id}</b><br><span style="color:${COL.dim}">— mR/h</span>`
      );
    }
    const hintLine = el(
      ctrlPanel,
      "div",
      `font-size:11.5px;color:${COL.dim};line-height:1.5;`,
      `Limit at the rope: <b style="color:${COL.ink}">${surveyLimit} mR/h</b>. Hold the meter at each point until STABLE, then record.`
    );

    const postBandLo = surveyLimit * 0.85;
    const postBandHi = surveyLimit * 1.05;

    recBtn.addEventListener("click", () => {
      // accepts only a stable reading taken at an unrecorded point
      if (!S.stable || !S.nearStake || S.recorded[S.nearStake] !== undefined) return;
      const st = stakes[S.nearStake];
      const val = rateAt(st.grp.position);
      S.recorded[S.nearStake] = val;
      const overL = val > surveyLimit;
      logChips[S.nearStake].innerHTML = `<b>${S.nearStake}</b><br><span style="color:${overL ? COL.bad : COL.ok};font-weight:700">${val.toFixed(2)}</span>`;
      logChips[S.nearStake].style.borderColor = overL ? "rgba(255,100,115,.6)" : "rgba(78,227,151,.5)";
      if (Object.keys(S.recorded).length >= 3) {
        award("surveyAll");
        hintLine.innerHTML = `Point B is over ${surveyLimit} mR/h — <b style="color:${COL.warn}">drag stake B outward</b> along its line until the rope reads ${surveyLimit} mR/h, then release.`;
      }
    });

    updateMode = function (dt) {
      S.meterRate = rateAt(fig.group.position);
      S.stakeBRate = rateAt(stakes.B.grp.position);
      S.stakeBRadius = Math.hypot(stakes.B.grp.position.x, stakes.B.grp.position.z);

      S.nearStake = null;
      let best = 1.05;
      for (const id of Object.keys(stakes)) {
        const d = fig.group.position.distanceTo(stakes[id].grp.position);
        if (d < best) {
          best = d;
          S.nearStake = id;
        }
      }

      const moved = fig.group.position.distanceTo(lastMeterPos);
      lastMeterPos.copy(fig.group.position);
      const draggingMeter = dragging && dragging.name === "meter";
      if (!draggingMeter && S.nearStake && moved < 0.02) meterStill += dt;
      else meterStill = 0;
      S.stable = meterStill >= 0.7;
      S.displayRate = S.stable
        ? S.meterRate
        : S.meterRate * (1 + 0.055 * Math.sin(simT * 9.7) + 0.035 * Math.sin(simT * 23.3));

      const bOver = S.stakeBRate > postBandHi;
      stakes.B.flag.material.color.setHex(bOver ? 0xff5868 : 0x4ee397);
      stakes.B.flag.material.opacity = !ctx.reducedMotion && bOver && !S.posted ? 0.7 + 0.3 * Math.sin(simT * 5) : 0.95;

      const draggingB = dragging && dragging.name === "stakeB";
      if (!S.posted && S.movedStakeB && !draggingB && S.stakeBRate >= postBandLo && S.stakeBRate <= postBandHi) {
        S.posted = true;
        postedSign.visible = true;
        award("postBoundary");
      }
      if (S.posted) postedSign.position.set(stakes.B.grp.position.x, 2.0, stakes.B.grp.position.z);

      // gate the Record button every frame (HUD text is throttled, this must not be)
      recBtn.disabled = !(S.stable && S.nearStake && S.recorded[S.nearStake] === undefined);
    };

    let hudT = 1;
    hudUpdate = function (dt) {
      hudT += dt;
      if (hudT < 0.08) return;
      hudT = 0;
      bigRate.textContent = fmtRate(S.displayRate);
      const distDev = DEV.distanceTo(tmpV.set(fig.group.position.x, 1.0, fig.group.position.z));
      lines.innerHTML =
        `Distance from device: <b style="color:${COL.cyanCss}">${distDev.toFixed(2)} m</b><br>` +
        `Nearest point: <b>${S.nearStake || "—"}</b> · boundary limit <b>${surveyLimit} mR/h</b><br>` +
        `Rope at B: <b style="color:${S.stakeBRate > postBandHi ? COL.bad : COL.ok}">${S.stakeBRate.toFixed(2)} mR/h</b> at ${S.stakeBRadius.toFixed(2)} m`;
      const ready = !recBtn.disabled;
      recBtn.style.opacity = ready ? "1" : "0.45";
      recBtn.style.cursor = ready ? "pointer" : "default";
      if (ready) {
        stableBadge.textContent = "STABLE — RECORD " + S.nearStake;
        stableBadge.style.color = COL.ok;
      } else if (S.nearStake && S.recorded[S.nearStake] !== undefined) {
        stableBadge.textContent = "POINT " + S.nearStake + " LOGGED";
        stableBadge.style.color = COL.dim;
      } else if (S.nearStake) {
        stableBadge.textContent = "STABILISING…";
        stableBadge.style.color = COL.warn;
      } else {
        stableBadge.textContent = "MOVE TO A POINT";
        stableBadge.style.color = COL.dim;
      }
    };

    idleMode = function (t) {
      if (ctx.reducedMotion) return;
      devGlow.halo.scale.setScalar(0.85 + 0.25 * Math.sin(t * 3.1));
    };

    dbg.stakeWorld = function (id) {
      const st = stakes[id];
      return st ? [st.grp.position.x, 0, st.grp.position.z] : null;
    };
    dbg.postTargetWorld = function () {
      // ground point on B's radial where rate ≈ 0.96 × limit
      const d3 = Math.sqrt(surveyOut1m / (surveyLimit * 0.96));
      const rGround = Math.sqrt(Math.max(1, d3 * d3 - (1.0 - DEV.y) * (1.0 - DEV.y)));
      return [bDir.x * rGround, 0, bDir.z * rGround];
    };
  }

  // intro line (bottom-right)
  if (config && config.intro) {
    el(root, "div", panelCss + `right:14px;bottom:14px;max-width:296px;font-size:12px;line-height:1.55;color:${COL.dim};`, String(config.intro));
  }
  refreshChips();

  // --- sizing ----------------------------------------------------------------
  function resize() {
    const w = Math.max(2, container.clientWidth || ctx.width || 640);
    const h = Math.max(2, container.clientHeight || ctx.height || 420);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(container);

  // --- main loop ---------------------------------------------------------------
  let rafId = 0;
  let running = false;
  let lastT = 0;

  function frame(now) {
    rafId = 0;
    if (disposed || !running) return;
    const dt = Math.min(0.05, lastT ? (now - lastT) / 1000 : 0.016);
    lastT = now;
    simT += dt;
    frames++;

    // gentle camera sway (max ≈ 2°/s), paused while dragging / reduced motion
    if (!ctx.reducedMotion && !dragging) camAz = 0.16 * Math.sin(simT * 0.22);
    applyCamera();

    updateMode(dt);
    idleMode(simT);
    hudUpdate(dt);
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(frame);
  }
  function start() {
    if (running || disposed) return;
    running = true;
    lastT = 0;
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }
  function onVis() {
    if (document.hidden) stop();
    else start();
  }
  document.addEventListener("visibilitychange", onVis);
  applyCamera();
  start();

  // --- handle ------------------------------------------------------------------
  /** @type {TrainerHandle & {__debug?: any}} */
  const handle = {
    dispose() {
      if (disposed) return;
      disposed = true;
      stop();
      document.removeEventListener("visibilitychange", onVis);
      if (ro) ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      scene.traverse((o) => {
        if (o.geometry && o.geometry.dispose) o.geometry.dispose();
        const m = o.material;
        if (m) {
          for (const mm of Array.isArray(m) ? m : [m]) {
            if (mm.map && mm.map.dispose) mm.map.dispose();
            if (mm.dispose) mm.dispose();
          }
        }
      });
      for (const d of disposables) {
        try {
          if (d && d.dispose) d.dispose();
        } catch (e) {
          /* noop */
        }
      }
      renderer.dispose();
      try {
        renderer.forceContextLoss();
      } catch (e) {
        /* noop */
      }
      if (root.parentNode) root.parentNode.removeChild(root);
      container.style.position = prevPosition;
    },
  };

  // --- test/debug surface (not part of the player contract) ---------------------
  handle.__debug = Object.assign(
    {
      get frames() {
        return frames;
      },
      get mode() {
        return mode;
      },
      state() {
        return {
          mode,
          workerRate: S.workerRate,
          boundaryRate: S.boundaryRate,
          distance: S.distance,
          slabs: S.slabs,
          timeMin: S.timeMin,
          doseMrem: S.doseMrem,
          meterRate: S.meterRate,
          stable: S.stable,
          nearStake: S.nearStake,
          recorded: Object.assign({}, S.recorded),
          stakeBRate: S.stakeBRate,
          stakeBRadius: S.stakeBRadius,
          posted: S.posted,
          done: Array.from(done),
        };
      },
      /** Project a world point to viewport pixel coordinates. */
      projectPoint(x, y, z) {
        const r = canvas.getBoundingClientRect();
        const v = new THREE.Vector3(x, y, z).project(camera);
        return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + (1 - (v.y + 1) / 2) * r.height };
      },
      /** Viewport position of a named grabbable's grab-volume centre. */
      objScreen(name) {
        const g = grabbables.find((gg) => gg.name === name);
        if (!g) return null;
        const p = new THREE.Vector3();
        g.grab.getWorldPosition(p);
        return this.projectPoint(p.x, p.y, p.z);
      },
    },
    dbg
  );

  return handle;
}
