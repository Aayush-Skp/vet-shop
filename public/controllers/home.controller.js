/**
 * Home Controller - Renders data into views
 */

(function () {
  'use strict';

  function renderNavbar() {
    const logoEl = document.querySelector('[data-nav-logo]');
    const navEl = document.querySelector('[data-nav-links]');
    if (!logoEl || !navEl) return;

    const logoImg = logoEl.querySelector('.navbar__logo-img');
    if (logoImg) logoImg.alt = navigationModel.logo.alt;
    const logoText = logoEl.querySelector('[data-nav-logo-text]');
    if (logoText) logoText.textContent = navigationModel.logo.text;
    navEl.innerHTML = navigationModel.items
      .map(
        (item) =>
          `<li><a href="${item.href}">${item.label}</a></li>`
      )
      .join('');
  }

  function renderHero() {
    const clinic = clinicModel;
    const elements = {
      headline: document.querySelector('[data-hero-headline]'),
      subheading: document.querySelector('[data-hero-subheading]'),
      ctaPrimary: document.querySelector('[data-hero-cta-primary]'),
      ctaPhone: document.querySelector('[data-hero-cta-phone]'),
      address: document.querySelector('[data-hero-address]'),
      hours: document.querySelector('[data-hero-hours]'),
    };

    if (elements.headline) elements.headline.textContent = clinic.slogan;
    if (elements.subheading) elements.subheading.textContent = clinic.tagline;
    if (elements.ctaPrimary) elements.ctaPrimary.textContent = clinic.cta.hero.primary;
    if (elements.ctaPhone) {
      elements.ctaPhone.textContent = clinic.cta.hero.secondary;
      elements.ctaPhone.href = `tel:${clinic.contact.phone}`;
    }
    if (elements.address) elements.address.textContent = clinic.address.line1;
    if (elements.hours) elements.hours.textContent = clinic.hours.display;
  }

  function renderWhyChooseUs() {
    const container = document.querySelector('[data-why-cards]');
    if (!container) return;

    container.innerHTML = whyChooseUsModel.items
      .map(
        (item) => `
      <article class="why-card">
        <div class="why-card__icon">${icons[item.icon] || icons.heart}</div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </article>
    `
      )
      .join('');
  }

  function renderServices() {
    const container = document.querySelector('[data-services-cards]');
    const ctaEl = document.querySelector('[data-services-cta]');
    if (!container) return;

    container.innerHTML = servicesModel.categories
      .map(
        (cat) => `
      <article class="service-card">
        <div class="service-card__icon">${icons[cat.icon] || icons.heart}</div>
        <h3>${cat.title}</h3>
        <ul>
          ${cat.services.map((s) => `<li>${s}</li>`).join('')}
        </ul>
      </article>
    `
      )
      .join('');

    if (ctaEl) ctaEl.textContent = servicesModel.ctaButton;
  }

  function renderTestimonials() {
    const container = document.querySelector('[data-testimonials-cards]');
    if (!container) return;

    container.innerHTML = testimonialsModel.items
      .map(
        (item) => `
      <article class="testimonial-card">
        <span class="testimonial-card__quote">"</span>
        <p>${item.quote}</p>
        <span class="testimonial-card__author">— ${item.author}</span>
        <div class="testimonial-card__stars">${'★'.repeat(item.rating)}</div>
      </article>
    `
      )
      .join('');
  }

  function renderCTA() {
    const clinic = clinicModel;
    const headline = document.querySelector('[data-cta-headline]');
    const callBtn = document.querySelector('[data-cta-call]');
    const visitBtn = document.querySelector('[data-cta-visit]');

    if (headline) headline.textContent = clinic.cta.section.headline;
    if (callBtn) {
      callBtn.textContent = clinic.cta.section.callNow;
      callBtn.href = `tel:${clinic.contact.phone}`;
    }
    if (visitBtn) {
      visitBtn.textContent = clinic.cta.section.visitClinic;
      visitBtn.href = `https://www.google.com/maps?q=${clinic.address.coordinates}`;
    }
  }

  function renderFooter() {
    const clinic = clinicModel;
    const elements = {
      name: document.querySelector('[data-footer-name]'),
      address: document.querySelector('[data-footer-address]'),
      hours: document.querySelector('[data-footer-hours]'),
      phone: document.querySelector('[data-footer-phone]'),
    };

    if (elements.name) elements.name.textContent = clinic.name;
    if (elements.address) elements.address.textContent = clinic.address.full;
    if (elements.hours) elements.hours.textContent = clinic.hours.display;
    if (elements.phone) {
      elements.phone.textContent = clinic.contact.phone;
      elements.phone.href = `tel:${clinic.contact.phone}`;
    }
    const mapIframe = document.querySelector('[data-map-embed]');
    if (mapIframe) {
      mapIframe.src = `https://www.google.com/maps?q=${clinic.address.coordinates}&output=embed`;
    }
  }

  function init() {
    renderNavbar();
    renderHero();
    renderWhyChooseUs();
    renderServices();
    renderTestimonials();
    renderCTA();
    renderFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
