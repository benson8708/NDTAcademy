// @ts-nocheck — plain-JS engine, functionally validated via harness (see media-build/trainer-harness)
// NDTAcademy 3-D method trainer — MT (Magnetic Particle Testing).
// Implements the TrainerMount contract in src/components/trainer3d/contract.ts:
//   export default mount(container, config, ctx) -> { dispose() }
//   export const MANIFEST
//
// Physics model (simplified but honest):
//   Magnetic flux leaks at a surface discontinuity only where the flux path
//   CROSSES the discontinuity. Sensitivity grows with the crossing angle: a
//   crack parallel to the flux produces no leakage field and holds no
//   particles; a crack within ~45 degrees of perpendicular to the flux gives a
//   usable leakage field, strongest at 90 degrees. Hence:
//     - AC yoke: flux runs pole-to-pole between the legs, so the inspector
//       orients the yoke so its pole-to-pole axis crosses the crack.
//     - Head shot (current through the bar): right-hand-rule CIRCULAR flux
//       wraps the bar -> reveals LONGITUDINAL (axis-parallel) cracks.
//     - Coil shot (current in an encircling coil): LONGITUDINAL flux along the
//       bar axis -> reveals TRANSVERSE (circumferential) cracks.
//   Particles accumulate only when applied (dust / bath) while leakage exists.
//
// Plain ESM JavaScript with JSDoc types. No DOM assumptions beyond `container`.

import * as THREE from "three";

/** @typedef {import("../contract").TrainerConfig} TrainerConfig */
/** @typedef {import("../contract").TrainerCtx} TrainerCtx */
/** @typedef {import("../contract").TrainerHandle} TrainerHandle */

export const MANIFEST = {
  engine: "mt",
  modes: {
    "yoke-orientation": {
      description:
        "Steel plate with three surface cracks at different orientations. Drag (or use the slider) to rotate an energized AC yoke; flux runs pole-to-pole between the legs. Dust dry particles: a crack indicates only while the flux crosses it within ~45° of perpendicular. Indicate all three cracks.",
      params: {
        crackAngles:
          "Array of 3 crack orientations in degrees, each 0–180, measured in the plate plane (0 = +X axis). Default [0, 60, 120].",
        indicationThresholdDeg:
          "Minimum flux-to-crack crossing angle (0 = parallel/no leakage, 90 = perpendicular/max leakage) required for an indication. Range 35–60, default 45.",
        startAngleDeg:
          "Initial yoke axis angle in degrees, 0–180. Default 25.",
      },
      taskIds: ["indicateA", "indicateB", "indicateC"],
    },
    "field-direction": {
      description:
        "Steel bar with one transverse and one longitudinal crack. Energize either the head shot (current through the bar → circular flux) or the coil shot (encircling coil → longitudinal flux); the particle bath reveals only the crack the flux crosses. Reveal both cracks, then answer a one-click which-field-finds-which check.",
      params: {
        bathMs:
          "Particle-bath time in milliseconds before an indication can develop after energizing. Range 200–2000, default 800.",
        quizLockMs:
          "Lockout in milliseconds after a wrong theory-check answer before retry. Range 0–5000, default 1200.",
      },
      taskIds: ["revealTransverse", "revealLongitudinal", "explainCheck"],
    },
  },
};

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

const FONT =
  "Manrope, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
const COL = {
  navy: "#0B1F3A",
  blue: "#1E66F5",
  cyan: "#5fe0ff",
  ink: "#dbe7ff",
  dim: "#8fa9d6",
  good: "#8aff9a",
  bad: "#ff9d9d",
  indication: 0xd8ff43, // fluorescent yellow-green particle buildup
};
const PANEL_CSS =
  "position:absolute;pointer-events:auto;box-sizing:border-box;" +
  "background:rgba(120,170,255,.07);border:1px solid rgba(150,200,255,.22);" +
  "border-radius:12px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);" +
  "box-shadow:0 10px 28px rgba(4,10,24,.45);color:" + COL.ink + ";" +
  "font-family:" + FONT + ";text-shadow:0 1px 2px rgba(0,0,0,.55);";
const BTN_CSS =
  "pointer-events:auto;cursor:pointer;border-radius:10px;padding:8px 14px;" +
  "font-family:" + FONT + ";font-size:12.5px;font-weight:700;letter-spacing:.02em;" +
  "color:#eaf2ff;background:linear-gradient(180deg,#1E66F5,#174fc4);" +
  "border:1px solid rgba(150,200,255,.4);box-shadow:0 4px 14px rgba(30,102,245,.35);";
const BTN_GHOST_CSS =
  "pointer-events:auto;cursor:pointer;border-radius:10px;padding:8px 14px;" +
  "font-family:" + FONT + ";font-size:12.5px;font-weight:700;letter-spacing:.02em;" +
  "color:" + COL.ink + ";background:rgba(120,170,255,.09);" +
  "border:1px solid rgba(150,200,255,.3);";

/** Clamp helper. */
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
/** Fold any angle in degrees into [0,180). */
function fold180(deg) { return ((deg % 180) + 180) % 180; }
/** Acute crossing angle between two undirected lines, degrees in [0,90]. 90 = perpendicular. */
function lineCross(aDeg, bDeg) {
  let d = Math.abs(fold180(aDeg) - fold180(bDeg));
  if (d > 90) d = 180 - d;
  return d;
}
/** Cheap gaussian-ish jitter in [-1,1]. */
function gauss() { return (Math.random() + Math.random() + Math.random()) / 1.5 - 1; }

/** Create a styled DOM element. */
function el(tag, css, html) {
  const n = document.createElement(tag);
  if (css) n.style.cssText = css;
  if (html != null) n.innerHTML = html;
  return n;
}

/** Canvas-texture letter sprite (crack labels). */
function makeLabelSprite(text) {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const g = c.getContext("2d");
  g.beginPath(); g.arc(64, 64, 56, 0, Math.PI * 2);
  g.fillStyle = "rgba(10,22,44,.88)"; g.fill();
  g.lineWidth = 5; g.strokeStyle = "rgba(95,224,255,.9)"; g.stroke();
  g.fillStyle = "#eaf2ff";
  g.font = "700 64px " + FONT;
  g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(text, 64, 70);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sp = new THREE.Sprite(mat);
  sp.renderOrder = 20;
  return sp;
}

/**
 * Flow dots: points that travel along a set of polylines (field-direction cue).
 * @param {THREE.Vector3[][]} polylines sampled curve points (>=2 each)
 * @param {{color:number,size:number,perLine:number,closed:boolean,opacity?:number}} o
 */
function makeFlowDots(polylines, o) {
  const perLine = o.perLine;
  const count = polylines.length * perLine;
  const pos = new Float32Array(count * 3);
  const meta = [];
  for (let li = 0; li < polylines.length; li++)
    for (let k = 0; k < perLine; k++)
      meta.push({ line: li, phase: (k + Math.random() * 0.6) / perLine });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  const mat = new THREE.PointsMaterial({
    color: o.color, size: o.size, transparent: true, opacity: o.opacity ?? 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  function sample(li, tRaw) {
    const line = polylines[li];
    const t = o.closed ? ((tRaw % 1) + 1) % 1 : clamp(tRaw, 0, 1);
    const f = t * (line.length - 1), i = Math.min(Math.floor(f), line.length - 2);
    const a = line[i], b = line[i + 1], u = f - i;
    return [a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, a.z + (b.z - a.z) * u];
  }
  /** @param {number} time @param {(phase:number,time:number)=>number} tOf */
  function update(time, tOf) {
    const arr = geo.attributes.position.array;
    for (let i = 0; i < meta.length; i++) {
      const m = meta[i];
      const p = sample(m.line, tOf(m.phase, time));
      arr[i * 3] = p[0]; arr[i * 3 + 1] = p[1]; arr[i * 3 + 2] = p[2];
    }
    geo.attributes.position.needsUpdate = true;
  }
  update(0, (ph) => ph);
  return { points: pts, update };
}

/** Dashed polyline helper. */
function dashedLine(points, color, opacity, dash, gap) {
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineDashedMaterial({
    color, transparent: true, opacity, dashSize: dash, gapSize: gap, depthWrite: false,
  });
  const line = new THREE.Line(geo, mat);
  line.computeLineDistances();
  return line;
}

/** Dispose every geometry/material/texture under root. */
function deepDispose(root) {
  root.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
    for (const m of mats) {
      if (m.map) m.map.dispose();
      m.dispose();
    }
  });
}

/* ------------------------------------------------------------------ */
/* Mount                                                               */
/* ------------------------------------------------------------------ */

/** @type {import("../contract").TrainerMount} */
export default function mount(container, config, ctx) {
  const mode = config && config.mode;
  if (!MANIFEST.modes[mode]) {
    throw new Error('mt engine: unknown mode "' + mode + '"');
  }
  const params = (config && config.params) || {};

  /* ---------- task accounting ---------- */
  const modeTaskIds = MANIFEST.modes[mode].taskIds;
  const required = new Set(
    (config.tasks && config.tasks.length ? config.tasks.map((t) => t.id) : modeTaskIds)
      .filter((id) => modeTaskIds.includes(id)),
  );
  const doneTasks = new Set();
  let allFired = false;
  let hudDirty = true;
  function completeTask(id) {
    if (doneTasks.has(id)) return;
    doneTasks.add(id);
    try { ctx.onTaskDone(id); } catch (_e) { /* player owns errors */ }
    hudDirty = true;
    if (!allFired && required.size > 0 && [...required].every((r) => doneTasks.has(r))) {
      allFired = true;
      try { ctx.onAllDone(); } catch (_e) { /* noop */ }
    }
  }

  /* ---------- root DOM ---------- */
  const root = el("div",
    "position:relative;width:100%;height:100%;min-height:300px;overflow:hidden;" +
    "background:#0a1830;border-radius:inherit;user-select:none;-webkit-user-select:none;");
  container.appendChild(root);
  const W0 = container.clientWidth || ctx.width || 800;
  const H0 = container.clientHeight || ctx.height || 480;

  /* ---------- renderer / scene / camera ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(W0, H0);
  renderer.domElement.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab;";
  root.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1830);
  scene.fog = new THREE.Fog(0x0a1830, 8, 15);

  const camera = new THREE.PerspectiveCamera(42, W0 / H0, 0.1, 60);
  const orbit = {
    target: new THREE.Vector3(0, 0.05, 0),
    radius: 4.9, theta: -0.62, phi: 1.02, // azimuth / polar
    dragging: false, mode: "none", lastX: 0, lastY: 0,
  };
  function applyCamera() {
    const s = new THREE.Spherical(orbit.radius, orbit.phi, orbit.theta);
    camera.position.setFromSpherical(s).add(orbit.target);
    camera.lookAt(orbit.target);
  }
  applyCamera();

  scene.add(new THREE.HemisphereLight(0x9db8ff, 0x0b1f3a, 1.0));
  const key = new THREE.DirectionalLight(0xffffff, 1.25);
  key.position.set(2.6, 4.2, 2.2);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x5fe0ff, 0.4);
  rim.position.set(-3, 2.4, -2.6);
  scene.add(rim);

  const grid = new THREE.GridHelper(24, 24, 0x16325e, 0x102648);
  grid.position.y = -0.62;
  grid.material.transparent = true;
  grid.material.opacity = 0.55;
  scene.add(grid);

  /* ---------- HUD root ---------- */
  const hud = el("div",
    "position:absolute;inset:0;pointer-events:none;font-family:" + FONT + ";" +
    "background:radial-gradient(120% 90% at 50% 0%, rgba(94,150,255,.10), rgba(5,12,26,0) 55%);");
  root.appendChild(hud);

  /* ---------- lifecycle plumbing ---------- */
  const cleanups = [];
  function listen(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  }
  const timeouts = new Set();
  function later(fn, ms) {
    const id = setTimeout(() => { timeouts.delete(id); fn(); }, ms);
    timeouts.add(id);
  }

  let disposed = false;
  let rafId = 0;
  let last = performance.now();
  let simTime = 0;

  /* ---------- pointer / raycast plumbing ---------- */
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function setRayFromEvent(ev) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.x = ((ev.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
    ndc.y = -((ev.clientY - r.top) / Math.max(1, r.height)) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
  }

  /** Mode impl fills these hooks. */
  const impl = {
    tick: (_dt, _t) => {},
    getState: () => ({ mode }),
    /** return true if the mode consumed the drag (else camera orbit) */
    dragStart: (_ev) => false,
    dragMove: (_ev) => {},
    dragEnd: () => {},
  };

  listen(renderer.domElement, "pointerdown", (ev) => {
    if (ev.isPrimary === false) return;
    setRayFromEvent(ev);
    orbit.dragging = true;
    orbit.lastX = ev.clientX; orbit.lastY = ev.clientY;
    orbit.mode = impl.dragStart(ev) ? "tool" : "orbit";
    renderer.domElement.style.cursor = "grabbing";
  });
  listen(window, "pointermove", (ev) => {
    if (!orbit.dragging) return;
    if (orbit.mode === "tool") {
      setRayFromEvent(ev);
      impl.dragMove(ev);
    } else {
      const dx = ev.clientX - orbit.lastX, dy = ev.clientY - orbit.lastY;
      orbit.theta -= dx * 0.005;
      orbit.phi = clamp(orbit.phi - dy * 0.004, 0.55, 1.32);
      applyCamera();
    }
    orbit.lastX = ev.clientX; orbit.lastY = ev.clientY;
  });
  listen(window, "pointerup", () => {
    if (!orbit.dragging) return;
    orbit.dragging = false;
    if (orbit.mode === "tool") impl.dragEnd();
    orbit.mode = "none";
    renderer.domElement.style.cursor = "grab";
  });

  /* ---------- shared scenic bits ---------- */

  /** Falling-particle burst (dry dust / wet bath). One reusable Points cloud. */
  function makeBurst(countN, color, area) {
    const n = countN;
    const posArr = new Float32Array(n * 3);
    const vel = new Float32Array(n);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3).setUsage(THREE.DynamicDrawUsage));
    const mat = new THREE.PointsMaterial({
      color, size: 0.028, transparent: true, opacity: 0,
      depthWrite: false, sizeAttenuation: true,
    });
    const pts = new THREE.Points(geo, mat);
    pts.visible = false; pts.frustumCulled = false;
    scene.add(pts);
    const st = { t: -1 };
    function fire() {
      for (let i = 0; i < n; i++) {
        posArr[i * 3] = area.x0 + Math.random() * (area.x1 - area.x0);
        posArr[i * 3 + 1] = area.yTop + Math.random() * 0.5;
        posArr[i * 3 + 2] = area.z0 + Math.random() * (area.z1 - area.z0);
        vel[i] = 0.55 + Math.random() * 0.5;
      }
      geo.attributes.position.needsUpdate = true;
      st.t = 0; pts.visible = true; mat.opacity = 0.55;
    }
    function tick(dt) {
      if (st.t < 0) return;
      st.t += dt;
      const arr = geo.attributes.position.array;
      for (let i = 0; i < n; i++) {
        const y = arr[i * 3 + 1] - vel[i] * dt;
        arr[i * 3 + 1] = Math.max(area.yFloor, y);
      }
      geo.attributes.position.needsUpdate = true;
      const p = st.t / 1.25;
      mat.opacity = p < 0.65 ? 0.55 : 0.55 * Math.max(0, 1 - (p - 0.65) / 0.35);
      if (p >= 1) { st.t = -1; pts.visible = false; }
    }
    return { fire, tick, points: pts };
  }

  /**
   * Particle indication along a polyline (bright fluorescent buildup).
   * Hidden until revealed; reveal animates opacity in.
   */
  function makeIndication(samplePts, acrossDir) {
    const N = 150;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const f = Math.random() * (samplePts.length - 1);
      const i0 = Math.min(Math.floor(f), samplePts.length - 2);
      const a = samplePts[i0], b = samplePts[i0 + 1], u = f - i0;
      const j = gauss() * 0.018;
      pos[i * 3] = a.x + (b.x - a.x) * u + acrossDir.x * j;
      pos[i * 3 + 1] = a.y + (b.y - a.y) * u + 0.006 + Math.random() * 0.012;
      pos[i * 3 + 2] = a.z + (b.z - a.z) * u + acrossDir.z * j;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const core = new THREE.Points(geo, new THREE.PointsMaterial({
      color: COL.indication, size: 0.042, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    const glow = new THREE.Points(geo, new THREE.PointsMaterial({
      color: COL.indication, size: 0.13, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    core.frustumCulled = glow.frustumCulled = false;
    const grp = new THREE.Group();
    grp.add(core, glow);
    scene.add(grp);
    const st = { reveal: 0, on: false, strength: 1 };
    return {
      state: st,
      show(strength) { st.on = true; st.strength = clamp(strength, 0.55, 1); },
      tick(dt) {
        const tgt = st.on ? 1 : 0;
        if (st.reveal !== tgt) {
          st.reveal = clamp(st.reveal + (tgt > st.reveal ? dt * 1.8 : -dt * 1.8), 0, 1);
          core.material.opacity = 0.95 * st.reveal * st.strength;
          glow.material.opacity = 0.28 * st.reveal * st.strength;
        }
      },
    };
  }

  /* ================================================================ */
  /* MODE 1 — yoke-orientation                                        */
  /* ================================================================ */
  function buildYokeMode() {
    const PLATE_TOP = 0.15;
    const threshold = clamp(Number(params.indicationThresholdDeg) || 45, 35, 60);
    const crackAngles = Array.isArray(params.crackAngles) && params.crackAngles.length === 3
      ? params.crackAngles.map((a) => fold180(Number(a) || 0))
      : [0, 60, 120];
    let yokeDeg = fold180(Number(params.startAngleDeg ?? 25));

    /* --- plate --- */
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.3, 2.7),
      new THREE.MeshStandardMaterial({ color: 0x8b99ad, metalness: 0.45, roughness: 0.42 }),
    );
    plate.position.y = 0;
    scene.add(plate);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(plate.geometry),
      new THREE.LineBasicMaterial({ color: 0x2a4f86, transparent: true, opacity: 0.7 }),
    );
    plate.add(edges);

    /* --- cracks --- */
    const crackDefs = [
      { id: "A", task: "indicateA", pos: new THREE.Vector3(0.02, 0, 0.42) },
      { id: "B", task: "indicateB", pos: new THREE.Vector3(-0.5, 0, -0.3) },
      { id: "C", task: "indicateC", pos: new THREE.Vector3(0.52, 0, -0.32) },
    ];
    const cracks = crackDefs.map((d, i) => {
      const ang = crackAngles[i];
      const rad = THREE.MathUtils.degToRad(ang);
      const dir = new THREE.Vector3(Math.cos(rad), 0, Math.sin(rad));
      const perp = new THREE.Vector3(-Math.sin(rad), 0, Math.cos(rad));
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.74, 0.014, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x12161c, roughness: 0.9, metalness: 0.1 }),
      );
      mesh.position.set(d.pos.x, PLATE_TOP + 0.006, d.pos.z);
      mesh.rotation.y = -rad;
      scene.add(mesh);
      const label = makeLabelSprite(d.id);
      label.scale.setScalar(0.2);
      label.position.set(d.pos.x, PLATE_TOP + 0.34, d.pos.z);
      scene.add(label);
      // indication sample points along the crack line
      const pts = [];
      for (let k = 0; k <= 12; k++) {
        const t = -0.36 + (k / 12) * 0.72;
        pts.push(new THREE.Vector3(d.pos.x + dir.x * t, PLATE_TOP + 0.004, d.pos.z + dir.z * t));
      }
      const ind = makeIndication(pts, perp);
      return { id: d.id, task: d.task, angle: ang, indicated: false, indication: ind };
    });

    /* --- AC yoke (rotates about plate centre) --- */
    const yoke = new THREE.Group();
    scene.add(yoke);
    const LEG_X = 0.95;
    const legMat = new THREE.MeshStandardMaterial({ color: 0x222b38, metalness: 0.6, roughness: 0.45 });
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd9a51c, metalness: 0.2, roughness: 0.5 });
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.55, 0.3), legMat);
      leg.position.set(sx * LEG_X, PLATE_TOP + 0.275, 0);
      yoke.add(leg);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.36), legMat);
      foot.position.set(sx * LEG_X, PLATE_TOP + 0.03, 0);
      yoke.add(foot);
    }
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.24, 0.3), bodyMat);
    bridge.position.set(0, PLATE_TOP + 0.67, 0);
    yoke.add(bridge);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.13, 0.2), bodyMat);
    handle.position.set(0, PLATE_TOP + 0.86, 0);
    yoke.add(handle);
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x5fe0ff }),
    );
    led.position.set(0.22, PLATE_TOP + 0.8, 0.11);
    yoke.add(led);

    // energized inspection zone between the poles (faint)
    const zone = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 1.24),
      new THREE.MeshBasicMaterial({
        color: 0x5fe0ff, transparent: true, opacity: 0.05,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      }),
    );
    zone.rotation.x = -Math.PI / 2;
    zone.position.y = PLATE_TOP + 0.004;
    yoke.add(zone);

    // pole-to-pole flux paths on the part surface (local +X axis), fanned
    const fluxLines = [];
    for (const w of [-0.42, -0.21, 0, 0.21, 0.42]) {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-LEG_X + 0.04, PLATE_TOP + 0.012, w),
        new THREE.Vector3(0, PLATE_TOP + 0.012, w * 2.0),
        new THREE.Vector3(LEG_X - 0.04, PLATE_TOP + 0.012, w),
      );
      const pts = curve.getPoints(40);
      yoke.add(dashedLine(pts, 0x5fe0ff, 0.65, 0.085, 0.05));
      fluxLines.push(pts);
    }
    // magnetic circuit return path through the yoke body
    const circuit = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-LEG_X, PLATE_TOP + 0.55, 0),
      new THREE.Vector3(0, PLATE_TOP + 0.95, 0),
      new THREE.Vector3(LEG_X, PLATE_TOP + 0.55, 0),
    ]).getPoints(28);
    yoke.add(dashedLine(circuit, 0x5fe0ff, 0.3, 0.07, 0.06));
    const flow = makeFlowDots(fluxLines, { color: 0x5fe0ff, size: 0.05, perLine: 6, closed: false });
    yoke.add(flow.points);

    // invisible grab disc -> generous raycast target for drag-rotate
    const grab = new THREE.Mesh(
      new THREE.CircleGeometry(1.5, 24),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    grab.rotation.x = -Math.PI / 2;
    grab.position.y = PLATE_TOP + 0.002;
    scene.add(grab);
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -PLATE_TOP);

    /* --- dust burst + residue --- */
    const burst = makeBurst(420, 0x9fb89a, { x0: -1.6, x1: 1.6, z0: -1.2, z1: 1.2, yTop: 0.7, yFloor: PLATE_TOP + 0.01 });
    const resN = 260;
    const resPos = new Float32Array(resN * 3);
    for (let i = 0; i < resN; i++) {
      resPos[i * 3] = (Math.random() * 2 - 1) * 1.7;
      resPos[i * 3 + 1] = PLATE_TOP + 0.006;
      resPos[i * 3 + 2] = (Math.random() * 2 - 1) * 1.26;
    }
    const resGeo = new THREE.BufferGeometry();
    resGeo.setAttribute("position", new THREE.BufferAttribute(resPos, 3));
    const residue = new THREE.Points(resGeo, new THREE.PointsMaterial({
      color: 0x9fb89a, size: 0.02, transparent: true, opacity: 0.12, depthWrite: false,
    }));
    residue.visible = false;
    scene.add(residue);

    /* --- HUD --- */
    const title = el("div", PANEL_CSS + "left:14px;top:12px;padding:10px 14px;max-width:330px;");
    title.innerHTML =
      '<div style="font-size:11px;letter-spacing:.14em;color:' + COL.cyan + ';font-weight:800;">MT · AC YOKE</div>' +
      '<div style="font-size:14px;font-weight:800;margin-top:2px;">Flux must CROSS the crack</div>' +
      '<div style="font-size:11.5px;color:' + COL.dim + ';margin-top:3px;line-height:1.45;">Drag the yoke (or use the slider) to rotate its pole-to-pole flux, then dust. A crack indicates only when flux crosses it ≥' + threshold + '° from parallel.</div>';
    hud.appendChild(title);

    const panel = el("div", PANEL_CSS + "right:14px;top:12px;padding:10px 12px;width:236px;font-size:12px;");
    panel.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:baseline;">' +
      '<b style="font-size:12px;">Flux readout</b>' +
      '<span id="mt-yoke-deg" style="color:' + COL.cyan + ';font-weight:800;"></span></div>' +
      '<div id="mt-rows" style="margin-top:6px;display:grid;gap:5px;"></div>' +
      '<div style="margin-top:8px;border-top:1px solid rgba(150,200,255,.18);padding-top:6px;color:' + COL.dim + ';font-size:11px;">cross angle: 0° = parallel (no leak) · 90° = perpendicular (max leak)</div>';
    hud.appendChild(panel);
    const rowsBox = panel.querySelector("#mt-rows");
    const degOut = panel.querySelector("#mt-yoke-deg");
    const rowEls = cracks.map((c) => {
      const r = el("div",
        "display:flex;justify-content:space-between;gap:6px;align-items:center;" +
        "background:rgba(11,31,58,.45);border:1px solid rgba(150,200,255,.14);border-radius:8px;padding:5px 8px;");
      r.innerHTML =
        '<span style="font-weight:800;">Crack ' + c.id + ' <i style="color:' + COL.dim + ';font-style:normal;">' + Math.round(c.angle) + '°</i></span>' +
        '<span class="mt-cross" style="min-width:96px;text-align:right;"></span>';
      rowsBox.appendChild(r);
      return r.querySelector(".mt-cross");
    });

    const bar = el("div", PANEL_CSS + "left:50%;transform:translateX(-50%);bottom:12px;padding:10px 14px;display:flex;gap:14px;align-items:center;");
    const sliderWrap = el("label", "display:flex;align-items:center;gap:8px;font-size:12px;color:" + COL.ink + ";");
    sliderWrap.innerHTML = '<span style="white-space:nowrap;font-weight:700;">Yoke angle</span>';
    const slider = el("input", "width:170px;accent-color:" + COL.blue + ";pointer-events:auto;cursor:pointer;");
    slider.type = "range"; slider.min = "0"; slider.max = "180"; slider.step = "1";
    slider.id = "mt-angle"; slider.value = String(Math.round(yokeDeg));
    sliderWrap.appendChild(slider);
    bar.appendChild(sliderWrap);
    const dustBtn = el("button", BTN_CSS);
    dustBtn.id = "mt-dust";
    dustBtn.textContent = "✨ Dust particles";
    bar.appendChild(dustBtn);
    const pill = el("div",
      "display:flex;align-items:center;gap:6px;font-size:11px;color:" + COL.dim + ";white-space:nowrap;");
    pill.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:' + COL.cyan + ';box-shadow:0 0 8px ' + COL.cyan + ';"></span>AC yoke energized';
    bar.appendChild(pill);
    hud.appendChild(bar);

    /* --- yoke angle plumbing --- */
    function setYoke(deg) {
      yokeDeg = fold180(deg);
      yoke.rotation.y = -THREE.MathUtils.degToRad(yokeDeg);
      if (Number(slider.value) !== Math.round(yokeDeg)) slider.value = String(Math.round(yokeDeg));
      hudDirty = true;
    }

    /* --- dust evaluation (the MT physics gate) --- */
    let pendingEval = -1;
    let evalYokeDeg = yokeDeg;
    function dust() {
      burst.fire();
      residue.visible = true;
      evalYokeDeg = yokeDeg; // particles land in the field present when applied
      pendingEval = simTime + 0.45;
      dustBtn.disabled = true;
      dustBtn.style.opacity = "0.55";
      later(() => { if (!disposed) { dustBtn.disabled = false; dustBtn.style.opacity = "1"; } }, 750);
    }
    function evaluateDust() {
      for (const c of cracks) {
        const cross = lineCross(evalYokeDeg, c.angle);
        if (cross >= threshold) {
          // leakage strength grows toward perpendicular
          const strength = 0.55 + 0.45 * Math.sin(THREE.MathUtils.degToRad(cross));
          c.indication.show(strength);
          if (!c.indicated) {
            c.indicated = true;
            completeTask(c.task);
          }
        }
      }
      hudDirty = true;
    }

    listen(slider, "input", () => setYoke(Number(slider.value)));
    listen(dustBtn, "click", dust);
    setYoke(yokeDeg);

    /* --- interactions --- */
    impl.dragStart = () => raycaster.intersectObjects([grab, yoke], true).length > 0;
    impl.dragMove = () => {
      const p = new THREE.Vector3();
      if (!raycaster.ray.intersectPlane(dragPlane, p)) return;
      if (p.x * p.x + p.z * p.z < 0.03) return; // dead zone at pivot
      setYoke(THREE.MathUtils.radToDeg(Math.atan2(p.z, p.x)));
    };

    /* --- per-frame --- */
    impl.tick = (dt, t) => {
      if (!ctx.reducedMotion) {
        // AC: dot stream sways back and forth along the flux path
        flow.update(t, (ph, time) => 0.08 + ((ph * 0.84 + 0.07 * Math.sin(time * 2.4) + 0.84) % 0.84));
        zone.material.opacity = 0.045 + 0.02 * Math.sin(t * 2.4);
      }
      burst.tick(dt);
      for (const c of cracks) c.indication.tick(dt);
      if (pendingEval >= 0 && simTime >= pendingEval) { pendingEval = -1; evaluateDust(); }
      if (hudDirty) {
        hudDirty = false;
        degOut.textContent = Math.round(yokeDeg) + "°";
        cracks.forEach((c, i) => {
          const cross = lineCross(yokeDeg, c.angle);
          const ok = cross >= threshold;
          rowEls[i].innerHTML = c.indicated
            ? '<b style="color:' + COL.good + ';">✓ indicated</b>'
            : '<span style="color:' + (ok ? COL.good : COL.bad) + ';font-weight:700;">' + Math.round(cross) + "° " + (ok ? "→ dust!" : "· rotate") + "</span>";
        });
      }
    };
    impl.getState = () => ({
      mode,
      yokeAngleDeg: yokeDeg,
      thresholdDeg: threshold,
      cracks: cracks.map((c) => ({
        id: c.id, angleDeg: c.angle,
        crossDeg: lineCross(yokeDeg, c.angle),
        indicated: c.indicated,
      })),
      tasksDone: [...doneTasks],
    });
  }

  /* ================================================================ */
  /* MODE 2 — field-direction                                         */
  /* ================================================================ */
  function buildFieldMode() {
    const bathMs = clamp(Number(params.bathMs) || 800, 200, 2000);
    const quizLockMs = clamp(Number(params.quizLockMs ?? 1200), 0, 5000);
    const BAR_R = 0.42, BAR_LEN = 3.6, CY = 0.45; // bar radius/length/centre height
    orbit.target.set(0, 0.45, 0);
    orbit.radius = 5.3; orbit.phi = 1.04;
    applyCamera();

    /* --- bar + cradles --- */
    const barMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(BAR_R, BAR_R, BAR_LEN, 48),
      new THREE.MeshStandardMaterial({ color: 0x8b99ad, metalness: 0.5, roughness: 0.38 }),
    );
    barMesh.rotation.z = Math.PI / 2;
    barMesh.position.y = CY;
    scene.add(barMesh);
    for (const sx of [-1, 1]) {
      const v = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.5, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x16243d, metalness: 0.3, roughness: 0.7 }),
      );
      v.position.set(sx * 1.45, -0.32, 0);
      scene.add(v);
    }

    /* --- gear: head-shot pads / coil --- */
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x3a342c, metalness: 0.7, roughness: 0.4, emissive: 0x000000,
    });
    const gHead = new THREE.Group();
    for (const sx of [-1, 1]) {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.22, 32), padMat);
      pad.rotation.z = Math.PI / 2;
      pad.position.set(sx * (BAR_LEN / 2 + 0.13), CY, 0);
      gHead.add(pad);
      // current direction arrows: I flows +X through the bar
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.07, 0.2, 14),
        new THREE.MeshBasicMaterial({ color: 0xffc34d }),
      );
      cone.rotation.z = -Math.PI / 2;
      cone.position.set(sx * (BAR_LEN / 2 + 0.42), CY, 0);
      gHead.add(cone);
    }
    scene.add(gHead);

    const gCoil = new THREE.Group();
    const coilMat = new THREE.MeshStandardMaterial({ color: 0xb46a32, metalness: 0.65, roughness: 0.35 });
    for (const cx of [-0.33, -0.11, 0.11, 0.33]) {
      const turn = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.05, 10, 36), coilMat);
      turn.rotation.y = Math.PI / 2;
      turn.position.set(cx, CY, 0);
      gCoil.add(turn);
    }
    // coil current circulation dots: phi-hat sense around +X (right-hand rule
    // consistent with the +X longitudinal field the coil produces)
    const coilRingPts = [];
    for (const cx of [-0.33, 0.33]) {
      const ring = [];
      for (let k = 0; k <= 36; k++) {
        const a = (k / 36) * Math.PI * 2;
        ring.push(new THREE.Vector3(cx, CY + 0.68 * Math.cos(a), 0.68 * Math.sin(a)));
      }
      coilRingPts.push(ring);
    }
    const coilFlow = makeFlowDots(coilRingPts, { color: 0xffc34d, size: 0.045, perLine: 8, closed: true, opacity: 0.85 });
    gCoil.add(coilFlow.points);
    scene.add(gCoil);

    /* --- field-line groups --- */
    // CIRCULAR flux (head shot): hoops around the bar. With current +X the
    // flux at the TOP of the bar runs toward +Z (right-hand rule); the ring
    // parameterization below advances exactly that way.
    const gCirc = new THREE.Group();
    const circPts = [];
    for (const cx of [-1.45, -0.95, -0.45, 0.05, 0.55, 1.05, 1.45]) {
      const ring = [];
      for (let k = 0; k <= 40; k++) {
        const a = (k / 40) * Math.PI * 2;
        ring.push(new THREE.Vector3(cx, CY + 0.52 * Math.cos(a), 0.52 * Math.sin(a)));
      }
      gCirc.add(dashedLine(ring, 0x5fe0ff, 0.6, 0.075, 0.05));
      circPts.push(ring);
    }
    const circFlow = makeFlowDots(circPts, { color: 0x5fe0ff, size: 0.05, perLine: 7, closed: true });
    gCirc.add(circFlow.points);
    const circCone = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 12),
      new THREE.MeshBasicMaterial({ color: 0x5fe0ff }));
    circCone.position.set(0.05, CY + 0.52, 0.12);
    circCone.rotation.x = Math.PI / 2; // points +Z: flux direction at top
    gCirc.add(circCone);
    scene.add(gCirc);

    // LONGITUDINAL flux (coil shot): lines along the bar axis, arrows +X.
    const gLong = new THREE.Group();
    const longPts = [];
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      const y = CY + 0.52 * Math.cos(a), z = 0.52 * Math.sin(a);
      const lp = [new THREE.Vector3(-1.8, y, z), new THREE.Vector3(1.8, y, z)];
      gLong.add(dashedLine(lp, 0x5fe0ff, 0.6, 0.09, 0.055));
      longPts.push(lp);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.15, 12),
        new THREE.MeshBasicMaterial({ color: 0x5fe0ff }));
      cone.rotation.z = -Math.PI / 2; // points +X
      cone.position.set(1.86, y, z);
      gLong.add(cone);
    }
    const longFlow = makeFlowDots(longPts, { color: 0x5fe0ff, size: 0.05, perLine: 6, closed: false });
    gLong.add(longFlow.points);
    scene.add(gLong);

    /* --- cracks on top of the bar --- */
    const topY = CY + BAR_R;
    // transverse crack: short circumferential arc at x = +0.95
    const tPts = [];
    for (let k = 0; k <= 12; k++) {
      const a = Math.PI / 2 - 0.55 + (k / 12) * 1.1;
      tPts.push(new THREE.Vector3(0.95, CY + BAR_R * Math.sin(a), BAR_R * Math.cos(a)));
    }
    const tCrack = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tPts), 16, 0.013, 6, false),
      new THREE.MeshStandardMaterial({ color: 0x12161c, roughness: 0.9 }),
    );
    scene.add(tCrack);
    const tInd = makeIndication(tPts, new THREE.Vector3(1, 0, 0)); // buildup spreads across the crack (x)
    const tLabel = makeLabelSprite("T");
    tLabel.scale.setScalar(0.2); tLabel.position.set(0.95, topY + 0.3, 0);
    scene.add(tLabel);

    // longitudinal crack: along the axis, x in [-1.25, -0.65], on top
    const lPts = [];
    for (let k = 0; k <= 12; k++) lPts.push(new THREE.Vector3(-1.25 + (k / 12) * 0.6, topY - 0.004, 0));
    const lCrack = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lPts), 16, 0.013, 6, false),
      new THREE.MeshStandardMaterial({ color: 0x12161c, roughness: 0.9 }),
    );
    scene.add(lCrack);
    const lInd = makeIndication(lPts, new THREE.Vector3(0, 0, 1)); // buildup spreads across the crack (z)
    const lLabel = makeLabelSprite("L");
    lLabel.scale.setScalar(0.2); lLabel.position.set(-0.95, topY + 0.3, 0);
    scene.add(lLabel);

    const cracks = {
      transverse: { ind: tInd, indicated: false, task: "revealTransverse" },
      longitudinal: { ind: lInd, indicated: false, task: "revealLongitudinal" },
    };

    /* --- particle bath --- */
    const burst = makeBurst(380, 0x9fc4a2, { x0: -1.8, x1: 1.8, z0: -0.6, z1: 0.6, yTop: 1.35, yFloor: CY + 0.05 });

    /* --- HUD --- */
    const title = el("div", PANEL_CSS + "left:14px;top:12px;padding:10px 14px;max-width:330px;");
    title.innerHTML =
      '<div style="font-size:11px;letter-spacing:.14em;color:' + COL.cyan + ';font-weight:800;">MT · FIELD DIRECTION</div>' +
      '<div style="font-size:14px;font-weight:800;margin-top:2px;">Circular vs longitudinal</div>' +
      '<div style="font-size:11.5px;color:' + COL.dim + ';margin-top:3px;line-height:1.45;">Energize each shot; the particle bath reveals only the crack the flux CROSSES.</div>';
    hud.appendChild(title);

    const tech = el("div", PANEL_CSS + "left:14px;bottom:12px;padding:10px 12px;width:262px;");
    tech.innerHTML = '<div style="font-size:11px;font-weight:800;letter-spacing:.1em;color:' + COL.dim + ';margin-bottom:7px;">MAGNETIZE</div>';
    const headBtn = el("button", BTN_GHOST_CSS);
    headBtn.id = "mt-head";
    headBtn.innerHTML = "⚡ Head shot — current through bar<br><span style='font-weight:400;font-size:11px;color:" + COL.dim + ";'>flux circles the bar (right-hand rule)</span>";
    const coilBtn = el("button", BTN_GHOST_CSS);
    coilBtn.id = "mt-coil";
    coilBtn.innerHTML = "⟲ Coil shot — encircling coil<br><span style='font-weight:400;font-size:11px;color:" + COL.dim + ";'>flux runs along the bar axis</span>";
    tech.appendChild(headBtn); tech.appendChild(coilBtn);
    hud.appendChild(tech);

    const panel = el("div", PANEL_CSS + "right:14px;top:12px;padding:10px 12px;width:240px;font-size:12px;");
    panel.innerHTML =
      '<b>Flux readout</b>' +
      '<div id="mt-field-now" style="margin-top:4px;color:' + COL.cyan + ';font-weight:700;"></div>' +
      '<div id="mt-rows2" style="margin-top:7px;display:grid;gap:5px;"></div>';
    hud.appendChild(panel);
    const fieldNow = panel.querySelector("#mt-field-now");
    const rows2 = panel.querySelector("#mt-rows2");
    const ROW_CSS = "background:rgba(11,31,58,.45);border:1px solid rgba(150,200,255,.14);border-radius:8px;padding:5px 8px;display:flex;justify-content:space-between;gap:6px;";
    const rowT = el("div", ROW_CSS);
    const rowL = el("div", ROW_CSS);
    rows2.appendChild(rowT); rows2.appendChild(rowL);

    // theory check (1-click)
    const quiz = el("div", PANEL_CSS + "right:14px;bottom:12px;padding:10px 12px;width:240px;font-size:12px;");
    quiz.innerHTML = '<b>Theory check</b><div style="margin-top:4px;color:' + COL.dim + ';line-height:1.4;">Which shot reveals the <b style="color:' + COL.ink + ';">TRANSVERSE</b> crack (across the bar)?</div>';
    const qWrap = el("div", "display:grid;gap:6px;margin-top:8px;");
    const qHead = el("button", BTN_GHOST_CSS + "text-align:left;");
    qHead.id = "mt-quiz-circular";
    qHead.textContent = "Head shot (circular flux)";
    const qCoil = el("button", BTN_GHOST_CSS + "text-align:left;");
    qCoil.id = "mt-quiz-longitudinal";
    qCoil.textContent = "Coil shot (longitudinal flux)";
    const qMsg = el("div", "margin-top:6px;font-size:11px;line-height:1.4;min-height:14px;color:" + COL.dim + ";");
    qWrap.appendChild(qHead); qWrap.appendChild(qCoil);
    quiz.appendChild(qWrap); quiz.appendChild(qMsg);
    hud.appendChild(quiz);

    /* --- technique state --- */
    /** @type {""|"head"|"coil"} */
    let technique = "";
    let pendingReveal = -1;
    function setTechnique(t) {
      technique = t;
      gHead.visible = t === "head";
      gCirc.visible = t === "head";
      gCoil.visible = t === "coil";
      gLong.visible = t === "coil";
      padMat.emissive.setHex(t === "head" ? 0x6e4a10 : 0x000000);
      headBtn.style.cssText = (t === "head" ? BTN_CSS : BTN_GHOST_CSS) + "width:100%;text-align:left;";
      coilBtn.style.cssText = (t === "coil" ? BTN_CSS : BTN_GHOST_CSS) + "width:100%;text-align:left;margin-top:6px;";
      if (t) {
        burst.fire();
        pendingReveal = simTime + bathMs / 1000;
      }
      hudDirty = true;
    }
    function evaluateBath() {
      // circular flux (head) crosses the LONGITUDINAL crack at 90 deg;
      // longitudinal flux (coil) crosses the TRANSVERSE crack at 90 deg.
      const target = technique === "head" ? cracks.longitudinal : technique === "coil" ? cracks.transverse : null;
      if (!target) return;
      target.ind.show(1);
      if (!target.indicated) {
        target.indicated = true;
        completeTask(target.task);
      }
      hudDirty = true;
    }
    listen(headBtn, "click", () => setTechnique("head"));
    listen(coilBtn, "click", () => setTechnique("coil"));
    setTechnique("");

    let quizDone = false, quizLockedUntil = 0;
    function answer(correct) {
      if (quizDone || performance.now() < quizLockedUntil) return;
      if (correct) {
        quizDone = true;
        qMsg.innerHTML = '<span style="color:' + COL.good + ';font-weight:700;">✓ Correct.</span> Longitudinal flux runs along the bar, so it crosses a transverse crack at 90° and leaks there.';
        qCoil.style.cssText = BTN_CSS + "text-align:left;";
        qHead.style.opacity = "0.55";
        completeTask("explainCheck");
      } else {
        quizLockedUntil = performance.now() + quizLockMs;
        qMsg.innerHTML = '<span style="color:' + COL.bad + ';font-weight:700;">Not quite.</span> Circular flux hoops run PARALLEL to a transverse crack — nothing crosses it, so nothing leaks. Try again.';
        qHead.style.opacity = qCoil.style.opacity = "0.55";
        later(() => {
          if (!disposed && !quizDone) { qHead.style.opacity = qCoil.style.opacity = "1"; }
        }, quizLockMs);
      }
    }
    listen(qHead, "click", () => answer(false));
    listen(qCoil, "click", () => answer(true));

    function statusCell(cross, indicated) {
      if (indicated) return "<b style='color:" + COL.good + ";'>✓ indicated</b>";
      if (cross == null) return "<span style='color:" + COL.dim + ";'>—</span>";
      const ok = cross >= 45;
      return "<span style='color:" + (ok ? COL.good : COL.bad) + ";font-weight:700;'>flux " + cross + "°" + (ok ? " → leaks" : " · no leak") + "</span>";
    }

    /* --- per-frame --- */
    impl.tick = (dt, t) => {
      if (!ctx.reducedMotion) {
        if (gCirc.visible) circFlow.update(t, (ph, time) => ph + time * 0.1);
        if (gLong.visible) longFlow.update(t, (ph, time) => 0.04 + ((ph * 0.92 + time * 0.085) % 0.92));
        if (gCoil.visible) coilFlow.update(t, (ph, time) => ph + time * 0.12);
      }
      burst.tick(dt);
      tInd.tick(dt); lInd.tick(dt);
      if (pendingReveal >= 0 && simTime >= pendingReveal) { pendingReveal = -1; evaluateBath(); }
      if (hudDirty) {
        hudDirty = false;
        fieldNow.textContent =
          technique === "head" ? "Circular — hoops around bar" :
          technique === "coil" ? "Longitudinal — along bar axis" :
          "De-energized — pick a shot";
        const crossT = technique === "head" ? 0 : technique === "coil" ? 90 : null;
        const crossL = technique === "head" ? 90 : technique === "coil" ? 0 : null;
        rowT.innerHTML = "<span style='font-weight:800;'>T · transverse</span>" + statusCell(crossT, cracks.transverse.indicated);
        rowL.innerHTML = "<span style='font-weight:800;'>L · longitudinal</span>" + statusCell(crossL, cracks.longitudinal.indicated);
      }
    };
    impl.getState = () => ({
      mode, technique,
      cracks: {
        transverse: { indicated: cracks.transverse.indicated, crossDeg: technique === "coil" ? 90 : technique === "head" ? 0 : null },
        longitudinal: { indicated: cracks.longitudinal.indicated, crossDeg: technique === "head" ? 90 : technique === "coil" ? 0 : null },
      },
      quizDone,
      tasksDone: [...doneTasks],
    });
  }

  /* ---------- build the requested mode ---------- */
  if (mode === "yoke-orientation") buildYokeMode();
  else buildFieldMode();

  /* ---------- RAF loop (pauses when hidden) ---------- */
  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    simTime += dt;
    if (!ctx.reducedMotion && !orbit.dragging) {
      orbit.theta += THREE.MathUtils.degToRad(1.7) * dt; // slow auto-orbit <= 3 deg/s
      applyCamera();
    }
    impl.tick(dt, simTime);
    renderer.render(scene, camera);
  }
  rafId = requestAnimationFrame(frame);

  function onVis() {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    } else if (!disposed && !rafId) {
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    }
  }
  listen(document, "visibilitychange", onVis);

  /* ---------- resize ---------- */
  function resize() {
    const w = container.clientWidth || W0, h = container.clientHeight || H0;
    renderer.setSize(w, h);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(container);
  else listen(window, "resize", resize);

  /* ---------- handle ---------- */
  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      if (ro) ro.disconnect();
      for (const off of cleanups) { try { off(); } catch (_e) { /* noop */ } }
      cleanups.length = 0;
      for (const id of timeouts) clearTimeout(id);
      timeouts.clear();
      deepDispose(scene);
      renderer.dispose();
      try { renderer.forceContextLoss(); } catch (_e) { /* noop */ }
      if (root.parentNode) root.parentNode.removeChild(root);
    },
    /** Debug/state hook used by the validation harness (not part of the contract). */
    getState() { return impl.getState(); },
  };
}
