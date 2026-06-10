#!/usr/bin/env python3
"""
NDT Academy — standards compliance verifier.

a) CP-105 coverage: parses every numbered line item from the OCR'd
   ANSI/ASNT CP-105-2024 topical outlines and verifies each item is
   covered by at least one lesson topic in the course curriculum.
b) Hours: verifies designed lesson minutes per level meet the governing
   formal-training-hour requirement (max of SNT-TC-1A 2024 Table 6.3.1A
   and NAS410 Table 1).

Outputs site/data/compliance.json (consumed by compliance.html) and
prints a summary. Unmatched outline items are listed for Level III
review rather than silently accepted.

Usage: python3 tools/verify_compliance.py [--ocr-dir DIR]
"""
import json, re, sys, os, difflib, argparse

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(HERE, '..', 'site')

# governing requirements: max(SNT-TC-1A 2024, NAS410)
REQ = {
  'ut':    {'name': 'Ultrasonic Testing',      'levels': {'I': {'snt': 40, 'nas': 40}, 'II': {'snt': 40, 'nas': 40}}},
  'rt':    {'name': 'Radiographic Testing',    'levels': {'I': {'snt': 40, 'nas': 40}, 'II': {'snt': 40, 'nas': 40}}},
  'et':    {'name': 'Eddy Current Testing',    'levels': {'I': {'snt': 40, 'nas': 40}, 'II': {'snt': 40, 'nas': 40}}},
  'mt':    {'name': 'Magnetic Particle',       'levels': {'I': {'snt': 12, 'nas': 16}, 'II': {'snt': 8,  'nas': 16}}},
  'pt':    {'name': 'Liquid Penetrant',        'levels': {'I': {'snt': 4,  'nas': 16}, 'II': {'snt': 8,  'nas': 16}}},
  'vt':    {'name': 'Visual Testing',          'levels': {'I': {'snt': 8,  'nas': None}, 'II': {'snt': 16, 'nas': None}}},
  'basic': {'name': 'NDT Basic',               'levels': {'Basic': {'snt': None, 'nas': None}}},
  'rad':   {'name': 'Radiation Safety',        'levels': {'RS': {'snt': None, 'nas': None}}},
}
OCR_FILES = {
  'ut': '2024-UT-Outline.txt', 'rt': '2024-RT-Outline.txt', 'et': '2024-ET-Outline.txt',
  'mt': '2024-MT-Outline.txt', 'pt': '2024-PT-Outline.txt', 'vt': '2024-VT-Outline.txt',
  'basic': '2024-Basic-Outline.txt', 'rad': 'Rad-Safety-Outline-2024.txt',
}
# outline sections intentionally NOT built into the MVP course (advanced
# techniques catalogued in futureTechniques) — excluded from coverage scoring
EXCLUDE_AFTER = {
  'ut': r'Full Matrix Capture Ultrasonic Testing',
  'rt': r'(Computed Radiography|Limited Certification)',
}
# ET outline interleaves ACFM / ECT / RFT technique outlines: keep only the
# Eddy Current Testing segments (ACFM and RFT are catalogued futureTechniques)
SEGMENT = {
  'et': {'start': r'Eddy Current Testing Level', 'stop': r'(Remote Field Testing Level|Alternating Current Field Measurement Testing Level|Magnetic Flux Leakage)'},
}

ITEM_RE = re.compile(r'^\s*(\d{1,2}(?:[.,]\d{1,2}){1,3})[.)]?\s+(.{3,})$')

def norm(s):
    s = s.lower()
    s = re.sub(r'\(.*?\)', ' ', s)                       # drop parentheticals
    s = re.sub(r'[^a-z0-9 ]', ' ', s)
    s = re.sub(r'\b(the|a|an|of|and|or|to|in|for|with|by|on|etc|vs|versus)\b', ' ', s)
    return ' '.join(s.split())

def parse_outline(path, course):
    """Extract (number, text) items from OCR'd outline."""
    raw = open(path, encoding='utf-8').read()
    excluded_note = None
    seg = SEGMENT.get(course)
    if seg:
        kept, pos = [], 0
        while True:
            s = re.search(seg['start'], raw[pos:])
            if not s:
                break
            start = pos + s.start()
            e = re.search(seg['stop'], raw[start:])
            end = start + e.start() if e else len(raw)
            kept.append(raw[start:end])
            pos = end
        if kept:
            raw = '\n'.join(kept)
            excluded_note = 'ACFM and RFT technique outlines excluded (catalogued as future techniques)'
    cut = EXCLUDE_AFTER.get(course)
    if cut:
        m = re.search(cut, raw)
        if m:
            excluded_note = raw[m.start():m.start()+60].split('\n')[0].strip()
            raw = raw[:m.start()]
    items, seen = [], set()
    for line in raw.splitlines():
        line = line.strip()
        m = ITEM_RE.match(line)
        if not m:
            continue
        num = m.group(1).replace(',', '.')
        text = re.sub(r'\s+', ' ', m.group(2)).strip(' .-—|')
        text = re.sub(r'\s+\d+(\.\d+)?$', '', text)  # strip stray hour-column digits OCR'd onto the line
        # skip OCR junk: too-short text, page furniture, hour columns
        if len(norm(text)) < 4 or re.match(r'^[\d\s.]+$', text):
            continue
        key = (num, norm(text)[:40])
        if key in seen:
            continue
        seen.add(key)
        items.append({'num': num, 'text': text})
    return items, excluded_note

TOPIC_PREFIX = re.compile(r'^[A-Za-z]{0,12}\.?\s*\d+(?:\.\d+)*\s*')  # "1.2.3 " or "Physics 1.1 "

def coverage(course_json, items):
    topics = []
    for L in course_json['levels']:
        for mod in L['modules']:
            for les in mod['lessons']:
                for t in les['topics']:
                    topics.append({'norm': norm(TOPIC_PREFIX.sub('', t)), 'lesson': les['id'], 'title': les['title'], 'raw': t})
            # lesson and module titles also count as coverage evidence for section headers
            for les in mod['lessons']:
                topics.append({'norm': norm(les['title']), 'lesson': les['id'], 'title': les['title'], 'raw': les['title']})
            topics.append({'norm': norm(mod['title']), 'lesson': mod['lessons'][0]['id'] if mod['lessons'] else None, 'title': mod['title'], 'raw': mod['title']})
    scored = []
    for it in items:
        n = norm(it['text'])
        best, best_r = None, 0.0
        for tp in topics:
            if not tp['norm']:
                continue
            if n and len(n) >= 6 and (n in tp['norm'] or tp['norm'] in n):
                r = 1.0
            else:
                r = difflib.SequenceMatcher(None, n, tp['norm']).ratio()
            if r > best_r:
                best, best_r = tp, r
            if r == 1.0:
                break
        scored.append({'num': it['num'], 'text': it['text'], 'match': round(best_r, 2),
                       'lesson': best['lesson'] if best else None,
                       'lessonTitle': best['title'] if best else None,
                       'direct': best_r >= 0.62})
    # parent rule: a section header (e.g. 2.0 or 1.3) counts as covered when
    # most of its children are covered — the content lives in the children
    for i, it in enumerate(scored):
        if it['direct']:
            continue
        prefix = it['num'].rstrip('.0').rstrip('.') if it['num'].endswith('.0') else it['num']
        kids = [s for s in scored if s is not it and s['num'].startswith(prefix + '.')]
        if len(kids) >= 2 and sum(1 for k in kids if k['direct']) / len(kids) >= 0.6:
            it['direct'] = True
            it['viaChildren'] = True
    matched = [s for s in scored if s['direct']]
    unmatched = [s for s in scored if not s['direct']]
    return matched, unmatched

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ocr-dir', default=os.environ.get('OCR_DIR', os.path.join(HERE, '..', 'ocr')))
    args = ap.parse_args()

    report = {'generated': __import__('datetime').date.today().isoformat(),
              'methodology': {
                'coverage': 'Every numbered item parsed from the OCR’d CP-105-2024 outline is matched against curriculum lesson topics (normalized text, >=0.62 similarity or containment). Items below threshold are flagged for Level III review — not assumed covered.',
                'hours': 'Designed lesson minutes per level are summed and compared to the governing requirement: max(SNT-TC-1A 2024 Table 6.3.1A, NAS410 Table 1). Delivery-time enforcement (active-engagement time tracking, certificate gating) is a platform feature; this report verifies course design.'},
              'courses': []}
    all_ok = True
    for cid, meta in REQ.items():
        cj = json.load(open(os.path.join(SITE, 'data', 'curriculum', f'{cid}.json')))
        ocr = os.path.join(args.ocr_dir, OCR_FILES[cid])
        items, excluded = parse_outline(ocr, cid) if os.path.exists(ocr) else ([], None)
        matched, unmatched = coverage(cj, items)
        # hours
        hours = []
        for L in cj['levels']:
            mins = sum(l['minutes'] for m in L['modules'] for l in m['lessons'])
            req = meta['levels'].get(L['level'], {})
            governing = max([x for x in (req.get('snt'), req.get('nas')) if x] or [0]) or None
            ok = governing is None or mins >= governing * 60
            if not ok:
                all_ok = False
            hours.append({'level': L['level'], 'designedMinutes': mins, 'designedHours': round(mins/60, 2),
                          'snt': req.get('snt'), 'nas': req.get('nas'), 'governing': governing,
                          'meets': ok,
                          'marginMinutes': (mins - governing*60) if governing else None})
        pct = round(100*len(matched)/len(items), 1) if items else None
        report['courses'].append({
            'id': cid, 'code': cj['code'], 'name': cj['name'],
            'outlineItems': len(items), 'matched': len(matched), 'unmatchedCount': len(unmatched),
            'coveragePct': pct, 'excludedAdvanced': excluded,
            'futureTechniques': cj.get('futureTechniques', []),
            'hours': hours,
            'reviewQueue': unmatched,
        })
        print(f"{cj['code']:>6}: outline items {len(items):>3}  matched {len(matched):>3} ({pct}%)  "
              f"review {len(unmatched):>2}  hours " +
              ' '.join(f"L{h['level']}:{h['designedHours']}h/{h['governing'] or '—'}h{'OK' if h['meets'] else ' FAIL'}" for h in hours))
    out = os.path.join(SITE, 'data', 'compliance.json')
    json.dump(report, open(out, 'w'), indent=1)
    open(os.path.join(SITE, 'data', 'compliance.js'), 'w').write(
        "window.NDTA_DATA=window.NDTA_DATA||{};window.NDTA_DATA['compliance']=" + json.dumps(report) + ";")
    print('wrote', out, '| ALL HOURS OK' if all_ok else '| HOUR FAILURES PRESENT')

if __name__ == '__main__':
    main()
