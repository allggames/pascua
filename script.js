(function () {
  'use strict';

  // Splash
  function initSplash() {
    const container = document.getElementById('splash-stars');
    const emojis = ['🥚', '🐰', '🌸'];
    for(let i=0; i<25; i++) {
      const s = document.createElement('div');
      s.className = 'splash-star';
      s.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      s.style.left = Math.random()*95 + '%';
      s.style.top = Math.random()*95 + '%';
      s.style.fontSize = (20 + Math.random()*20) + 'px';
      container.appendChild(s);
    }

    let prog = 0;
    const bar = document.getElementById('loading-progress');
    const interval = setInterval(() => {
      prog += 5;
      bar.style.width = prog + '%';
      if(prog >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          document.getElementById('splash').classList.add('hidden');
        }, 300);
      }
    }, 50);
  }

  // Premios
  const prizes = [
    { label: "100% de bono + 1000 fichas" },
    { label: "150% de bono + 1500 fichas" },
    { label: "200% de bono + 2000 fichas" }
  ];

  function setupGame() {
    const btns = document.querySelectorAll('.star');
    const today = new Date().toISOString().slice(0,10);
    const selection = localStorage.getItem('pascua_selection');

    if(selection) {
      const data = JSON.parse(selection);
      if(data.date === today) {
        showModal(data.prize, data.time, true);
        btns.forEach(b => b.style.pointerEvents = 'none');
      }
    }

    btns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        if(localStorage.getItem('pascua_selection')) return;
        
        const prize = prizes[Math.floor(Math.random()*prizes.length)];
        const time = new Date().toLocaleString();
        const saveData = { date: today, prize: prize.label, time: time };
        
        localStorage.setItem('pascua_selection', JSON.stringify(saveData));
        showModal(prize.label, time, false);
        btns.forEach(b => b.style.pointerEvents = 'none');
      });
    });
  }

  function showModal(label, time, already) {
    const modal = document.getElementById('result');
    document.getElementById('modal-title').textContent = already ? "Ya reclamaste hoy" : "¡Felicidades!";
    document.getElementById('prize-text').textContent = label;
    document.getElementById('prize-date').textContent = "Fecha: " + time;
    modal.classList.add('show');
  }

  document.getElementById('close-btn').addEventListener('click', () => {
    document.getElementById('result').classList.remove('show');
  });

  // Canvas Estrellas
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');
  let w, h;
  function resize() { 
    w = canvas.width = window.innerWidth; 
    h = canvas.height = window.innerHeight; 
  }
  window.addEventListener('resize', resize);
  resize();

  function draw() {
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = "white";
    for(let i=0; i<50; i++) {
      ctx.beginPath();
      ctx.arc(Math.random()*w, Math.random()*h, Math.random()*1.5, 0, Math.PI*2);
      ctx.fill();
    }
  }
  draw();

  document.addEventListener('DOMContentLoaded', () => {
    initSplash();
    setupGame();
  });

})();
