// script.js
// Versión optimizada: Huevos sedosos, sin contornos y con lógica de bloqueo diario.

(function () {
  'use strict';

  /* ---------- Geometry: Crea una forma de Huevo fluida ---------- */
  function makeEggPath(cx, cy, rx, ry) {
    const topY = cy - ry;
    const botY = cy + ry;
    // Usamos curvas de Bézier para una forma ovoide perfecta
    return `M ${cx},${topY} 
            C ${cx + rx},${topY} ${cx + rx},${botY} ${cx},${botY} 
            C ${cx - rx},${botY} ${cx - rx},${topY} ${cx},${topY} Z`;
  }

  /* ------------------ Splash loader ------------------ */
  (function splashInit() {
    const EGG_COUNT = 40; 
    const LOAD_MS = 1400;

    function createSplashEggs() {
      const container = document.getElementById('splash-stars');
      if (!container) return;
      container.innerHTML = '';
      const emojis = ['🥚', '🐰', '🌸', '🍬', '✨', '🍫'];
      
      for (let i=0; i<EGG_COUNT; i++){
        const s = document.createElement('div');
        s.className = 'splash-star';
        s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        s.style.left = (Math.random() * 100) + '%';
        s.style.top = (Math.random() * 100) + '%';
        const size = 15 + Math.round(Math.random()*26);
        s.style.fontSize = size + 'px';
        const dur = 4 + Math.random()*8;
        s.style.animationDuration = dur.toFixed(2) + 's';
        s.style.opacity = (0.5 + Math.random()*0.6).toFixed(2);
        s.style.animationDelay = (Math.random()*2).toFixed(2) + 's';
        container.appendChild(s);
      }
    }

    function placeBottomLogo() {
      const logo = document.getElementById('logo');
      const container = document.getElementById('bottom-logo-container');
      if (logo && container) {
        try {
          logo.classList.remove('hide-until-bottom');
          logo.style.display = ''; 
          container.appendChild(logo);
          container.setAttribute('aria-hidden','false');
        } catch(e) { /* ignore */ }
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
      createSplashEggs();
      window.addEventListener('resize', createSplashEggs);
      setTimeout(runLoaderThenHide, 160);
    });
  })();

  /* ------------------ Lógica de Premios ------------------ */
  const ASSIGN_KEY = 'eggs.assignments';
  const SELECT_KEY = 'eggs.selection';
  const prizesData = [
    { label: "100% de bono + 1000 fichas", weight: 1 },
    { label: "150% de bono + 1500 fichas", weight: 1 },
    { label: "200% de bono + 2000 fichas", weight: 1 }
  ];

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
      const total = pool.reduce((s,x)=>s+(x.weight||1),0);
      let r = Math.random()*total;
      for (let j=0; j<pool.length;j++){
        r -= (pool[j].weight||1);
        if (r <= 0){
          out.push(pool.splice(j,1)[0]);
          break;
        }
      }
      if (pool.length === 0 && out.length < k) break;
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
    const assigned = sampleWeightedNoReplace(prizesData, count);
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

  /* ---------- setupEggs: SIN CONTORNOS (Huevos sedosos) ---------- */
  function setupEggs() {
    const starEls = document.querySelectorAll('.star');
    if (!starEls.length) return;

    const cx = 60, cy = 75; // Ajustado para centrar mejor en el SVG
    const rx = 38, ry = 52; // Proporción de huevo más orgánica
    const pathData = makeEggPath(cx, cy, rx, ry);

    starEls.forEach((btn, i) => {
      const svg = btn.querySelector('.star-svg');
      if (!svg) return;
      const halo = svg.querySelector('.halo');
      const body = svg.querySelector('.body');
      const rim = svg.querySelector('.rim');

      // Aplicar el path a cuerpo y halo
      if (halo) {
        halo.setAttribute('d', pathData);
        halo.setAttribute('stroke', 'none'); // Eliminar borde
      }
      if (body) {
        body.setAttribute('d', pathData);
        body.setAttribute('stroke', 'none'); // Eliminar borde
      }
      // Ocultar la línea de borde (rim) si existe para que no ensucie
      if (rim) rim.style.display = 'none';

      // Escalas para resaltar el central
      let scale = (i === 1) ? 1.25 : 1.0;
      if (body) body.setAttribute('transform', `translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`);
      if (halo) halo.setAttribute('transform', `translate(${cx} ${cy}) scale(${scale * 1.08}) translate(${-cx} ${-cy})`);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupEggs();
    const starButtons = Array.from(document.querySelectorAll('.star'));
    const assignments = loadOrCreateAssignments(starButtons.length);
    
    starButtons.forEach((btn, idx) => {
      btn.dataset.assignedPrize = JSON.stringify(assignments[idx]);
      initSparksFor(btn);
    });

    const existing = loadSelection();
    let locked = !!existing;

    if (existing) {
      document.querySelectorAll('.star').forEach(b => b.style.pointerEvents = 'none');
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
          document.querySelectorAll('.star').forEach(b => b.style.pointerEvents = 'none');
        }, 760);
      });
    });

    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) closeBtn.addEventListener('click', hidePrize);

    setTimeout(() => {
      document.body.classList.remove('dropping');
    }, 60);
  });

  /* ---------- Animaciones de UI ---------- */
  function showPrize(prize, savedAt) {
    document.getElementById('modal-title').textContent = '¡Felicidades!';
    document.getElementById('prize-text').textContent = prize.label;
    const pDate = document.getElementById('prize-date');
    pDate.textContent = 'Reclamado: ' + formatSavedAt(savedAt);
    pDate.setAttribute('aria-hidden','false');
    const modal = document.getElementById('result');
    modal.classList.remove('hidden');
    modal.classList.add('show');
    explodeConfetti();
  }

  function showClaimed(selection) {
    document.getElementById('modal-title').textContent = 'Ya participaste hoy';
    document.getElementById('prize-text').textContent = selection.prize.label;
    const pDate = document.getElementById('prize-date');
    pDate.textContent = 'Fecha: ' + formatSavedAt(selection.savedAt);
    pDate.setAttribute('aria-hidden','false');
    const modal = document.getElementById('result');
    modal.classList.remove('hidden');
    modal.classList.add('show');
  }

  function hidePrize() {
    const modal = document.getElementById('result');
    if (modal) modal.classList.remove('show');
    setTimeout(() => { if (modal) modal.classList.add('hidden'); }, 240);
  }

  function explodeConfetti() {
    const container = document.getElementById('confetti');
    if (!container) return;
    container.innerHTML = '';
    const emojis = ["🥚", "🍫", "🐰", "🌸", "✨", "🍬", "🎉"];
    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.left = (40 + Math.random()*20) + '%';
      el.style.top = (40 + Math.random()*15) + '%';
      el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      el.style.fontSize = (15 + Math.random()*30) + 'px';
      container.appendChild(el);
      const dur = 1200 + Math.random()*1500;
      el.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${(Math.random()-0.5)*250}px, 110vh) rotate(${Math.random()*720}deg)`, opacity: 0 }
      ], { duration: dur, easing: 'cubic-bezier(.2,.8,.2,1)' });
      setTimeout(() => el.remove(), dur);
    }
  }

  function initSparksFor(starEl) {
    const count = 4;
    for (let i=0;i<count;i++){
      const sp = document.createElement('span');
      sp.className = 'spark';
      sp.style.left = (20 + Math.random()*60) + '%';
      sp.style.top = (20 + Math.random()*50) + '%';
      sp.style.setProperty('--dur', (1 + Math.random()) + 's');
      sp.style.setProperty('--delay', (Math.random()*2) + 's');
      starEl.appendChild(sp);
    }
  }

  /* ---------- Canvas Sky ---------- */
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');
  let W, H, skyStars = [];
  const DPR = window.devicePixelRatio || 1;

  function resize() {
    W = canvas.width = window.innerWidth * DPR;
    H = canvas.height = window.innerHeight * DPR;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    skyStars = [];
    for (let i=0; i<80; i++) {
      skyStars.push({
        x: Math.random()*W, y: Math.random()*H,
        r: (Math.random()*1.5 + 0.5)*DPR,
        p: Math.random()*Math.PI*2, s: 0.02 + Math.random()*0.03
      });
    }
  }
  window.addEventListener('resize', resize);
  resize();

  function drawCanvas() {
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0, '#04101d'); g.addColorStop(1, '#071a2d');
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    skyStars.forEach(s => {
      s.p += s.s;
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(s.p)*0.4})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(drawCanvas);
  }
  drawCanvas();

})();
