/* Under Bridges — site behaviour
   Nav state, mobile menu, reveal-on-scroll, hero video scroll-scrub, contact form. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.querySelector('[data-nav]');
  var isHome = document.body.getAttribute('data-page') === 'home';

  /* Footer year ---------------------------------------------------------- */

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* Mobile menu ---------------------------------------------------------- */

  var burger = document.querySelector('[data-burger]');
  var menu = document.querySelector('[data-mnav]');

  function setMenu(open) {
    if (!menu || !burger) return;
    menu.classList.toggle('is-open', open);
    burger.textContent = open ? '✕' : '☰';
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open && nav) nav.classList.add('is-solid');
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      setMenu(!menu.classList.contains('is-open'));
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* Nav solid state ------------------------------------------------------- */

  var hero = document.querySelector('[data-hero]');

  function navThreshold() {
    var vh = window.innerHeight || 800;
    if (!isHome || !hero) return -1; // always solid
    // Layout not settled yet (hero track should be at least one viewport tall):
    // keep the nav transparent rather than flashing the solid state over the hero.
    if (hero.offsetHeight < vh * 0.9) return Infinity;
    if (reduceMotion) return vh * 0.55;
    return hero.offsetHeight - vh * 0.55;
  }

  function updateNav() {
    if (!nav) return;
    if (menu && menu.classList.contains('is-open')) { nav.classList.add('is-solid'); return; }
    var t = navThreshold();
    nav.classList.toggle('is-solid', t < 0 || window.scrollY > t);
  }

  updateNav();
  window.addEventListener('load', updateNav);
  window.addEventListener('resize', updateNav);
  if (isHome) window.addEventListener('scroll', updateNav, { passive: true });

  /* Reveal on scroll -------------------------------------------------------- */

  function setupReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!els.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.opacity = '1';
          en.target.style.transform = 'none';
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

    var vh = window.innerHeight || 800;
    els.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.94) {
        el.style.opacity = '1';
        el.style.transform = 'none';
        return;
      }
      el.style.opacity = '0';
      el.style.transform = 'translateY(26px)';
      el.style.transition = 'opacity .9s cubic-bezier(.22,.61,.2,1), transform .9s cubic-bezier(.22,.61,.2,1)';
      io.observe(el);
    });
  }

  setupReveal();

  /* Hero video scroll-scrub (home) -------------------------------------------- */

  if (isHome && hero && !reduceMotion) {
    var video = document.querySelector('[data-hero-video]');
    var frame = document.querySelector('[data-hero-frame]');
    var content = document.querySelector('[data-hero-content]');
    var cue = document.querySelector('[data-hero-cue]');
    var vt = null;
    var blobbing = false;
    var blobUrl = null;

    // Fetch the video as a blob so the whole file is seekable for scrubbing.
    var loadHeroVideo = function () {
      if (!video || video.dataset.blobbed) return;
      if (blobUrl) {
        video.src = blobUrl;
        video.dataset.blobbed = '1';
        try { video.load(); } catch (e) { /* noop */ }
        return;
      }
      if (blobbing) return;
      blobbing = true;
      fetch(video.getAttribute('data-src') || video.src)
        .then(function (r) { return r.blob(); })
        .then(function (b) {
          blobUrl = URL.createObjectURL(b);
          video.src = blobUrl;
          video.dataset.blobbed = '1';
          try { video.load(); } catch (e) { /* noop */ }
        })
        .catch(function () { /* keep direct src */ })
        .finally(function () { blobbing = false; });
    };

    var offscreenDone = false;

    var tick = function () {
      if (!video) return;
      var vh = window.innerHeight || 800;
      var rect = hero.getBoundingClientRect();

      // Hero fully above the viewport: freeze the scrub at its end state and do
      // no video work — far seeks on every frame can stall the renderer.
      if (rect.bottom <= 0) {
        if (!offscreenDone) {
          offscreenDone = true;
          if (content) { content.style.opacity = '0'; content.style.transform = 'translateY(-44px)'; }
          if (cue) cue.style.opacity = '0';
          if (frame) { frame.style.borderBottomLeftRadius = '64px'; frame.style.borderBottomRightRadius = '64px'; }
        }
        return;
      }
      offscreenDone = false;

      loadHeroVideo();
      if (!video.paused) video.pause();

      // Scrub: the video only moves when you scroll, slowly, across the whole track.
      var scrollable = Math.max(1, hero.offsetHeight - vh);
      var progress = Math.min(1, Math.max(0, (-rect.top) / scrollable));
      var dur = video.duration;
      if (isFinite(dur) && dur > 0) {
        var target = progress * (dur - 0.05);
        // On a large jump (deep link, scroll restoration) seek once instead of
        // chasing across the whole file in dozens of expensive far seeks.
        vt = (vt == null || Math.abs(target - vt) > 3) ? target : vt + (target - vt) * 0.16;
        if (Math.abs(vt - video.currentTime) > 0.034 && !video.seeking) {
          try { video.currentTime = vt; } catch (e) { /* noop */ }
        }
      }
      if (content) {
        content.style.opacity = String(Math.max(0, 1 - progress * 2.4));
        content.style.transform = 'translateY(' + (progress * -44) + 'px)';
      }
      if (cue) cue.style.opacity = String(Math.max(0, 1 - progress * 5));
      if (frame) {
        var r = Math.round(Math.min(64, progress * 150));
        frame.style.borderBottomLeftRadius = r + 'px';
        frame.style.borderBottomRightRadius = r + 'px';
      }
    };

    var loop = function () {
      tick();
      updateNav();
      window.requestAnimationFrame(loop);
    };
    window.requestAnimationFrame(loop);
  }

  /* Contact form ----------------------------------------------------------------- */

  var form = document.querySelector('[data-contact-form]');

  if (form) {
    var sent = document.querySelector('[data-form-sent]');
    var error = document.querySelector('[data-form-error]');
    var submitBtn = form.querySelector('button[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.innerHTML : '';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (error) error.classList.remove('is-visible');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      var data = {
        name: form.name.value,
        email: form.email.value,
        company: form.company.value,
        help: form.help.value,
        message: form.message.value,
        _subject: 'New enquiry — underbridges.co.za'
      };

      fetch('https://formsubmit.co/ajax/info@underbridges.co.za', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) {
          if (!r.ok) throw new Error('send failed');
          return r.json();
        })
        .then(function () {
          form.style.display = 'none';
          if (sent) sent.classList.add('is-visible');
          window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        })
        .catch(function () {
          if (error) error.classList.add('is-visible');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitLabel;
          }
        });
    });
  }
})();
