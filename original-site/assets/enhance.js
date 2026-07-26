/* Premier — high-end interaction layer. Resilient to the SPA's re-renders:
   pointer effects use delegated document listeners (no per-node setup);
   reveal + count-up run once after the app first mounts. */
(function () {
  if (window.__pmdEnhanced) return; window.__pmdEnhanced = true;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SPOT = 'a.group > div, .rounded-2xl.bg-card, .bg-primary\\/10.border-primary';
  var MAG = 'a.bg-primary, button.bg-primary, a.bg-white, button.bg-white';

  // ---- cursor spotlight on cards ----
  document.addEventListener('pointermove', function (e) {
    if (RM || !e.target.closest) return;
    var el = e.target.closest(SPOT);
    if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  }, { passive: true });

  // ---- magnetic primary buttons ----
  document.addEventListener('pointermove', function (e) {
    if (RM || !e.target.closest) return;
    var b = e.target.closest(MAG);
    if (!b) return;
    var r = b.getBoundingClientRect();
    var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    b.style.setProperty('--tx', (dx * 5).toFixed(1) + 'px');
    b.style.setProperty('--ty', (dy * 5).toFixed(1) + 'px');
  }, { passive: true });
  document.addEventListener('pointerout', function (e) {
    var b = e.target.closest && e.target.closest(MAG);
    if (b) { b.style.removeProperty('--tx'); b.style.removeProperty('--ty'); }
  }, { passive: true });

  // ---- one-time reveal + count-up ----
  var done = false;
  function init() {
    if (done) return;
    var root = document.getElementById('root');
    if (!root || root.innerHTML.length < 2000) return;
    done = true;
    if (RM || !('IntersectionObserver' in window)) return;
    var vh = innerHeight;

    // scroll reveal — headings + card-grid items
    var targets = [], seen = new Set();
    root.querySelectorAll('section').forEach(function (sec) {
      var h = sec.querySelector('h2');
      if (h && h.parentElement) targets.push(h.parentElement);
      sec.querySelectorAll('.grid > *, a.group').forEach(function (c) { targets.push(c); });
    });
    targets = targets.filter(function (t) { if (!t || seen.has(t)) return false; seen.add(t); return true; });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.remove('rz'); en.target.classList.add('rz-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    targets.forEach(function (t, i) {
      var top = t.getBoundingClientRect().top;
      if (top < vh * 0.92) { t.classList.add('rz-in'); return; }   // in/near view: no hide
      t.classList.add('rz');
      t.style.transitionDelay = ((i % 6) * 65) + 'ms';
      io.observe(t);
    });

    // count-up on stat numbers
    var nums = [];
    root.querySelectorAll('.text-4xl, .text-5xl').forEach(function (d) {
      if (d.children.length === 0 && /^[0-9][0-9.,]*\+?$/.test(d.textContent.trim())) nums.push(d);
    });
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); io2.unobserve(en.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io2.observe(n); });
  }

  function countUp(el) {
    var raw = el.textContent.trim();
    var plus = /\+$/.test(raw), dec = /\./.test(raw);
    var target = parseFloat(raw.replace(/[+,]/g, ''));
    if (isNaN(target)) return;
    var dur = 1300, start = null;
    (function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1), e = 1 - Math.pow(1 - p, 3), v = target * e;
      el.textContent = (dec ? v.toFixed(1) : Math.round(v).toLocaleString('en-US')) + (plus ? '+' : '');
      if (p < 1) requestAnimationFrame(step); else el.textContent = raw;
    })(performance.now());
    requestAnimationFrame(function (t) {});
  }

  var mo = new MutationObserver(function () { init(); if (done) mo.disconnect(); });
  var r = document.getElementById('root');
  if (r) mo.observe(r, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('load', function () { setTimeout(init, 400); });
  setTimeout(init, 1600);
})();
