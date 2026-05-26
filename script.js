// ── SCROLL REVEAL ──
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach(el => obs.observe(el));

// ── PROGRESS BAR ──
const bar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  bar.style.width = pct + '%';
});

// ── BACK TO TOP ──
const backTop = document.getElementById('back-top');
window.addEventListener('scroll', () => {
  backTop.classList.toggle('visible', window.scrollY > 400);
});

// ── ACTIVE NAV HIGHLIGHT ──
const sections = document.querySelectorAll('section[id], div[id]');
const navAs = document.querySelectorAll('.nav-links a');
const navObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAs.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => navObs.observe(s));

// ── TYPEWRITER ──
const tw = document.getElementById('hero-sub');
const msg = "We build modern, fast, and affordable websites for schools, colleges, shops, and local businesses — no tech headaches, just results.";
let idx = 0;
function type() {
  if (idx < msg.length) {
    tw.textContent += msg[idx++];
    setTimeout(type, 28);
  } else {
    tw.classList.remove('typewriter');
  }
}
setTimeout(type, 900);

// ── COUNTER ANIMATION ──
const counters = document.querySelectorAll('.counter');
const cObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = +el.dataset.target;
      const suffix = el.querySelector('span') ? el.querySelector('span').outerHTML : '';
      let count = 0;
      const step = Math.ceil(target / 50);
      const tick = setInterval(() => {
        count = Math.min(count + step, target);
        el.innerHTML = count + suffix;
        if (count >= target) clearInterval(tick);
      }, 30);
      cObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => cObs.observe(c));

// ── PRICING TOGGLE ──
const pToggle = document.getElementById('price-toggle');
const pGrid = document.querySelector('.pricing-grid');
const lblOne = document.getElementById('lbl-one');
const lblMaint = document.getElementById('lbl-maint');
let maintMode = false;
pToggle.addEventListener('click', () => {
  maintMode = !maintMode;
  pToggle.classList.toggle('yearly', maintMode);
  pGrid.classList.toggle('show-maint', maintMode);
  lblOne.classList.toggle('active', !maintMode);
  lblMaint.classList.toggle('active', maintMode);
});

// ── FAQ ACCORDION ──
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ── START PROJECT BUTTON ──
function startProject() {
  // Navigate to Client Response Form with proper URL encoding
  window.location.href = encodeURI('ClientResponseForm/index.html');
}
