// @ts-nocheck — plain-JS engine, functionally validated via harness (see media-build/trainer-harness)
// Eddy Current (ET) method trainer — three.js mini-app implementing the
// TrainerMount contract (see ../contract.ts). Plain ESM JavaScript + JSDoc.
//
// Modes:
//   "liftoff-null" — balance (null) an absolute surface probe on bare aluminum,
//                    then raise it so the impedance-plane trace draws the
//                    lift-off vector (running toward the AIR point).
//   "crack-scan"   — drag a probe along a plate hiding a surface crack; the
//                    crack kicks the impedance dot at a distinctly steeper
//                    phase angle than lift-off. Mark the crack, then identify
//                    which recorded trace was the crack.
//   "skin-depth"   — frequency slider (100 Hz–1 MHz) + conductivity picker;
//                    a cutaway slab shades eddy-current density vs depth with
//                    a live standard-depth (δ) readout.
//
// Physics notes (simplified, but honest):
// • The impedance-plane display mimics a nulled, phase-rotated eddyscope:
//   operators rotate the display so lift-off runs horizontally toward the AIR
//   point. The lift-off response decays roughly exponentially with coil
//   height (most of the signal change happens in the first ~1 mm), and the
//   lift-off locus is drawn with its real slight bow.
// • A surface-breaking crack interrupts the eddy-current paths and produces a
//   signal at a much steeper phase angle than lift-off (~100° separation here,
//   typical for surface cracks in aluminum alloys near 200 kHz).
// • Standard depth of penetration uses the plane-wave model:
//   δ = 1/√(π·f·μ·σ), J(z) = J₀·e^(−z/δ)  →  37% of surface density at z = δ,
//   ~5% at 3δ. Material constants are real IACS conductivities; all picker
//   materials are non-magnetic (μr ≈ 1) so the conductivity/frequency story
//   stays clean.
//
/** @typedef {import("../contract").TrainerConfig} TrainerConfig */
/** @typedef {import("../contract").TrainerCtx} TrainerCtx */
/** @typedef {import("../contract").TrainerHandle} TrainerHandle */
import * as THREE from "three";

export const MANIFEST = {
  engine: "et",
  modes: {
    "liftoff-null": {
      description:
        "Probe over an aluminum plate with a live impedance-plane display. Lower the probe to contact, press Null to balance, then lift it so the trace draws the lift-off vector toward the AIR point.",
      params: {
        maxHeightMm: "Probe height range in mm (2–8, default 5)",
        nullToleranceMm:
          "Height treated as surface contact for a valid null, mm (0.05–0.5, default 0.2)",
        liftoffTargetMm:
          "Height the probe must reach after a contact null to complete traceLiftoff, mm (1–4, default 2)",
      },
      taskIds: ["nullProbe", "traceLiftoff"],
    },
    "crack-scan": {
      description:
        "Drag the probe along a 90 mm lane over a hidden surface crack. Crossing the crack kicks the impedance dot at a steep phase angle vs the horizontal lift-off noise; the trace persists. Mark the crack position, then pick which recorded signal was the crack.",
      params: {
        crackXMm:
          "Crack position along the 0–90 mm lane, mm (15–65, default randomized 20–60)",
        markToleranceMm: "Mark accuracy tolerance, ± mm (2–5, default 3)",
        crackDepthMm:
          "Crack depth driving signal amplitude, mm (0.5–2, default 1.2)",
      },
      taskIds: ["findCrack", "distinguish"],
    },
    "skin-depth": {
      description:
        "Cutaway slab shades eddy-current density J(z)=J₀·e^(−z/δ) under a pancake coil. Tune frequency (100 Hz–1 MHz, log slider) and pick the material conductivity to push the standard depth δ past the shallow and deep targets (hold briefly to confirm).",
      params: {
        shallowTargetMm:
          "δ must be at or under this to complete setShallow, mm (0.3–1.5, default 0.8)",
        deepTargetMm:
          "δ must be at or over this to complete setDeep, mm (2–6, default 3)",
        material:
          "Starting material: copper | aluminum | stainless | titanium (default aluminum)",
        holdMs:
          "Continuous dwell beyond a target before it counts, ms (300–2000, default 800)",
      },
      taskIds: ["setShallow", "setDeep"],
    },
  },
};

// ---------------------------------------------------------------- brand kit
const FONT =
  "Manrope, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
const NAVY = "#0B1F3A";
const CYAN = "#5fe0ff";
const BLUE = "#1E66F5";
const GLASS_BG = "rgba(120,170,255,.07)";
const GLASS_BORDER = "1px solid rgba(150,200,255,.22)";
const TXT = "#e8f1ff";
const TXT_DIM = "#9fb6d2";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const num = (v, d, lo, hi) => {
  const n = Number(v);
  return Number.isFinite(n) ? clamp(n, lo, hi) : d;
};

function div(cssText, html) {
  const d = document.createElement("div");
  d.style.cssText = cssText;
  if (html != null) d.innerHTML = html;
  return d;
}
function panel(extra) {
  return div(
    `position:absolute;pointer-events:auto;background:${GLASS_BG};border:${GLASS_BORDER};` +
      `border-radius:12px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);` +
      `box-shadow:0 8px 26px rgba(3,10,24,.45);padding:10px 12px;color:${TXT};` +
      `font:500 12.5px/1.45 ${FONT};${extra || ""}`
  );
}
function heading(text) {
  return div(
    `font:700 10.5px ${FONT};letter-spacing:.14em;color:${CYAN};margin:0 0 7px;`,
    text
  );
}
function button(label, opts = {}) {
  const b = document.createElement("button");
  if (opts.id) b.id = opts.id;
  b.type = "button";
  b.textContent = label;
  b.style.cssText =
    `pointer-events:auto;cursor:pointer;font:700 12px ${FONT};letter-spacing:.05em;` +
    `color:#f2f7ff;border-radius:9px;padding:8px 13px;transition:filter .15s;` +
    (opts.primary
      ? `background:linear-gradient(180deg,#3a82ff,${BLUE});border:1px solid rgba(170,210,255,.6);`
      : `background:rgba(120,170,255,.12);border:1px solid rgba(150,200,255,.3);`);
  b.onmouseenter = () => (b.style.filter = "brightness(1.15)");
  b.onmouseleave = () => (b.style.filter = "");
  return b;
}
function sliderRow(id, label, min, max, step, value, fmt) {
  const row = div(`margin:7px 0 2px;`);
  const top = div(
    `display:flex;justify-content:space-between;gap:10px;margin-bottom:3px;` +
      `font:600 12px ${FONT};color:${TXT_DIM};`
  );
  const name = div(``, label);
  const val = div(`color:${TXT};font-weight:700;`);
  val.id = `${id}-val`;
  top.append(name, val);
  const input = document.createElement("input");
  input.type = "range";
  input.id = id;
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.setAttribute("aria-label", label);
  input.style.cssText = `width:100%;accent-color:${BLUE};height:22px;cursor:pointer;margin:0;`;
  row.append(top, input);
  const update = () => (val.textContent = fmt(Number(input.value)));
  update();
  return { row, input, update };
}

// ------------------------------------------------------------ ET physics
// Lift-off response on the rotated display: exponential approach to the AIR
// point (decay constant ~0.9 mm for a small surface probe) with the real
// slight bow of the lift-off locus.
const LIFT_H0 = 0.9; // mm
const AIR_A = 0.86; // screen radius fraction at which the AIR point sits
function liftPoint(h) {
  const s = 1 - Math.exp(-Math.max(0, h) / LIFT_H0);
  return { x: -AIR_A * s, y: 0.26 * s * (1 - s) };
}
// Surface-crack signal: distinct phase angle vs lift-off (~100° separation),
// Gaussian amplitude vs probe-to-crack distance (width ~ coil footprint),
// with a small perpendicular component that opens the trace into the
// familiar thin crack loop.
const CRACK_ANGLE = (82 * Math.PI) / 180; // screen angle; lift-off runs at 180°
const CRACK_W = 1.35; // mm, gaussian width ~ coil footprint
function crackVec(xMm, crackXMm, kDepth) {
  const u = (xMm - crackXMm) / CRACK_W;
  const g = Math.exp(-u * u);
  const amp = 0.62 * kDepth * g;
  const loop = 0.13 * kDepth * u * g;
  const cx = Math.cos(CRACK_ANGLE), cy = Math.sin(CRACK_ANGLE);
  return { x: cx * amp - cy * loop, y: cy * amp + cx * loop };
}
// Standard depth of penetration (plane-wave model): δ = 1/√(π f μ σ).
// With μ = μ0·μr this is 503.292/√(f·μr·σ) meters (σ in S/m).
function skinDepthMm(fHz, sigmaSm, mur) {
  return (503.292 / Math.sqrt(fHz * mur * sigmaSm)) * 1000;
}
const MATERIALS = [
  { id: "copper", name: "Copper", sigma: 58e6, iacs: "100% IACS", mur: 1 },
  { id: "aluminum", name: "Aluminum", sigma: 35e6, iacs: "60% IACS", mur: 1 },
  { id: "stainless", name: "SS 304", sigma: 1.4e6, iacs: "2.4% IACS", mur: 1.02 },
  { id: "titanium", name: "Ti-6Al-4V", sigma: 0.58e6, iacs: "1% IACS", mur: 1 },
];
function fmtHz(f) {
  if (f < 1000) return `${Math.round(f)} Hz`;
  if (f < 1e6) return `${(f / 1000).toFixed(f < 10000 ? 2 : 1)} kHz`;
  return `${(f / 1e6).toFixed(2)} MHz`;
}
function fmtMm(d) {
  if (d < 0.3) return d.toFixed(3);
  if (d < 3) return d.toFixed(2);
  return d.toFixed(1);
}

// ---------------------------------------------------- impedance-plane scope
function makeScope(size) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  canvas.style.cssText = `width:${size}px;height:${size}px;display:block;border-radius:9px;`;
  const g = canvas.getContext("2d");
  const S = size;
  const R = S / 2 - 16;
  const px = (x) => S / 2 + x * R;
  const py = (y) => S / 2 - y * R;
  const scope = {
    canvas,
    pts: [],
    last: null,
    dot: { x: 0, y: 0 },
    air: null,
    nulled: false,
    note: "",
    push(x, y) {
      const l = scope.last;
      if (!l || Math.hypot(x - l.x, y - l.y) > 0.0035) {
        scope.pts.push(x, y);
        if (scope.pts.length > 1800) scope.pts.splice(0, scope.pts.length - 1800);
        scope.last = { x, y };
      }
    },
    clear() {
      scope.pts.length = 0;
      scope.last = null;
    },
    draw(t, reduced) {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, S, S);
      g.fillStyle = "#061427";
      g.beginPath();
      g.roundRect(0, 0, S, S, 9);
      g.fill();
      g.strokeStyle = "rgba(95,224,255,.10)";
      g.lineWidth = 1;
      for (let i = 1; i < 8; i++) {
        const q = (S / 8) * i;
        g.beginPath(); g.moveTo(q, 6); g.lineTo(q, S - 6); g.stroke();
        g.beginPath(); g.moveTo(6, q); g.lineTo(S - 6, q); g.stroke();
      }
      // axes
      g.strokeStyle = scope.nulled ? "rgba(95,224,255,.42)" : "rgba(95,224,255,.2)";
      g.beginPath(); g.moveTo(S / 2, 8); g.lineTo(S / 2, S - 8); g.stroke();
      g.beginPath(); g.moveTo(8, S / 2); g.lineTo(S - 8, S / 2); g.stroke();
      // AIR marker
      if (scope.air) {
        const ax = px(clamp(scope.air.x, -0.97, 0.97));
        const ay = py(clamp(scope.air.y, -0.97, 0.97));
        g.strokeStyle = "rgba(255,210,125,.8)";
        g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(ax - 4, ay - 4); g.lineTo(ax + 4, ay + 4); g.stroke();
        g.beginPath(); g.moveTo(ax - 4, ay + 4); g.lineTo(ax + 4, ay - 4); g.stroke();
        g.fillStyle = "rgba(255,210,125,.85)";
        g.font = `700 9.5px ${FONT}`;
        g.fillText("AIR", ax - 9, ay - 8);
      }
      // persistent trace, brightening toward newest
      const n = scope.pts.length / 2;
      if (n > 1) {
        g.lineWidth = 1.7;
        g.lineJoin = "round";
        for (let i = 1; i < n; i++) {
          const a = 0.14 + 0.8 * (i / n);
          g.strokeStyle = `rgba(95,224,255,${a.toFixed(3)})`;
          g.beginPath();
          g.moveTo(px(clamp(scope.pts[(i - 1) * 2], -1, 1)), py(clamp(scope.pts[(i - 1) * 2 + 1], -1, 1)));
          g.lineTo(px(clamp(scope.pts[i * 2], -1, 1)), py(clamp(scope.pts[i * 2 + 1], -1, 1)));
          g.stroke();
        }
      }
      // dot with glow
      const r0 = Math.hypot(scope.dot.x, scope.dot.y);
      const off = r0 > 0.965;
      const dx = px(off ? (scope.dot.x / r0) * 0.965 : scope.dot.x);
      const dy = py(off ? (scope.dot.y / r0) * 0.965 : scope.dot.y);
      const pulse = reduced ? 1 : 1 + 0.12 * Math.sin(t * 5);
      const grad = g.createRadialGradient(dx, dy, 0, dx, dy, 12 * pulse);
      grad.addColorStop(0, "rgba(180,245,255,.95)");
      grad.addColorStop(0.35, "rgba(95,224,255,.5)");
      grad.addColorStop(1, "rgba(95,224,255,0)");
      g.fillStyle = grad;
      g.beginPath(); g.arc(dx, dy, 12 * pulse, 0, 7); g.fill();
      g.fillStyle = off ? "#ffd27d" : "#eafcff";
      g.beginPath(); g.arc(dx, dy, off ? 3.4 : 3, 0, 7); g.fill();
      if (off) {
        g.fillStyle = "rgba(255,210,125,.9)";
        g.font = `700 9px ${FONT}`;
        g.fillText("OFF-SCALE", S / 2 - 26, 16);
      }
      if (!scope.nulled) {
        const a = reduced ? 0.85 : 0.55 + 0.4 * Math.sin(t * 3.2);
        g.fillStyle = `rgba(255,210,125,${a.toFixed(2)})`;
        g.font = `700 10px ${FONT}`;
        g.textAlign = "center";
        g.fillText("PRESS NULL TO BALANCE", S / 2, 26);
        g.textAlign = "left";
      }
      if (scope.note) {
        g.fillStyle = "rgba(159,182,210,.75)";
        g.font = `600 8.5px ${FONT}`;
        g.textAlign = "center";
        g.fillText(scope.note, S / 2, S - 9);
        g.textAlign = "left";
      }
    },
  };
  return scope;
}

// ------------------------------------------------------------------- mount
/** @type {import("../contract").TrainerMount} */
export default function mount(container, config, ctx) {
  const modeDef = config && MANIFEST.modes[config.mode];
  const mode = modeDef ? config.mode : null;

  // ---- shell DOM
  const wrap = div(
    `position:relative;width:100%;height:100%;overflow:hidden;background:${NAVY};` +
      `font-family:${FONT};user-select:none;-webkit-user-select:none;border-radius:inherit;`
  );
  container.appendChild(wrap);
  if (!mode) {
    wrap.appendChild(
      div(
        `display:flex;height:100%;align-items:center;justify-content:center;color:${TXT_DIM};font:600 14px ${FONT};`,
        `ET trainer: unknown mode "${config ? config.mode : "?"}"`
      )
    );
    return { dispose() { wrap.remove(); } };
  }

  const P = (config && config.params) || {};
  const reduced = !!(ctx && ctx.reducedMotion);
  const ac = new AbortController();
  const sig = { signal: ac.signal };
  let disposed = false;

  // ---- tasks
  const wanted = [
    ...new Set(
      ((config && config.tasks) || [])
        .map((t) => t && t.id)
        .filter((id) => modeDef.taskIds.includes(id))
    ),
  ];
  const doneTasks = new Set();
  let allFired = false;
  function completeTask(id) {
    if (!modeDef.taskIds.includes(id) || doneTasks.has(id)) return;
    doneTasks.add(id);
    if (wanted.includes(id)) {
      try { ctx.onTaskDone(id); } catch {}
    }
    if (!allFired && wanted.length > 0 && wanted.every((w) => doneTasks.has(w))) {
      allFired = true;
      try { ctx.onAllDone && ctx.onAllDone(); } catch {}
    }
  }

  // ---- renderer / scene scaffold
  const W0 = container.clientWidth || (ctx && ctx.width) || 800;
  const H0 = container.clientHeight || (ctx && ctx.height) || 520;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(W0, H0, false);
  const glCanvas = renderer.domElement;
  glCanvas.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab;";
  wrap.appendChild(glCanvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1f3a);
  scene.fog = new THREE.Fog(0x0b1f3a, 260, 560);
  const camera = new THREE.PerspectiveCamera(38, W0 / H0, 0.1, 1200);

  scene.add(new THREE.HemisphereLight(0xcfe2ff, 0x0a1830, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(70, 130, 90);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x9db8ff, 0.7);
  fill.position.set(-90, 50, -70);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x5fe0ff, 0.55);
  rim.position.set(-30, 25, 140);
  scene.add(rim);

  // ---- camera rig (gentle auto-orbit ≤ ~1.2°/s, optional drag-orbit)
  const rig = { target: new THREE.Vector3(), dist: 120, yaw0: 0.45, pitch0: 0.42, yawU: 0, pitchU: 0, autoAmp: reduced ? 0 : 0.1, autoW: (2 * Math.PI) / 30 };
  function applyCamera(t) {
    const yaw = rig.yaw0 + rig.yawU + rig.autoAmp * Math.sin(t * rig.autoW);
    const pitch = clamp(rig.pitch0 + rig.pitchU, 0.08, 1.25);
    camera.position.set(
      rig.target.x + rig.dist * Math.sin(yaw) * Math.cos(pitch),
      rig.target.y + rig.dist * Math.sin(pitch),
      rig.target.z + rig.dist * Math.cos(yaw) * Math.cos(pitch)
    );
    camera.lookAt(rig.target);
  }

  // ---- HUD scaffold
  const hud = div(`position:absolute;inset:0;pointer-events:none;`);
  wrap.appendChild(hud);
  const topChip = panel(`top:10px;left:10px;max-width:46%;padding:8px 12px;`);
  hud.appendChild(topChip);
  const rightPanel = panel(`top:10px;right:10px;width:252px;`);
  hud.appendChild(rightPanel);
  const bottomPanel = panel(`left:10px;bottom:10px;width:min(420px,55%);`);
  hud.appendChild(bottomPanel);
  const toastEl = div(
    `position:absolute;left:46%;top:64px;transform:translateX(-50%) translateY(-8px);max-width:42%;` +
      `padding:8px 14px;border-radius:10px;background:rgba(10,26,50,.92);border:${GLASS_BORDER};` +
      `color:${TXT};font:600 12.5px ${FONT};opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;text-align:center;`
  );
  hud.appendChild(toastEl);
  let toastT = 0;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.style.borderColor =
      kind === "good" ? "rgba(120,255,190,.55)" : kind === "warn" ? "rgba(255,205,120,.55)" : "rgba(150,200,255,.3)";
    toastEl.style.color = kind === "good" ? "#bdffdd" : kind === "warn" ? "#ffe2af" : TXT;
    toastEl.style.opacity = "1";
    toastEl.style.transform = "translateX(-50%) translateY(0)";
    clearTimeout(toastT);
    toastT = setTimeout(() => {
      toastEl.style.opacity = "0";
      toastEl.style.transform = "translateX(-50%) translateY(-8px)";
    }, 2800);
  }
  function setTopChip(title, hint) {
    topChip.innerHTML =
      `<div style="font:700 10.5px ${FONT};letter-spacing:.14em;color:${CYAN};">EDDY CURRENT · ${title}</div>` +
      `<div style="font:500 11.5px ${FONT};color:${TXT_DIM};margin-top:3px;">${hint}</div>`;
  }

  // ---- raycast helpers
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function setRay(e) {
    const r = glCanvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    raycaster.setFromCamera(ndc, camera);
  }

  // ---- per-mode controller
  /** @type {{update:(dt:number,t:number)=>void, hitTest?:(e:PointerEvent)=>string|null, onDrag?:(kind:string,e:PointerEvent)=>void, onUp?:()=>void, grab?:{y:number,h:number}}} */
  let modeCtl = { update() {} };
  const metalMat = (color, metalness = 0.55, roughness = 0.34) =>
    new THREE.MeshStandardMaterial({ color, metalness, roughness });

  function addPlate(len, th, wid) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(len, th, wid), metalMat(0xaebccf));
    plate.position.y = th / 2;
    scene.add(plate);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(plate.geometry),
      new THREE.LineBasicMaterial({ color: 0x4d6f9e, transparent: true, opacity: 0.55 })
    );
    edges.position.copy(plate.position);
    scene.add(edges);
    const grid = new THREE.GridHelper(460, 23, 0x1c3a66, 0x132b4e);
    grid.position.y = -16;
    scene.add(grid);
    return plate;
  }
  function buildProbe() {
    const gp = new THREE.Group();
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.3, 5, 24), metalMat(0xd9e4f2, 0.25, 0.5));
    tip.position.y = 2.5;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 2.4, 16, 28), metalMat(0x16314f, 0.35, 0.5));
    body.position.y = 13;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.12, 0.42, 12, 36),
      new THREE.MeshStandardMaterial({ color: 0x5fe0ff, emissive: 0x2fb9e8, emissiveIntensity: 0.9, metalness: 0.2, roughness: 0.4 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 7.4;
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 7, 12), metalMat(0x0d1f38, 0.1, 0.8));
    cable.position.y = 24.5;
    gp.add(tip, body, ring, cable);
    // generous invisible grab proxy
    const proxy = new THREE.Mesh(
      new THREE.CylinderGeometry(6.5, 6.5, 30, 10),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    proxy.position.y = 14;
    gp.add(proxy);
    return { group: gp, proxy };
  }

  // =====================================================================
  // MODE 1 — liftoff-null
  // =====================================================================
  if (mode === "liftoff-null") {
    const maxH = num(P.maxHeightMm, 5, 2, 8);
    const nullTol = num(P.nullToleranceMm, 0.2, 0.05, 0.5);
    const liftTarget = num(P.liftoffTargetMm, 2, 1, 4);

    rig.target.set(0, 9, 0);
    rig.dist = 122; rig.yaw0 = 0.5; rig.pitch0 = 0.42;
    setTopChip("LIFT-OFF & NULL", "1 · touch down &nbsp; 2 · NULL &nbsp; 3 · lift the probe — watch the dot run toward AIR");

    const plate = addPlate(80, 6, 50);
    const plateTop = 6;
    const { group: probe, proxy } = buildProbe();
    probe.position.set(0, plateTop, 0);
    scene.add(probe);

    // contact glow + lift-off leader line
    const glow = new THREE.Mesh(
      new THREE.RingGeometry(3.4, 5.4, 40),
      new THREE.MeshBasicMaterial({ color: 0x5fe0ff, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(0, plateTop + 0.06, 0);
    scene.add(glow);
    const leadGeo = new THREE.BufferGeometry();
    leadGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(18), 3));
    const leader = new THREE.LineSegments(
      leadGeo,
      new THREE.LineBasicMaterial({ color: 0x5fe0ff, transparent: true, opacity: 0.75 })
    );
    scene.add(leader);

    // HUD — scope + controls
    rightPanel.appendChild(heading("IMPEDANCE PLANE"));
    const scope = makeScope(224);
    scope.note = "display rotated: lift-off set horizontal";
    rightPanel.appendChild(scope.canvas);
    rightPanel.appendChild(
      div(`display:flex;justify-content:space-between;margin:7px 0 8px;font:600 11px ${FONT};color:${TXT_DIM};`,
        `<span>f = 200 kHz</span><span>Al alloy plate</span>`)
    );
    const nullBtn = button("NULL / BALANCE", { id: "et-null", primary: true });
    nullBtn.style.width = "100%";
    rightPanel.appendChild(nullBtn);
    const status = div(`margin-top:7px;font:600 11.5px ${FONT};color:${TXT_DIM};`, "&nbsp;");
    rightPanel.appendChild(status);

    bottomPanel.appendChild(heading("PROBE"));
    const hs = sliderRow("et-height", "Probe height (lift-off)", 0, maxH, 0.05, 3.0, (v) => `${v.toFixed(2)} mm`);
    bottomPanel.appendChild(hs.row);
    bottomPanel.appendChild(
      div(`font:500 11px ${FONT};color:${TXT_DIM};margin-top:2px;`,
        `Drag the probe up/down in the scene, or use the slider. Null counts at contact (≤ ${nullTol.toFixed(2)} mm).`)
    );

    let hCur = 3.0, hVis = 3.0, hNull = 0.55, nullAtContact = false, hTrace = 3.0;
    function syncSlider() { hs.input.value = String(hCur); hs.update(); }
    hs.input.addEventListener("input", () => { hCur = clamp(Number(hs.input.value), 0, maxH); hs.update(); }, sig);
    nullBtn.addEventListener("click", () => {
      hNull = hCur;
      scope.clear();
      scope.nulled = true;
      if (hCur <= nullTol) {
        nullAtContact = true;
        completeTask("nullProbe");
        toast("✓ Balanced at surface contact — impedance zeroed", "good");
        status.innerHTML = `Nulled at contact. <b style="color:${CYAN}">Lift to ≥ ${liftTarget.toFixed(1)} mm</b> to draw the lift-off vector.`;
      } else {
        nullAtContact = false;
        toast(`Balanced at ${hCur.toFixed(2)} mm — re-null with the probe ON the surface`, "warn");
        status.textContent = "Null again at contact (h ≈ 0) to complete the task.";
      }
    }, sig);

    modeCtl = {
      grab: { y: 0, h: 0 },
      hitTest(e) {
        setRay(e);
        if (raycaster.intersectObject(proxy, false).length) {
          this.grab = { y: e.clientY, h: hCur };
          return "height";
        }
        return null;
      },
      onDrag(kind, e) {
        if (kind !== "height") return;
        const rect = glCanvas.getBoundingClientRect();
        const worldPerPx = (2 * rig.dist * Math.tan((camera.fov * Math.PI) / 360)) / rect.height;
        hCur = clamp(this.grab.h + (this.grab.y - e.clientY) * worldPerPx * 0.6, 0, maxH);
        syncSlider();
      },
      update(dt, t) {
        hVis += (hCur - hVis) * Math.min(1, dt * 14);
        probe.position.y = plateTop + hVis;
        glow.material.opacity = clamp(0.55 - hVis * 1.5, 0, 0.55) * (reduced ? 1 : 0.8 + 0.2 * Math.sin(t * 4));
        // leader line: plate -> probe tip with end ticks
        const a = leadGeo.attributes.position.array;
        const lx = 7.5, y0 = plateTop + 0.05, y1 = plateTop + Math.max(0.05, hVis);
        a.set([lx - 2, y0, 0, lx + 2, y0, 0, lx, y0, 0, lx, y1, 0, lx - 2, y1, 0, lx + 2, y1, 0]);
        leadGeo.attributes.position.needsUpdate = true;
        leader.visible = hVis > 0.12;
        // scope: integrate in sub-steps so fast slider moves still draw the line
        const nRef = liftPoint(hNull);
        const steps = Math.min(40, Math.max(1, Math.ceil(Math.abs(hCur - hTrace) / 0.05)));
        for (let i = 1; i <= steps; i++) {
          const h = hTrace + ((hCur - hTrace) * i) / steps;
          const p = liftPoint(h);
          scope.push(p.x - nRef.x, p.y - nRef.y);
        }
        hTrace = hCur;
        const pNow = liftPoint(hVis);
        const j = reduced ? 0 : 0.004;
        scope.dot.x = pNow.x - nRef.x + (Math.random() - 0.5) * j;
        scope.dot.y = pNow.y - nRef.y + (Math.random() - 0.5) * j;
        const airP = liftPoint(99);
        scope.air = { x: airP.x - nRef.x, y: airP.y - nRef.y };
        scope.draw(t, reduced);
        if (nullAtContact && hNull <= nullTol && hCur >= liftTarget && !doneTasks.has("traceLiftoff")) {
          completeTask("traceLiftoff");
          toast("✓ Lift-off vector drawn — it runs straight toward the AIR point", "good");
          status.innerHTML = `<b style="color:#9dffc9">Both tasks complete.</b> Lift-off = the signal of probe-to-surface distance.`;
        }
      },
    };
    void plate;
  }

  // =====================================================================
  // MODE 2 — crack-scan
  // =====================================================================
  if (mode === "crack-scan") {
    const crackX = num(P.crackXMm, 20 + Math.random() * 40, 15, 65);
    const markTol = num(P.markToleranceMm, 3, 2, 5);
    const kDepth = clamp(num(P.crackDepthMm, 1.2, 0.5, 2) / 1.2, 0.3, 1.45);

    rig.target.set(0, 1, 0);
    rig.dist = 142; rig.yaw0 = 0.16; rig.pitch0 = 0.55; rig.autoAmp = reduced ? 0 : 0.06;
    setTopChip("CRACK SCAN", "Drag the probe along the lane — a crack kicks the dot at a steep angle. Mark it.");

    const plate = addPlate(90, 6, 50);
    const plateTop = 6;
    const { group: probe, proxy } = buildProbe();
    let xCur = 8, xVis = 8, xTrace = 8;
    probe.position.set(xCur - 45, plateTop, 0);
    scene.add(probe);

    // scan lane + covered strip
    const lane = new THREE.Mesh(
      new THREE.PlaneGeometry(90, 14),
      new THREE.MeshBasicMaterial({ color: 0x1e66f5, transparent: true, opacity: 0.07, side: THREE.DoubleSide })
    );
    lane.rotation.x = -Math.PI / 2;
    lane.position.y = plateTop + 0.03;
    scene.add(lane);
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 12),
      new THREE.MeshBasicMaterial({ color: 0x5fe0ff, transparent: true, opacity: 0.13, side: THREE.DoubleSide })
    );
    strip.rotation.x = -Math.PI / 2;
    strip.position.y = plateTop + 0.05;
    strip.visible = false;
    scene.add(strip);
    let scanMin = xCur, scanMax = xCur;
    // ruler ticks along the lane front edge
    const tickGeo = new THREE.BufferGeometry();
    const tickPts = [];
    for (let m = 0; m <= 90; m += 10) tickPts.push(m - 45, plateTop + 0.05, 9, m - 45, plateTop + 0.05, 12);
    tickGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(tickPts), 3));
    scene.add(new THREE.LineSegments(tickGeo, new THREE.LineBasicMaterial({ color: 0x49709f, transparent: true, opacity: 0.8 })));

    // hidden crack (revealed when found)
    const crackGrp = new THREE.Group();
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 16), new THREE.MeshBasicMaterial({ color: 0x040910 }));
    slit.position.set(crackX - 45, plateTop - 0.55, 0);
    const slitGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 17),
      new THREE.MeshBasicMaterial({ color: 0xff5d6c, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
    );
    slitGlow.rotation.x = -Math.PI / 2;
    slitGlow.position.set(crackX - 45, plateTop + 0.08, 0);
    crackGrp.add(slit, slitGlow);
    crackGrp.visible = false;
    scene.add(crackGrp);

    // HUD
    rightPanel.appendChild(heading("IMPEDANCE PLANE"));
    const scope = makeScope(224);
    scope.nulled = true;
    scope.note = "lift-off horizontal · crack kicks steeply";
    const nRef = liftPoint(0.05);
    const airP = liftPoint(99);
    scope.air = { x: airP.x - nRef.x, y: airP.y - nRef.y };
    rightPanel.appendChild(scope.canvas);
    rightPanel.appendChild(
      div(`display:flex;justify-content:space-between;margin:7px 0 8px;font:600 11px ${FONT};color:${TXT_DIM};`,
        `<span>f = 200 kHz</span><span>nulled on clean metal</span>`)
    );
    const markBtn = button("MARK CRACK HERE", { id: "et-mark", primary: true });
    markBtn.style.width = "100%";
    rightPanel.appendChild(markBtn);
    const status = div(`margin-top:7px;font:600 11.5px ${FONT};color:${TXT_DIM};`, "Scan the full lane, then mark the kick.");
    rightPanel.appendChild(status);
    const compareBox = div(`margin-top:9px;display:none;`);
    rightPanel.appendChild(compareBox);

    bottomPanel.appendChild(heading("SCAN"));
    const xs = sliderRow("et-scanx", "Probe position", 0, 90, 0.1, xCur, (v) => `${v.toFixed(1)} mm`);
    bottomPanel.appendChild(xs.row);
    bottomPanel.appendChild(
      div(`font:500 11px ${FONT};color:${TXT_DIM};margin-top:2px;`,
        `Mark tolerance ± ${markTol.toFixed(0)} mm. Lift-off wobble stays horizontal — the crack rises at a steep angle.`)
    );
    xs.input.addEventListener("input", () => { xCur = clamp(Number(xs.input.value), 0, 90); xs.update(); }, sig);

    let noise = 0, dragging = false, found = false;

    function buildComparePanel() {
      compareBox.style.display = "block";
      compareBox.appendChild(heading("WHICH SIGNAL WAS THE CRACK?"));
      const row = div(`display:flex;gap:8px;`);
      compareBox.appendChild(row);
      const mk = (role, label) => {
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.role = role;
        b.style.cssText =
          `flex:1;cursor:pointer;background:rgba(120,170,255,.08);border:1px solid rgba(150,200,255,.3);` +
          `border-radius:9px;padding:6px 6px 4px;color:${TXT_DIM};font:700 10px ${FONT};letter-spacing:.06em;`;
        const c = document.createElement("canvas");
        const w = 100, h = 74, dpr = Math.min(window.devicePixelRatio || 1, 2);
        c.width = w * dpr; c.height = h * dpr;
        c.style.cssText = `width:${w}px;height:${h}px;display:block;border-radius:6px;background:#061427;`;
        const g = c.getContext("2d");
        g.scale(dpr, dpr);
        g.strokeStyle = "rgba(95,224,255,.18)";
        g.lineWidth = 1;
        g.beginPath(); g.moveTo(w / 2, 4); g.lineTo(w / 2, h - 4); g.stroke();
        g.beginPath(); g.moveTo(4, h * 0.7); g.lineTo(w - 4, h * 0.7); g.stroke();
        const cx0 = w / 2, cy0 = h * 0.7, sc = (h * 0.62) / (0.62 * kDepth + 0.05);
        g.strokeStyle = CYAN; g.lineWidth = 1.6; g.lineJoin = "round";
        g.beginPath();
        let first = true;
        if (role === "crack") {
          for (let u = -3.2; u <= 3.2; u += 0.1) {
            const v = crackVec(crackX + u * CRACK_W, crackX, kDepth);
            const x = cx0 + v.x * sc + (Math.random() - 0.5) * 0.7;
            const y = cy0 - v.y * sc + (Math.random() - 0.5) * 0.7;
            first ? g.moveTo(x, y) : g.lineTo(x, y);
            first = false;
          }
        } else {
          const ref = liftPoint(0.05);
          for (let i = 0; i <= 80; i++) {
            const hh = 0.05 + Math.sin((i / 80) * Math.PI) * 1.25;
            const p = liftPoint(hh);
            const x = cx0 + (p.x - ref.x) * sc * 0.55 + (Math.random() - 0.5) * 0.8;
            const y = cy0 - (p.y - ref.y) * sc * 0.55 + (Math.random() - 0.5) * 0.8;
            first ? g.moveTo(x, y) : g.lineTo(x, y);
            first = false;
          }
        }
        g.stroke();
        const cap = div(`text-align:center;margin-top:3px;`, label);
        b.append(c, cap);
        b.addEventListener("click", () => {
          if (doneTasks.has("distinguish")) return;
          if (role === "crack") {
            b.style.borderColor = "rgba(120,255,190,.7)";
            cap.innerHTML = `<span style="color:#9dffc9">✓ CRACK — steep phase angle</span>`;
            completeTask("distinguish");
            toast("✓ Right — crack signals rise steeply; lift-off runs along the horizontal", "good");
            status.innerHTML = `<b style="color:#9dffc9">Both tasks complete.</b> Phase angle separates flaw from lift-off.`;
          } else {
            b.style.borderColor = "rgba(255,120,130,.7)";
            cap.innerHTML = `<span style="color:#ffb3ba">that one is lift-off</span>`;
            toast("That trace runs horizontal — that's lift-off wobble. Try the other one.", "warn");
          }
        }, sig);
        return b;
      };
      const aIsCrack = Math.random() < 0.5;
      row.append(
        mk(aIsCrack ? "crack" : "liftoff", "SIGNAL A"),
        mk(aIsCrack ? "liftoff" : "crack", "SIGNAL B")
      );
    }

    markBtn.addEventListener("click", () => {
      if (found) return;
      if (Math.abs(xCur - crackX) <= markTol) {
        found = true;
        crackGrp.visible = true;
        completeTask("findCrack");
        toast(`✓ Indication confirmed — surface crack at ${crackX.toFixed(1)} mm`, "good");
        status.innerHTML = `Crack found at <b style="color:${CYAN}">${crackX.toFixed(1)} mm</b>. Now identify its signal below.`;
        buildComparePanel();
      } else {
        toast(`No indication at ${xCur.toFixed(1)} mm — scan for the steep kick, then mark on top of it`, "warn");
      }
    }, sig);

    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -plateTop);
    const hitPt = new THREE.Vector3();
    modeCtl = {
      hitTest(e) {
        setRay(e);
        if (raycaster.intersectObject(proxy, false).length || raycaster.intersectObject(plate, false).length) {
          dragging = true;
          if (raycaster.ray.intersectPlane(dragPlane, hitPt)) {
            xCur = clamp(hitPt.x + 45, 0, 90);
            xs.input.value = String(xCur); xs.update();
          }
          return "scan";
        }
        return null;
      },
      onDrag(kind, e) {
        if (kind !== "scan") return;
        setRay(e);
        if (raycaster.ray.intersectPlane(dragPlane, hitPt)) {
          xCur = clamp(hitPt.x + 45, 0, 90);
          xs.input.value = String(xCur); xs.update();
        }
      },
      onUp() { dragging = false; },
      update(dt, t) {
        xVis += (xCur - xVis) * Math.min(1, dt * 16);
        probe.position.x = xVis - 45;
        scanMin = Math.min(scanMin, xVis); scanMax = Math.max(scanMax, xVis);
        if (scanMax - scanMin > 0.5) {
          strip.visible = true;
          strip.scale.x = scanMax - scanMin;
          strip.position.x = (scanMin + scanMax) / 2 - 45;
        }
        // lift-off scanning wobble (horizontal on the display) + crack kick
        noise = clamp(noise * 0.86 + (Math.random() - 0.5) * (dragging ? 0.5 : 0.1), -1.3, 1.3);
        const hEff = 0.05 + Math.abs(noise) * (dragging ? 0.115 : 0.02);
        const lp = liftPoint(hEff);
        const base = { x: lp.x - nRef.x, y: lp.y - nRef.y };
        // integrate sub-steps so fast drags still paint the crack kick
        const steps = Math.min(48, Math.max(1, Math.ceil(Math.abs(xVis - xTrace) / 0.35)));
        for (let i = 1; i <= steps; i++) {
          const x = xTrace + ((xVis - xTrace) * i) / steps;
          const cv = crackVec(x, crackX, kDepth);
          scope.push(base.x * (0.4 + 0.6 * Math.random()) + cv.x, base.y + cv.y);
        }
        xTrace = xVis;
        const cv = crackVec(xVis, crackX, kDepth);
        scope.dot.x = base.x + cv.x;
        scope.dot.y = base.y + cv.y;
        scope.draw(t, reduced);
        if (!found) status.innerHTML = `Probe at <b style="color:${CYAN}">${xCur.toFixed(1)} mm</b> — mark within ± ${markTol.toFixed(0)} mm of the crack.`;
      },
    };
  }

  // =====================================================================
  // MODE 3 — skin-depth
  // =====================================================================
  if (mode === "skin-depth") {
    const shallowT = num(P.shallowTargetMm, 0.8, 0.3, 1.5);
    const deepT = num(P.deepTargetMm, 3, 2, 6);
    const holdMs = num(P.holdMs, 800, 300, 2000);
    const matStart = MATERIALS.some((m) => m.id === P.material) ? String(P.material) : "aluminum";

    rig.target.set(0, -11, -10);
    rig.dist = 96; rig.yaw0 = 0; rig.pitch0 = 0.2; rig.autoAmp = reduced ? 0 : 0.07;
    setTopChip("SKIN DEPTH", "Tune frequency & material — push δ past each target line and hold it there");

    let material = MATERIALS.find((m) => m.id === matStart);
    // start between the targets so neither task can complete without input
    const midD = (shallowT + deepT) / 2 / 1000; // m
    let freq = clamp((503.292 / midD) ** 2 / (material.mur * material.sigma), 100, 1e6);

    const DEPTH_MM = 30;
    const texC = document.createElement("canvas");
    texC.width = 640; texC.height = 320;
    const tg = texC.getContext("2d");
    const tex = new THREE.CanvasTexture(texC);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sideMat = metalMat(0x223c5e, 0.4, 0.6);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(60, 30, 40), [
      sideMat, sideMat, metalMat(0x9fb3c8, 0.5, 0.4), sideMat,
      new THREE.MeshBasicMaterial({ map: tex }), sideMat,
    ]);
    slab.position.set(0, -15, -20);
    scene.add(slab);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(slab.geometry),
      new THREE.LineBasicMaterial({ color: 0x4d6f9e, transparent: true, opacity: 0.6 })
    );
    edges.position.copy(slab.position);
    scene.add(edges);
    const grid = new THREE.GridHelper(460, 23, 0x1c3a66, 0x132b4e);
    grid.position.y = -31;
    scene.add(grid);

    // pancake coil probe sitting on the cut plane (classic cutaway through
    // the coil axis — half of each eddy loop pokes out of the section)
    const coil = new THREE.Mesh(
      new THREE.TorusGeometry(7, 1.5, 14, 48),
      new THREE.MeshStandardMaterial({ color: 0xc97c50, metalness: 0.7, roughness: 0.35, emissive: 0x803c18, emissiveIntensity: 0.25 })
    );
    coil.rotation.x = Math.PI / 2;
    coil.position.set(0, 1.6, 0);
    scene.add(coil);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(8.6, 8.6, 3, 36), metalMat(0x16314f, 0.35, 0.5));
    cap.position.set(0, 4.4, 0);
    scene.add(cap);

    // eddy-current loops at fixed depths; opacity follows e^(−z/δ)
    const ringDepths = [0.6, 1.6, 3.2, 6, 10];
    const rings = ringDepths.map((d, i) => {
      const r = new THREE.Mesh(
        new THREE.TorusGeometry(6.6 - i * 0.35, 0.26, 8, 40),
        new THREE.MeshBasicMaterial({ color: 0x5fe0ff, transparent: true, opacity: 0 })
      );
      r.rotation.x = Math.PI / 2;
      r.position.set(0, -d, 0);
      scene.add(r);
      return r;
    });

    function drawFace(delta) {
      const W = texC.width, H = texC.height;
      tg.setTransform(1, 0, 0, 1, 0, 0);
      tg.fillStyle = "#08182d";
      tg.fillRect(0, 0, W, H);
      for (let y = 0; y < H; y += 2) {
        const z = (y / H) * DEPTH_MM;
        const I = Math.pow(Math.exp(-z / delta), 0.8);
        const rC = Math.round(10 + 85 * I), gC = Math.round(28 + 196 * I), bC = Math.round(51 + 204 * I);
        tg.fillStyle = `rgb(${rC},${gC},${bC})`;
        tg.fillRect(0, y, W, 2);
      }
      // flow dashes hinting current sheets (density-weighted)
      tg.strokeStyle = "rgba(8,24,45,.5)";
      tg.lineWidth = 2;
      for (let k = 0; k < 7; k++) {
        const z = (DEPTH_MM * (k + 0.5)) / 7;
        const y = (z / DEPTH_MM) * H;
        const I = Math.exp(-z / delta);
        if (I < 0.04) continue;
        tg.setLineDash([14, 10]);
        tg.beginPath(); tg.moveTo(70, y); tg.lineTo(W - 16, y); tg.stroke();
      }
      tg.setLineDash([]);
      // depth ruler
      tg.fillStyle = "rgba(6,16,32,.78)";
      tg.fillRect(0, 0, 58, H);
      tg.font = `700 15px ${FONT}`;
      tg.fillStyle = "#bcd2ee";
      tg.strokeStyle = "rgba(188,210,238,.8)";
      tg.lineWidth = 2;
      for (let mm = 0; mm <= DEPTH_MM; mm += 5) {
        const y = (mm / DEPTH_MM) * H;
        tg.beginPath(); tg.moveTo(44, Math.min(H - 1, Math.max(1, y))); tg.lineTo(58, Math.min(H - 1, Math.max(1, y))); tg.stroke();
        tg.fillText(`${mm}`, 8, clamp(y + 5, 16, H - 6));
      }
      tg.fillText("mm", 30, 16);
      const yOf = (mm) => (mm / DEPTH_MM) * H;
      const line = (mm, color, dash, label, alignRight, labelBelow) => {
        if (mm > DEPTH_MM) return;
        const y = yOf(mm);
        tg.strokeStyle = color; tg.lineWidth = 3; tg.setLineDash(dash);
        tg.beginPath(); tg.moveTo(58, y); tg.lineTo(W, y); tg.stroke();
        tg.setLineDash([]);
        tg.font = `700 16px ${FONT}`;
        tg.fillStyle = color;
        const tw = tg.measureText(label).width;
        const ly = labelBelow ? clamp(y + 20, 60, H - 8) : clamp(y - 7, 40, H - 26);
        tg.fillText(label, alignRight ? W - tw - 10 : 66, ly);
      };
      // shallow label above its line, deep label below — they can't collide
      line(shallowT, "#7dffb4", [10, 7], `shallow target ${shallowT.toFixed(1)} mm`, false, false);
      line(deepT, "#ffc06b", [10, 7], `deep target ${deepT.toFixed(1)} mm`, false, true);
      line(delta, "#5fe0ff", [], `δ = ${fmtMm(delta)} mm · 37% J₀`, true, delta < 4);
      if (3 * delta <= DEPTH_MM) line(3 * delta, "rgba(95,224,255,.55)", [4, 6], "3δ ≈ 5% J₀", true, true);
      if (delta > DEPTH_MM) {
        tg.fillStyle = "#5fe0ff";
        tg.font = `700 16px ${FONT}`;
        tg.fillText(`δ = ${fmtMm(delta)} mm — below this 30 mm section`, 66, H - 14);
      }
      tg.font = `700 14px ${FONT}`;
      tg.fillStyle = "rgba(234,248,255,.92)";
      tg.fillText("EDDY-CURRENT DENSITY  J(z) = J₀·e^(−z/δ)", 66, 22);
      tex.needsUpdate = true;
    }

    // HUD
    rightPanel.appendChild(heading("STANDARD DEPTH δ"));
    const big = div(`font:800 28px ${FONT};color:${CYAN};letter-spacing:.01em;`);
    rightPanel.appendChild(big);
    rightPanel.appendChild(
      div(`font:600 11px ${FONT};color:${TXT_DIM};margin:1px 0 8px;`,
        `δ = 1/√(π·f·μ·σ) &nbsp;·&nbsp; J(δ) = 37% J₀`)
    );
    rightPanel.appendChild(heading("MATERIAL · σ"));
    const matGrid = div(`display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:9px;`);
    rightPanel.appendChild(matGrid);
    const matBtns = new Map();
    let touched = false;
    let dirty = true;
    for (const m of MATERIALS) {
      const b = button("", { id: `et-mat-${m.id}` });
      b.innerHTML = `<div style="font:700 11.5px ${FONT}">${m.name}</div><div style="font:600 9.5px ${FONT};color:${TXT_DIM};margin-top:1px">${(m.sigma / 1e6).toFixed(m.sigma < 2e6 ? 2 : 0)} MS/m · ${m.iacs}</div>`;
      b.style.padding = "6px 8px";
      b.style.textAlign = "left";
      b.addEventListener("click", () => { material = m; touched = true; dirty = true; refreshMatBtns(); }, sig);
      matBtns.set(m.id, b);
      matGrid.appendChild(b);
    }
    function refreshMatBtns() {
      for (const [id, b] of matBtns) {
        const on = id === material.id;
        b.style.borderColor = on ? "rgba(95,224,255,.75)" : "rgba(150,200,255,.3)";
        b.style.background = on ? "rgba(95,224,255,.16)" : "rgba(120,170,255,.12)";
      }
    }
    refreshMatBtns();
    const mkTarget = (label, color) => {
      const box = div(`margin-top:7px;`);
      const lab = div(`display:flex;justify-content:space-between;font:700 11px ${FONT};color:${TXT_DIM};`);
      const name = div(``, label);
      const state = div(`color:${color};`, "—");
      lab.append(name, state);
      const barBg = div(`height:6px;border-radius:4px;background:rgba(120,170,255,.14);margin-top:4px;overflow:hidden;`);
      const bar = div(`height:100%;width:0%;border-radius:4px;background:${color};transition:width .12s linear;`);
      barBg.appendChild(bar);
      box.append(lab, barBg);
      return { box, bar, state };
    };
    const tgtShallow = mkTarget(`SHALLOW · δ ≤ ${shallowT.toFixed(1)} mm`, "#7dffb4");
    const tgtDeep = mkTarget(`DEEP · δ ≥ ${deepT.toFixed(1)} mm`, "#ffc06b");
    rightPanel.append(tgtShallow.box, tgtDeep.box);

    bottomPanel.appendChild(heading("TEST FREQUENCY"));
    const f2v = (f) => Math.log10(f / 100) * 100;
    const v2f = (v) => 100 * Math.pow(10, v / 100);
    const fs = sliderRow("et-freq", "Frequency (log)", 0, 400, 1, f2v(freq), (v) => fmtHz(v2f(v)));
    bottomPanel.appendChild(fs.row);
    bottomPanel.appendChild(
      div(`font:500 11px ${FONT};color:${TXT_DIM};margin-top:2px;`,
        `Higher f or higher σ → currents crowd the surface (smaller δ). Hold past a target ${Math.round(holdMs)} ms to confirm.`)
    );
    fs.input.addEventListener("input", () => { freq = v2f(Number(fs.input.value)); touched = true; dirty = true; fs.update(); }, sig);

    let tShallow = 0, tDeep = 0, lastDelta = -1, saidS = false, saidD = false;
    modeCtl = {
      update(dt, t) {
        const delta = skinDepthMm(freq, material.sigma, material.mur);
        if (dirty || Math.abs(delta - lastDelta) > 1e-9) {
          drawFace(delta);
          big.textContent = `δ = ${fmtMm(delta)} mm`;
          lastDelta = delta; dirty = false;
        }
        for (let i = 0; i < rings.length; i++) {
          const d = ringDepths[i];
          const base = 0.9 * Math.exp(-d / delta);
          rings[i].material.opacity = base * (reduced ? 1 : 0.7 + 0.3 * Math.sin(t * 4 - d * 1.2));
        }
        if (!reduced) coil.material.emissiveIntensity = 0.25 + 0.15 * Math.sin(t * 6);
        // dwell logic (requires an actual user input first)
        const inShallow = touched && delta <= shallowT;
        const inDeep = touched && delta >= deepT;
        tShallow = inShallow ? tShallow + dt * 1000 : 0;
        tDeep = inDeep ? tDeep + dt * 1000 : 0;
        if (tShallow >= holdMs && !doneTasks.has("setShallow")) {
          completeTask("setShallow");
          if (!saidS) { saidS = true; toast(`✓ Shallow — at ${fmtHz(freq)} in ${material.name}, currents hug the surface (δ = ${fmtMm(delta)} mm)`, "good"); }
        }
        if (tDeep >= holdMs && !doneTasks.has("setDeep")) {
          completeTask("setDeep");
          if (!saidD) { saidD = true; toast(`✓ Deep — lower f (or lower σ) lets eddy currents reach ${fmtMm(delta)} mm`, "good"); }
        }
        const sDone = doneTasks.has("setShallow"), dDone = doneTasks.has("setDeep");
        tgtShallow.bar.style.width = `${sDone ? 100 : Math.min(100, (tShallow / holdMs) * 100)}%`;
        tgtDeep.bar.style.width = `${dDone ? 100 : Math.min(100, (tDeep / holdMs) * 100)}%`;
        tgtShallow.state.textContent = sDone ? "✓ done" : inShallow ? "hold…" : "—";
        tgtDeep.state.textContent = dDone ? "✓ done" : inDeep ? "hold…" : "—";
      },
    };
  }

  // ---- pointer interactions (drag-to-act, fallback drag-orbit)
  let drag = null;
  glCanvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const kind = (modeCtl.hitTest && modeCtl.hitTest(e)) || "orbit";
    drag = { kind, x: e.clientX, y: e.clientY };
    glCanvas.style.cursor = "grabbing";
    try { glCanvas.setPointerCapture(e.pointerId); } catch {}
  }, sig);
  glCanvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (drag.kind === "orbit") {
      rig.yawU = clamp(rig.yawU - (e.clientX - drag.x) * 0.005, -0.7, 0.7);
      rig.pitchU = clamp(rig.pitchU + (e.clientY - drag.y) * 0.004, -0.3, 0.35);
      drag.x = e.clientX; drag.y = e.clientY;
    } else if (modeCtl.onDrag) {
      modeCtl.onDrag(drag.kind, e);
    }
  }, sig);
  const endDrag = () => {
    if (drag && modeCtl.onUp) modeCtl.onUp();
    drag = null;
    glCanvas.style.cursor = "grab";
  };
  glCanvas.addEventListener("pointerup", endDrag, sig);
  glCanvas.addEventListener("pointercancel", endDrag, sig);

  // ---- resize
  let ro = null;
  if (typeof ResizeObserver !== "undefined") {
    ro = new ResizeObserver(() => {
      const w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);
  }

  // ---- RAF loop (paused while hidden)
  let raf = 0, running = false, last = performance.now();
  function frame(now) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    applyCamera(t);
    modeCtl.update(dt, t);
    renderer.render(scene, camera);
  }
  function startLoop() {
    if (running || disposed) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stopLoop() {
    running = false;
    cancelAnimationFrame(raf);
  }
  document.addEventListener("visibilitychange", () => (document.hidden ? stopLoop() : startLoop()), sig);
  startLoop();

  // ---- dispose
  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      stopLoop();
      clearTimeout(toastT);
      ac.abort();
      if (ro) ro.disconnect();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        const m = o.material;
        if (Array.isArray(m)) m.forEach((x) => { if (x.map) x.map.dispose(); x.dispose(); });
        else if (m) { if (m.map) m.map.dispose(); m.dispose(); }
      });
      renderer.dispose();
      if (renderer.forceContextLoss) try { renderer.forceContextLoss(); } catch {}
      wrap.remove();
    },
  };
}
