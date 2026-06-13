#!/usr/bin/env node
// Generic glassmorphism explainer renderer (locked "v5" style, approved 2026-06-10).
// Renders a lesson video from a spec JSON + narration audio + reusable SVG assets.
//
//   node scripts/explainer-gen.mjs <lessonId> spot   # one frame per beat -> media-build/explainer-frames/<id>-spot/
//   node scripts/explainer-gen.mjs <lessonId> full   # full render + narration mux -> media-build/explainer-drop/<id>.mp4
//
// Inputs:
//   media-src/specs/<lessonId>.json    lesson spec: beats[] of {type,narration,payload}
//   media-src/assets/<name>.svg        technical SVG (unique element ids)
//   media-src/assets/<name>.json       reveal manifest {scan:{id,sweep,loop?},reveals:[{kind,id,at}]}
//   media-build/explainer-audio/<id>/beat<N>.mp3   ElevenLabs v3 narration per beat
//
// Scene types: title (HUD panel + optional chips), tiles (3-4 glass cards + under-rail),
// diagram (asset panel + timed reveals + note chip), kinetic (stacked display lines), list (stacked chips).
// Timing: LEAD 1.0s, GAP 1.1s between beats, TAIL 1.0s. No end card; subtle one-per-frame watermark.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const SPECS = join(webRoot, "media-src", "specs");
const ASSETS = join(webRoot, "media-src", "assets");
const AUDIO = join(webRoot, "media-build", "explainer-audio");
const FRAMES = join(webRoot, "media-build", "explainer-frames");
const DROP = join(webRoot, "media-build", "explainer-drop");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FPS = 30, W = 1280, H = 720;
const LEAD = 1.0, GAP = 1.1, TAIL = 1.0;

const lessonId = process.argv[2];
const mode = process.argv[3] || "full";
if (!lessonId) { console.error("usage: explainer-gen.mjs <lessonId> [spot|full]"); process.exit(2); }

const spec = JSON.parse(readFileSync(join(SPECS, `${lessonId}.json`), "utf8"));
const beats = spec.beats;
if (!beats?.length) throw new Error("spec has no beats");

const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "pipe", "pipe"] });
const probe = (f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

// ---- schedule from narration durations ----
const durs = beats.map((_, i) => probe(join(AUDIO, lessonId, `beat${i + 1}.mp3`)));
durs.forEach((d, i) => { if (d > 11) console.warn(`warn: beat${i + 1} narration ${d.toFixed(1)}s > 11s`); });
const starts = []; let cur = LEAD;
for (let i = 0; i < beats.length; i++) { starts.push(cur); cur += durs[i] + GAP; }
const TOTAL = cur - GAP + TAIL;
const scenes = starts.map((s, i) => ({ start: s, dur: durs[i], end: s + durs[i] }));

// ---- load assets used by this lesson ----
const usedAssets = new Set();
for (const b of beats) {
  const a = b.payload?.asset ?? b.payload?.panel;
  if (a) {
    if (usedAssets.has(a)) throw new Error(`asset "${a}" used twice in one lesson — ids would collide`);
    usedAssets.add(a);
  }
}
const assetSvg = {}, assetManifest = {};
for (const a of usedAssets) {
  assetSvg[a] = readFileSync(join(ASSETS, `${a}.svg`), "utf8");
  assetManifest[a] = JSON.parse(readFileSync(join(ASSETS, `${a}.json`), "utf8"));
}

// ---- per-beat runtime config for the in-page animator ----
const beatCfg = beats.map((b, i) => {
  const p = b.payload ?? {};
  const cfg = { type: b.type, i };
  if (b.type === "title") { cfg.hud = p.hud !== false && !!p.panel; cfg.chips = (p.chips ?? []).map((c, j) => ({ at: c.at ?? 0.7 + j * 0.9 })); cfg.panel = p.panel ?? null; }
  if (b.type === "tiles") cfg.n = p.tiles.length;
  if (b.type === "list") cfg.chips = (p.chips ?? []).map((c, j) => ({ at: c.at ?? 0.7 + j * 0.8 }));
  if (b.type === "kinetic") { cfg.n = p.lines.length; cfg.subAt = p.subAt ?? (0.5 + p.lines.length * 0.8 + 0.6); }
  if (b.type === "diagram") { cfg.noteAt = p.noteAt ?? null; cfg.asset = p.asset; }
  if (cfg.panel || cfg.asset) {
    const m = assetManifest[cfg.panel ?? cfg.asset] ?? {};
    cfg.scan = m.scan ?? null;
    cfg.reveals = (p.reveals ?? m.reveals ?? []);
  }
  return cfg;
});

// ---- HTML ----
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const ICON = (n) => `<i class="ti ti-${n}"></i>`;

function sceneHtml(b, i) {
  const p = b.payload ?? {};
  if (b.type === "title") {
    const chips = (p.chips ?? []).map((c, j) =>
      `<div class=chip id=b${i}c${j} style="left:64px;top:${348 + j * 72}px">${ICON(c.icon ?? "point")}<span style="color:#E8F0F8;font-size:19px">${esc(c.t)}</span></div>`).join("");
    const panel = p.panel ? `
  <div class=glass id=b${i}panel style="left:676px;top:140px;width:536px;height:430px">
   <div class=mono style="position:absolute;left:22px;top:15px;color:#7fd6ff;font-size:13px;letter-spacing:2px">${esc(p.panelLabel ?? "ANALYSIS")}</div>
   <div class=mono id=b${i}live style="position:absolute;right:22px;top:15px;color:#5fe0ff;font-size:13px">● LIVE</div>
   <div style="position:absolute;left:16px;right:16px;top:46px;height:236px">${assetSvg[p.panel]}</div>
   ${p.hud !== false ? `<svg id=b${i}wave viewBox="0 0 500 70" style="position:absolute;left:24px;right:24px;bottom:54px;width:488px;height:64px"><polyline id=b${i}wavep points="" fill="none" stroke="#5fe0ff" stroke-width="2"/></svg>
   <div class=rd style="position:absolute;left:24px;bottom:18px">GAIN 42 dB</div>
   <div class=rd id=b${i}r2 style="position:absolute;left:50%;transform:translateX(-50%);bottom:18px">DEPTH 0.00 mm</div>
   <div class=rd style="position:absolute;right:24px;bottom:18px">100% COVERAGE</div>
   <div class=bar id=b${i}bar1 style="right:18px;top:54px;height:30px"></div><div class=bar id=b${i}bar2 style="right:32px;top:54px;height:30px"></div><div class=bar id=b${i}bar3 style="right:46px;top:54px;height:30px"></div>` : ""}
  </div>
  <div class=hud style="left:676px;top:140px;border-right:none;border-bottom:none"></div>
  <div class=hud style="right:68px;top:140px;border-left:none;border-bottom:none"></div>
  <div class=hud style="left:676px;top:544px;border-right:none;border-top:none"></div>
  <div class=hud style="right:68px;top:544px;border-left:none;border-top:none"></div>` : "";
    return `
  <div class=mono id=b${i}tag style="position:absolute;left:64px;top:100px;color:#5fe0ff;font-size:15px;letter-spacing:3px">${esc(p.kicker ?? spec.kicker ?? "")}</div>
  <div id=b${i}title class=disp style="position:absolute;left:62px;top:128px;width:${p.panel ? 520 : 1100}px;color:#eaf4ff;font-weight:700;font-size:${p.titleSize ?? 76}px;line-height:.95;text-shadow:0 0 30px rgba(46,120,255,.45)">${esc(p.title)}</div>
  ${(p.chips ?? []).length ? "" : `<div id=b${i}sub style="position:absolute;left:64px;top:328px;width:${p.panel ? 430 : 900}px;color:#a9c6e8;font-size:21px;line-height:1.5">${esc(p.sub ?? "")}</div>`}
  ${chips}${panel}`;
  }
  if (b.type === "tiles") {
    const n = p.tiles.length;
    const w = n === 3 ? 300 : 270, gap = n === 3 ? 40 : 24;
    const totalW = n * w + (n - 1) * gap, x0 = Math.round((W - totalW) / 2);
    return `
  <div id=b${i}t class=disp style="position:absolute;left:64px;top:74px;color:#eaf4ff;font-weight:700;font-size:50px">${esc(p.heading)}</div>
  <div id=b${i}line style="position:absolute;left:${x0}px;top:486px;width:${totalW}px;height:3px;background:linear-gradient(90deg,#1E66F5,#5fe0ff);box-shadow:0 0 12px #2b86ff;transform-origin:left;transform:scaleX(0)"></div>
  <div id=b${i}dot style="position:absolute;top:480px;left:${x0}px;width:15px;height:15px;border-radius:50%;background:#5fe0ff;box-shadow:0 0 14px #5fe0ff;opacity:0"></div>
  ${p.tiles.map((k, j) => `
  <div class="glass tile" id=b${i}k${j} style="left:${x0 + j * (w + gap)}px;top:222px;width:${w}px;height:240px"><div class=ic id=b${i}i${j}>${ICON(k.icon)}</div>
   <div class=disp style="color:#fff;font-weight:600;font-size:32px;margin-top:16px">${esc(k.t)}</div>
   <div style="color:#bcd6f5;font-size:17px;margin-top:8px">${esc(k.s ?? "")}</div>
   <div class=mono style="color:#5fe0ff;font-size:12px;margin-top:14px;letter-spacing:1px">0${j + 1} / 0${n}</div></div>`).join("")}`;
  }
  if (b.type === "diagram") {
    return `
  <div id=b${i}t class=disp style="position:absolute;left:64px;top:70px;color:#eaf4ff;font-weight:700;font-size:50px">${esc(p.heading)}</div>
  <div class=glass id=b${i}panel style="left:330px;top:150px;width:620px;height:360px"><div style="position:absolute;inset:14px">${assetSvg[p.asset]}</div></div>
  ${p.note ? `<div class="call mono" id=b${i}note style="left:50%;top:548px;transform:translateX(-50%);border-color:#5fe0ff;color:#9fe6ff;font-size:15px">${esc(p.note)}</div>` : ""}`;
  }
  if (b.type === "kinetic") {
    return `
  <div id=b${i}blk style="position:absolute;left:64px;top:150px;width:8px;height:${p.lines.length * 86 + 60}px;background:#1E66F5;border-radius:4px;transform-origin:top;transform:scaleY(0);box-shadow:0 0 14px #2b86ff"></div>
  <div style="position:absolute;left:96px;top:140px">
   ${p.lines.map((l, j) => `<div id=b${i}w${j} class=disp style="color:${l.c ?? ["#E8F0F8", "#9BC4FF", "#3b82ff", "#5fe0ff"][j % 4]};font-weight:700;font-size:74px;line-height:1.12">${esc(l.t)}</div>`).join("")}
  </div>
  ${p.sub ? `<div id=b${i}sub style="position:absolute;left:98px;bottom:110px;max-width:78%;color:#cbd9ec;font-size:24px">${esc(p.sub)}</div>` : ""}`;
  }
  if (b.type === "list") {
    return `
  <div id=b${i}t class=disp style="position:absolute;left:64px;top:74px;color:#eaf4ff;font-weight:700;font-size:50px">${esc(p.heading)}</div>
  ${(p.chips ?? []).map((c, j) => `
  <div class=chip id=b${i}c${j} style="left:${c.x ?? 120}px;top:${c.y ?? 210 + j * 86}px;max-width:1040px">${ICON(c.icon ?? "point")}
   <span style="color:#E8F0F8;font-size:21px">${esc(c.t)}${c.s ? ` <span style="color:#8fb6e0;font-size:17px"> — ${esc(c.s)}</span>` : ""}</span></div>`).join("")}`;
  }
  throw new Error(`unknown beat type ${b.type}`);
}

const SCHED = JSON.stringify({ scenes, TOTAL, starts });
const CFG = JSON.stringify(beatCfg);

const html = `<!doctype html><html><head><meta charset=utf8>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel=stylesheet>
<link href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.24.0/dist/tabler-icons.min.css" rel=stylesheet>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
#stage{position:relative;width:${W}px;height:${H}px;background:radial-gradient(120% 100% at 72% 16%,#123059 0%,#08152b 55%,#040a16 100%);font-family:Inter,sans-serif;overflow:hidden}
.disp{font-family:'Barlow Condensed',sans-serif}.mono{font-family:'JetBrains Mono',monospace}
.scene{position:absolute;inset:0;opacity:0;will-change:transform,opacity}
.glow{position:absolute;border-radius:50%;filter:blur(70px);opacity:.5}
.part{position:absolute;border-radius:50%;background:#5fe0ff;box-shadow:0 0 8px #5fe0ff}
.glass{position:absolute;background:rgba(120,170,255,.07);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border:1px solid rgba(150,200,255,.22);border-radius:18px;box-shadow:0 8px 44px rgba(0,10,30,.55),inset 0 1px 0 rgba(255,255,255,.12)}
.tile{position:absolute;padding:24px 20px;text-align:center;will-change:transform}
.ic{width:78px;height:78px;border-radius:18px;background:linear-gradient(160deg,#1E66F5,#2b86ff);display:flex;align-items:center;justify-content:center;margin:0 auto;box-shadow:0 0 30px rgba(46,120,255,.65)}
.ic i{color:#fff;font-size:40px}
.hud{position:absolute;width:26px;height:26px;border:2px solid #5fe0ff;opacity:.85}
.bar{position:absolute;bottom:0;width:9px;background:linear-gradient(#5fe0ff,#1E66F5);border-radius:3px;box-shadow:0 0 8px rgba(95,224,255,.6)}
.chip{position:absolute;display:flex;align-items:center;gap:12px;background:rgba(19,41,74,.78);border:1px solid #2b4a7d;border-radius:12px;padding:13px 18px;will-change:transform}
.chip i{color:#9BC4FF;font-size:22px}
.call{position:absolute;display:flex;align-items:center;gap:8px;padding:9px 15px;border-radius:10px;background:rgba(8,20,38,.72);backdrop-filter:blur(8px);border:1px solid;font-family:'JetBrains Mono';font-size:15px;will-change:transform}
.rd{font-family:'JetBrains Mono';font-size:12px;color:#8fb6e0}
#prog{position:absolute;left:0;top:0;height:4px;background:linear-gradient(90deg,#1E66F5,#5fe0ff);width:0;z-index:9;box-shadow:0 0 12px #2b86ff}
#flash{position:absolute;top:0;width:120px;height:100%;left:-200px;background:linear-gradient(90deg,transparent,rgba(95,224,255,.28),transparent);opacity:0;z-index:8}
#wm{position:absolute;right:22px;bottom:16px;font-family:'Barlow Condensed';font-weight:600;font-size:18px;color:#bcd6f5;opacity:.55;letter-spacing:.4px;z-index:8;text-shadow:0 0 10px rgba(95,224,255,.4)}#wm b{color:#5fe0ff}
</style></head><body>
<div id=stage>
 <div id=prog></div>
 <div class=glow style="width:560px;height:560px;background:#1748a0;left:58%;top:-14%"></div>
 <div class=glow style="width:380px;height:380px;background:#0d6fb0;left:-8%;bottom:-16%;opacity:.4"></div>
 <svg width=100% height=100% style="position:absolute;inset:0;opacity:.16" preserveAspectRatio="none"><defs><pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M56 0H0V56" fill="none" stroke="#4f86c8" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
 <div id=parts></div>
 ${beats.map((b, i) => `<div class=scene id=s${i}>${sceneHtml(b, i)}</div>`).join("\n")}
 <div id=flash></div>
 <div id=wm>NDT<b>Academy</b>.com</div>
</div>
<script>
const SCH=${SCHED};
const CFG=${CFG};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x,0,1);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
const backOut=x=>{x=clamp(x,0,1);const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
const tw=(lt,s,d,a,b)=>a+(b-a)*ease((lt-s)/d);
const E=id=>document.getElementById(id);
const PA=[];const pe=E('parts');
for(let i=0;i<20;i++){const p=document.createElement('div');p.className='part';const s=2+(i%3);p.style.width=s+'px';p.style.height=s+'px';p.dataset.x=(i*53)%96+2;p.dataset.sp=9+(i%5)*5;p.dataset.ph=(i*0.31)%1;pe.appendChild(p);PA.push(p)}
function wave(el,t,spike){if(!el)return;var pts=[];for(var x=0;x<=500;x+=10){var base=35+Math.sin((x*0.08)+t*5)*6+Math.sin((x*0.21)-t*7)*3;var sp=spike>0?Math.exp(-Math.pow((x-spike*500)/30,2))*-26:0;pts.push(x+','+(base+sp))}el.setAttribute('points',pts.join(' '))}
function scanG(id,lt,dlen){var g=E(id);if(!g)return 0;var sc=clamp(lt/dlen,0,1);var x=60+sc*460;var o=tw(lt,0,.4,0,.9)*tw(lt,dlen-0.5,.5,1,0);g.setAttribute('transform','translate('+x+',0)');g.setAttribute('opacity',o);return sc}
function ping(id,lt,s){var c=E(id);if(!c)return;var k=clamp((lt-s)/0.8,0,1);if(k<=0||k>=1){c.setAttribute('opacity',0);return}c.setAttribute('r',6+k*34);c.setAttribute('opacity',(1-k)*0.9)}
function chipIn(el,lt,s,t,ph){if(!el)return;var k=clamp((lt-s)/0.55,0,1);var fl=k>0.99?Math.sin((t+ph)*1.6)*3:0;el.style.opacity=clamp(k*1.6,0,1);el.style.transform='translateY('+(16*(1-k)+fl)+'px)'}
function applyReveals(cfg,lt,skipPing){if(!cfg.reveals)return;for(const r of cfg.reveals){var el=E(r.id);if(!el)continue;
  if(r.kind==='draw'){el.style.strokeDashoffset=100*(1-ease((lt-r.at)/0.6));}
  else if(r.kind==='ping'){if(!skipPing)ping(r.id,lt,r.at);}
  else{el.style.opacity=clamp((lt-r.at)/0.45,0,1);}}}
window.render=function(t){
 E('prog').style.width=(clamp(t/SCH.TOTAL,0,1)*100)+'%';
 var sc=SCH.scenes;
 for(let i=0;i<PA.length;i++){var p=PA[i],sp=+p.dataset.sp,ph=+p.dataset.ph;var fr=((t*sp/760)+ph)%1;p.style.left=p.dataset.x+'%';p.style.top=(740-fr*800)+'px';p.style.opacity=0.12+0.18*(0.5+0.5*Math.sin((t+ph*6)*2))}
 var fl=0,fx=-200;for(var b=0;b<SCH.starts.length;b++){var d=t-(SCH.starts[b]-0.25);if(d>=0&&d<=0.55){fl=Math.sin(d/0.55*Math.PI);fx=-150+(d/0.55)*(${W}+200)}}
 E('flash').style.opacity=fl*0.9;E('flash').style.left=fx+'px';
 function vis(i){var s=sc[i];var nextStart=(i+1<sc.length)?sc[i+1].start:1e9;var outEnd=Math.min(s.end+1.15,nextStart+0.1);return Math.min(clamp((t-(s.start-0.18))/0.35,0,1),clamp((outEnd-t)/0.35,0,1))}
 function enter(i){return clamp((t-sc[i].start+0.18)/0.45,0,1)}
 for(var i=0;i<CFG.length;i++){
  var cfg=CFG[i];var o=vis(i);var S=E('s'+i);S.style.opacity=o;S.style.transform='translateX('+(1-enter(i))*40+'px)';
  if(o<=0)continue;var lt=t-sc[i].start;
  if(cfg.type==='title'){
   var tg=E('b'+i+'tag');if(tg)tg.style.opacity=tw(lt,0,.5,0,1);
   var ti=E('b'+i+'title');ti.style.opacity=tw(lt,0.15,.6,0,1);ti.style.transform='translateX('+tw(lt,0.15,.6,-26,0)+'px)';
   var su=E('b'+i+'sub');if(su)su.style.opacity=tw(lt,0.7,.6,0,1);
   for(var j=0;j<cfg.chips.length;j++)chipIn(E('b'+i+'c'+j),lt,cfg.chips[j].at,t,j*0.8);
   var pn=E('b'+i+'panel');if(pn){pn.style.opacity=tw(lt,0.5,.7,0,1);pn.style.transform='translateX('+tw(lt,0.5,.7,34,0)+'px)';
    var lv=E('b'+i+'live');if(lv)lv.style.opacity=0.5+0.5*Math.abs(Math.sin(t*2.4));
    if(cfg.scan){var loop=cfg.scan.loop||4.2;var ls=((lt-0.6)%loop+loop)%loop;scanG(cfg.scan.id,ls,cfg.scan.sweep||3.4);
     if(cfg.reveals)for(const r of cfg.reveals){if(r.kind==='ping')ping(r.id,ls,r.at)}
     wave(E('b'+i+'wavep'),t,(ls>1.55&&ls<2.75)?clamp((ls-1.55)/1.2,0,1):0);}
    applyReveals(cfg,lt,true);
    if(cfg.hud){var r2=E('b'+i+'r2');if(r2)r2.textContent='DEPTH '+(Math.abs(Math.sin(t*1.3))*0.9).toFixed(2)+' mm';
     for(var k2=1;k2<=3;k2++){var bb=E('b'+i+'bar'+k2);if(bb)bb.style.height=(20+18*(0.5+0.5*Math.sin(t*6+(k2-1)*1.5)))+'px'}}}
  } else if(cfg.type==='tiles'){
   var hd=E('b'+i+'t');hd.style.opacity=tw(lt,0,.5,0,1);hd.style.transform='translateX('+tw(lt,0,.5,-22,0)+'px)';
   var lp=ease((lt-0.7)/0.9);var ln=E('b'+i+'line');ln.style.transform='scaleX('+lp+')';
   var dt=E('b'+i+'dot');dt.style.opacity=lp>0.02&&lp<0.99?0.95:0;dt.style.left=(parseFloat(ln.style.left)+lp*(parseFloat(ln.style.width)-15))+'px';
   for(var j2=0;j2<cfg.n;j2++){var kk=E('b'+i+'k'+j2);var pk=clamp((lt-(0.7+(j2+1)*0.4))/0.55,0,1);var fl2=pk>0.99?Math.sin((t+j2)*1.5)*5:0;
    kk.style.opacity=clamp(pk*1.6,0,1);kk.style.transform='translateY('+(30*(1-pk)+fl2)+'px) scale('+(0.7+0.3*backOut(pk))+')';
    var ic=E('b'+i+'i'+j2);ic.style.transform='scale('+(pk>0.99?1+0.06*Math.sin((t+j2)*3):1)+')'}
  } else if(cfg.type==='diagram'){
   var hd2=E('b'+i+'t');hd2.style.opacity=tw(lt,0,.5,0,1);
   var pn2=E('b'+i+'panel');pn2.style.opacity=tw(lt,0.3,.6,0,1);pn2.style.transform='scale('+tw(lt,0.3,.6,.96,1)+')';
   if(cfg.scan)scanG(cfg.scan.id,clamp(lt-0.6,0,(cfg.scan.sweep||4.2)+0.8),cfg.scan.sweep||4.2);
   applyReveals(cfg,lt);
   var nt=E('b'+i+'note');if(nt&&cfg.noteAt!=null){nt.style.opacity=tw(lt,cfg.noteAt,.6,0,1);nt.style.transform='translateX(-50%) translateY('+tw(lt,cfg.noteAt,.6,14,0)+'px)'}
  } else if(cfg.type==='kinetic'){
   var bk=E('b'+i+'blk');bk.style.transform='scaleY('+ease(lt/0.5)+')';
   for(var j3=0;j3<cfg.n;j3++){var wv=E('b'+i+'w'+j3);var st=0.3+j3*0.8;var k3=clamp((lt-st)/0.5,0,1);
    var sc2=k3>0.99?1+0.012*Math.sin((t-st)*3):0.6+0.4*backOut(k3);
    wv.style.opacity=clamp(k3*1.6,0,1);wv.style.transform='translateX('+(30*(1-k3))+'px) scale('+sc2+')';wv.style.transformOrigin='left'}
   var su2=E('b'+i+'sub');if(su2){su2.style.opacity=tw(lt,cfg.subAt,.6,0,1);su2.style.transform='translateX('+tw(lt,cfg.subAt,.6,20,0)+'px)'}
  } else if(cfg.type==='list'){
   var hd3=E('b'+i+'t');hd3.style.opacity=tw(lt,0,.5,0,1);hd3.style.transform='translateX('+tw(lt,0,.5,-22,0)+'px)';
   for(var j4=0;j4<cfg.chips.length;j4++)chipIn(E('b'+i+'c'+j4),lt,cfg.chips[j4].at,t,j4*0.8);
  }
 }
};
window.__ready=true;
</script></body></html>`;

const outHtml = join(FRAMES, `${lessonId}.html`);
mkdirSync(FRAMES, { recursive: true });
writeFileSync(outHtml, html);
console.log(`${lessonId}: ${beats.length} beats, total=${TOTAL.toFixed(2)}s`);

// ---- render ----
const puppeteer = (await import("puppeteer-core")).default;
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--force-color-profile=srgb", "--hide-scrollbars"] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto(`file://${outHtml}`, { waitUntil: "networkidle0" });
await page.evaluateHandle("document.fonts.ready");
await new Promise((r) => setTimeout(r, 500));

if (mode === "spot") {
  const dir = join(FRAMES, `${lessonId}-spot`);
  mkdirSync(dir, { recursive: true });
  for (let i = 0; i < scenes.length; i++) {
    const tt = scenes[i].start + Math.min(scenes[i].dur * 0.62, scenes[i].dur - 0.3);
    await page.evaluate((t) => render(t), tt);
    await page.screenshot({ path: join(dir, `b${i + 1}.png`) });
  }
  console.log(`spot -> ${dir}`);
} else {
  const fdir = join(FRAMES, `${lessonId}-frames`);
  if (existsSync(fdir)) rmSync(fdir, { recursive: true, force: true });
  mkdirSync(fdir, { recursive: true });
  const total = Math.ceil(TOTAL * FPS);
  for (let f = 0; f < total; f++) {
    await page.evaluate((t) => render(t), f / FPS);
    await page.screenshot({ path: join(fdir, `f${String(f).padStart(5, "0")}.png`) });
  }
  // narration track: lead + beats with gaps + tail
  const tmp = join(FRAMES, `${lessonId}-aud`);
  if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const sil = (d, f) => ff(["-f", "lavfi", "-t", String(d), "-i", "anullsrc=r=44100:cl=stereo", f]);
  sil(LEAD, join(tmp, "lead.wav")); sil(GAP, join(tmp, "gap.wav")); sil(TAIL, join(tmp, "tail.wav"));
  const parts = [join(tmp, "lead.wav")];
  for (let i = 0; i < beats.length; i++) {
    const wv = join(tmp, `b${i + 1}.wav`);
    ff(["-i", join(AUDIO, lessonId, `beat${i + 1}.mp3`), "-ar", "44100", "-ac", "2", wv]);
    parts.push(wv);
    if (i < beats.length - 1) parts.push(join(tmp, "gap.wav"));
  }
  parts.push(join(tmp, "tail.wav"));
  writeFileSync(join(tmp, "list.txt"), parts.map((f) => `file '${f}'`).join("\n"));
  ff(["-f", "concat", "-safe", "0", "-i", join(tmp, "list.txt"), "-c:a", "aac", "-b:a", "192k", join(tmp, "narr.m4a")]);
  mkdirSync(DROP, { recursive: true });
  const out = join(DROP, `${lessonId}.mp4`);
  ff(["-framerate", String(FPS), "-i", join(fdir, "f%05d.png"), "-i", join(tmp, "narr.m4a"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", String(FPS), "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out]);
  rmSync(fdir, { recursive: true, force: true });
  rmSync(tmp, { recursive: true, force: true });
  console.log(`-> ${out} (${probe(out).toFixed(1)}s)`);
}
await browser.close();
