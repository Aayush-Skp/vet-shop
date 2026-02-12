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
    const navbar = document.querySelector('.navbar');
    const getOffset = () => navbar ? navbar.offsetHeight : 60;

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const targetTop = target.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: targetTop - getOffset(), behavior: 'smooth' });
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
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.section, .section-title, .why-card, .service-card, .testimonial-card, .about__content').forEach((el) => {
      observer.observe(el);
    });
  }

  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 80) {
        navbar.classList.add('navbar--scrolled');
      } else {
        navbar.classList.remove('navbar--scrolled');
      }
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
