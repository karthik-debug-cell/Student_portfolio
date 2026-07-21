/**
 * ===================================================
 * animations.js – Contact Page Animation Helpers
 * ===================================================
 * Handles:
 *  • Intersection Observer scroll-reveal
 *  • Floating card parallax on mouse move
 *  • Staggered children animation
 *  • Number counter animation
 */

'use strict';

(function () {

  /* ---- 1. Scroll Reveal ---- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


  /* ---- 2. Staggered reveal for lists ---- */
  document.querySelectorAll('.reveal-stagger').forEach((container) => {
    const children = container.children;
    Array.from(children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 80}ms`;
      child.classList.add('reveal');
      revealObserver.observe(child);
    });
  });


  /* ---- 3. Subtle floating parallax on mouse move ---- */
  const floatingCards = document.querySelectorAll('.float-card');

  if (floatingCards.length > 0) {
    document.addEventListener('mousemove', (e) => {
      const { innerWidth: w, innerHeight: h } = window;
      const x = (e.clientX / w - 0.5) * 2;   // -1 to 1
      const y = (e.clientY / h - 0.5) * 2;   // -1 to 1

      floatingCards.forEach((card, i) => {
        const depth = (i % 3 + 1) * 3;        // 3, 6, or 9 px
        card.style.transform = `translateX(${x * depth}px) translateY(${y * depth}px)`;
      });
    });

    // Reset on mouse leave
    document.addEventListener('mouseleave', () => {
      floatingCards.forEach(card => {
        card.style.transform = 'translateX(0) translateY(0)';
      });
    });
  }


  /* ---- 4. Sticky navbar scroll class ---- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });
  }


  /* ---- 5. Hamburger menu ---- */
  const hamburger  = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('nav-links');

  if (hamburger && navLinksEl) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinksEl.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinksEl.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinksEl.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navLinksEl.classList.contains('open')) {
        navLinksEl.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinksEl.classList.contains('open')) {
        navLinksEl.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        hamburger.focus();
      }
    });
  }


  /* ---- 6. Back to top ---- */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
