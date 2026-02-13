/**
 * Products Page Controller - Nav, search, grid
 */

(function () {
  'use strict';

  const NAV_ITEMS = [
    { label: 'Home', href: '/index.html' },
    { label: 'Why Choose Us', href: '/index.html#why-choose-us' },
    { label: 'Services', href: '/index.html#services' },
    { label: 'Products', href: '/products.html' },
    { label: 'About', href: '/index.html#about' },
    { label: 'Testimonials', href: '/index.html#testimonials' },
    { label: 'Contact', href: '/index.html#contact' },
  ];

  function formatPrice(amount) {
    return 'Rs. ' + (amount || 0).toLocaleString();
  }

  function renderStars(rating) {
    const full = Math.floor(rating || 0);
    const half = (rating % 1 >= 0.5) ? '½' : '';
    return '★'.repeat(full) + half;
  }

  function renderProductCard(product) {
    const imgSrc = product.image.startsWith('http') || product.image.startsWith('/') ? product.image : '/' + product.image;
    const hasDiscount = product.discount > 0;
    const outOfStock = product.inStock === false;
    const onSale = product.onSale === true;
    const stars = renderStars(product.rating);

    return `
      <article class="product-card product-card--grid${outOfStock ? ' product-card--oos' : ''}" data-product-id="${product.id}" role="button" tabindex="0">
        <div class="product-card__image-wrap">
          <img src="${imgSrc}" alt="${product.name}" class="product-card__image" loading="lazy" />
          <div class="product-card__badges">
            ${onSale ? '<span class="product-card__badge product-card__badge--sale">SALE</span>' : ''}
            ${hasDiscount ? `<span class="product-card__badge">${product.discount}% OFF</span>` : ''}
          </div>
          ${outOfStock ? '<div class="product-card__oos-overlay"><span>Out of Stock</span></div>' : ''}
          ${outOfStock ? `<button class="product-card__wishlist-btn" data-wishlist-id="${product.id}" title="Add to Wishlist" onclick="event.stopPropagation(); window.toggleWishlist('${product.id}', this);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </button>` : ''}
        </div>
        <div class="product-card__body">
          ${product.highlight ? `<span class="product-card__highlight">${product.highlight}</span>` : ''}
          <span class="product-card__category">${product.category || ''}</span>
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

  function initNavbar() {
    const navEl = document.querySelector('[data-nav-links]');
    if (!navEl) return;
    navEl.innerHTML = NAV_ITEMS.map((item) => `<li><a href="${item.href}">${item.label}</a></li>`).join('');
  }

  function initFooter() {
    if (typeof clinicModel === 'undefined') return;
    const els = {
      name: document.querySelector('[data-footer-name]'),
      address: document.querySelector('[data-footer-address]'),
      hours: document.querySelector('[data-footer-hours]'),
      phone: document.querySelector('[data-footer-phone]'),
    };
    if (els.name) els.name.textContent = clinicModel.name;
    if (els.address) els.address.textContent = clinicModel.address.full;
    if (els.hours) els.hours.textContent = clinicModel.hours.display;
    if (els.phone) {
      els.phone.textContent = clinicModel.contact.phone;
      els.phone.href = 'tel:' + clinicModel.contact.phone;
    }
    const mapIframe = document.querySelector('[data-map-embed]');
    if (mapIframe) {
      mapIframe.src = 'https://www.google.com/maps?q=' + clinicModel.address.coordinates + '&output=embed';
    }
  }

  function filterProducts(products, query) {
    if (!query || !query.trim()) return products;
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      return name.includes(q) || category.includes(q);
    });
  }

  function updateProductsList(products, filtered) {
    const grid = document.querySelector('[data-products-grid]');
    const empty = document.querySelector('[data-products-empty]');
    const count = document.querySelector('[data-products-count]');
    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (empty) {
        empty.hidden = false;
      }
    } else {
      if (empty) empty.hidden = true;
      grid.innerHTML = filtered.map(renderProductCard).join('');
      if (typeof window.applyWishlistState === 'function') window.applyWishlistState();
      if (typeof window.attachProductCardListeners === 'function') window.attachProductCardListeners();
    }

    if (count) {
      const total = products.length;
      const searchActive = document.querySelector('[data-products-search]')?.value?.trim();
      count.textContent = searchActive
        ? `Showing ${filtered.length} of ${total} products`
        : `Showing all ${total} products`;
    }
  }

  function initSearch(products) {
    const input = document.querySelector('[data-products-search]');
    if (!input) return;

    const debounce = (fn, ms) => {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
      };
    };

    input.addEventListener(
      'input',
      debounce((e) => {
        const filtered = filterProducts(products, e.target.value);
        updateProductsList(products, filtered);
      }, 200)
    );
  }

  async function init() {
    initNavbar();
    initFooter();

    const products = typeof fetchProducts === 'function' ? await fetchProducts() : [];
    updateProductsList(products, products);
    initSearch(products);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
