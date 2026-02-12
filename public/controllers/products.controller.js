/**
 * Products Controller - Renders products and carousel
 */

(function () {
  'use strict';

  function formatPrice(amount) {
    return 'Rs. ' + (amount || 0).toLocaleString();
  }

  function renderProductCard(product) {
    const imgSrc = product.image.startsWith('http') || product.image.startsWith('/') ? product.image : '/' + product.image;
    const hasDiscount = product.discount > 0;
    const stars = '★'.repeat(Math.floor(product.rating || 0)) + (product.rating % 1 >= 0.5 ? '½' : '');
    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-card__image-wrap">
          <img src="${imgSrc}" alt="${product.name}" class="product-card__image" loading="lazy" />
          ${hasDiscount ? `<span class="product-card__badge">${product.discount}% OFF</span>` : ''}
        </div>
        <div class="product-card__body">
          <h3 class="product-card__name">${product.name}</h3>
          <div class="product-card__rating">${stars}</div>
          <div class="product-card__price">
            ${hasDiscount ? `<span class="product-card__price-original">${formatPrice(product.originalPrice)}</span>` : ''}
            <span class="product-card__price-current">${formatPrice(product.price)}</span>
          </div>
        </div>
      </article>
    `;
  }

  function initCarousel() {
    const track = document.querySelector('[data-products-track]');
    const prevBtn = document.querySelector('.products__nav--prev');
    const nextBtn = document.querySelector('.products__nav--next');
    const carousel = document.querySelector('[data-products-carousel]');

    if (!track || !carousel) return;

    const scrollAmount = () => {
      const card = track.querySelector('.product-card');
      if (!card) return 280;
      return card.offsetWidth + 24;
    };

    prevBtn?.addEventListener('click', () => {
      carousel.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });

    nextBtn?.addEventListener('click', () => {
      carousel.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });
  }

  async function renderProducts() {
    const track = document.querySelector('[data-products-track]');
    if (!track) return;

    const products = typeof fetchProducts === 'function' ? await fetchProducts() : [];
    track.innerHTML = products.map((p) => renderProductCard(p)).join('');
    initCarousel();
    if (typeof window.observeProductCards === 'function') window.observeProductCards();
  }

  function init() {
    renderProducts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
