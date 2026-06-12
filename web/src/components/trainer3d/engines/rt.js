// @ts-nocheck — plain-JS engine, functionally validated via harness (see media-build/trainer-harness)
/**
 * rt — Radiographic Testing method trainer (three.js mini-app).
 *
 * Implements the TrainerMount contract (see ../contract.ts):
 *   export default mount(container, config, ctx) -> { dispose() }
 *   export const MANIFEST
 *
 * Modes:
 *   "geometry" — source head / weld plate / film cassette stack. Student controls
 *     source-to-object distance (SOD) and object-to-film gap; the readout computes
 *     geometric unsharpness Ug = f · OFD / SOD with OFD measured from the SOURCE-SIDE
 *     surface of the part to the film (OFD = plate thickness + gap — worst case, the
 *     plane where the IQI sits). A ghost radiograph preview blurs/sharpens live.
 *     Tasks: meetUg (Ug <= spec), placeIQI (drag the wire IQI onto the source-side
 *     weld surface; the film side is rejected with a code hint).
 *   "exposure" — Ir-192 source with honest decay A = A0 · 2^(-day/halfLife) and toy
 *     reciprocity E = A · t (Ci·min) feeding a logistic film characteristic curve
 *     (base+fog 0.26, shoulder ~4.2, gradient ~4 per decade — industrial-film-ish).
 *     Tasks: hitDensity (developed density inside the target window), compensateDecay
 *     (press "30 days later", then re-achieve the window with the weaker source).
 *
 * Plain ESM + JSDoc, imports bare "three" only. No external CSS/assets.
 */

import * as THREE from "three";

/** @type {{engine:string, modes:Record<string,{description:string, params:Record<string,string>, taskIds:string[]}>}} */
export const MANIFEST = {
  engine: "rt",
  modes: {
    geometry: {
      description:
        "Radiographic setup: drag the gamma source head (or use the sliders) to set source-to-object distance and the object-to-film gap. The readout computes geometric unsharpness Ug = f x OFD / SOD (OFD = plate thickness + gap, measured from the source-side surface) and a ghost radiograph sharpens or blurs live. Finish by dragging the wire IQI onto the source-side weld surface — film-side placement is rejected.",
      params: {
        focalSpotMm: "Effective focal spot (source) size f in mm. Range 0.5-5. Default 3.",
        specUgMm: "Ug acceptance limit in mm (PASS when Ug <= spec). Range 0.1-1.0. Default 0.5.",
        plateThicknessMm: "Weld plate thickness in mm; counted into OFD. Range 6-25. Default 12.",
        sodMm: "Initial source-to-object distance in mm. Range 150-450. Default 220.",
        gapMm: "Initial object-to-film air gap in mm. Range 0-60. Default 45.",
      },
      taskIds: ["meetUg", "placeIQI"],
    },
    exposure: {
      description:
        "Gamma exposure: an Ir-192 source decays as A = A0 x 2^(-day/halfLife) while you pick an exposure time; film density follows a toy characteristic curve of exposure E = A x t (reciprocity). Expose to land density inside the target window, then press '30 days later' and compensate for source decay by re-exposing longer.",
      params: {
        isotope: "Isotope label shown on the console. Default 'Ir-192'.",
        halfLifeDays: "Source half-life in days. Range 1-120. Default 73.8 (Ir-192).",
        curies: "Source activity on day 0 in curies. Range 5-100. Default 40.",
        targetDmin: "Lower bound of the film-density window. Range 1.5-2.5. Default 2.0.",
        targetDmax: "Upper bound of the film-density window. Range 2.5-4.0. Default 3.0.",
        maxTimeMin: "Maximum of the exposure-time slider in minutes. Range 10-60. Default 20.",
      },
      taskIds: ["hitDensity", "compensateDecay"],
    },
  },
};

// ---------------------------------------------------------------------------
// brand + tiny DOM helpers
// ---------------------------------------------------------------------------

const FONT = 'Manrope, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const C = {
  navy: "#0B1F3A",
  blue: "#1E66F5",
  cyan: "#5fe0ff",
  ink: "#eaf3ff",
  dim: "#9db8de",
  glass: "rgba(120,170,255,.07)",
  edge: "rgba(150,200,255,.22)",
  good: "#46e0a5",
  bad: "#ff8585",
  warn: "#ffc46b",
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const numP = (v, d, a, b) => clamp(typeof v === "number" && isFinite(v) ? v : d, a, b);
const fmt = (v, n = 1) => Number(v).toFixed(n);

function el(tag, css, html) {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (html != null) e.innerHTML = html;
  return e;
}

function glassPanel(extra) {
  return el(
    "div",
    `position:absolute;${extra};background:${C.glass};border:1px solid ${C.edge};` +
      `border-radius:14px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);` +
      `color:${C.ink};font-family:${FONT};pointer-events:auto;box-sizing:border-box;`
  );
}

function makeSlider(label, attr, min, max, step, value, unitFmt, onInput) {
  const wrap = el("div", "margin:9px 0 2px;");
  const row = el(
    "div",
    `display:flex;justify-content:space-between;align-items:baseline;font-size:11px;color:${C.dim};letter-spacing:.02em;`
  );
  const name = el("span", null, label);
  const val = el("span", `color:${C.ink};font-weight:700;font-variant-numeric:tabular-nums;`);
  row.append(name, val);
  const input = el(
    "input",
    `display:block;width:100%;margin:5px 0 0;accent-color:${C.blue};cursor:pointer;height:14px;`
  );
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.setAttribute("data-rt", attr);
  const sync = () => (val.textContent = unitFmt(parseFloat(input.value)));
  input.addEventListener("input", () => {
    sync();
    onInput(parseFloat(input.value));
  });
  sync();
  wrap.append(row, input);
  return {
    root: wrap,
    input,
    get: () => parseFloat(input.value),
    set(v) {
      input.value = String(v);
      sync();
    },
  };
}

function makeBtn(label, attr, primary, onClick) {
  const b = el(
    "button",
    `font:600 12px/1.1 ${FONT};padding:9px 12px;border-radius:10px;color:${C.ink};cursor:pointer;` +
      `letter-spacing:.02em;border:1px solid rgba(150,200,255,.35);` +
      `background:${primary ? "linear-gradient(180deg,#2f74ff,#1750c0)" : "rgba(120,170,255,.12)"};`
  );
  b.textContent = label;
  b.setAttribute("data-rt", attr);
  b.addEventListener("click", onClick);
  return b;
}

function chip(text, color) {
  return (
    `<span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:800;` +
    `letter-spacing:.06em;color:#06121f;background:${color};vertical-align:1px;">${text}</span>`
  );
}

// ---------------------------------------------------------------------------
// shared scene scaffolding
// ---------------------------------------------------------------------------

function steelMat(color, rough = 0.45, metal = 0.55) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
}

function edgeLines(mesh, color = 0x3b5e8f, opacity = 0.65) {
  const g = new THREE.EdgesGeometry(mesh.geometry, 20);
  const l = new THREE.LineSegments(
    g,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  );
  mesh.add(l);
  return l;
}

/**
 * Cassette on a stand + butt-welded plate pair. The plate group origin sits at the
 * plate BOTTOM face; callers set group.position.y = cassetteTopY + gap.
 */
function buildBench(scene, tU) {
  const bench = {};
  const stand = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, 2.3), steelMat(0x11243d, 0.85, 0.2));
  stand.position.y = 0.15;
  scene.add(stand);

  const cassette = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 4.5), steelMat(0x223a57, 0.7, 0.35));
  cassette.position.y = 0.36;
  edgeLines(cassette);
  scene.add(cassette);

  const film = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 0.012, 4.1),
    new THREE.MeshStandardMaterial({ color: 0x2a3c31, roughness: 0.55, metalness: 0.1 })
  );
  film.position.y = 0.426;
  scene.add(film);

  const plateGroup = new THREE.Group();
  const plateMat = steelMat(0x8fa3b8, 0.42, 0.6);
  for (const sx of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(1.32, tU, 3.0), plateMat);
    p.position.set(sx * 0.83, tU / 2, 0);
    edgeLines(p, 0x4a6e9c, 0.5);
    plateGroup.add(p);
  }
  const beadGeo = new THREE.CylinderGeometry(0.17, 0.17, 3.0, 24);
  beadGeo.rotateX(Math.PI / 2);
  const bead = new THREE.Mesh(beadGeo, steelMat(0xaab8c6, 0.6, 0.45));
  bead.scale.set(1, 0.55, 1);
  bead.position.y = tU;
  plateGroup.add(bead);
  const rootGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.0, 16);
  rootGeo.rotateX(Math.PI / 2);
  const root = new THREE.Mesh(rootGeo, steelMat(0x95a4b3, 0.65, 0.45));
  root.scale.set(1, 0.4, 1);
  plateGroup.add(root);
  scene.add(plateGroup);

  bench.cassetteTopY = 0.42;
  bench.beadH = 0.17 * 0.55;
  bench.plateGroup = plateGroup;
  bench.filmMesh = film;
  bench.cassette = cassette;
  return bench;
}

/** Source head group; origin = focal spot. */
function buildHead(scene, withRail) {
  const head = new THREE.Group();
  const focal = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0x5fe0ff })
  );
  head.add(focal);
  const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.09, 0.22, 20), steelMat(0x2a4163, 0.5, 0.6));
  snout.position.y = 0.14;
  head.add(snout);
  const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.46, 24), steelMat(0x35517a, 0.4, 0.7));
  housing.position.y = 0.48;
  edgeLines(housing, 0x6f9bd4, 0.45);
  head.add(housing);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.1, 16), steelMat(0x22354e, 0.5, 0.6));
  cap.position.y = 0.76;
  head.add(cap);
  if (withRail) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 6.6, 0.1), steelMat(0x1b3050, 0.7, 0.4));
    rail.position.set(-1.9, 3.3, 0);
    scene.add(rail);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.09, 0.12), steelMat(0x27405f, 0.6, 0.5));
    arm.position.set(-0.95, 0.48, 0);
    head.add(arm);
  }
  scene.add(head);
  return head;
}

function buildBeam(scene) {
  const geo = new THREE.ConeGeometry(1, 1, 36, 1, true);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x5fe0ff,
    transparent: true,
    opacity: 0.07,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const cone = new THREE.Mesh(geo, mat);
  scene.add(cone);
  /** apex at focalY, base at baseY, fixed ~16 deg half-angle */
  cone.update = (focalY, baseY) => {
    const L = Math.max(0.05, focalY - baseY);
    const r = 0.2867 * L;
    cone.scale.set(r, L, r);
    cone.position.y = focalY - L / 2;
  };
  return cone;
}

function makeDim(scene, color = 0x5fe0ff) {
  const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const mat = new THREE.LineDashedMaterial({
    color,
    transparent: true,
    opacity: 0.8,
    dashSize: 0.09,
    gapSize: 0.06,
  });
  const line = new THREE.Line(geo, mat);
  scene.add(line);
  return {
    line,
    set(a, b) {
      const pos = geo.attributes.position;
      pos.setXYZ(0, a.x, a.y, a.z);
      pos.setXYZ(1, b.x, b.y, b.z);
      pos.needsUpdate = true;
      geo.computeBoundingSphere();
      line.computeLineDistances();
    },
  };
}

// ---------------------------------------------------------------------------
// mount
// ---------------------------------------------------------------------------

/**
 * @param {HTMLElement} container
 * @param {{engine:string,mode:string,title:string,intro:string,params?:Record<string,unknown>,tasks:{id:string,label:string}[]}} config
 * @param {{onTaskDone(id:string):void,onAllDone():void,reducedMotion:boolean,width:number,height:number}} ctx
 * @returns {{dispose():void}}
 */
export default function mount(container, config, ctx) {
  const mode = config && MANIFEST.modes[config.mode] ? config.mode : "geometry";
  const P = (config && config.params) || {};
  let disposed = false;

  // ---- DOM scaffold -------------------------------------------------------
  const wrapper = el(
    "div",
    "position:relative;width:100%;height:100%;overflow:hidden;" +
      "background:radial-gradient(120% 95% at 30% 0%, #102a4d 0%, #0B1F3A 48%, #071527 100%);" +
      `font-family:${FONT};`
  );
  container.appendChild(wrapper);

  const W0 = container.clientWidth || ctx.width || 960;
  const H0 = container.clientHeight || ctx.height || 600;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(W0, H0, false);
  const canvas = renderer.domElement;
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;";
  wrapper.appendChild(canvas);

  const hud = el("div", "position:absolute;inset:0;pointer-events:none;");
  wrapper.appendChild(hud);

  // title chip
  hud.appendChild(
    el(
      "div",
      `position:absolute;top:12px;left:12px;max-width:52%;padding:7px 11px;background:${C.glass};` +
        `border:1px solid ${C.edge};border-radius:10px;font-size:12px;font-weight:700;color:${C.ink};` +
        `letter-spacing:.02em;backdrop-filter:blur(8px);pointer-events:none;`,
      (config && config.title) || (mode === "geometry" ? "RT — shooting geometry" : "RT — exposure & decay")
    )
  );

  // task checklist chips
  const tasksWanted = Array.isArray(config && config.tasks) ? config.tasks : [];
  const wanted = new Set(tasksWanted.map((t) => t.id));
  const doneSet = new Set();
  const chipRow = el("div", "position:absolute;left:12px;bottom:12px;display:flex;gap:8px;flex-wrap:wrap;max-width:55%;pointer-events:none;");
  hud.appendChild(chipRow);
  const taskChips = new Map();
  for (const t of tasksWanted) {
    const c = el(
      "div",
      `display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:99px;background:rgba(8,20,38,.7);` +
        `border:1px solid ${C.edge};font-size:11px;color:${C.dim};backdrop-filter:blur(8px);`
    );
    const dot = el(
      "span",
      `width:9px;height:9px;border-radius:50%;border:1.5px solid ${C.cyan};background:transparent;flex:none;`
    );
    c.append(dot, el("span", null, t.label || t.id));
    chipRow.appendChild(c);
    taskChips.set(t.id, { c, dot });
  }
  function markChip(id) {
    const tc = taskChips.get(id);
    if (!tc) return;
    tc.dot.style.background = C.good;
    tc.dot.style.borderColor = C.good;
    tc.c.style.color = C.ink;
  }
  function report(id) {
    if (disposed || !wanted.has(id) || doneSet.has(id)) return;
    doneSet.add(id);
    markChip(id);
    try {
      ctx.onTaskDone(id);
    } catch (_) {}
    if (doneSet.size === wanted.size && wanted.size > 0) {
      try {
        ctx.onAllDone && ctx.onAllDone();
      } catch (_) {}
    }
  }

  // toast
  const toastEl = el(
    "div",
    `position:absolute;left:50%;bottom:54px;transform:translateX(-50%);padding:8px 14px;border-radius:10px;` +
      `background:rgba(8,20,38,.88);border:1px solid ${C.edge};color:${C.ink};font-size:12px;font-weight:600;` +
      `opacity:0;transition:opacity .25s;max-width:70%;text-align:center;pointer-events:none;`
  );
  hud.appendChild(toastEl);
  const timers = new Set();
  function toast(msg, color) {
    if (disposed) return;
    toastEl.textContent = msg;
    toastEl.style.borderColor = color || C.edge;
    toastEl.style.opacity = "1";
    const id = setTimeout(() => {
      toastEl.style.opacity = "0";
      timers.delete(id);
    }, 2400);
    timers.add(id);
  }

  // projected 3-D labels
  const labels = [];
  function addLabel() {
    const d = el(
      "div",
      `position:absolute;transform:translate(-50%,-50%);padding:3px 7px;border-radius:8px;background:rgba(8,20,38,.8);` +
        `border:1px solid ${C.edge};color:${C.cyan};font-size:10px;font-weight:700;white-space:nowrap;` +
        `font-variant-numeric:tabular-nums;pointer-events:none;`
    );
    hud.appendChild(d);
    const item = { el: d, world: new THREE.Vector3(), visible: true };
    labels.push(item);
    return item;
  }

  // ---- scene --------------------------------------------------------------
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, W0 / H0, 0.1, 80);

  scene.add(new THREE.HemisphereLight(0x9fc8ff, 0x0b1f3a, 0.9));
  const key = new THREE.DirectionalLight(0xeaf3ff, 1.2);
  key.position.set(5, 9, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x5fe0ff, 0.35);
  rim.position.set(-6, 4, -5);
  scene.add(rim);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(9.5, 48),
    new THREE.MeshStandardMaterial({ color: 0x0a1c33, roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.005;
  scene.add(ground);
  const grid = new THREE.GridHelper(18, 36, 0x1c3c66, 0x12294a);
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  scene.add(grid);

  // camera rig
  const rig =
    mode === "geometry"
      ? { target: new THREE.Vector3(0, 2.3, 0), radius: 11.4, yaw: 0.6, pitch: 0.24 }
      : { target: new THREE.Vector3(0, 2.5, 0), radius: 10.6, yaw: 0.55, pitch: 0.22 };
  let userYaw = 0;
  let userPitch = 0;
  let elapsed = 0;
  function placeCamera() {
    const auto = ctx.reducedMotion ? 0 : Math.sin(elapsed * 0.35) * 0.12; // peak rate ~2.4 deg/s
    const yaw = rig.yaw + auto + userYaw;
    const pitch = clamp(rig.pitch + userPitch, 0.06, 0.5);
    camera.position.set(
      rig.target.x + rig.radius * Math.cos(pitch) * Math.sin(yaw),
      rig.target.y + rig.radius * Math.sin(pitch),
      rig.target.z + rig.radius * Math.cos(pitch) * Math.cos(yaw)
    );
    camera.lookAt(rig.target);
  }
  placeCamera();

  // raycasting
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function setRayFromEvent(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
  }

  // ---- mode content -------------------------------------------------------
  /** hooks filled by the mode builder */
  const hooks = {
    tick: () => {},
    pick: () => null,
    dragMove: () => {},
    dragEnd: () => {},
    hoverables: [],
    anchors: {},
    state: () => ({}),
  };

  // ======================= GEOMETRY MODE ====================================
  if (mode === "geometry") {
    const focalMm = numP(P.focalSpotMm, 3, 0.5, 5);
    const specMm = numP(P.specUgMm, 0.5, 0.1, 1.0);
    const tMm = numP(P.plateThicknessMm, 12, 6, 25);
    let sodMm = numP(P.sodMm, 220, 150, 450);
    let gapMm = numP(P.gapMm, 45, 0, 60);
    const tU = tMm / 100;

    const bench = buildBench(scene, tU);
    const head = buildHead(scene, true);
    const beam = buildBeam(scene);

    // IQI target zone on the source-side weld surface
    const zone = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.1),
      new THREE.MeshBasicMaterial({
        color: 0x5fe0ff,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    zone.rotation.x = -Math.PI / 2;
    zone.position.set(0, tU + 0.125, 0.55);
    bench.plateGroup.add(zone);

    // IQI (ASTM wire-type: wires run ACROSS the weld axis)
    const iqi = new THREE.Group();
    const plaque = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.026, 0.36),
      new THREE.MeshStandardMaterial({ color: 0xd8c08e, roughness: 0.8, metalness: 0.05 })
    );
    plaque.position.y = 0.013;
    iqi.add(plaque);
    for (let i = 0; i < 6; i++) {
      const r = 0.005 + i * 0.0022;
      const wgeo = new THREE.CylinderGeometry(r, r, 0.3, 8);
      wgeo.rotateZ(Math.PI / 2);
      const w = new THREE.Mesh(wgeo, steelMat(0x76828f, 0.4, 0.8));
      w.position.set(0, 0.028, -0.125 + i * 0.05);
      iqi.add(w);
    }
    const tab = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.06), steelMat(0x3a4654, 0.5, 0.7));
    tab.position.set(-0.19, 0.028, -0.13);
    iqi.add(tab);
    scene.add(iqi);

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.3, 0.52, 20), steelMat(0x16294a, 0.8, 0.25));
    pedestal.position.set(-2.2, 0.26, 1.85);
    scene.add(pedestal);
    const iqiHome = new THREE.Vector3(-2.2, 0.535, 1.85);
    iqi.position.copy(iqiHome);
    let iqiPlaced = false;

    // dimension lines + labels
    const dimSod = makeDim(scene, 0x5fe0ff);
    const dimGap = makeDim(scene, 0x9fc4ff);
    const sodLabel = addLabel();
    const gapLabel = addLabel();

    const plateTopY = () => bench.cassetteTopY + gapMm / 100 + tU;

    // right control panel
    const panel = glassPanel(
      "top:12px;right:12px;width:250px;max-width:46%;padding:12px 14px;max-height:calc(100% - 24px);overflow:auto;"
    );
    hud.appendChild(panel);
    panel.appendChild(
      el("div", `font-size:11px;font-weight:800;letter-spacing:.12em;color:${C.cyan};`, "SHOOTING GEOMETRY")
    );

    const sodCtl = makeSlider("Source → object (SOD)", "sod", 150, 450, 1, sodMm, (v) => `${fmt(v, 0)} mm`, (v) => {
      sodMm = v;
      refresh();
    });
    const gapCtl = makeSlider("Object → film gap", "gap", 0, 60, 1, gapMm, (v) => `${fmt(v, 0)} mm`, (v) => {
      gapMm = v;
      refresh();
    });
    panel.append(sodCtl.root, gapCtl.root);

    const formula = el(
      "div",
      `margin-top:10px;padding:9px 10px;border-radius:10px;background:rgba(8,20,38,.55);border:1px solid ${C.edge};` +
        `font-size:11.5px;line-height:1.55;font-variant-numeric:tabular-nums;`
    );
    panel.appendChild(formula);

    const prevWrap = el("div", "margin-top:10px;");
    prevWrap.appendChild(
      el(
        "div",
        `display:flex;justify-content:space-between;font-size:10px;color:${C.dim};letter-spacing:.06em;margin-bottom:4px;`,
        `<span>GHOST RADIOGRAPH</span><span>blur = U<sub>g</sub> × 6</span>`
      )
    );
    const prev = el("canvas", `width:100%;border-radius:10px;border:1px solid ${C.edge};display:block;background:#0a1424;`);
    prev.width = 222;
    prev.height = 124;
    prevWrap.appendChild(prev);
    panel.appendChild(prevWrap);
    panel.appendChild(
      el(
        "div",
        `margin-top:9px;font-size:11px;color:${C.dim};line-height:1.5;`,
        `Drag the <b style="color:${C.ink}">IQI plaque</b> onto the <b style="color:${C.cyan}">source-side weld surface</b> — wires across the seam.`
      )
    );

    // offscreen feature canvas for the preview
    const feat = document.createElement("canvas");
    feat.width = 206;
    feat.height = 108;
    const noise = document.createElement("canvas");
    noise.width = 64;
    noise.height = 64;
    {
      const nctx = noise.getContext("2d");
      const img = nctx.createImageData(64, 64);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 120 + Math.random() * 135;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 26;
      }
      nctx.putImageData(img, 0, 0);
    }

    function drawFeatures() {
      const g = feat.getContext("2d");
      g.clearRect(0, 0, feat.width, feat.height);
      // film is darker where more radiation got through; the weld bead is THICKER
      // section, so the bead band reads lighter than the parent plate.
      g.fillStyle = "#46596e";
      g.fillRect(0, 0, feat.width, feat.height);
      const bx = 75, bw = 56;
      g.fillStyle = "#8ba0b6";
      g.fillRect(bx, 0, bw, feat.height);
      g.fillStyle = "#c2d3e4";
      g.fillRect(bx - 1, 0, 2.4, feat.height);
      g.fillRect(bx + bw - 1, 0, 2.4, feat.height);
      // root band (extra metal -> lighter) with a dark lack-of-penetration stretch
      g.fillStyle = "#9fb4c8";
      g.fillRect(bx + bw / 2 - 5, 0, 10, feat.height);
      g.fillStyle = "#23303e";
      g.fillRect(bx + bw / 2 - 1.2, 16, 2.4, 30);
      // porosity (voids -> more exposure -> darker dots)
      g.fillStyle = "#2a3845";
      for (const [px, py, pr] of [[bx + 14, 70, 2.2], [bx + 38, 86, 1.7], [bx + 26, 30, 1.4]]) {
        g.beginPath();
        g.arc(px, py, pr, 0, Math.PI * 2);
        g.fill();
      }
      if (iqiPlaced) {
        // wire images: denser wires absorb -> lighter lines; diameters increase,
        // so blur (Ug) erases the thinnest wires first — the sensitivity story.
        for (let i = 0; i < 6; i++) {
          g.fillStyle = "#dce8f4";
          const wy = 22 + i * 12.5;
          const wh = 0.7 + i * 0.45;
          g.fillRect(bx - 18, wy, bw + 36, wh);
        }
        g.strokeStyle = "rgba(220,232,244,.55)";
        g.lineWidth = 1;
        g.strokeRect(bx - 24, 14, bw + 48, 86);
      }
    }

    function drawPreview(ug) {
      const g = prev.getContext("2d");
      g.clearRect(0, 0, prev.width, prev.height);
      g.fillStyle = "#0a1424";
      g.fillRect(0, 0, prev.width, prev.height);
      drawFeatures();
      const px = clamp(ug * 6, 0, 16);
      g.save();
      g.filter = px > 0.05 ? `blur(${px.toFixed(2)}px)` : "none";
      g.drawImage(feat, 8, 8);
      g.restore();
      g.globalAlpha = 0.5;
      for (let x = 8; x < 214; x += 64) for (let y = 8; y < 116; y += 64) g.drawImage(noise, x, y);
      g.globalAlpha = 1;
      g.strokeStyle = "rgba(150,200,255,.28)";
      g.strokeRect(8.5, 8.5, 205, 107);
    }

    // Ug bookkeeping (tick-based hold so a transient pass doesn't count)
    let ugMm = 0;
    let ugOkTime = 0;

    function refresh() {
      sodCtl.set(sodMm);
      gapCtl.set(gapMm);
      const gapU = gapMm / 100;
      bench.plateGroup.position.y = bench.cassetteTopY + gapU;
      const topY = plateTopY();
      head.position.y = topY + sodMm / 100;
      beam.update(head.position.y, bench.cassetteTopY + 0.006);

      const ofdMm = tMm + gapMm;
      ugMm = (focalMm * ofdMm) / sodMm;
      const pass = ugMm <= specMm;
      formula.innerHTML =
        `<div style="color:${C.dim};letter-spacing:.04em;">U<sub>g</sub> = f · OFD / SOD</div>` +
        `<div>= ${fmt(focalMm, 1)} × ${fmt(ofdMm, 0)} / ${fmt(sodMm, 0)}</div>` +
        `<div style="font-size:14px;font-weight:800;color:${pass ? C.good : C.bad};">U<sub>g</sub> = ${fmt(ugMm, 2)} mm ` +
        chip(pass ? `PASS ≤ ${fmt(specMm, 2)}` : `FAIL > ${fmt(specMm, 2)}`, pass ? C.good : C.bad) +
        `</div>` +
        `<div style="color:${C.dim};font-size:10.5px;">OFD = t ${fmt(tMm, 0)} + gap ${fmt(gapMm, 0)} = ${fmt(ofdMm, 0)} mm (source-side surface → film)</div>`;
      if (!pass) ugOkTime = 0;
      drawPreview(ugMm);

      dimSod.set(new THREE.Vector3(-1.72, topY, 1.3), new THREE.Vector3(-1.72, head.position.y, 1.3));
      dimGap.set(
        new THREE.Vector3(-2.02, bench.cassetteTopY, 1.3),
        new THREE.Vector3(-2.02, bench.cassetteTopY + gapU, 1.3)
      );
      sodLabel.world.set(-1.72, (topY + head.position.y) / 2, 1.3);
      sodLabel.el.textContent = `SOD ${fmt(sodMm, 0)} mm`;
      gapLabel.world.set(-2.02, bench.cassetteTopY + gapU / 2 + 0.09, 1.3);
      gapLabel.el.textContent = `gap ${fmt(gapMm, 0)} mm`;

      if (iqiPlaced) iqi.position.set(0, topY + bench.beadH + 0.015, 0.55);
    }
    refresh();

    // drag interactions
    const dragPlane = new THREE.Plane();
    const hitPt = new THREE.Vector3();
    const flights = []; // ease-back animations

    hooks.pick = (ray) => {
      if (!iqiPlaced) {
        const hi = ray.intersectObject(iqi, true);
        if (hi.length) {
          dragPlane.set(new THREE.Vector3(0, 1, 0), -plateTopY());
          const grab = ray.ray.intersectPlane(dragPlane, hitPt)
            ? hitPt.clone().sub(new THREE.Vector3(iqi.position.x, 0, iqi.position.z))
            : new THREE.Vector3();
          grab.y = 0;
          return { kind: "iqi", grab, planeC: -plateTopY() };
        }
      }
      const hh = ray.intersectObject(head, true);
      if (hh.length) {
        const n = camera.position.clone().sub(rig.target);
        n.y = 0;
        n.normalize();
        return { kind: "sod", n };
      }
      return null;
    };

    hooks.dragMove = (drag, ray) => {
      if (drag.kind === "iqi") {
        dragPlane.set(new THREE.Vector3(0, 1, 0), drag.planeC);
        if (!ray.ray.intersectPlane(dragPlane, hitPt)) return;
        const x = clamp(hitPt.x - drag.grab.x, -2.6, 2.6);
        const z = clamp(hitPt.z - drag.grab.z, -2.3, 2.3);
        let y = -drag.planeC + 0.012;
        const overPlate = Math.abs(x) <= 1.5 && Math.abs(z) <= 1.5;
        const overCassette = Math.abs(x) <= 1.7 && Math.abs(z) <= 2.25;
        if (!overPlate && overCassette) y = bench.cassetteTopY + 0.02; // visibly drops to the film side
        iqi.position.set(x, y, z);
      } else if (drag.kind === "sod") {
        dragPlane.setFromNormalAndCoplanarPoint(drag.n, new THREE.Vector3(0, 0, 0));
        if (!ray.ray.intersectPlane(dragPlane, hitPt)) return;
        sodMm = clamp(Math.round((hitPt.y - plateTopY()) * 100), 150, 450);
        refresh();
      }
    };

    hooks.dragEnd = (drag) => {
      if (drag.kind !== "iqi" || iqiPlaced) return;
      const x = iqi.position.x;
      const z = iqi.position.z;
      const onWeldZone = Math.abs(x) <= 0.85 && Math.abs(z - 0.55) <= 0.62;
      const onPlate = Math.abs(x) <= 1.5 && Math.abs(z) <= 1.5;
      const onFilmSide = !onPlate && Math.abs(x) <= 1.7 && Math.abs(z) <= 2.25;
      if (onWeldZone) {
        iqiPlaced = true;
        iqi.position.set(0, plateTopY() + bench.beadH + 0.015, 0.55);
        zone.visible = false;
        toast("IQI on the source side — sensitivity is judged at the worst-case plane.", C.good);
        drawPreview(ugMm);
        report("placeIQI");
      } else if (onFilmSide) {
        toast("That's the film side — codes want the IQI on the SOURCE side whenever practical.", C.bad);
        flights.push({ from: iqi.position.clone(), t: 0 });
      } else if (onPlate) {
        toast("On the plate, but cover the weld — wires across the seam.", C.warn);
        flights.push({ from: iqi.position.clone(), t: 0 });
      } else {
        flights.push({ from: iqi.position.clone(), t: 0 });
      }
    };

    hooks.hoverables = [iqi, head];

    hooks.tick = (dt) => {
      if (!iqiPlaced) {
        zone.material.opacity = ctx.reducedMotion ? 0.14 : 0.1 + 0.06 * (0.5 + 0.5 * Math.sin(elapsed * 3));
      }
      for (let i = flights.length - 1; i >= 0; i--) {
        const f = flights[i];
        f.t = Math.min(1, f.t + dt * 2.4);
        const k = 1 - Math.pow(1 - f.t, 3);
        iqi.position.lerpVectors(f.from, iqiHome, k);
        iqi.position.y += Math.sin(k * Math.PI) * 0.35;
        if (f.t >= 1) flights.splice(i, 1);
      }
      if (ugMm <= specMm && !doneSet.has("meetUg")) {
        ugOkTime += dt;
        if (ugOkTime >= 0.5) report("meetUg");
      }
    };

    hooks.anchors = {
      iqi: () => iqi.getWorldPosition(new THREE.Vector3()),
      iqiTarget: () => new THREE.Vector3(0, plateTopY() + 0.13, 0.55),
      sourceHead: () => new THREE.Vector3(0, head.position.y + 0.48, 0),
    };
    hooks.state = () => ({
      mode,
      focalMm,
      specMm,
      tMm,
      sodMm,
      gapMm,
      ofdMm: tMm + gapMm,
      ugMm,
      iqiPlaced,
      done: [...doneSet],
    });
  }

  // ======================= EXPOSURE MODE ====================================
  if (mode === "exposure") {
    const isotope = typeof P.isotope === "string" ? P.isotope : "Ir-192";
    const halfLife = numP(P.halfLifeDays, 73.8, 1, 120);
    const curies0 = numP(P.curies, 40, 5, 100);
    const dmin = numP(P.targetDmin, 2.0, 1.5, 2.5);
    const dmax = numP(P.targetDmax, 3.0, 2.5, 4.0);
    const maxTime = numP(P.maxTimeMin, 20, 10, 60);

    // toy characteristic curve (industrial film-ish: base+fog .26, shoulder ~4.2,
    // gradient ~4 per decade of exposure). E in Ci*min at fixed SFD.
    const DBASE = 0.26;
    const DRANGE = 3.94;
    const SLOPE = 1.8; // per ln(E)
    const E50 = 6.5 * curies0; // mid-density exposure; scales with the source so any config stays completable
    const densityFor = (E) => (E <= 0 ? DBASE : DBASE + DRANGE / (1 + Math.exp(-SLOPE * Math.log(E / E50))));

    const tU = 0.12;
    const bench = buildBench(scene, tU); // gap = 0 -> film-contact technique
    bench.plateGroup.position.y = bench.cassetteTopY;
    const head = buildHead(scene, false);
    const SFD_U = 5.0; // 500 mm at scene scale (fixed)
    const plateTopY = bench.cassetteTopY + tU;
    head.position.y = plateTopY + SFD_U;
    const beam = buildBeam(scene);
    beam.update(head.position.y, bench.cassetteTopY + 0.006);
    beam.visible = false;

    // crank-out projector + guide tube (visual context)
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.55), steelMat(0x1b3050, 0.6, 0.4));
    box.position.set(2.5, 0.25, -1.1);
    edgeLines(box, 0x4a6e9c, 0.5);
    scene.add(box);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.5, 0.52, -1.1),
      new THREE.Vector3(2.0, 2.0, -0.7),
      new THREE.Vector3(1.0, 4.1, -0.25),
      new THREE.Vector3(0.18, head.position.y + 0.35, 0),
    ]);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.045, 8, false), steelMat(0x4f6f96, 0.5, 0.5));
    scene.add(tube);
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0x9ff0ff, transparent: true, opacity: 0 })
    );
    glow.position.copy(head.position);
    scene.add(glow);

    // state
    let day = 0;
    let lastD = null;
    let displayD = 0;
    let stale = false;
    let decayed = false;
    let phase = null; // expose animation
    const activity = () => curies0 * Math.pow(2, -day / halfLife);

    // console panel
    const panel = glassPanel(
      "top:12px;right:12px;width:252px;max-width:48%;padding:12px 14px;max-height:calc(100% - 24px);overflow:auto;"
    );
    hud.appendChild(panel);
    panel.appendChild(el("div", `font-size:11px;font-weight:800;letter-spacing:.12em;color:${C.cyan};`, "EXPOSURE CONSOLE"));

    const srcRow = el("div", "display:flex;justify-content:space-between;align-items:center;margin-top:8px;gap:6px;");
    const isoChip = el(
      "div",
      `padding:4px 9px;border-radius:8px;background:rgba(8,20,38,.6);border:1px solid ${C.edge};font-size:11px;font-weight:700;`,
      `${isotope} · T<sub>½</sub> ${fmt(halfLife, 1)} d`
    );
    const dayChip = el(
      "div",
      `padding:4px 9px;border-radius:8px;background:rgba(8,20,38,.6);border:1px solid ${C.edge};font-size:11px;font-weight:700;color:${C.cyan};font-variant-numeric:tabular-nums;`,
      "Day 0"
    );
    srcRow.append(isoChip, dayChip);
    panel.appendChild(srcRow);

    const actLine = el("div", `margin-top:8px;font-size:12px;font-variant-numeric:tabular-nums;`);
    panel.appendChild(actLine);

    const timeCtl = makeSlider("Exposure time", "time", 0.5, maxTime, 0.1, 6, (v) => `${fmt(v, 1)} min`, () => updateReadout());
    panel.appendChild(timeCtl.root);

    const eLine = el(
      "div",
      `margin-top:4px;padding:7px 9px;border-radius:9px;background:rgba(8,20,38,.55);border:1px solid ${C.edge};` +
        `font-size:11.5px;line-height:1.5;font-variant-numeric:tabular-nums;`
    );
    panel.appendChild(eLine);

    const btnRow = el("div", "display:flex;gap:8px;margin-top:10px;");
    const exposeBtn = makeBtn("Expose film", "expose", true, () => startExpose());
    const decayBtn = makeBtn("30 days later", "decay", false, () => {
      if (phase || disposed) return;
      day += 30;
      decayed = true;
      stale = lastD != null;
      dayChip.textContent = `Day ${day}`;
      updateReadout();
      toast(`Source decayed to ${fmt(activity(), 1)} Ci — re-expose to verify density.`, C.warn);
    });
    btnRow.append(exposeBtn, decayBtn);
    panel.appendChild(btnRow);

    const staleChip = el(
      "div",
      `margin-top:8px;padding:5px 9px;border-radius:8px;border:1px solid ${C.warn};color:${C.warn};` +
        `font-size:10.5px;font-weight:700;display:none;`,
      "Source decayed — last film is stale, re-expose"
    );
    panel.appendChild(staleChip);

    const meterRow = el("div", "display:flex;gap:8px;margin-top:10px;align-items:flex-start;");
    const gauge = el("canvas", `border-radius:10px;border:1px solid ${C.edge};background:rgba(8,20,38,.55);display:block;`);
    gauge.width = 158;
    gauge.height = 112;
    const strip = el("canvas", `border-radius:8px;border:1px solid ${C.edge};display:block;background:#0a1424;`);
    strip.width = 56;
    strip.height = 112;
    meterRow.append(gauge, strip);
    panel.appendChild(meterRow);
    const verdict = el("div", `margin-top:7px;font-size:11.5px;font-weight:700;min-height:15px;`);
    panel.appendChild(verdict);
    panel.appendChild(
      el(
        "div",
        `margin-top:6px;font-size:10.5px;color:${C.dim};line-height:1.5;`,
        `Target density ${fmt(dmin, 1)}–${fmt(dmax, 1)} · SFD fixed 0.5 m · toy reciprocity: E = A × t`
      )
    );

    function updateReadout() {
      const A = activity();
      const t = timeCtl.get();
      actLine.innerHTML =
        `Activity now <b style="font-size:14px;">${fmt(A, 1)} Ci</b> ` +
        `<span style="color:${C.dim};font-size:10.5px;">A = ${fmt(curies0, 0)} × 2<sup>−${day}/${fmt(halfLife, 1)}</sup></span>`;
      eLine.innerHTML = `E = A × t = ${fmt(A, 1)} × ${fmt(t, 1)} = <b>${fmt(A * t, 0)} Ci·min</b>`;
      staleChip.style.display = stale ? "block" : "none";
    }

    function drawGauge() {
      const g = gauge.getContext("2d");
      const w = gauge.width, h = gauge.height;
      g.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h - 16, r = 62;
      const a = (D) => Math.PI * (1 - clamp(D, 0, 4) / 4); // 180 deg sweep, 0 at left
      g.lineWidth = 9;
      g.strokeStyle = "rgba(150,200,255,.18)";
      g.beginPath();
      g.arc(cx, cy, r, Math.PI, 0);
      g.stroke();
      g.strokeStyle = "rgba(95,224,255,.55)";
      g.beginPath();
      g.arc(cx, cy, r, a(dmin), a(dmax), true);
      g.stroke();
      g.fillStyle = C.dim;
      g.font = `700 8.5px ${FONT}`;
      g.textAlign = "center";
      for (let D = 0; D <= 4; D += 1) {
        const ang = a(D);
        g.fillText(String(D), cx + Math.cos(ang) * (r + 11), cy - Math.sin(ang) * (r + 11) + 3);
      }
      const ang = a(displayD);
      g.strokeStyle = "#ffffff";
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(ang) * (r - 8), cy - Math.sin(ang) * (r - 8));
      g.stroke();
      g.fillStyle = C.cyan;
      g.beginPath();
      g.arc(cx, cy, 4, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = lastD == null ? C.dim : C.ink;
      g.font = `800 15px ${FONT}`;
      g.fillText(lastD == null ? "—" : fmt(displayD, 2), cx, cy - 26);
      g.font = `600 8px ${FONT}`;
      g.fillStyle = C.dim;
      g.fillText("FILM DENSITY", cx, cy + 12);
    }

    function drawStrip() {
      const g = strip.getContext("2d");
      const w = strip.width, h = strip.height;
      g.clearRect(0, 0, w, h);
      g.fillStyle = "#dfe9f6"; // illuminator bezel
      g.fillRect(0, 0, w, h);
      const D = lastD == null ? 0.08 : displayD;
      const L = (DD) => clamp(255 * Math.pow(Math.pow(10, -DD), 0.35), 4, 250);
      const base = L(D);
      g.fillStyle = `rgb(${base | 0},${(base * 1.04) | 0},${(base * 1.1) | 0})`;
      g.fillRect(5, 5, w - 10, h - 10);
      // weld bead band: thicker metal -> lower density -> brighter on the viewer
      const bandL = L(Math.max(DBASE, D - 0.45));
      g.fillStyle = `rgb(${bandL | 0},${(bandL * 1.03) | 0},${(bandL * 1.08) | 0})`;
      g.fillRect(w / 2 - 7, 5, 14, h - 10);
      if (lastD != null) {
        const dotL = L(Math.min(4.2, D + 0.5));
        g.fillStyle = `rgb(${dotL | 0},${dotL | 0},${dotL | 0})`;
        g.beginPath();
        g.arc(w / 2 + 3, h * 0.62, 2.2, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = "#56708e";
      g.font = `600 7.5px ${FONT}`;
      g.textAlign = "center";
      g.fillText(lastD == null ? "no film" : "on viewer", w / 2, h - 9);
    }

    function setBtns(on) {
      for (const b of [exposeBtn, decayBtn]) {
        b.style.opacity = on ? "1" : "0.45";
        b.style.pointerEvents = on ? "auto" : "none";
      }
    }

    function startExpose() {
      if (phase || disposed) return;
      phase = { t: 0, dur: 1.15 };
      setBtns(false);
      beam.visible = true;
      glow.material.opacity = 0.3;
    }

    function finishExpose() {
      const A = activity();
      const t = timeCtl.get();
      const E = A * t;
      lastD = densityFor(E);
      stale = false;
      const inWin = lastD >= dmin && lastD <= dmax;
      verdict.innerHTML = inWin
        ? `<span style="color:${C.good};">D = ${fmt(lastD, 2)} — in the window</span> ${chip("GOOD", C.good)}`
        : lastD < dmin
          ? `<span style="color:${C.bad};">D = ${fmt(lastD, 2)} — too light, add time</span>`
          : `<span style="color:${C.bad};">D = ${fmt(lastD, 2)} — too dark, cut time</span>`;
      bench.filmMesh.material.color
        .set("#2a3c31")
        .lerp(new THREE.Color("#0a100c"), clamp(lastD / 4, 0, 1));
      updateReadout();
      if (inWin) {
        report("hitDensity");
        if (decayed) report("compensateDecay");
      }
    }

    updateReadout();
    drawGauge();
    drawStrip();

    hooks.tick = (dt) => {
      if (phase) {
        phase.t += dt;
        const k = phase.t / phase.dur;
        beam.material.opacity = ctx.reducedMotion ? 0.11 : 0.06 + 0.07 * (0.5 + 0.5 * Math.sin(k * Math.PI * 7));
        glow.material.opacity = 0.18 + 0.18 * (0.5 + 0.5 * Math.sin(k * Math.PI * 9));
        if (phase.t >= phase.dur) {
          phase = null;
          beam.visible = false;
          glow.material.opacity = 0;
          finishExpose();
          setBtns(true);
        }
      }
      const target = lastD == null ? 0 : lastD;
      const prevD = displayD;
      displayD += (target - displayD) * Math.min(1, dt * 7);
      if (Math.abs(displayD - prevD) > 0.0004 || phase) {
        drawGauge();
        drawStrip();
      }
    };

    hooks.anchors = {
      sourceHead: () => new THREE.Vector3(0, head.position.y + 0.48, 0),
    };
    hooks.state = () => ({
      mode,
      isotope,
      halfLifeDays: halfLife,
      curies0,
      day,
      activityCi: activity(),
      timeMin: timeCtl.get(),
      e50: E50,
      lastD,
      dmin,
      dmax,
      stale,
      decayed,
      animating: !!phase,
      done: [...doneSet],
    });
  }

  // ---- pointer interaction (drag objects or orbit) -------------------------
  let drag = null;
  function onPointerDown(e) {
    if (disposed) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (_) {}
    setRayFromEvent(e);
    const d = hooks.pick(raycaster);
    drag = d || { kind: "orbit", x: e.clientX, y: e.clientY, yaw: userYaw, pitch: userPitch };
    canvas.style.cursor = d ? "grabbing" : "move";
    e.preventDefault();
  }
  function onPointerMove(e) {
    if (disposed) return;
    if (!drag) {
      if (hooks.hoverables.length) {
        setRayFromEvent(e);
        const over = hooks.hoverables.some((o) => raycaster.intersectObject(o, true).length > 0);
        canvas.style.cursor = over ? "grab" : "default";
      }
      return;
    }
    if (drag.kind === "orbit") {
      userYaw = clamp(drag.yaw + (e.clientX - drag.x) * 0.005, -0.55, 0.55);
      userPitch = clamp(drag.pitch + (e.clientY - drag.y) * 0.003, -0.12, 0.2);
    } else {
      setRayFromEvent(e);
      hooks.dragMove(drag, raycaster);
    }
  }
  function onPointerUp(e) {
    if (disposed || !drag) return;
    if (drag.kind !== "orbit") {
      setRayFromEvent(e);
      hooks.dragEnd(drag, raycaster);
    }
    drag = null;
    canvas.style.cursor = "default";
  }
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  window.addEventListener("pointerup", onPointerUp);

  // ---- frame loop ----------------------------------------------------------
  let raf = 0;
  let running = false;
  let last = performance.now();
  const projV = new THREE.Vector3();
  function frame(now) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    elapsed += dt;
    placeCamera();
    hooks.tick(dt);
    const r = canvas.getBoundingClientRect();
    for (const L of labels) {
      projV.copy(L.world).project(camera);
      const behind = projV.z > 1;
      L.el.style.display = L.visible && !behind ? "block" : "none";
      if (!behind) {
        L.el.style.left = `${((projV.x + 1) / 2) * r.width}px`;
        L.el.style.top = `${((1 - projV.y) / 2) * r.height}px`;
      }
    }
    renderer.render(scene, camera);
  }
  function start() {
    if (running || disposed) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }
  function onVis() {
    if (document.hidden) stop();
    else start();
  }
  document.addEventListener("visibilitychange", onVis);
  start();

  // ---- resize --------------------------------------------------------------
  const ro = new ResizeObserver(() => {
    if (disposed) return;
    const w = container.clientWidth || ctx.width || W0;
    const h = container.clientHeight || ctx.height || H0;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  ro.observe(container);

  // ---- handle ---------------------------------------------------------------
  function dispose() {
    if (disposed) return;
    disposed = true;
    stop();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    for (const id of timers) clearTimeout(id);
    timers.clear();
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          for (const k in m) if (m[k] && m[k].isTexture) m[k].dispose();
          m.dispose();
        }
      }
    });
    renderer.dispose();
    try {
      renderer.forceContextLoss && renderer.forceContextLoss();
    } catch (_) {}
    wrapper.remove();
  }

  return {
    dispose,
    /** test/debug hook: screen coords of named anchors + readable physics state */
    debug: {
      screenXY(name) {
        const fn = hooks.anchors[name];
        if (!fn) return null;
        const v = fn().project(camera);
        const r = canvas.getBoundingClientRect();
        return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
      },
      state: () => hooks.state(),
    },
  };
}
