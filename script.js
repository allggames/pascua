(function () {
  'use strict';

  // Splash Loader
  (function splashInit() {
    const LOAD_MS = 1400;
    const progress = document.getElementById('loading-progress');
    const splash = document.getElementById('splash');

    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / LOAD_MS);
      if (progress) progress.style.width = (t * 100) + '%';
      if (t < 1) requestAnimationFrame(tick);
      else {
        setTimeout(() => { if (splash) splash.classList.add('hidden'); }, 300);
      }
    }
    requestAnimationFrame(tick);
  })();

  // Lógica de Premios
  const prizes = [
    { label: "100% de bono + 1000 fichas" },
    { label: "150% de bono + 1500 fichas" },
    { label: "200% de bono + 2000 fichas" }
  ];

  function initGame() {
    const btns = document.querySelectorAll('.star');
    const today = new Date().toISOString().slice(0, 10);
    const selection = localStorage.getItem('eggs_selection');

    if (selection) {
      const data = JSON.parse(selection);
      if (data.date === today) {
        showResult(data.prize, data.time, true);
        btns.forEach(b => b.style.pointerEvents = 'none');
      }
    }

    btns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        if (localStorage.getItem('eggs_selection')) return;
        btn.classList.add('pop');
        
        const prize = prizes[Math.floor(Math.random() * prizes.length)];
        const time = new Date().toLocaleString();
        const saveData = { date: today, prize: prize.label, time: time };
        
        localStorage.setItem('eggs_selection', JSON.stringify(saveData));
        setTimeout(() => showResult(prize.label, time, false), 500);
        btns.forEach(b => b.style.pointerEvents = 'none');
      });
    });
  }

  function showResult(label, time, already) {
    const modal = document.getElementById('result');
    document.getElementById('modal-title').textContent = already ? "Ya participaste hoy" : "¡Felicidades!";
    document.getElementById('prize-text').textContent = label;
    document.getElementById('prize-date').textContent = "Fecha: " + time;
    modal.classList.add('show');
  }

  document.getElementById('close-btn').addEventListener('click', () => {
    document.getElementById('result').classList.remove('show');
  });

  // Canvas Cielo
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');
  let w, h;
  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  function draw() {
    ctx.fillStyle = '#04101d'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();

  document.addEventListener('DOMContentLoaded', initGame);
  setTimeout(() => document.body.classList.remove('dropping'), 100);
})();
