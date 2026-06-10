// NDT Academy — curriculum overview + lesson player (prototype)
(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const params = new URLSearchParams(location.search);
  const courseId = params.get('course') || 'ut';
  let C = null;          // course data
  let levelIdx = 0;      // selected level index
  let cur = null;        // current lesson ref {li, mi, ci}

  const ICONS = {
    video: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    narration: '<svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11z"/></svg>',
    diagram: '<svg viewBox="0 0 24 24"><path d="M3 3h8v8H3zm10 0h8v5h-8zM3 13h8v8H3zm10-3h8v11h-8z" transform="scale(.9) translate(1.3,1.3)"/></svg>',
    interactive: '<svg viewBox="0 0 24 24"><path d="M13 2 3 14h6l-2 8L19 10h-6l2-8z"/></svg>',
    simulation: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-8-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    reference: '<svg viewBox="0 0 24 24"><path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 4v2h8V6H8zm0 4v2h8v-2H8zm0 4v2h5v-2H8z"/></svg>'
  };
  const MEDIA_NOTE = {
    video: 'Video placeholder — production footage to be added',
    narration: 'Voiceover placeholder — narration script and audio to be recorded',
    diagram: 'Diagram placeholder — illustration to be produced',
    interactive: 'Interactive placeholder — exercise to be built',
    simulation: 'Simulation placeholder — virtual practice environment to be built',
    reference: 'Reference placeholder — standards/excerpt library to be attached'
  };

  // ---------- progress (localStorage) ----------
  const PKEY = `ndta-progress-${courseId}`;
  const progress = JSON.parse(localStorage.getItem(PKEY) || '{}');
  const saveProgress = () => localStorage.setItem(PKEY, JSON.stringify(progress));

  // ---------- load (fetch with file:// script fallback) ----------
  function loadViaScript() {
    const s = document.createElement('script');
    s.src = `data/curriculum/${courseId}.js`;
    s.onload = () => {
      C = (window.NDTA_DATA || {})[`curriculum-${courseId}`];
      if (C) init(); else fail();
    };
    s.onerror = fail;
    document.head.appendChild(s);
  }
  function fail() {
    $('view-curriculum').innerHTML = '<div class="proto-note">Could not load curriculum data for this course.</div>';
  }
  fetch(`data/curriculum/${courseId}.json`).then(r => {
    if (!r.ok) throw 0;
    return r.json();
  }).then(data => { C = data; init(); }).catch(loadViaScript);

  function init() {
    document.title = `${C.name} — NDT Academy`;
    $('c-code').textContent = `${C.code} · ${C.levels.length > 1 ? 'Levels ' + C.levels.map(l => l.level).join(' & ') : C.levels[0].level}`;
    $('c-name').textContent = C.name;
    $('c-cp').textContent = `Built to ${C.cp105}` + (C.jurisdictionNote ? ' · Jurisdiction requirements vary' : '');
    // hour pills
    const h = C.hours, pills = [];
    C.levels.forEach(l => pills.push(`<div class="hour-pill"><div class="lbl">Level ${l.level} — course length</div><div class="val">${l.targetHours}<em>h</em></div></div>`));
    if (h.snt_tc_1a && h.snt_tc_1a.l1 != null) pills.push(`<div class="hour-pill"><div class="lbl">SNT-TC-1A 2024 (L1/L2)</div><div class="val">${h.snt_tc_1a.l1}<em>/</em>${h.snt_tc_1a.l2}<em>h</em></div></div>`);
    if (h.nas410 && h.nas410.l1 != null) pills.push(`<div class="hour-pill"><div class="lbl">NAS410 (L1/L2)</div><div class="val">${h.nas410.l1}<em>/</em>${h.nas410.l2}<em>h</em></div></div>`);
    if (h.directToL2) pills.push(`<div class="hour-pill"><div class="lbl">Direct to Level II</div><div class="val">${h.directToL2}<em>h</em></div></div>`);
    $('c-hours').innerHTML = pills.join('');
    // level tabs
    $('level-tabs').innerHTML = C.levels.map((l, i) =>
      `<button class="level-tab${i === 0 ? ' sel' : ''}" data-i="${i}">${l.level === 'I' || l.level === 'II' ? 'Level ' + l.level : esc(l.level === 'RS' ? 'Radiation Safety' : l.level)}</button>`).join('');
    $('level-tabs').addEventListener('click', e => {
      const b = e.target.closest('.level-tab'); if (!b) return;
      levelIdx = +b.dataset.i;
      document.querySelectorAll('.level-tab').forEach(x => x.classList.toggle('sel', x === b));
      renderCurriculum();
    });
    renderCurriculum();
  }

  const lessonDone = id => !!progress[id];
  const fmtH = m => (m / 60).toFixed(m % 60 ? 2 : 0).replace(/\.?0+$/, '') || '0';

  // ---------- curriculum overview ----------
  function renderCurriculum() {
    const L = C.levels[levelIdx];
    $('level-desc').textContent = L.description || '';
    // progress
    let total = 0, done = 0;
    L.modules.forEach(m => m.lessons.forEach(l => { total += l.minutes; if (lessonDone(l.id)) done += l.minutes; }));
    $('prog-text').textContent = `${fmtH(done)} / ${fmtH(total)} h`;
    $('prog-bar').style.width = total ? `${(done / total) * 100}%` : '0%';

    $('modules').innerHTML = L.modules.map((m, mi) => `
      <div class="module${mi === 0 ? ' open' : ''}">
        <div class="module-head" data-mi="${mi}">
          <span class="m-num">${String(mi + 1).padStart(2, '0')}</span>
          <h3>${esc(m.title)}</h3>
          <span class="m-meta">${m.lessons.length} lessons · ${m.hours} h</span>
          <span class="chev"></span>
        </div>
        <div class="module-body">
          ${m.cpSection ? `<div class="cp-ref">${esc(m.cpSection)}</div>` : ''}
          ${m.lessons.map((l, li) => `
            <div class="lesson-row${lessonDone(l.id) ? ' done' : ''}" data-mi="${mi}" data-li="${li}">
              <span class="dot"></span>
              <span class="l-title">${esc(l.title)}</span>
              <span class="l-meta">${[...new Set(l.media.map(x => x.type))].map(t => `<span class="mtag ${t}">${t}</span>`).join('')}</span>
              <span class="min">${l.minutes} min</span>
            </div>`).join('')}
          ${m.moduleQuiz ? `<div class="quiz-row">MODULE QUIZ — ${m.moduleQuiz.questions} questions · ${m.moduleQuiz.passingScore}% to pass · placeholder</div>` : ''}
        </div>
      </div>`).join('') +
      (L.finalExam ? `<div class="module open"><div class="quiz-row" style="border-top:0">FINAL EXAM — ${L.finalExam.questions} questions · ${L.finalExam.passingScore}% to pass${L.finalExam.bank ? ` · drawn from ${L.finalExam.bank} Level ${L.finalExam.bankLevel} bank` : ''} · placeholder</div></div>` : '');

    $('modules').querySelectorAll('.module-head').forEach(h =>
      h.addEventListener('click', () => h.parentElement.classList.toggle('open')));
    $('modules').querySelectorAll('.lesson-row').forEach(r =>
      r.addEventListener('click', () => openLesson(+r.dataset.mi, +r.dataset.li)));
    $('view-curriculum').style.display = 'block';
    $('view-lesson').style.display = 'none';
    window.scrollTo({ top: 0 });
  }

  // ---------- lesson player ----------
  function openLesson(mi, li) {
    cur = { mi, li };
    const L = C.levels[levelIdx], M = L.modules[mi], lesson = M.lessons[li];

    $('player-side').innerHTML = `<div class="ps-head">${C.code} ${L.level === 'I' || L.level === 'II' ? 'Level ' + L.level : ''} Curriculum</div>` +
      L.modules.map((m, xmi) => `
        <div class="ps-mod">
          <div class="ps-mtitle">${String(xmi + 1).padStart(2, '0')} · ${esc(m.title)}</div>
          ${m.lessons.map((l, xli) => `
            <div class="ps-lesson${xmi === mi && xli === li ? ' cur' : ''}${lessonDone(l.id) ? ' done' : ''}" data-mi="${xmi}" data-li="${xli}">
              <span class="dot"></span><span>${esc(l.title)}</span>
            </div>`).join('')}
        </div>`).join('');
    $('player-side').querySelectorAll('.ps-lesson').forEach(r =>
      r.addEventListener('click', () => openLesson(+r.dataset.mi, +r.dataset.li)));

    const done = lessonDone(lesson.id);
    $('lesson-main').innerHTML = `
      <div class="crumb"><a id="back-curr">Curriculum</a> / Module ${mi + 1}: ${esc(M.title)}</div>
      <h1>${esc(lesson.title)}</h1>
      <div class="lesson-stats">${lesson.minutes} minutes of formal training · counts toward ${L.targetHours} h requirement</div>
      <div class="objectives"><h4>Learning objectives</h4><ul>${lesson.objectives.map(o => `<li>${esc(o)}</li>`).join('')}</ul></div>
      ${lesson.media.map(m => `
        <div class="media-block">
          <div class="mb-head"><span class="mtag ${m.type}">${m.type}</span><span class="t">${esc(m.title)}</span>${m.duration ? `<span class="dur">${m.duration}</span>` : ''}</div>
          <div class="media-stage ${m.type === 'video' ? 'video' : ''}">
            <div class="ph">
              <div class="ph-icon">${ICONS[m.type] || ICONS.reference}</div>
              <div class="ph-label">${m.type} · placeholder</div>
              <div class="ph-note">${MEDIA_NOTE[m.type] || ''}</div>
            </div>
          </div>
        </div>`).join('')}
      <div class="topics-panel"><h4>CP-105 topics covered in this lesson</h4><ul>${lesson.topics.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
      ${lesson.check ? `<div class="check-block"><div><div class="t">Knowledge check</div><div class="d">${lesson.check.questions} questions — must be completed to log this lesson's training time (placeholder)</div></div><button class="btn btn-ghost btn-sm" disabled>Start (coming soon)</button></div>` : ''}
      <div class="lesson-nav">
        <button class="btn btn-ghost" id="prev-l">Previous</button>
        <button class="btn complete-btn${done ? ' done' : ''}" id="toggle-done">${done ? 'Completed ✓' : 'Mark Lesson Complete'}</button>
        <button class="btn btn-primary" id="next-l">Next Lesson</button>
      </div>`;

    $('back-curr').addEventListener('click', renderCurriculum);
    $('toggle-done').addEventListener('click', () => {
      progress[lesson.id] = !progress[lesson.id];
      if (!progress[lesson.id]) delete progress[lesson.id];
      saveProgress(); openLesson(mi, li);
    });
    $('prev-l').addEventListener('click', () => step(-1));
    $('next-l').addEventListener('click', () => step(1));

    $('view-curriculum').style.display = 'none';
    $('view-lesson').style.display = 'block';
    window.scrollTo({ top: 0 });
  }

  function step(dir) {
    const L = C.levels[levelIdx];
    let { mi, li } = cur;
    li += dir;
    if (li < 0) { mi--; if (mi < 0) return renderCurriculum(); li = L.modules[mi].lessons.length - 1; }
    if (li >= L.modules[mi].lessons.length) { mi++; li = 0; if (mi >= L.modules.length) return renderCurriculum(); }
    openLesson(mi, li);
  }
})();
