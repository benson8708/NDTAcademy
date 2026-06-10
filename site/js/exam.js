// NDT Academy — practice exam engine
(() => {
  const $ = id => document.getElementById(id);
  const METHOD_NAMES = { UT: 'Ultrasonic', RT: 'Radiographic', MPI: 'Magnetic Particle', LPI: 'Liquid Penetrant', ECT: 'Eddy Current' };
  const PASS = 80;

  const state = { method: 'UT', level: 1, count: 25, timer: 0, qs: [], i: 0, picks: [], secs: 0, tick: null, locked: false };

  // picker groups
  const groups = { 'pick-method': v => state.method = v, 'pick-level': v => state.level = +v, 'pick-count': v => state.count = +v, 'pick-timer': v => state.timer = +v };
  Object.entries(groups).forEach(([id, set]) => {
    $(id).addEventListener('click', e => {
      const b = e.target.closest('.pick'); if (!b) return;
      $(id).querySelectorAll('.pick').forEach(x => x.classList.remove('sel'));
      b.classList.add('sel'); set(b.dataset.v);
    });
  });

  // honor ?method=XX deep links
  const pm = new URLSearchParams(location.search).get('method');
  if (pm && METHOD_NAMES[pm]) {
    state.method = pm;
    $('pick-method').querySelectorAll('.pick').forEach(b => b.classList.toggle('sel', b.dataset.v === pm));
  }

  const cache = {};
  async function loadBank(m) {
    if (!cache[m]) {
      try {
        cache[m] = await fetch(`data/questions-${m}.json`).then(r => { if (!r.ok) throw 0; return r.json(); });
      } catch (e) { // file:// fallback via script tag
        cache[m] = await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = `data/questions-${m}.js`;
          s.onload = () => { const d = (window.NDTA_DATA || {})[`questions-${m}`]; d ? res(d) : rej(); };
          s.onerror = rej;
          document.head.appendChild(s);
        });
      }
    }
    return cache[m];
  }

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  $('start').addEventListener('click', async () => {
    $('start').disabled = true; $('start').textContent = 'Loading…';
    try {
      const bank = await loadBank(state.method);
      const pool = bank.filter(q => q.l === state.level && q.q && q.o.every(o => o));
      state.qs = shuffle([...pool]).slice(0, Math.min(state.count, pool.length));
      state.i = 0; state.picks = [];
      $('setup').style.display = 'none'; $('results').style.display = 'none'; $('exam').style.display = 'block';
      $('exam-label').textContent = `${METHOD_NAMES[state.method]} · Level ${'I'.repeat(state.level)}`;
      render();
    } catch (e) {
      alert('Could not load the question bank. If you opened this file directly from disk, run it through a local server or the hosted site.');
    }
    $('start').disabled = false; $('start').textContent = 'Start Exam';
  });

  function startTimer() {
    stopTimer();
    if (!state.timer) { $('exam-timer').textContent = ''; return; }
    state.secs = state.timer;
    const t = $('exam-timer');
    t.classList.remove('warn');
    t.textContent = `00:${String(state.secs).padStart(2, '0')}`;
    state.tick = setInterval(() => {
      state.secs--;
      t.textContent = `00:${String(Math.max(state.secs, 0)).padStart(2, '0')}`;
      if (state.secs <= 10) t.classList.add('warn');
      if (state.secs <= 0) { stopTimer(); lockIn(-1); } // time out = no answer
    }, 1000);
  }
  function stopTimer() { if (state.tick) clearInterval(state.tick); state.tick = null; }

  function render() {
    const q = state.qs[state.i];
    state.locked = false;
    $('exam-counter').textContent = `Question ${state.i + 1} / ${state.qs.length}`;
    $('exam-progress').style.width = `${(state.i / state.qs.length) * 100}%`;
    $('q-text').textContent = q.q;
    const box = $('answers'); box.innerHTML = '';
    q.o.forEach((opt, idx) => {
      const b = document.createElement('button');
      b.className = 'ans';
      b.innerHTML = `<span class="key">${'ABCD'[idx]}</span><span>${opt.replace(/</g, '&lt;')}</span>`;
      b.addEventListener('click', () => lockIn(idx));
      box.appendChild(b);
    });
    $('next').disabled = true;
    $('next').textContent = state.i === state.qs.length - 1 ? 'Finish Exam' : 'Next Question';
    startTimer();
  }

  function lockIn(idx) {
    if (state.locked) return;
    state.locked = true; stopTimer();
    state.picks[state.i] = idx;
    const q = state.qs[state.i];
    [...$('answers').children].forEach((b, j) => {
      b.disabled = true;
      if (j === q.c) b.classList.add('correct');
      else if (j === idx) b.classList.add('wrong');
    });
    $('next').disabled = false;
    $('next').focus();
  }

  $('next').addEventListener('click', () => {
    if (state.i < state.qs.length - 1) { state.i++; render(); }
    else finish();
  });

  $('quit').addEventListener('click', () => { stopTimer(); $('exam').style.display = 'none'; $('setup').style.display = 'block'; });

  function finish() {
    stopTimer();
    const right = state.qs.reduce((n, q, i) => n + (state.picks[i] === q.c ? 1 : 0), 0);
    const pct = Math.round((right / state.qs.length) * 100);
    $('exam').style.display = 'none'; $('results').style.display = 'block';
    const ring = $('ring');
    ring.style.setProperty('--pct', pct);
    ring.style.setProperty('--ring', pct >= PASS ? 'var(--green)' : pct >= 60 ? 'var(--amber)' : 'var(--red)');
    $('r-pct').textContent = `${pct}%`;
    $('r-frac').textContent = `${right} of ${state.qs.length}`;
    const v = $('r-verdict');
    v.textContent = pct >= PASS ? 'Pass — nice work' : 'Below 80% — keep drilling';
    v.className = `verdict ${pct >= PASS ? 'pass' : 'fail'}`;
    // review missed questions
    const rev = $('review'); rev.innerHTML = '';
    const missed = state.qs.map((q, i) => ({ q, pick: state.picks[i], n: i })).filter(x => x.pick !== x.q.c);
    if (missed.length) {
      const h = document.createElement('h3'); h.textContent = `Review (${missed.length} missed)`; h.style.margin = '10px 0 6px';
      rev.appendChild(h);
      missed.forEach(({ q, pick }) => {
        const d = document.createElement('div'); d.className = 'review-item';
        d.innerHTML = `<div class="rq">${q.q.replace(/</g, '&lt;')}</div>` +
          (pick >= 0 ? `<div class="ra bad">${'ABCD'[pick]}. ${q.o[pick].replace(/</g, '&lt;')}</div>` : `<div class="ra bad">No answer (time)</div>`) +
          `<div class="ra good">${'ABCD'[q.c]}. ${q.o[q.c].replace(/</g, '&lt;')}</div>`;
        rev.appendChild(d);
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $('again').addEventListener('click', () => $('start').click());
  $('again-setup').addEventListener('click', () => { $('results').style.display = 'none'; $('setup').style.display = 'block'; });
})();
