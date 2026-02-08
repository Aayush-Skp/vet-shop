/**
 * UI Controller - Interactions, animations, mobile menu
 */

(function () {
  'use strict';

  function initMobileMenu() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('.navbar__nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      nav.classList.toggle('show');
      toggle.setAttribute('aria-expanded', nav.classList.contains('show'));
    });

    // Close menu when clicking a link
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('show');
      });
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') nav.classList.remove('show');
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.section, .why-card, .service-card, .testimonial-card').forEach((el) => {
      observer.observe(el);
    });
  }

  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 100) {
        navbar.style.boxShadow = '0 2px 12px rgba(13, 71, 161, 0.12)';
      } else {
        navbar.style.boxShadow = '0 2px 8px rgba(13, 71, 161, 0.08)';
      }
      lastScroll = currentScroll;
    });
  }

  function init() {
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initNavbarScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
