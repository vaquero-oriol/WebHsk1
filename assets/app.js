/* ===== Mobile menu ===== */
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
if (burger && menu) {
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    burger.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });
  // Close mobile menu when a link is tapped
  menu.querySelectorAll('a.link').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
    burger.innerHTML = '<i class="fa-solid fa-bars"></i>';
  }));
}

/* ===== Language selector ===== */
const lang = document.getElementById('lang');
if (lang) {
  const langBtn = document.getElementById('langBtn');
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = lang.classList.toggle('open');
    langBtn.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', () => lang.classList.remove('open'));

  // Remember a manually chosen language so the auto-redirect on "/" respects it.
  lang.querySelectorAll('ul li a[hreflang]').forEach((a) => {
    a.addEventListener('click', () => {
      try { localStorage.setItem('hsklan_lang', a.getAttribute('hreflang')); } catch (e) {}
    });
  });
}

/* ===== FAQ accordion ===== */
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-a').style.maxHeight = null;
      i.querySelector('.faq-q').setAttribute('aria-expanded', false);
    });
    if (!isOpen) {
      item.classList.add('open');
      const ans = item.querySelector('.faq-a');
      ans.style.maxHeight = ans.scrollHeight + 'px';
      q.setAttribute('aria-expanded', true);
    }
  });
});

/* ===== Reveal on scroll ===== */
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('in');
      io.unobserve(en.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ===== Animated counters ===== */
const fmt = n => n >= 1000 ? Math.floor(n).toLocaleString('en-US') : Math.floor(n);
const animateCounter = (el) => {
  const target = +el.dataset.target;
  const big = target >= 1000;
  const dur = 1600;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(target * eased);
    if (big && p === 1) el.innerHTML = fmt(target) + '<span class="plus">+</span>';
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      animateCounter(en.target);
      counterIO.unobserve(en.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.num[data-target]').forEach(el => counterIO.observe(el));

/* ===== Year ===== */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
