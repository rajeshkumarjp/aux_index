/* AUX Landing — interactions */

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Sticky navbar shadow
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile burger
const burger = document.getElementById('burger');
burger?.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a =>
  a.addEventListener('click', () => nav.classList.remove('open'))
);

// Reveal-on-scroll
const revealEls = document.querySelectorAll(
  '.section-head, .problem-grid article, .feature, .steps li, .dash, .benefits > div, .about, .cta-inner, .hero-copy, .hero-visual, .enquiry-copy, .enquiry-card'
);
revealEls.forEach(el => el.classList.add('reveal'));
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('in'), i * 40);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// Animated counters
const counters = document.querySelectorAll('[data-count]');
const animateCount = (el) => {
  const target = +el.dataset.count;
  const dur = 1600;
  const start = performance.now();
  const fmt = new Intl.NumberFormat('en-IN');
  const tick = (now) => {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = fmt.format(Math.floor(target * eased));
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = fmt.format(target);
  };
  requestAnimationFrame(tick);
};
const cio = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
  });
}, { threshold: 0.5 });
counters.forEach(el => cio.observe(el));


/* =========================================================
   PARTICLE BACKGROUND: Perfect Order & Narrative Webbing
   ========================================================= */
const canvas = document.getElementById('bg-particles');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
let W, H, particles = [];

const PARTICLE_COUNT = window.innerWidth < 700 ? 400 : 800; 

const words = ['AUTOMATE', 'SCALE', 'AuX'];
let wordIndex = 0;
let targets = [];

let state = 'WANDER'; 
let stateTimer = 600; 

let currentGlobalOpacity = 0.15; 
let connectionOpacity = 0;       

function resize() {
  W = canvas.width = window.innerWidth * devicePixelRatio;
  H = canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
}
resize();
window.addEventListener('resize', resize);

function getTextTargets(word) {
  const tCanvas = document.createElement('canvas');
  const tCtx = tCanvas.getContext('2d', { willReadFrequently: true });
  
  const tW = 1200;
  const tH = 400;
  tCanvas.width = tW;
  tCanvas.height = tH;

  const fontSize = Math.floor((tW * 0.85) / Math.max(word.length * 0.6, 1));
  
  tCtx.fillStyle = 'black'; 
  tCtx.fillRect(0, 0, tW, tH);
  
  tCtx.font = `900 ${fontSize}px Inter, sans-serif`;
  tCtx.fillStyle = 'white';
  tCtx.textAlign = 'center';
  tCtx.textBaseline = 'middle';
  tCtx.fillText(word, tW / 2, tH / 2);

  const imgData = tCtx.getImageData(0, 0, tW, tH).data;
  const rawTargets = [];
  
  const scaleX = (W * 0.85) / tW;
  const scaleY = scaleX; 
  const step = 4; 

  // 1. Gather all possible valid pixels
  for (let y = 0; y < tH; y += step) {
      for (let x = 0; x < tW; x += step) {
          const idx = (y * tW + x) * 4;
          if (imgData[idx] > 128) { 
              const finalX = W / 2 + (x - tW / 2) * scaleX;
              const finalY = H / 2.2 + (y - tH / 2) * scaleY; 
              rawTargets.push({ x: finalX, y: finalY });
          }
      }
  }
  
  // 2. Uniform Distribution Math
  // Instead of randomly guessing, we divide the total pixels evenly by our dot count.
  // This guarantees every edge, corner, and center is mathematically filled.
  const finalTargets = [];
  if (rawTargets.length > 0) {
      const skip = Math.max(1, rawTargets.length / PARTICLE_COUNT);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
          const index = Math.min(Math.floor(i * skip), rawTargets.length - 1);
          finalTargets.push(rawTargets[index]);
      }
  }

  // 3. Shuffle ONLY the evenly distributed array so dots fly to random parts of the structured grid
  return finalTargets.sort(() => Math.random() - 0.5);
}

function initParticles() {
  particles = Array.from({ length: PARTICLE_COUNT }, () => {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 1.5 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 1.5 * devicePixelRatio,
      r: Math.random() * 1.2 * devicePixelRatio + 0.6, 
      tx: 0,
      ty: 0
    };
  });
}
initParticles();

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  stateTimer++;

  // --- STATE MACHINE ---
  if (state === 'WANDER' && stateTimer > 700) { 
      state = 'FORMING'; 
      stateTimer = 0;
      targets = getTextTargets(words[wordIndex]);
      wordIndex = (wordIndex + 1) % words.length;

      particles.forEach((p, i) => {
          if (targets.length > 0) {
              const target = targets[i % targets.length];
              p.tx = target.x;
              p.ty = target.y;
          }
      });
  } 
  else if (state === 'FORMING' && stateTimer > 180) { 
      state = 'HOLDING'; 
      stateTimer = 0;
  } 
  else if (state === 'HOLDING' && stateTimer > 180) { 
      state = 'WANDER'; 
      stateTimer = 0;
      particles.forEach(p => {
          p.vx = (Math.random() - 0.5) * 2.0 * devicePixelRatio;
          p.vy = (Math.random() - 0.5) * 2.0 * devicePixelRatio;
      });
  }

  // --- STORYTELLING OPACITY LOGIC ---
  
  // Dot Brightness
  const targetDotOpacity = (state === 'WANDER') ? 0.25 : 0.85;
  currentGlobalOpacity += (targetDotOpacity - currentGlobalOpacity) * 0.05;

  // Webbing Brightness
  let targetConnectionOpacity = 0;
  
  if (state === 'HOLDING') {
      // Lines ONLY highlight AFTER the word forms (Wait 10 frames to settle)
      // They fade out gracefully BEFORE the word splits (at frame 180 out of 280)
      if (stateTimer > 10 && stateTimer < 90) {
          targetConnectionOpacity = 0.3; // Glow heavily
      } else {
          targetConnectionOpacity = 0;   // Fade out to clean text
      }
  } else {
      // Strictly off during chaotic WANDER and scrambled FORMING
      targetConnectionOpacity = 0; 
  }
  
  // Smoothly animate the line opacity so it pulses nicely
  connectionOpacity += (targetConnectionOpacity - connectionOpacity) * 0.04;


  // --- PHYSICS UPDATE ---
  particles.forEach(p => {
      if (state === 'FORMING' || state === 'HOLDING') {
          // Graceful slide into perfect order
          p.x += (p.tx - p.x) * 0.025;
          p.y += (p.ty - p.y) * 0.025;
      } else {
          // Natural chaotic drift
          p.x += p.vx;
          p.y += p.vy;
          
          p.vx *= 0.99;
          p.vy *= 0.99;

          if (Math.abs(p.vx) < 0.4) p.vx += (Math.random() - 0.5) * 0.15;
          if (Math.abs(p.vy) < 0.4) p.vy += (Math.random() - 0.5) * 0.15;

          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
      }
  });

  // --- DRAW LINES (Order Webbing) ---
  if (connectionOpacity > 0.01) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          
          if (Math.abs(a.x - b.x) > 60 || Math.abs(a.y - b.y) > 60) continue;

          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx*dx + dy*dy);
          const max = (window.innerWidth < 700 ? 30 : 45) * devicePixelRatio; 
          
          if (d < max) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d/max) * connectionOpacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
  }

  // --- DRAW DOTS ---
  ctx.fillStyle = `rgba(255, 255, 255, ${currentGlobalOpacity})`;
  
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(drawParticles);
}

drawParticles();