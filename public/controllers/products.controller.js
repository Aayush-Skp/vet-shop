/**
 * Products Controller - Renders products carousel on the homepage
 * Depends on: product-detail.js (wishlist + card navigation)
 */

(function () {
  'use strict';

  function formatPrice(amount) {
    return 'Rs. ' + (amount || 0).toLocaleString();
  }

  function renderStars(rating) {
    var full = Math.floor(rating || 0);
    var half = (rating % 1 >= 0.5) ? '½' : '';
    return '★'.repeat(full) + half;
  }

  function renderProductCard(product) {
    var imgSrc = product.image.startsWith('http') || product.image.startsWith('/') ? product.image : '/' + product.image;
    var hasDiscount = product.discount > 0;
    var outOfStock = product.inStock === false;
    var onSale = product.onSale === true;
    var stars = renderStars(product.rating);

    return (
      '<article class="product-card' + (outOfStock ? ' product-card--oos' : '') + '" data-product-id="' + product.id + '" role="button" tabindex="0">' +
        '<div class="product-card__image-wrap">' +
          '<img src="' + imgSrc + '" alt="' + product.name + '" class="product-card__image" loading="lazy" />' +
          '<div class="product-card__badges">' +
            (onSale ? '<span class="product-card__badge product-card__badge--sale">SALE</span>' : '') +
            (hasDiscount ? '<span class="product-card__badge">' + product.discount + '% OFF</span>' : '') +
          '</div>' +
          (outOfStock ? '<div class="product-card__oos-overlay"><span>Out of Stock</span></div>' : '') +
          (outOfStock
            ? '<button class="product-card__wishlist-btn" data-wishlist-id="' + product.id + '" title="Add to Wishlist" onclick="event.stopPropagation(); window.toggleWishlist(\'' + product.id + '\', this);">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>' +
              '</button>'
            : '') +
        '</div>' +
        '<div class="product-card__body">' +
          (product.highlight ? '<span class="product-card__highlight">' + product.highlight + '</span>' : '') +
          '<h3 class="product-card__name">' + product.name + '</h3>' +
          '<div class="product-card__rating">' + stars + '</div>' +
          '<div class="product-card__price">' +
            (hasDiscount ? '<span class="product-card__price-original">' + formatPrice(product.originalPrice) + '</span>' : '') +
            '<span class="product-card__price-current">' + formatPrice(product.price) + '</span>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  /* ── Carousel ── */
  function initCarousel() {
    var track = document.querySelector('[data-products-track]');
    var prevBtn = document.querySelector('.products__nav--prev');
    var nextBtn = document.querySelector('.products__nav--next');
    var carousel = document.querySelector('[data-products-carousel]');

    if (!track || !carousel) return;

    var scrollAmount = function () {
      var card = track.querySelector('.product-card');
      if (!card) return 280;
      return card.offsetWidth + 24;
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        carousel.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        carousel.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
      });
    }
  }

  async function renderProducts() {
    var track = document.querySelector('[data-products-track]');
    if (!track) return;

    var products = typeof fetchProducts === 'function' ? await fetchProducts() : [];
    track.innerHTML = products.map(renderProductCard).join('');
    initCarousel();

    // Apply shared wishlist state & click handlers
    if (typeof window.applyWishlistState === 'function') window.applyWishlistState();
    if (typeof window.attachProductCardListeners === 'function') window.attachProductCardListeners();
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
