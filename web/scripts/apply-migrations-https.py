#!/usr/bin/env python3
"""Apply supabase/migrations/*.sql to the cloud project over HTTPS.

This network blocks outbound Postgres ports (5432/6543), so instead of
`supabase db push` we use the Management API SQL endpoint, splitting large
seed files on `-- CHUNK --` markers. Applied versions are recorded in
supabase_migrations.schema_migrations so a future `supabase db push` from a
normal network agrees with cloud state.
"""
import json, subprocess, sys, time, urllib.request, base64
from pathlib import Path

REF = "vamjeecpssxhzeyiqqsc"
ROOT = Path(__file__).resolve().parents[2]
MIGRATIONS = sorted((ROOT / "supabase" / "migrations").glob("*.sql"))

raw = subprocess.check_output(
    ["security", "find-generic-password", "-s", "Supabase CLI", "-w"], text=True
).strip()
TOKEN = base64.b64decode(raw.removeprefix("go-keyring-base64:")).decode()

def run_sql(query: str, attempts: int = 4) -> object:
    last = None
    for attempt in range(attempts):
        req = urllib.request.Request(
            f"https://api.supabase.com/v1/projects/{REF}/database/query",
            data=json.dumps({"query": query}).encode(),
            headers={
                "Authorization": f"Bearer {TOKEN}",
                "Content-Type": "application/json",
                "User-Agent": "ndtacademy-deploy/1.0",  # default Python-urllib UA is WAF-blocked
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                return json.loads(resp.read() or b"null")
        except urllib.error.HTTPError as e:
            if e.code == 400:  # real SQL error — not transient, surface immediately
                raise
            last = e
            time.sleep(2 * (attempt + 1))
    raise last

applied = set()
try:
    rows = run_sql("select version from supabase_migrations.schema_migrations") or []
    applied = {r["version"] for r in rows}
except Exception:
    run_sql("create schema if not exists supabase_migrations;"
            "create table if not exists supabase_migrations.schema_migrations"
            "(version text primary key, statements text[], name text)")

for path in MIGRATIONS:
    version = path.name.split("_")[0]
    name = path.stem.split("_", 1)[1]
    if version in applied:
        print(f"skip  {path.name} (already applied)")
        continue
    sql = path.read_text()
    chunks = [c.strip() for c in sql.split("-- CHUNK --") if c.strip()]
    for i, chunk in enumerate(chunks):
        try:
            run_sql(chunk)
        except urllib.error.HTTPError as e:
            print(f"FAIL  {path.name} chunk {i + 1}/{len(chunks)}: {e.read().decode()[:500]}")
            sys.exit(1)
        print(f"ok    {path.name} chunk {i + 1}/{len(chunks)}")
    run_sql(
        "insert into supabase_migrations.schema_migrations (version, name) "
        f"values ('{version}', '{name}') on conflict (version) do nothing"
    )

print("\n--- verification ---")
for q in [
    "select count(*) as courses from public.courses",
    "select count(*) as levels from public.course_levels",
    "select count(*) as modules from public.modules",
    "select count(*) as lessons from public.lessons",
    "select method, level, count(*) from public.questions group by 1,2 order by 1,2",
]:
    print(json.dumps(run_sql(q)))
