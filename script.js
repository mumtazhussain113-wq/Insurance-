/* =====================================================================
   Mumtaz Hussain - insurance advisory, Dubai
   Behaviour: mobile menu, sticky header, FAQ, scroll reveal,
   active nav links, WhatsApp enquiry form
   ===================================================================== */
(function () {
  'use strict';

  /* The one WhatsApp number used across the site (international format,
     digits only, no plus sign - this is what wa.me expects). */
  var WHATSAPP_NUMBER = '971558963834';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Mobile menu ---------- */
  var header = document.getElementById('siteHeader');
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  function setMenu(open) {
    if (!navToggle || !nav) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    /* Close after tapping a link, so the page is visible straight away. */
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        navToggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;
      if (!nav.contains(event.target) && !navToggle.contains(event.target)) setMenu(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  /* ---------- 2. Sticky header state and floating button ---------- */
  var waFloat = document.getElementById('waFloat');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-stuck', y > 12);
    if (waFloat) waFloat.classList.toggle('is-visible', y > 420);
  }

  var scrollQueued = false;
  window.addEventListener('scroll', function () {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(function () {
      onScroll();
      scrollQueued = false;
    });
  }, { passive: true });
  onScroll();

  /* ---------- 3. FAQ accordion ---------- */
  var triggers = document.querySelectorAll('.faq-trigger');

  Array.prototype.forEach.call(triggers, function (trigger) {
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;

    trigger.addEventListener('click', function () {
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');

      if (isOpen) {
        if (reduceMotion) {
          panel.hidden = true;
          panel.style.height = '';
          return;
        }
        panel.style.height = panel.scrollHeight + 'px';
        panel.classList.add('is-animating');
        window.requestAnimationFrame(function () { panel.style.height = '0px'; });
        window.setTimeout(function () {
          panel.hidden = true;
          panel.classList.remove('is-animating');
          panel.style.height = '';
        }, 360);
      } else {
        panel.hidden = false;
        if (reduceMotion) return;
        var target = panel.scrollHeight;
        panel.style.height = '0px';
        panel.classList.add('is-animating');
        window.requestAnimationFrame(function () { panel.style.height = target + 'px'; });
        window.setTimeout(function () {
          panel.classList.remove('is-animating');
          panel.style.height = '';
        }, 360);
      }
    });
  });

  /* ---------- 4. Reveal on scroll ---------- */
  var revealItems = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealItems, function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    Array.prototype.forEach.call(revealItems, function (el, i) {
      el.style.transitionDelay = (i % 3) * 70 + 'ms';
      revealObserver.observe(el);
    });
  }

  /* ---------- 5. Active navigation link ---------- */
  var navLinks = nav ? nav.querySelectorAll('ul a[href^="#"]') : [];

  if (navLinks.length && 'IntersectionObserver' in window) {
    var sectionMap = {};
    Array.prototype.forEach.call(navLinks, function (link) {
      var section = document.querySelector(link.getAttribute('href'));
      if (section) sectionMap[section.id] = link;
    });

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = sectionMap[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Array.prototype.forEach.call(navLinks, function (other) {
            other.classList.remove('is-active');
          });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(sectionMap).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  /* ---------- 6. Enquiry form: opens WhatsApp with the message ready ---------- */
  var form = document.getElementById('quoteForm');
  var note = document.getElementById('formNote');

  function showError(field, show) {
    var wrap = field.closest('.field');
    if (!wrap) return;
    var message = wrap.querySelector('.field-error');
    wrap.classList.toggle('has-error', show);
    if (message) message.hidden = !show;
    field.setAttribute('aria-invalid', show ? 'true' : 'false');
  }

  if (form) {
    var required = ['qName', 'qMobile', 'qCover'];

    required.forEach(function (id) {
      var field = document.getElementById(id);
      if (!field) return;
      field.addEventListener('input', function () {
        if (field.value.trim()) showError(field, false);
      });
      field.addEventListener('change', function () {
        if (field.value.trim()) showError(field, false);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var firstInvalid = null;
      required.forEach(function (id) {
        var field = document.getElementById(id);
        if (!field) return;
        var empty = !field.value.trim();
        showError(field, empty);
        if (empty && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        if (note) note.textContent = 'Please complete the highlighted fields.';
        return;
      }

      var name = document.getElementById('qName').value.trim();
      var mobile = document.getElementById('qMobile').value.trim();
      var cover = document.getElementById('qCover').value;
      var details = document.getElementById('qDetails').value.trim();

      var lines = [
        'Hello, I would like a quote.',
        '',
        'Name: ' + name,
        'Mobile: ' + mobile,
        'Cover needed: ' + cover
      ];
      if (details) lines.push('Details: ' + details);

      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      var opened = window.open(url, '_blank', 'noopener');
      if (!opened) window.location.href = url;

      if (note) note.textContent = 'WhatsApp is opening with your message. Press send there to reach me.';
      form.reset();
    });
  }

  /* ---------- 7. Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
