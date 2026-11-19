/* ============================================================
   NUSA — interaction layer
   Vanilla JS. No dependencies. Every module is optional:
   if its markup is absent on a page, it exits quietly.
   ============================================================ */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var clamp = function (min, max, v) { return Math.min(max, Math.max(min, v)); };

  /* ---------- local clock, Jakarta ---------- */
  function initClock() {
    var nodes = $$('[data-clock]');
    if (!nodes.length) return;
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false
      });
    } catch (err) {
      fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    function tick() {
      var value = fmt.format(new Date()) + ' WIB';
      nodes.forEach(function (n) { n.textContent = value; });
    }
    tick();
    setInterval(tick, 30000);
  }

  /* ---------- year ---------- */
  $$('[data-year]').forEach(function (n) { n.textContent = String(new Date().getFullYear()); });

  /* ---------- loader (shown once per session) ---------- */
  function initLoader() {
    var loader = $('[data-loader]');
    if (!loader) return;
    var count = $('[data-loader-count]', loader);
    var seen = false;
    try { seen = sessionStorage.getItem('nusa:visited') === '1'; } catch (err) { seen = false; }
    if (window.location.search.indexOf('nopreload') !== -1) seen = true;

    if (seen || reduced.matches) {
      loader.classList.add('is-done');
      setTimeout(function () { loader.remove(); }, 600);
      return;
    }
    try { sessionStorage.setItem('nusa:visited', '1'); } catch (err) { /* private mode */ }

    var start = performance.now();
    var duration = 620;
    function frame(now) {
      var t = clamp(0, 1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      if (count) count.textContent = String(Math.round(eased * 100)).padStart(2, '0');
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        loader.classList.add('is-done');
        setTimeout(function () { loader.remove(); }, 700);
      }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- header state ---------- */
  function initHeader() {
    var head = $('[data-head]');
    if (!head) return;
    var ticking = false;
    function update() {
      head.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- active nav ---------- */
  function initActiveNav() {
    var page = doc.body.getAttribute('data-page');
    if (!page) return;
    $$('[data-nav]').forEach(function (link) {
      if (link.getAttribute('data-nav') === page) link.setAttribute('aria-current', 'page');
    });
  }

  /* ---------- mobile menu ---------- */
  function initMenu() {
    var toggle = $('[data-menu-toggle]');
    var menu = $('[data-menu]');
    if (!toggle || !menu) return;
    var lastFocus = null;

    function open() {
      lastFocus = doc.activeElement;
      menu.hidden = false;
      doc.body.classList.add('is-locked');
      toggle.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(function () { menu.classList.add('is-open'); });
      var first = $('a', menu);
      if (first) setTimeout(function () { first.focus(); }, 240);
    }
    function close() {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      doc.body.classList.remove('is-locked');
      setTimeout(function () { menu.hidden = true; }, 420);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function isOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }

    toggle.addEventListener('click', function () { isOpen() ? close() : open(); });

    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () {
        menu.hidden = true;
        doc.body.classList.remove('is-locked');
      });
    });

    doc.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var focusables = $$('a[href], button', menu);
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080 && isOpen()) close();
    });
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || reduced.matches) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- counters ---------- */
  function initCounters() {
    var nodes = $$('[data-count]');
    if (!nodes.length) return;
    var targets = nodes.map(function (n) { return { el: n, to: parseInt(n.getAttribute('data-count'), 10) || 0 }; });
    if (reduced.matches) return;

    function run(item) {
      var to = item.to;
      if (to > 200) return;
      var start = performance.now();
      var dur = 1100;
      function frame(now) {
        var t = clamp(0, 1, (now - start) / dur);
        item.el.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var item = targets.filter(function (t) { return t.el === entry.target; })[0];
        if (item) run(item);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    targets.forEach(function (t) { io.observe(t.el); });
  }

  /* ---------- gentle parallax ---------- */
  function initParallax() {
    var nodes = $$('[data-parallax]');
    if (!nodes.length || reduced.matches) return;

    nodes.forEach(function (node) {
      var img = node.querySelector('img');
      if (!img) return;
      img.style.willChange = 'transform';
      img.style.transform = 'scale(1.07)';
    });

    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      nodes.forEach(function (node) {
        if (window.innerWidth < 1080) return;
        var img = node.querySelector('img');
        if (!img) return;
        var rect = node.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > vh + 100) return;
        var speed = parseFloat(node.getAttribute('data-parallax')) || 0.05;
        var offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
        img.style.transform = 'scale(1.07) translate3d(0,' + offset.toFixed(2) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- works preview follows pointer ---------- */
  function initWorkPreview() {
    var works = $$('[data-works] .work');
    if (!works.length || !finePointer.matches) return;

    var x = window.innerWidth / 2, y = window.innerHeight / 2;
    var tx = x, ty = y;
    var active = null;
    var raf = null;

    works.forEach(function (work) {
      var link = $('.work__link', work);
      var preview = $('.work__preview', work);
      if (!link || !preview) return;
      link.addEventListener('mouseenter', function () {
        $$('.work__preview.is-on').forEach(function (p) { p.classList.remove('is-on'); });
        preview.style.setProperty('--x', x + 'px');
        preview.style.setProperty('--y', y + 'px');
        preview.classList.add('is-on');
        active = preview;
      });
      link.addEventListener('mouseleave', function () {
        preview.classList.remove('is-on');
        if (active === preview) active = null;
      });
      link.addEventListener('focus', function () {
        preview.classList.add('is-on');
        preview.style.setProperty('--x', (window.innerWidth / 2) + 'px');
        preview.style.setProperty('--y', (window.innerHeight / 2) + 'px');
        active = preview;
      });
      link.addEventListener('blur', function () {
        preview.classList.remove('is-on');
        if (active === preview) active = null;
      });
    });

    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });

    function tick() {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      if (active) {
        active.style.setProperty('--x', x.toFixed(1) + 'px');
        active.style.setProperty('--y', y.toFixed(1) + 'px');
      }
      if (Math.abs(tx - x) > 0.2 || Math.abs(ty - y) > 0.2 || active) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }
  }

  /* ---------- signature: section cut ---------- */
  function initSectionCut() {
    var stage = $('[data-cut]');
    var handle = $('[data-cut-handle]');
    if (!stage || !handle) return;

    var render = $('[data-cut-render]', stage);
    var readout = $('[data-cut-readout]');
    var value = 54;
    var dragging = false;
    var hasDragged = false;

    function apply(v, announce) {
      value = clamp(8, 92, v);
      stage.style.setProperty('--cut', value.toFixed(1) + '%');
      var rounded = Math.round(value);
      handle.setAttribute('aria-valuemin', '8');
      handle.setAttribute('aria-valuemax', '92');
      handle.setAttribute('aria-valuenow', String(rounded));
      handle.setAttribute('aria-valuetext', rounded + ' persen material');
      if (readout) readout.textContent = String(rounded);
      if (announce) hasDragged = true;
    }

    function fromClient(clientY) {
      var rect = stage.getBoundingClientRect();
      if (!rect.height) return;
      apply(((clientY - rect.top) / rect.height) * 100);
    }

    stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' && !e.target.closest('[data-cut-handle]')) return;
      dragging = true;
      stage.classList.add('is-dragging');
      stage.setPointerCapture && stage.setPointerCapture(e.pointerId);
      fromClient(e.clientY);
      e.preventDefault();
    });

    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      fromClient(e.clientY);
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('is-dragging');
      if (hasDragged) stage.classList.add('has-dragged');
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    window.addEventListener('pointerup', endDrag);

    handle.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 12 : 3;
      var next = null;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = value - step;
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = value + step;
      else if (e.key === 'PageUp') next = value - 15;
      else if (e.key === 'PageDown') next = value + 15;
      else if (e.key === 'Home') next = 8;
      else if (e.key === 'End') next = 92;
      if (next === null) return;
      e.preventDefault();
      apply(next, true);
      stage.classList.add('has-dragged');
    });

    apply(54, false);

    if (finePointer.matches && !reduced.matches) {
      stage.addEventListener('mouseenter', function () { stage.classList.add('has-dragged'); }, { once: true });
    }
  }

  /* ---------- crosshair cursor with coordinates ---------- */
  function initCursor() {
    var cursor = $('[data-cursor]');
    if (!cursor || !finePointer.matches || reduced.matches) return;
    var coords = $('[data-cursor-coords]', cursor);
    var x = window.innerWidth / 2, y = window.innerHeight / 2;
    var tx = x, ty = y;
    var visible = false;
    var raf = null;

    document.body.classList.add('has-cursor');

    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!visible) {
        visible = true;
        x = tx; y = ty;
        cursor.classList.add('is-on');
      }
      if (coords) {
        var px = Math.round((e.clientX / window.innerWidth) * 100);
        var py = Math.round((e.clientY / window.innerHeight) * 100);
        coords.textContent = String(px).padStart(3, '0') + ' / ' + String(py).padStart(3, '0');
      }
      var interactive = e.target.closest('a, button, [role="slider"], input, textarea, select');
      cursor.classList.toggle('is-detail', !!interactive);
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });

    doc.addEventListener('mouseleave', function () {
      visible = false;
      cursor.classList.remove('is-on');
    });

    function tick() {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      cursor.style.setProperty('--x', x.toFixed(1) + 'px');
      cursor.style.setProperty('--y', y.toFixed(1) + 'px');
      if (Math.abs(tx - x) > 0.2 || Math.abs(ty - y) > 0.2) raf = requestAnimationFrame(tick);
      else raf = null;
    }
  }

  /* ---------- project filters ---------- */
  function initFilters() {
    var buttons = $$('[data-filter]');
    var cards = $$('[data-cat]');
    if (!buttons.length || !cards.length) return;
    var count = $('[data-filter-count]');

    function setCount(n) {
      if (count) count.textContent = String(n).padStart(2, '0') + ' proyek';
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var shown = 0;
        cards.forEach(function (card) {
          var match = filter === 'all' || card.getAttribute('data-cat').indexOf(filter) !== -1;
          card.classList.toggle('is-hidden', !match);
          if (match) shown++;
        });
        setCount(shown);
      });
    });
    setCount(cards.length);
  }

  /* ---------- contact form ---------- */
  function initForm() {
    var form = $('[data-form]');
    if (!form) return;
    var status = $('[data-form-status]', form);
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.namedItem('nama');
      var email = form.elements.namedItem('email');
      var message = form.elements.namedItem('pesan');
      var errors = [];

      if (!name || !name.value.trim()) errors.push('nama');
      if (!email || !emailRe.test(email.value.trim())) errors.push('email');
      if (!message || message.value.trim().length < 10) errors.push('pesan');

      [name, email, message].forEach(function (field) {
        if (!field) return;
        var invalid = errors.indexOf(field.name) !== -1;
        field.setAttribute('aria-invalid', String(invalid));
      });

      if (errors.length) {
        if (status) {
          status.className = 'form-status is-visible is-error';
          status.textContent = 'Periksa kembali: nama, email yang valid, dan pesan minimal 10 karakter.';
          status.setAttribute('role', 'alert');
        }
        var first = form.elements.namedItem(errors[0]);
        if (first) first.focus();
        return;
      }

      var submit = $('[type="submit"]', form);
      if (submit) { submit.disabled = true; submit.textContent = 'Mengirim…'; }
      setTimeout(function () {
        if (status) {
          status.className = 'form-status is-visible is-ok';
          status.setAttribute('role', 'status');
          status.textContent = 'Terima kasih, ' + name.value.trim().split(' ')[0] + '. Pesan Anda tercatat — kami membalas dalam dua hari kerja ke ' + email.value.trim() + '.';
        }
        form.reset();
        [name, email, message].forEach(function (f) { if (f) f.removeAttribute('aria-invalid'); });
        if (submit) { submit.disabled = false; submit.textContent = 'Kirim pesan'; }
      }, 700);
    });
  }

  /* ---------- keyboard: close menu / skip focus fix ---------- */
  function initMisc() {
    doc.addEventListener('click', function (e) {
      var anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      var id = anchor.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = doc.getElementById(id.slice(1));
      if (target) {
        target.setAttribute('tabindex', '-1');
        setTimeout(function () { target.focus({ preventScroll: true }); }, 480);
      }
    });
  }

  /* ---------- boot ---------- */
  function boot() {
    initClock();
    initLoader();
    initHeader();
    initActiveNav();
    initMenu();
    initReveal();
    initCounters();
    initParallax();
    initWorkPreview();
    initSectionCut();
    initCursor();
    initFilters();
    initForm();
    initMisc();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
