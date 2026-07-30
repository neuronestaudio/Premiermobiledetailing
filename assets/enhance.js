/* Premier — high-end interaction layer. Resilient to the SPA's re-renders:
   pointer effects use delegated document listeners (no per-node setup);
   reveal + count-up run once after the app first mounts. */
(function () {
  if (window.__pmdEnhanced) return; window.__pmdEnhanced = true;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- About page: PD logo splash intro ----
  (function () {
    var path = (location.pathname.replace(/\/+$/, '') || '/');
    if (path !== '/about') return;
    function splash() {
      if (document.getElementById('pmd-splash')) return;
      var ov = document.createElement('div'); ov.id = 'pmd-splash';
      ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#080B16;display:flex;align-items:center;justify-content:center;overflow:hidden';
      var mesh = document.createElement('div');
      mesh.style.cssText = "position:absolute;inset:0;background:url('/assets/images/carbon-mesh.png') repeat;background-size:27px 48px;opacity:.4";
      var glow = document.createElement('div');
      glow.style.cssText = 'position:absolute;inset:0;background:radial-gradient(720px 520px at 50% 45%, rgba(37,99,235,.30), transparent 62%)';
      var img = document.createElement('img'); img.src = '/assets/images/45ead650-192d-44cb-8c3f-0ae51ecbbc4b.webp'; img.alt = 'Premier Mobile Detailing';
      img.style.cssText = 'width:min(60vw,440px);height:auto;position:relative;filter:drop-shadow(0 12px 44px rgba(0,0,0,.6))';
      ov.appendChild(mesh); ov.appendChild(glow); ov.appendChild(img);
      (document.body || document.documentElement).appendChild(ov);
      if (RM) { setTimeout(function () { ov.remove(); }, 500); return; }
      img.animate([{ opacity: 0, transform: 'scale(.82)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 760, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
      var shine = document.createElement('div');
      shine.style.cssText = 'position:absolute;top:0;bottom:0;width:38%;left:-50%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.4),transparent);transform:skewX(-18deg)';
      ov.appendChild(shine);
      shine.animate([{ left: '-50%' }, { left: '125%' }], { duration: 1100, delay: 360, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
      setTimeout(function () {
        var a = ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 560, easing: 'ease', fill: 'both' });
        a.onfinish = function () { ov.remove(); };
      }, 1500);
    }
    if (document.body) splash(); else document.addEventListener('DOMContentLoaded', splash);
  })();

  // ---- About page: image defaults to Daniel & Andy (hero photo), hover reveals the van + Mercedes ----
  (function () {
    if ((location.pathname.replace(/\/+$/, '') || '/') !== '/about') return;
    var HERO = '/assets/images/57982f66-2a3a-44b2-8853-af37ac4c757d.webp';
    var VAN_ID = '4d675fa6-7fb4-4331-bae5-291ba87f1cde'; // the van + Mercedes photo
    function apply() {
      var root = document.getElementById('root'); if (!root) return;
      var imgs = root.querySelectorAll('img');
      for (var i = 0; i < imgs.length; i++) {
        var im = imgs[i];
        if (im.src.indexOf(VAN_ID) === -1) continue;
        var box = im.closest('.rounded-3xl') || im.parentElement;
        if (!box || box.querySelector('.pmd-about-swap')) return;
        if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
        var ov = document.createElement('img');
        ov.className = 'pmd-about-swap'; ov.src = HERO;
        ov.alt = 'Daniel & Andy — Premier Mobile Detailing';
        ov.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 72%;opacity:1;transition:opacity .55s ease;z-index:3;pointer-events:none';
        box.appendChild(ov);
        box.addEventListener('mouseenter', function () { ov.style.opacity = '0'; });
        box.addEventListener('mouseleave', function () { ov.style.opacity = '1'; });
        var badge = document.createElement('div');
        badge.className = 'pmd-about-badge';
        badge.innerHTML = '<span class="pmd-about-badge-num">30<i>+</i></span><span class="pmd-about-badge-label">Years Combined<br>Experience</span>';
        box.appendChild(badge);
        return;
      }
    }
    var r = document.getElementById('root');
    if (r) new MutationObserver(apply).observe(r, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', apply);
    [200, 700, 1500, 3000].forEach(function (t) { setTimeout(apply, t); });
    apply();
  })();

  // ---- homepage hero: A/B variant, scrub reveal, cursive subhead, cleanup ----
  (function () {
    if ((location.pathname.replace(/\/+$/, '') || '/') !== '/') return;
    var V = (function () { try { var u = new URLSearchParams(location.search).get('hero'); if (u) localStorage.setItem('pmdHero', u.toUpperCase()); return (localStorage.getItem('pmdHero') || 'A').toUpperCase(); } catch (e) { return 'A'; } })();
    var B_HTML = 'Premier Mobile <br><span class="text-primary">Detailing.</span>';
    var C_HTML = '<span class="pmd-hero-mono">Premier Mobile Detailing.</span>';
    var STRIP = ['ceramic coating', 'paint correction', 'full detail'];
    function apply() {
      var root = document.getElementById('root'); if (!root) return;
      var hero = root.querySelector('h1'); if (!hero) return;
      if (V === 'C') {
        // NLP-style: single Bebas line with the metallic shine sweep, no line-split scrub.
        if (!hero.querySelector('.pmd-hero-mono')) hero.innerHTML = C_HTML;
      } else {
        if (V === 'B' && hero.textContent.indexOf('Premier Mobile') === -1) hero.innerHTML = B_HTML;
        if (!hero.querySelector('.pmd-line')) {
          var groups = [[]];
          Array.prototype.forEach.call(hero.childNodes, function (n) { if (n.nodeName === 'BR') groups.push([]); else groups[groups.length - 1].push(n); });
          hero.textContent = '';
          var spans = groups.map(function (g) { var s = document.createElement('span'); s.className = 'pmd-line'; g.forEach(function (n) { s.appendChild(n); }); hero.appendChild(s); return s; });
          if (!RM && !window.__pmdHeroAnim) {
            window.__pmdHeroAnim = true;
            spans.forEach(function (s, i) { s.animate([{ opacity: 0, clipPath: 'inset(0 100% 0 0)', filter: 'blur(3px)' }, { opacity: 1, clipPath: 'inset(0 0 0 0)', filter: 'blur(0)' }], { duration: 950, delay: i * 240, easing: 'cubic-bezier(.5,0,.15,1)', fill: 'both' }); });
          }
        }
      }
      var sub = hero.nextElementSibling;
      while (sub && sub.tagName !== 'P') sub = sub.nextElementSibling;
      if (sub) {
        if (V === 'C') {
          if (!sub.classList.contains('pmd-hero-kicker')) {
            sub.classList.remove('pmd-cursive', 'pmd-subhead'); sub.classList.add('pmd-hero-kicker');
            sub.textContent = 'Ceramic Coating · Paint Correction · Detailing — Melbourne';
          }
        } else if (!sub.classList.contains('pmd-subhead')) {
          sub.classList.remove('pmd-cursive'); sub.classList.add('pmd-subhead');
          sub.textContent = 'Ceramic coating & detailing — at your door.';
        }
      }
      Array.prototype.forEach.call(root.querySelectorAll('.pmd-trust'), function (n) { n.remove(); });
      if (hero.parentNode) Array.prototype.forEach.call(hero.parentNode.querySelectorAll('a, button'), function (el) {
        if (el.textContent.trim().toLowerCase() === 'start your quote') el.style.display = 'none';
      });
      var as = root.querySelectorAll('a');
      for (var k = 0; k < as.length; k++) {
        var t = as[k].textContent.replace(/[^a-z ]/gi, '').trim().toLowerCase();
        if (STRIP.indexOf(t) > -1 && as[k].classList.contains('group') && !as[k].querySelector('img') && !as[k].closest('nav')) {
          var sc = as[k].closest('section');
          if (sc && !sc.querySelector('h1')) sc.style.display = 'none';
          else { var g = as[k].closest('.grid') || as[k].parentElement; if (g) g.style.display = 'none'; }
          break;
        }
      }
    }
    var r = document.getElementById('root');
    if (r) new MutationObserver(apply).observe(r, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', apply);
    [150, 500, 1200, 2500].forEach(function (t) { setTimeout(apply, t); });
    apply();
    function toggle() {
      if (document.getElementById('pmd-abtoggle')) return;
      var box = document.createElement('div'); box.id = 'pmd-abtoggle';
      box.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:99998;display:flex;gap:6px;align-items:center;background:rgba(11,16,28,.85);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.14);border-radius:9999px;padding:6px 10px 6px 14px;font:600 12px/1 system-ui,sans-serif;color:#cbd2dd;box-shadow:0 10px 30px rgba(0,0,0,.5)';
      box.innerHTML = '<span style="opacity:.6;margin-right:2px">Hero</span><button data-v="A" style="border:0;border-radius:9999px;padding:6px 12px;cursor:pointer;font:inherit">A</button><button data-v="B" style="border:0;border-radius:9999px;padding:6px 12px;cursor:pointer;font:inherit">B</button><button data-v="C" style="border:0;border-radius:9999px;padding:6px 12px;cursor:pointer;font:inherit">C</button>';
      Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
        var on = b.getAttribute('data-v') === V; b.style.background = on ? '#2f6bff' : 'rgba(255,255,255,.08)'; b.style.color = on ? '#fff' : '#cbd2dd';
        b.addEventListener('click', function () { try { localStorage.setItem('pmdHero', b.getAttribute('data-v')); } catch (e) { } location.reload(); });
      });
      (document.body || document.documentElement).appendChild(box);
    }
    if (document.body) toggle(); else document.addEventListener('DOMContentLoaded', toggle);
  })();

  // ---- homepage: fold the stats bar into the "What Our Clients Say" section ----
  (function () {
    if ((location.pathname.replace(/\/+$/, '') || '/') !== '/') return;
    function fold() {
      var root = document.getElementById('root'); if (!root) return;
      var lab = null, divs = root.querySelectorAll('div');
      for (var i = 0; i < divs.length; i++) { if (!divs[i].children.length && divs[i].textContent.trim() === 'Cars Detailed') { lab = divs[i]; break; } }
      if (!lab) return;
      var card = lab.closest('.rounded-xl'); if (!card) return;
      var revH = null, h2s = root.querySelectorAll('h2');
      for (var j = 0; j < h2s.length; j++) { if (/clients/i.test(h2s[j].textContent)) { revH = h2s[j]; break; } }
      var sec = revH ? revH.closest('section') : null;
      if (!sec || sec.contains(card)) return;
      var inner = sec.querySelector('.container') || sec;
      var wrap = card.parentElement;
      card.classList.remove('mt-16', 'rounded-xl', 'shadow-2xl', 'overflow-hidden');
      card.classList.add('max-w-3xl', 'mx-auto', 'pmd-statrow');
      card.style.marginTop = '40px';
      inner.appendChild(card);
      if (wrap && !wrap.querySelector('*')) wrap.style.display = 'none';
    }
    var r = document.getElementById('root');
    if (r) new MutationObserver(fold).observe(r, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', fold);
    [200, 700, 1500, 3000].forEach(function (t) { setTimeout(fold, t); });
    fold();
  })();

  // ---- homepage: rebuild the services section as angled premium panels ----
  (function () {
    if ((location.pathname.replace(/\/+$/, '') || '/') !== '/') return;
    function build() {
      var root = document.getElementById('root'); if (!root) return;
      var secH = null, hs = root.querySelectorAll('h2');
      for (var i = 0; i < hs.length; i++) { if (/right service/i.test(hs[i].textContent)) { secH = hs[i]; break; } }
      var sec = secH ? secH.closest('section') : null; if (!sec) return;
      var links = [].slice.call(sec.querySelectorAll('a[href*="/services/"]')).filter(function (a) { return a.querySelector('img'); });
      if (links.length < 3) return;
      var grid = links[0].closest('.grid');
      if (sec.querySelector('.pmd-svc-wrap')) { if (grid) grid.style.display = 'none'; return; }
      var wrap = document.createElement('div'); wrap.className = 'pmd-svc-wrap';
      links.forEach(function (a, idx) {
        var img = a.querySelector('img'); var src = img ? (img.currentSrc || img.src) : '';
        var title = (a.querySelector('h3') || {}).textContent || '';
        var txt = a.textContent.replace(/\s+/g, ' ');
        var pm = txt.match(/From\s*\$[\d,]+/i); var price = pm ? pm[0] : '';
        var cat = '', ds = a.querySelectorAll('div');
        for (var j = 0; j < ds.length; j++) { var t = ds[j].textContent.trim(); if (/^0[1-9]\b/.test(t) && ds[j].children.length === 0) { cat = t.replace(/^0[1-9]\s*/, ''); break; } }
        var num = '0' + (idx + 1);
        var el = document.createElement('a'); el.className = 'pmd-svc' + (idx === 0 ? ' pmd-svc-pop' : ''); el.href = a.getAttribute('href') || '#';
        el.innerHTML =
          '<div class="pmd-svc-img" style="background-image:url(\'' + src + '\')"></div>' +
          '<div class="pmd-svc-stamp"><span class="pmd-stamp-bars"><i></i><i></i><i></i><i></i></span><span class="pmd-svc-num">' + num + '</span></div>' +
          '<div class="pmd-svc-mid"><div class="pmd-svc-cat">' + cat + '</div><div class="pmd-svc-title">' + title + '</div></div>' +
          '<div class="pmd-svc-right"><div class="pmd-svc-price">' + price + '</div><div class="pmd-svc-more">Learn More &rarr;</div></div>';
        wrap.appendChild(el);
      });
      sec.classList.add('pmd-svc-section');
      if (grid) { grid.style.display = 'none'; grid.parentNode.insertBefore(wrap, grid.nextSibling); }
      else { (sec.querySelector('.container') || sec).appendChild(wrap); }
    }
    var r = document.getElementById('root');
    if (r) new MutationObserver(build).observe(r, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', build);
    [300, 900, 1800, 3200].forEach(function (t) { setTimeout(build, t); });
    build();
  })();

  // ---- homepage: glass comparison cards + strip carbon mesh from the FAQ ----
  (function () {
    if ((location.pathname.replace(/\/+$/, '') || '/') !== '/') return;
    function tweak() {
      var root = document.getElementById('root'); if (!root) return;
      var hs = root.querySelectorAll('h2');
      for (var i = 0; i < hs.length; i++) {
        var t = hs[i].textContent;
        if (/car washes|created equal/i.test(t)) {
          var sec = hs[i].closest('section');
          if (sec) Array.prototype.forEach.call(sec.querySelectorAll('.rounded-2xl'), function (c) {
            if (!c.classList.contains('pmd-glass')) { c.classList.add('pmd-glass'); if (c.className.indexOf('primary') > -1) c.classList.add('pmd-glass-blue'); }
          });
        }
        if (/common questions/i.test(t)) { var s = hs[i].closest('section'); if (s) s.classList.add('pmd-nomesh'); }
      }
    }
    var r = document.getElementById('root');
    if (r) new MutationObserver(tweak).observe(r, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', tweak);
    [200, 700, 1500, 3000].forEach(function (t) { setTimeout(tweak, t); });
    tweak();
  })();

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

  // ---- inject Warranties + TDS links into the existing nav & footer (idempotent) ----
  function injectNavLinks() {
    // Top nav stays as Services / Gallery / About (no injected Ceramic Coating).
    // Remove it if a stale render left one behind.
    var nav = document.querySelector('nav');
    if (nav) [].forEach.call(nav.querySelectorAll('a[href="/ceramic-coating-melbourne"]'), function (a) { a.remove(); });
    document.querySelectorAll('footer ul').forEach(function (ul) {
      var hasAbout = [...ul.querySelectorAll('a')].some(function (a) { return /\/about$/.test(a.getAttribute('href') || ''); });
      if (hasAbout && !ul.querySelector('a[href="/ceramic-coating-melbourne"]')) {
        var li0 = ul.querySelector('li'), a0 = ul.querySelector('a');
        [{ t: 'Ceramic Coating', h: '/ceramic-coating-melbourne' }, { t: 'PPF', h: '/ppf-melbourne' }, { t: 'Window Tinting', h: '/automotive-window-tinting-melbourne' }, { t: 'Get a Quote', h: '/enquiry' }, { t: 'Warranties', h: '/warranties' }, { t: 'Product TDS', h: '/product-tds' }].forEach(function (o) {
          var li = document.createElement('li'); li.className = li0 ? li0.className : '';
          var a = document.createElement('a'); a.className = a0 ? a0.className : 'hover:text-primary transition-colors';
          a.href = o.h; a.textContent = o.t; li.appendChild(a); ul.appendChild(li);
        });
      }
    });
  }

  function trimNav() {
    // Hiding of Areas / phone / Get In Touch is handled in CSS (flash-free).
    // Here we only relabel the quote CTA to "Book Now".
    var nav = document.querySelector('nav'); if (!nav) return;
    [].forEach.call(nav.querySelectorAll('button'), function (el) {
      var txt = el.textContent.trim().toLowerCase();
      if (txt === 'start your quote' || txt === 'quote' || txt === 'get a quote') {
        el.textContent = 'Book Now';
      }
    });
  }
  function boot() { init(); injectNavLinks(); trimNav(); }
  var mo = new MutationObserver(function () { boot(); if (done) mo.disconnect(); });
  var r = document.getElementById('root');
  if (r) mo.observe(r, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', boot);
  window.addEventListener('load', function () { setTimeout(boot, 400); });
  window.addEventListener('resize', trimNav);
  [800, 1600, 3000].forEach(function (t) { setTimeout(injectNavLinks, t); });
  setTimeout(init, 1600);
})();
