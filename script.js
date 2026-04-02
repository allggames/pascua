(function () {
  'use strict';

  // 1. Splash y Emojis Aleatorios de Fondo
  (function initSplash() {
    const container = document.getElementById('splash-stars');
    if (!container) return;
    const emojis = ['🥚', '🐰', '🌸', '🍬', '✨', '🍫'];
    
    // Inyectar 40 emojis de forma aleatoria
    for(let i=0; i<40; i++) {
      const el = document.createElement('div');
      el.className = 'splash-star';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = Math.random() * 95 + '%';
      el.style.top = Math.random() * 95 + '%';
      el.style.fontSize = (Math.random() * 20 + 20) + 'px';
      el.style.animationDelay = (Math.random() * 2) + 's';
      container.appendChild(el);
    }

    // Simulador de carga
    let p = 0;
    const bar = document.getElementById('loading-progress');
    const interval = setInterval(() => {
      p += 2;
      if (bar) bar.style.width = p + '%';
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          document.getElementById('splash').classList.add('hidden');
          const logo = document.getElementById('logo');
          if(logo) logo.classList.remove('hide-until-bottom');
        }, 400);
      }
    }, 30);
  })();

  // 2. Lógica del Juego (Premios y Bloqueo Diario)
  const prizes = [
    { label: "100% de bono + 1000 fichas" },
    { label: "150% de bono + 1500 fichas" },
    { label: "200% de bono + 2000 fichas" }
  ];

  function setupGame() {
    const btns = document.querySelectorAll('.star');
    const today = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem('pascua_win_final');

    // Verificar si ya jugó hoy
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today) {
        setTimeout(() => showModal(data.prize, data.time, true), 1000);
        btns.forEach(b => b.style.pointerEvents = 'none');
      }
    }

    btns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        if (localStorage.getItem('pascua_win_final')) return;
        
        // Efecto visual y sonido
        const audio = document.getElementById('claim-sound');
        if (audio) { audio.currentTime = 0; audio.play().catch(()=>{}); }
        
        const prize = prizes[Math.floor(Math.random() * prizes.length)];
        const time = new Date().toLocaleString();
        const data = { prize: prize.label, time: time, date: today };
        
        localStorage.setItem('pascua_win_final', JSON.stringify(data));
        
        setTimeout(() => {
          showModal(prize.label, time, false);
          btns.forEach(b => b.style.pointerEvents = 'none');
        }, 600);
      });
    });
  }

  function showModal(prize, time, already) {
    const m = document.getElementById('result');
    document.getElementById('modal-title').textContent = already ? "Ya reclamaste hoy" : "¡Felicidades!";
    document.getElementById('prize-text').textContent = prize;
    document.getElementById('prize-date').textContent = "Reclamado: " + time;
    m.classList.add('show');
    if (!already) explodeConfetti();
  }

  function explodeConfetti() {
    const container = document.getElementById('confetti');
    const emojis = ["🥚", "🍫", "🐰", "🌸", "✨"];
    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.left = (40 + Math.random() * 20) + '%';
      el.style.top = '40%';
      el.style.fontSize = (20 + Math.random() * 20) + 'px';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      container.appendChild(el);
      const dur = 1500 + Math.random() * 1000;
      el.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${(Math.random() - 0.5) * 200}px, 100vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
      ], { duration: dur, easing: 'ease-out' });
      setTimeout(() => el.remove(), dur);
    }
  }

  document.getElementById('close-btn').addEventListener('click', () => {
    document.getElementById('result').classList.remove('show');
  });

  // 3. Fondo Cielo (Canvas)
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');
  let w, h, stars = [];
  function res() { 
    w = canvas.width = window.innerWidth; 
    h = canvas.height = window.innerHeight; 
    stars = [];
    for(let i=0; i<100; i++) stars.push({x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.2, o: Math.random()});
  }
  window.onresize = res; res();

  function animate() {
    ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,w,h);
    stars.forEach(s => {
      s.o += 0.01;
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.abs(Math.sin(s.o)) * 0.5})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
    });
    requestAnimationFrame(animate);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupGame();
    animate();
    setTimeout(() => document.body.classList.remove('dropping'), 100);
  });

})();
