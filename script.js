(function () {
  'use strict';

  /* ---------- Geometry: Crea una forma de Huevo (más ancho abajo) ---------- */
  function makeEggPath(cx, cy, rx, ry) {
    // Definimos los puntos para una forma ovoide usando curvas Bézier
    const topY = cy - ry;
    const botY = cy + ry;
    return `M ${cx},${topY} 
            C ${cx + rx},${topY} ${cx + rx},${botY} ${cx},${botY} 
            C ${cx - rx},${botY} ${cx - rx},${topY} ${cx},${topY} Z`;
  }

  /* ------------------ Splash loader ------------------ */
  (function splashInit() {
    const EGG_COUNT = 30; 
    const LOAD_MS = 1400;

    function createSplashStars() {
  const container = document.getElementById('splash-stars');
  if (!container) return;
  container.innerHTML = '';
  const emojis = ['🥚', '🐰', '🌸', '🍬'];
  for (let i=0; i<30; i++){
    const s = document.createElement('div');
    s.className = 'splash-star';
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    // Esto asegura que se distribuyan por toda la pantalla
    s.style.left = (Math.random() * 90 + 5) + '%';
    s.style.top = (Math.random() * 90 + 5) + '%';
    s.style.fontSize = (20 + Math.random()*20) + 'px';
    s.style.animationDelay = (Math.random()*2) + 's';
    container.appendChild(s);
  }

    function placeBottomLogo() {
      const logo = document.getElementById('logo');
      const container = document.getElementById('bottom-logo-container');
      if (logo && container) {
        logo.classList.remove('hide-until-bottom');
        container.appendChild(logo);
        container.setAttribute('aria-hidden','false');
      }
    }

    function runLoaderThenHide() {
      const progress = document.getElementById('loading-progress');
      const splash = document.getElementById('splash');
      if (!progress || !splash) return;
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / LOAD_MS);
        progress.style.width = Math.round(t * 100) + '%';
        if (t < 1) requestAnimationFrame(tick);
        else {
          setTimeout(()=> {
            splash.classList.add('hidden');
            placeBottomLogo();
          }, 300);
        }
      }
      requestAnimationFrame(tick);
    }

    document.addEventListener('DOMContentLoaded', () => {
      createSplashStars();
      setTimeout(runLoaderThenHide, 160);
    });
  })();

  const ASSIGN_KEY = 'eggs.assignments';
  const SELECT_KEY = 'eggs.selection';

  function todayKey() { return new Date().toISOString().slice(0,10); }

  function formatSavedAt(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleString([], { day: '2-digit', month: '2-digit', year: 'numeric', hour:'2-digit', minute:'2-digit' });
    } catch(e) { return isoString; }
  }

  function sampleWeightedNoReplace(sourceArr, k) {
    const pool = [...sourceArr];
    const out = [];
    for (let i=0; i<k; i++){
      const idx = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(idx,1)[0]);
    }
    return out;
  }

  function loadOrCreateAssignments(count) {
    const raw = localStorage.getItem(ASSIGN_KEY);
    const today = todayKey();
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) return parsed.assignments;
    }
    const pool = [{label:'100% de bono + 1000 fichas'},{label:'150% de bono + 1500 fichas'},{label:'200% de bono + 2000 fichas'}];
    const assigned = sampleWeightedNoReplace(pool, count);
    localStorage.setItem(ASSIGN_KEY, JSON.stringify({ date: today, assignments: assigned }));
    return assigned;
  }

  function loadSelection() {
    const raw = localStorage.getItem(SELECT_KEY);
    const today = todayKey();
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) return parsed;
    }
    return null;
  }

  function saveSelection(index, prize) {
    const payload = { date: todayKey(), index, prize, savedAt: new Date().toISOString() };
    localStorage.setItem(SELECT_KEY, JSON.stringify(payload));
    return payload;
  }

  function disableAllStars() {
    document.querySelectorAll('.star').forEach(btn => {
      btn.style.pointerEvents = 'none';
      btn.classList.add('disabled');
    });
  }

  function showPrize(prize, savedAt) {
    const modal = document.getElementById('result');
    document.getElementById('modal-title').textContent = '¡Encontraste el premio!';
    document.getElementById('prize-text').textContent = prize.label;
    const pDate = document.getElementById('prize-date');
    pDate.textContent = 'Reclamado: ' + formatSavedAt(savedAt);
    pDate.setAttribute('aria-hidden','false');
    modal.classList.remove('hidden');
    modal.classList.add('show');
    explodeConfetti();
  }

  function showClaimed(selection) {
    const modal = document.getElementById('result');
    document.getElementById('modal-title').textContent = 'Ya participaste hoy';
    document.getElementById('prize-text').textContent = selection.prize.label;
    document.getElementById('prize-date').textContent = 'Fecha: ' + formatSavedAt(selection.savedAt);
    modal.classList.remove('hidden');
    modal.classList.add('show');
  }

  /* ---------- setupStars (Ahora Huevos) ---------- */
  function setupStars() {
    const starEls = document.querySelectorAll('.star');
    const cx = 60, cy = 60;
    const rx = 34, ry = 46; // Dimensiones del huevo
    const pathData = makeEggPath(cx, cy, rx, ry);

    starEls.forEach((btn, i) => {
      const svg = btn.querySelector('.star-svg');
      const halo = svg.querySelector('.halo');
      const body = svg.querySelector('.body');
      const rim = svg.querySelector('.rim');

      if (halo) halo.setAttribute('d', pathData);
      if (body) body.setAttribute('d', pathData);
      if (rim) rim.setAttribute('d', pathData);

      // Ajuste de escala central
      let s = (i === 1) ? 1.25 : 1.0;
      body.setAttribute('transform', `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`);
      rim.setAttribute('transform', `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`);
      halo.setAttribute('transform', `translate(${cx} ${cy}) scale(${s * 1.1}) translate(${-cx} ${-cy})`);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupStars();
    const starButtons = Array.from(document.querySelectorAll('.star'));
    const assignments = loadOrCreateAssignments(starButtons.length);
    
    starButtons.forEach((btn, idx) => {
      btn.dataset.assignedPrize = JSON.stringify(assignments[idx]);
    });

    const existing = loadSelection();
    let locked = !!existing;

    if (existing) {
      disableAllStars();
      starButtons[existing.index].classList.add('selected');
      showClaimed(existing);
    }

    starButtons.forEach((btn, idx) => {
      btn.addEventListener('click', async () => {
        if (locked) return;
        locked = true;
        btn.classList.add('selected', 'pop', 'flip');

        const audio = document.getElementById('claim-sound');
        if (audio) { audio.currentTime = 0; audio.play().catch(()=>{}); }

        const prize = JSON.parse(btn.dataset.assignedPrize);
        setTimeout(() => {
          const payload = saveSelection(idx, prize);
          showPrize(prize, payload.savedAt);
          disableAllStars();
        }, 800);
      });
    });

    document.getElementById('close-btn').addEventListener('click', () => {
      document.getElementById('result').classList.remove('show');
    });

    setTimeout(() => document.body.classList.remove('dropping'), 100);
  });

  function explodeConfetti() {
    const container = document.getElementById('confetti');
    const emojis = ["🥚","🍫","🐰","🌸","✨","🎉"];
    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.left = (40 + Math.random()*20) + '%';
      el.style.top = '40%';
      el.style.fontSize = (15 + Math.random()*25) + 'px';
      el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      container.appendChild(el);
      const dur = 1500 + Math.random()*1000;
      el.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${(Math.random()-0.5)*200}px, 100vh) rotate(${Math.random()*720}deg)`, opacity: 0 }
      ], { duration: dur, easing: 'ease-out' });
      setTimeout(() => el.remove(), dur);
    }
  }

  /* Canvas Sky - Twinkle */
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    stars = [];
    for(let i=0; i<80; i++) stars.push({x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.5, p:Math.random()*Math.PI*2});
  }
  function draw() {
    ctx.fillStyle = '#07162a'; ctx.fillRect(0,0,W,H);
    stars.forEach(s => {
      s.p += 0.02;
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(s.p)*0.4})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  resize(); draw();

})();
