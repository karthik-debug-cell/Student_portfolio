/**
 * ====================================================
 * KARTHIK M PORTFOLIO – script.js
 * Vanilla JavaScript – No external dependencies
 * Features:
 *   - Typing Animation
 *   - Scroll Reveal (Intersection Observer)
 *   - Sticky Navbar with Active Links
 *   - Hamburger Menu
 *   - Back-to-Top Button
 *   - Project Filter (projects.html)
 *   - Smooth Scroll
 * ====================================================
 */

(function () {
  'use strict';

  /* ====================================================
     1. TYPING ANIMATION
     ==================================================== */

  const typingEl = document.getElementById('typing-text');

  if (typingEl) {
    const roles = [
      'ML & Data Science Engineer',
      'Deep Learning Enthusiast',
      'Computer Vision Developer',
      'AI Problem Solver',
      'Data Analytics Engineer',
    ];

    let roleIndex   = 0;
    let charIndex   = 0;
    let isDeleting  = false;
    let typingTimer = null;

    /**
     * Core typing function — types out and deletes each role in sequence.
     */
    function typeEffect() {
      const currentRole = roles[roleIndex];

      if (!isDeleting) {
        // Typing forward
        typingEl.textContent = currentRole.slice(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentRole.length) {
          // Full word typed — pause then delete
          clearTimeout(typingTimer);
          typingTimer = setTimeout(() => {
            isDeleting = true;
            typeEffect();
          }, 1800);
          return;
        }
      } else {
        // Deleting backward
        typingEl.textContent = currentRole.slice(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting  = false;
          roleIndex   = (roleIndex + 1) % roles.length;
        }
      }

      const speed = isDeleting ? 60 : 90;
      clearTimeout(typingTimer);
      typingTimer = setTimeout(typeEffect, speed);
    }

    // Start after a brief delay so hero loads first
    setTimeout(typeEffect, 800);
  }


  /* ====================================================
     2. SCROLL REVEAL (Intersection Observer)
     ==================================================== */

  /**
   * Uses IntersectionObserver to fade in elements with class .reveal
   * when they enter the viewport.
   */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Stop observing once revealed
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  // Attach observer to all .reveal elements
  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });


  /* ====================================================
     3. STICKY NAVBAR
     ==================================================== */

  const navbar = document.getElementById('navbar');

  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }


  /* ====================================================
     4. ACTIVE NAV LINK (based on scroll position)
     ==================================================== */

  const navLinks = document.querySelectorAll('.nav-link:not(.nav-link-accent)');
  const sections = document.querySelectorAll('section[id]');

  if (sections.length > 0) {
    const activeLinkObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              const href = link.getAttribute('href');
              if (href === `#${id}` || href === `index.html#${id}`) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      {
        threshold: 0.35,
        rootMargin: '-80px 0px 0px 0px',
      }
    );

    sections.forEach((section) => activeLinkObserver.observe(section));
  }


  /* ====================================================
     5. HAMBURGER MOBILE MENU
     ==================================================== */

  const hamburger  = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('nav-links');

  if (hamburger && navLinksEl) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinksEl.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));

      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a nav link is clicked
    navLinksEl.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinksEl.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navLinksEl.classList.contains('open')) {
        navLinksEl.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Close on Escape key
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


  /* ====================================================
     6. BACK TO TOP BUTTON
     ==================================================== */

  const backToTop = document.getElementById('back-to-top');

  if (backToTop) {
    // Show / hide based on scroll position
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    // Smooth scroll to top on click
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ====================================================
     7. PROJECT FILTER (projects.html only)
     ==================================================== */

  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Update active state
        filterBtns.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filter = btn.getAttribute('data-filter');

        projectCards.forEach((card) => {
          const categories = card.getAttribute('data-category') || '';

          if (filter === 'all' || categories.includes(filter)) {
            card.classList.remove('hidden');
            // Re-trigger reveal animation
            card.classList.remove('visible');
            setTimeout(() => card.classList.add('visible'), 50);
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }


  /* ====================================================
     8. SMOOTH SCROLL for anchor links
     ==================================================== */

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const offsetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });


  /* ====================================================
     9. SKILL CARD – Tooltip on hover (accessibility)
     ==================================================== */

  document.querySelectorAll('.skill-card').forEach((card) => {
    const skillName = card.getAttribute('data-skill');
    if (skillName) {
      card.setAttribute('title', skillName);
      card.setAttribute('role', 'img');
      card.setAttribute('aria-label', skillName);
    }
  });


  /* ====================================================
     10. CONSOLE GREETING (Easter Egg for developers 👨‍💻)
     ==================================================== */

  console.log(
    '%c Karthik M – ML & Data Science Engineer ',
    'background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-size: 14px; font-weight: bold; padding: 8px 16px; border-radius: 6px;'
  );
  console.log(
    '%c 📌 GitHub: https://github.com/karthik-debug-cell\n🔗 LinkedIn: https://www.linkedin.com/in/m-karthik-826271393',
    'color: #94a3b8; font-size: 12px;'
  );

})();