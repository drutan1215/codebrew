/* ============================================================
   CODEBREW — Interactions & Animations
   ============================================================ */

(function () {
  'use strict';

  /* ---- Progress bar ---- */
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrolled =
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
      progressBar.style.width = scrolled + '%';
    }, { passive: true });
  }

  /* ---- Nav scroll effect ---- */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile hamburger ---- */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Scroll reveal ---- */
  const revealTargets = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right'
  );

  if ('IntersectionObserver' in window && revealTargets.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: show everything immediately
    revealTargets.forEach(el => el.classList.add('visible'));
  }

  /* ---- Counter animation ---- */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el, target, duration) {
    const start = performance.now();
    const isFloat = target % 1 !== 0;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = easeOutQuart(progress) * target;
      el.textContent = isFloat ? value.toFixed(1) : Math.floor(value);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };

    requestAnimationFrame(tick);
  }

  const statNumbers = document.querySelectorAll('.stat-number');
  if ('IntersectionObserver' in window && statNumbers.length) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = parseFloat(entry.target.dataset.target);
            animateCounter(entry.target, target, 1800);
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    statNumbers.forEach(el => statsObserver.observe(el));
  }

  /* ---- Form submission ---- */
  const joinForm   = document.getElementById('join-form');
  const submitBtn  = document.getElementById('submit-btn');

  if (joinForm && submitBtn) {
    joinForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameEl  = joinForm.querySelector('#form-name');
      const emailEl = joinForm.querySelector('#form-email');

      // Simple validation
      if (!nameEl.value.trim() || !emailEl.value.trim()) {
        shakeField(nameEl.value.trim() ? emailEl : nameEl);
        return;
      }
      if (!isValidEmail(emailEl.value.trim())) {
        shakeField(emailEl);
        return;
      }

      // Loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      // Simulate async submission
      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.classList.add('success');
        submitBtn.style.background = '#059669';

        // Reset form fields
        joinForm.querySelectorAll('.form-input, .form-select').forEach(el => {
          if (el.tagName === 'SELECT') el.selectedIndex = 0;
          else el.value = '';
        });
      }, 1200);
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeField(el) {
    el.style.borderColor = '#ef4444';
    el.style.boxShadow  = '0 0 0 3px rgba(239,68,68,0.2)';
    el.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 380, easing: 'ease-out' }
    );
    el.addEventListener('input', () => {
      el.style.borderColor = '';
      el.style.boxShadow   = '';
    }, { once: true });
  }

  /* ---- Smooth anchor offset (fixed nav) ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      const navHeight = nav ? nav.getBoundingClientRect().height : 0;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });

  /* ---- Parallax hero orbs (subtle) ---- */
  const orbs = document.querySelectorAll('.hero-orb');
  if (orbs.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          orbs.forEach((orb, i) => {
            const speed = 0.06 + i * 0.03;
            orb.style.transform = `translateY(${scrollY * speed}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

})();
