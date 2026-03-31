// script.js
// Versión unificada: mantiene la lógica de bloqueo por día, sonido, stars (ahora eggs), canvas detallado.

(function () {
  'use strict';

  /* ---------- Geometry: Ahora crea un camino de Huevo ovoide en lugar de estrella ---------- */
  function makeEggPath(cx, cy, rx, ry) {
    // Definimos los puntos para una forma ovoide (huevo)
    // Es más estrecho arriba (y=top) y más ancho abajo (y=bottom)
    const topY = cy - ry;
    const botY = cy + ry;
    return `M ${cx},${topY} 
            C ${cx + rx},${topY} ${cx + rx},${botY} ${cx},${botY} 
            C ${cx - rx},${botY} ${cx - rx},${topY} ${cx},${topY} Z`;
  }

  /* ------------------ Splash loader ------------------ */
  (function splashInit() {
    // Config
    const EGG_COUNT = 40;        // cantidad de elementos flotantes
    const LOAD_MS = 1400;        // duración aproximada de "carga" (ms)

    // helper: crea elementos emoji aleatorios dentro de #splash-stars
    function createSplashEggs() {
      const container = document.getElementById('splash-stars');
      if (!container) return;
      container.innerHTML = '';
      
      // Lista de emojis temáticos de Pascua
      const emojis = ['🥚', '🐰', '🌸', 'Candy', '✨'];
      
      for (let i=0; i<EGG_COUNT; i++){
        const s = document.createElement('div');
        s.className = 'splash-star'; // Mantenemos el nombre de la clase CSS original
        
        // Asignación aleatoria de emoji
        s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        
        // Posicion aleatoria
        s.style.left = (Math.random() * 100) + '%';
        s.style.top = (Math.random() * 100) + '%';
        
        // tamaño y duración aleatoria
        const size = 15 + Math.round(Math.random()*26); // px
        s.style.fontSize = size + 'px';
        const dur = 4 + Math.random()*8;
        s.style.animationDuration = dur.toFixed(2) + 's';
        s.style.opacity = (0.5 + Math.random()*0.6).toFixed(2);
        s.style.animationDelay = (Math.random()*2).toFixed(2) + 's';
        
        container.appendChild(s);
      }
    }

    // Mover #logo (si existe) hacia el footer #bottom-logo-container
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
        const percent = Math.round(t * 100);
        progress.style.width = percent + '%';
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

    // init on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
      createSplashEggs();
      window.addEventListener('resize', createSplashEggs);
      setTimeout(runLoaderThenHide, 160);
    });
  })();

  /* ------------------------------------------------------------------ */
  /* ADICIONES para: asignación aleatoria de premios y bloqueo por día  */
  /* ------------------------------------------------------------------ */

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
    try {
      const raw = localStorage.getItem(ASSIGN_KEY);
      const today = todayKey();
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.date === today && Array.isArray(parsed.assignments) && parsed.assignments.length === count) {
          return parsed.assignments;
        }
      }
    } catch(e){}
    const pool = prizesData;
    const assigned = sampleWeightedNoReplace(pool, count);
    localStorage.setItem(ASSIGN_KEY, JSON.stringify({ date: todayKey(), assignments: assigned }));
    return assigned;
  }

  function loadSelection() {
    try {
      const raw = localStorage.getItem(SELECT_KEY);
      const today = todayKey();
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.date === today) return parsed;
      }
    } catch(e){}
    return null;
  }

  function saveSelection(index, prize) {
    const payload = { date: todayKey(), index, prize, savedAt: new Date().toISOString() };
    localStorage.setItem(SELECT_KEY, JSON.stringify(payload));
    return payload;
  }

  function disableAllStars() {
    document.querySelectorAll('.star').forEach(btn=>{
      btn.style.pointerEvents = 'none';
    });
  }

  /* ---------- UI & interactions (flip, prize, confetti) ---------- */
  const prizesData = [
    { label: "100% de bono + 1000 fichas", weight: 1 },
    { label: "150% de bono + 1500 fichas", weight: 1 },
    { label: "200% de bono + 2000 fichas", weight: 1 }
  ];

  function weightedRandom(arr) {
    const total = arr.reduce((s, x) => s + (x.weight || 1), 0);
    let r = Math.random() * total;
    for (const item of arr) {
      r -= (item.weight || 1);
      if (r <= 0) return item;
    }
    return arr[arr.length - 1];
  }

  let locked = true;
  const wait = (ms) => new Promise(res => setTimeout(res, ms));

  function showPrize(prize, savedAt) {
    document.getElementById('modal-title').textContent = '¡Felicidades!';
    document.getElementById('prize-text').textContent = prize.label;
    const prizeDate = document.getElementById('prize-date');
    prizeDate.textContent = 'Reclamado: ' + formatSavedAt(savedAt);
    prizeDate.setAttribute('aria-hidden','false');
    const modal = document.getElementById('result');
    modal.classList.remove('hidden');
    modal.classList.add('show');
    explodeConfetti();
  }

  function showClaimed(selection) {
    const prize = selection && selection.prize ? selection.prize : { label: 'Premio reclamado' };
    document.getElementById('modal-title').textContent = 'Ya reclamaste hoy';
    document.getElementById('prize-text').textContent = prize.label;
    const prizeDate = document.getElementById('prize-date');
    prizeDate.textContent = 'Fecha: ' + formatSavedAt(selection.savedAt);
    prizeDate.setAttribute('aria-hidden','false');
    const modal = document.getElementById('result');
    modal.classList.remove('hidden');
    modal.classList.add('show');
  }

  function hidePrize() {
    const modal = document.getElementById('result');
    if (modal) modal.classList.remove('show');
    setTimeout(() => { if (modal) modal.classList.add('hidden'); }, 240);
    const confettiContainer = document.getElementById('confetti');
    if (confettiContainer) confettiContainer.innerHTML = '';
  }

  /* ---------- setupStars: Ahora setupEggs (aplica la geometría ovoide) ---------- */
  function setupEggs() {
    const starEls = document.querySelectorAll('.star');
    if (!starEls.length) return;

    // Dimensiones para la forma ovoide (más alto que ancho)
    const cx = 60, cy = 80;
    const rx = 34, ry = 46; 
    const pathData = makeEggPath(cx, cy, rx, ry);

    starEls.forEach((btn, i) => {
      const svg = btn.querySelector('.star-svg');
      if (!svg) return;
      const halo = svg.querySelector('.halo');
      const body = svg.querySelector('.body');
      const rim = svg.querySelector('.rim');

      if (halo) halo.setAttribute('d', pathData);
      if (body) body.setAttribute('d', pathData);
      if (rim) rim.setAttribute('d', pathData);

      // Ajustes de escala originales para resaltar el central
      if (i === 0 || i === 2) {
        if (body) body.setAttribute('transform', `translate(${cx} ${cy}) scale(1.15) translate(${-cx} ${-cy})`);
        if (rim)  rim.setAttribute('transform', `translate(${cx} ${cy}) scale(1.15) translate(${-cx} ${-cy})`);
        if (halo) halo.setAttribute('transform', `translate(${cx} ${cy}) scale(1.22) translate(${-cx} ${-cy})`);
      } else if (i === 1) {
        if (body) body.setAttribute('transform', `translate(${cx} ${cy}) scale(1.35) translate(${-cx} ${-cy})`);
        if (rim) rim.setAttribute('transform', `translate(${cx} ${cy}) scale(1.35) translate(${-cx} ${-cy})`);
        if (halo) halo.setAttribute('transform', `translate(${cx} ${cy}) scale(1.45) translate(${-cx} ${-cy})`);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Dibuja la geometría de los huevos
    setupEggs();

    const starButtons = Array.from(document.querySelectorAll('.star'));
    const closeBtn = document.getElementById('close-btn');

    // Inicializa las chispas (sparkles) para cada huevo
    starButtons.forEach(btn => initSparksFor(btn));

    // Asignación persistente por día
    const assignments = loadOrCreateAssignments(starButtons.length);
    starButtons.forEach((btn, idx) => {
      btn.dataset.assignedPrize = JSON.stringify(assignments[idx]);
    });

    // Verificación de selección diaria
    const existing = loadSelection();
    if (existing) {
      locked = true;
      disableAllStars();
      starButtons[existing.index].classList.add('selected');
      showClaimed(existing);
    }

    // Click handlers
    starButtons.forEach((btn, idx) => {
      btn.addEventListener('click', async () => {
        if (locked) return;
        locked = true;
        btn.classList.add('selected', 'pop', 'flip');

        const audio = document.getElementById('claim-sound');
        if (audio) { audio.currentTime = 0; audio.play().catch(()=>{}); }

        let prize;
        try { prize = JSON.parse(btn.dataset.assignedPrize); } catch(e) { prize = weightedRandom(prizesData); }

        await wait(760);

        const payload = saveSelection(idx, prize);
        showPrize(prize, payload.savedAt);
        disableAllStars();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', hidePrize);

    // Landing animation
    setTimeout(() => {
      document.body.classList.remove('dropping');
      if (!loadSelection()) setTimeout(() => { locked = false; }, 600);
    }, 60);
  });

  /* ---------- confetti (emoji aleatorio) ---------- */
  function explodeConfetti() {
    const confettiContainer = document.getElementById('confetti');
    if (!confettiContainer) return;
    confettiContainer.innerHTML = '';
    
    // Lista de emojis temáticos aleatorios para el confeti
    const emojis = ["🥚", "🍫", "🐰", "🌸", "✨", "🍬", "🎉"];
    const count = 30;
    
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.left = (40 + Math.random()*20) + '%';
      el.style.top = (40 + Math.random()*15) + '%';
      
      // Asignación aleatoria de emoji y tamaño
      el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      el.style.fontSize = (15 + Math.random()*30) + 'px';
      
      el.style.opacity = (0.7 + Math.random()*0.3);
      el.style.transform = `translateY(0) rotate(${Math.random()*360}deg)`;
      confettiContainer.appendChild(el);
      
      const duration = 1200 + Math.random()*1500;
      el.animate([
        { transform: `translateY(0) rotate(${Math.random()*360}deg)`, opacity: 1 },
        { transform: `translate(${(Math.random()-0.5)*200}px, 110vh) rotate(${Math.random()*900 - 450}deg)`, opacity: 0 }
      ], { duration, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
      setTimeout(() => { try { el.remove(); } catch(e){} }, duration+200);
    }
  }

  /* ---------- sparkles per star element ---------- */
  function initSparksFor(starEl) {
    if (!starEl) return;
    const count = 3 + Math.floor(Math.random()*3);
    for (let i=0;i<count;i++){
      const sp = document.createElement('span');
      sp.className = 'spark';
      const lx = 20 + Math.random()*60;
      const ty = 15 + Math.random()*50;
      const size = 3 + Math.random()*8;
      const dur = (0.9 + Math.random()*1.6).toFixed(2) + 's';
      const delay = (Math.random()*1.8).toFixed(2) + 's';
      sp.style.left = lx + '%'; sp.style.top = ty + '%';
      sp.style.width = size + 'px'; sp.style.height = size + 'px';
      sp.style.setProperty('--dur', dur);
      sp.style.setProperty('--delay', delay);
      starEl.appendChild(sp);
    }
  }

  /* ---------- Canvas sky (twinkle detallado original) ---------- */
  const canvas = document.getElementById('sky');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  let skyStars = [], W=0, H=0;
  const DPR = Math.max(1, window.devicePixelRatio || 1);

  function resize() {
    if (!canvas || !ctx) return;
    W = canvas.width = Math.floor(window.innerWidth * DPR);
    H = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px'; canvas.style.height = window.innerHeight + 'px';
    initStarsCanvas();
  }
  window.addEventListener('resize', resize);

  function initStarsCanvas() {
    skyStars = [];
    const area = window.innerWidth * window.innerHeight;
    const count = Math.max(60, Math.floor(area / 16000));
    for (let i=0;i<count;i++){
      const x = Math.random() * W;
      const y = Math.random() * H * 0.95;
      const r = (Math.random() * 1.6 + 0.4) * DPR;
      const baseA = Math.random() * 0.6 + 0.3;
      const speed = Math.random() * 0.6 + 0.2;
      const amp = Math.random() * 0.22 + 0.06;
      const phase = Math.random() * Math.PI * 2;
      const hasSpark = Math.random() < 0.12;
      skyStars.push({x,y,r,baseA,speed,amp,phase,hasSpark,sparkTimer:0});
    }
  }

  let last = performance.now();
  function drawCanvas(now) {
    if (!ctx) return;
    const dt = (now - last) / 1000; last = now;
    
    // Degradado de fondo
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0, '#04101d'); g.addColorStop(0.5, '#07162a'); g.addColorStop(1, '#071a2d');
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    
    // Viñeteado radial
    const vign = ctx.createRadialGradient(W/2, H*0.36, Math.min(W,H)*0.18, W/2, H/2, Math.max(W,H));
    vign.addColorStop(0,'rgba(20,30,50,0.02)'); vign.addColorStop(1,'rgba(0,0,0,0.28)');
    ctx.fillStyle = vign; ctx.fillRect(0,0,W,H);
    
    ctx.globalCompositeOperation = 'screen';
    
    for (let i=0;i<skyStars.length;i++){
      const s = skyStars[i];
      s.phase += dt * s.speed;
      let tw = s.baseA * (1 + Math.sin(s.phase) * s.amp);
      
      // Chispas aleatorias
      if (s.hasSpark && Math.random() < 0.006) { s.sparkTimer = 0.12 + Math.random() * 0.34; }
      if (s.sparkTimer > 0) { tw += 0.6 * Math.exp(-5 * (0.4 - s.sparkTimer)); s.sparkTimer -= dt; }
      
      const rad = s.r * (1 + Math.sin(s.phase) * 0.12);
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, rad*4.5);
      grad.addColorStop(0, `rgba(255,255,255,${Math.min(1, 0.95 * tw)})`);
      grad.addColorStop(0.2, `rgba(255,245,200,${0.45 * tw})`);
      grad.addColorStop(0.6, `rgba(200,200,255,${0.06 * tw})`);
      grad.addColorStop(1, `rgba(0,0,0,0)`);
      
      ctx.fillStyle = grad;
      ctx.fillRect(s.x - rad*4.5, s.y - rad*4.5, rad*9, rad*9);
      
      // Núcleo duro
      ctx.fillStyle = `rgba(255,255,255,${0.35 * tw})`;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), Math.max(1, DPR), Math.max(1, DPR));
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(drawCanvas);
  }
  
  resize();
  requestAnimationFrame(drawCanvas);

})();
