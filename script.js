(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  // Mobile navigation
  const menu = $('.menu-toggle');
  const nav = $('.nav-links');
  menu?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
  }));

  // Active section navigation
  const sections = $$('main section[id]');
  const links = $$('.nav-links a:not(.nav-cta)');
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach(s => sectionObserver.observe(s));

  // Reveal-on-scroll
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  // Contact form: no backend is invented; provide a safe mailto handoff.
  $('#contact-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get('name'), email = data.get('email'), subject = data.get('subject'), message = data.get('message');
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    window.location.href = `mailto:bhardwaj9812@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    $('#form-note').textContent = 'Opening your email client…';
  });
  $('#year').textContent = new Date().getFullYear();

  // Lightweight interactive ballpit. Reduced on touch/reduced-motion.
  const canvas = $('#ballpit'), ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(pointer: coarse)').matches;
  let w = 0, h = 0, dpr = 1, balls = [], raf = 0, paused = false, mx = -9999, my = -9999;

  function resize() {
    const r = canvas.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = r.width; h = r.height; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = reduce ? 0 : touch ? 24 : Math.min(65, Math.max(35, Math.floor(w * h / 18000)));
    balls = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: Math.random() * 5 + 2,
      vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45,
      alpha: Math.random() * .28 + .08
    }));
  }
  function move(e) { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }
  function frame() {
    if (paused || reduce) { return; }
    ctx.clearRect(0, 0, w, h);
    for (const b of balls) {
      const dx = b.x - mx, dy = b.y - my, dist = Math.hypot(dx, dy);
      if (dist < 120 && dist > 0) { const f = (120 - dist) / 120 * .55; b.vx += (dx / dist) * f; b.vy += (dy / dist) * f; }
      b.vx *= .995; b.vy *= .995; b.x += b.vx; b.y += b.vy;
      if (b.x < -20) b.x = w + 20; if (b.x > w + 20) b.x = -20; if (b.y < -20) b.y = h + 20; if (b.y > h + 20) b.y = -20;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(8,200,244,${b.alpha})`; ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  addEventListener('resize', resize);
  addEventListener('pointermove', move, { passive: true });
  document.addEventListener('visibilitychange', () => { paused = document.hidden; if (!paused) raf = requestAnimationFrame(frame); });
  resize(); if (!reduce) frame();
})();
