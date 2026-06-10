#!/usr/bin/env node
// Knowlify explainer-video pipeline for course lessons.
//
//   node scripts/generate-explainers.mjs queue    queue every planned video not yet submitted
//   node scripts/generate-explainers.mjs poll     poll all pending jobs until done (sweeps ~80s apart)
//   node scripts/generate-explainers.mjs status   one-line-per-video state table
//
// Plan:  media-build/explainer-plan.json   (hand-authored prompts; lessonId + afterSection)
// State: media-build/explainers-state.json (uuid/chat_url/status per lesson — idempotent resume)
//
// Knowlify limits: 30 requests/60s shared by POST+GET, ≤50 items per batch,
// 3 concurrent renders (excess items park and auto-promote).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url))); // web/
const PLAN_PATH = path.join(ROOT, "media-build", "explainer-plan.json");
const STATE_PATH = path.join(ROOT, "media-build", "explainers-state.json");
const API = "https://api.knowlify.com/v1";

const env = readFileSync(path.join(ROOT, ".env.local"), "utf8");
const KEY = env.match(/^KNOWLIFY_API_KEY=(.+)$/m)?.[1]?.trim();
if (!KEY) throw new Error("KNOWLIFY_API_KEY missing from web/.env.local");

const plan = JSON.parse(readFileSync(PLAN_PATH, "utf8"));
const loadState = () => {
  try {
    return JSON.parse(readFileSync(STATE_PATH, "utf8"));
  } catch {
    return {};
  }
};
const saveState = (s) => writeFileSync(STATE_PATH, JSON.stringify(s, null, 2));

async function api(pathname, init = {}) {
  const resp = await fetch(`${API}${pathname}`, {
    ...init,
    headers: { "X-API-Key": KEY, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (resp.status === 429) {
    const wait = Number(resp.headers.get("Retry-After") ?? 60);
    console.log(`  rate-limited, waiting ${wait}s`);
    await new Promise((r) => setTimeout(r, (wait + 2) * 1000));
    return api(pathname, init);
  }
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(`${pathname} -> ${resp.status} ${JSON.stringify(body)}`);
  return body;
}

async function queue() {
  const state = loadState();
  // Queue anything that has never been submitted OR previously failed (e.g.
  // INSUFFICIENT_CREDITS) — so a credit top-up + re-run resumes cleanly.
  const todo = plan.items.filter((it) => {
    const st = state[it.lessonId];
    return !st?.uuid || st.status === "failed";
  });
  if (!todo.length) {
    console.log("nothing to queue — every plan item is rendering or complete");
    return;
  }
  console.log(`queueing ${todo.length} videos in one batch…`);
  const body = {
    videos: todo.map((it) => ({
      task: it.task,
      video_duration_seconds: it.seconds,
      aspect_ratio: "16:9",
      video_type: "instructional",
      global_style_prompt: plan.globalStyle,
      color_palette: plan.palette,
      voice_description: plan.voice,
    })),
  };
  const resp = await api("/videos", { method: "POST", body: JSON.stringify(body) });
  for (const r of resp.results ?? []) {
    const it = todo[r.index];
    state[it.lessonId] = {
      title: it.title,
      afterSection: it.afterSection,
      uuid: r.uuid ?? null,
      chat_url: r.chat_url ?? null,
      status: r.status,
      error: r.error_message ?? null,
    };
    console.log(`  ${it.lessonId}  ${r.status}  ${r.uuid ?? ""}  ${r.chat_url ?? ""}`);
  }
  saveState(state);
  console.log(`state saved -> ${STATE_PATH}`);
}

async function poll() {
  for (;;) {
    const state = loadState();
    const pending = Object.entries(state).filter(
      ([, v]) => v.uuid && v.status !== "complete" && v.status !== "failed",
    );
    if (!pending.length) {
      console.log("all jobs complete/failed");
      return;
    }
    let line = [];
    for (const [lessonId, v] of pending) {
      try {
        const s = await api(`/videos/${v.uuid}`);
        v.status = s.is_failed ? "failed" : s.status;
        v.percent = s.progress?.percent ?? 0;
        v.error = s.error_message ?? null;
        line.push(`${lessonId}:${v.status}@${v.percent}`);
      } catch (e) {
        line.push(`${lessonId}:pollerr`);
      }
      // self-pace: 30 req/60s shared budget -> ~2.2s between calls keeps a sweep legal
      await new Promise((r) => setTimeout(r, 2200));
    }
    saveState(state);
    const done = Object.values(state).filter((v) => v.status === "complete").length;
    console.log(`[${new Date().toISOString()}] ${done}/${Object.keys(state).length} complete | ${line.join(" ")}`);
    if (!pending.some(([, v]) => v.status !== "complete" && v.status !== "failed")) continue;
    await new Promise((r) => setTimeout(r, 20_000));
  }
}

function status() {
  const state = loadState();
  for (const [lessonId, v] of Object.entries(state)) {
    console.log(
      `${lessonId.padEnd(10)} ${(v.status ?? "?").padEnd(18)} ${String(v.percent ?? "").padEnd(4)} ${v.uuid ?? ""} ${v.chat_url ?? ""}${v.error ? `  ERR: ${v.error}` : ""}`,
    );
  }
}

const cmd = process.argv[2];
if (cmd === "queue") await queue();
else if (cmd === "poll") await poll();
else if (cmd === "status") status();
else {
  console.log("usage: node scripts/generate-explainers.mjs <queue|poll|status>");
  process.exit(1);
}
