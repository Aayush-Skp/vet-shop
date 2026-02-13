/**
 * Product Detail Page Controller
 * Reads product ID from URL, fetches data, and renders the detail view.
 */

(function () {
  'use strict';

  var NAV_ITEMS = [
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
    var full = Math.floor(rating || 0);
    var half = (rating % 1 >= 0.5) ? '½' : '';
    return '★'.repeat(full) + half;
  }

  /* ── Wishlist helpers ── */
  function getWishlist() {
    try { return JSON.parse(localStorage.getItem('curavet_wishlist') || '[]'); } catch (e) { return []; }
  }

  function saveWishlist(list) {
    localStorage.setItem('curavet_wishlist', JSON.stringify(list));
  }

  function syncWishlist(productId, action) {
    fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: productId, action: action }),
    }).catch(function (err) {
      console.warn('Wishlist sync failed:', err.message);
    });
  }

  /* ── Navbar & Footer ── */
  function initNavbar() {
    var navEl = document.querySelector('[data-nav-links]');
    if (!navEl) return;
    navEl.innerHTML = NAV_ITEMS.map(function (item) {
      return '<li><a href="' + item.href + '">' + item.label + '</a></li>';
    }).join('');
  }

  function initFooter() {
    if (typeof clinicModel === 'undefined') return;
    var els = {
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
    var mapIframe = document.querySelector('[data-map-embed]');
    if (mapIframe) {
      mapIframe.src = 'https://www.google.com/maps?q=' + clinicModel.address.coordinates + '&output=embed';
    }
  }

  /* ── Get product ID from URL ── */
  function getProductId() {
    // Supports /product/PRODUCT_ID and ?id=PRODUCT_ID
    var path = window.location.pathname;
    var match = path.match(/\/product\/([^/]+)/);
    if (match) return decodeURIComponent(match[1]);

    var params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  /* ── Render product details into the page ── */
  function renderProduct(product) {
    var loading = document.querySelector('[data-pd-loading]');
    var content = document.querySelector('[data-pd-content]');
    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';

    var imgSrc = product.image.startsWith('http') || product.image.startsWith('/') ? product.image : '/' + product.image;
    var hasDiscount = product.discount > 0;
    var outOfStock = product.inStock === false;
    var onSale = product.onSale === true;

    // Page title
    document.title = product.name + ' | Curavet Pet Clinic';

    // Breadcrumb
    var breadcrumbName = document.querySelector('[data-pd-breadcrumb-name]');
    if (breadcrumbName) breadcrumbName.textContent = product.name;

    // Image
    var imgEl = document.querySelector('[data-pd-image]');
    if (imgEl) { imgEl.src = imgSrc; imgEl.alt = product.name; }

    // Image badges
    var badgesEl = document.querySelector('[data-pd-image-badges]');
    if (badgesEl) {
      var badgesHtml = '';
      if (outOfStock) badgesHtml += '<span class="pd-badge pd-badge--oos">Out of Stock</span>';
      if (onSale) badgesHtml += '<span class="pd-badge pd-badge--sale">SALE</span>';
      if (hasDiscount) badgesHtml += '<span class="pd-badge pd-badge--discount">' + product.discount + '% OFF</span>';
      badgesEl.innerHTML = badgesHtml;
    }

    // Meta (category + highlight)
    var metaEl = document.querySelector('[data-pd-meta]');
    if (metaEl) {
      var metaHtml = '<span class="pd-category">' + (product.category || 'Uncategorized') + '</span>';
      if (product.highlight) {
        metaHtml += '<span class="pd-highlight-tag">' + product.highlight + '</span>';
      }
      metaEl.innerHTML = metaHtml;
    }

    // Title & Description
    var titleEl = document.querySelector('[data-pd-title]');
    if (titleEl) titleEl.textContent = product.name;

    var descEl = document.querySelector('[data-pd-description]');
    if (descEl) {
      if (product.description) {
        descEl.textContent = product.description;
        descEl.hidden = false;
      } else {
        descEl.hidden = true;
      }
    }

    // Rating
    var ratingEl = document.querySelector('[data-pd-rating]');
    if (ratingEl) {
      ratingEl.innerHTML =
        '<span class="pd-stars">' + renderStars(product.rating) + '</span>' +
        '<span class="pd-rating-num">' + (product.rating || 0) + ' / 5</span>';
    }

    // Pricing
    var pricingEl = document.querySelector('[data-pd-pricing]');
    if (pricingEl) {
      var priceHtml = '<span class="pd-price">' + formatPrice(product.price) + '</span>';
      if (hasDiscount) {
        priceHtml +=
          '<span class="pd-original-price">' + formatPrice(product.originalPrice) + '</span>' +
          '<span class="pd-discount-tag">' + product.discount + '% OFF</span>';
      }
      pricingEl.innerHTML = priceHtml;
    }

    // Stock status
    var stockEl = document.querySelector('[data-pd-stock]');
    if (stockEl) {
      stockEl.className = 'pd-stock' + (outOfStock ? ' pd-stock--oos' : '');
      stockEl.innerHTML =
        '<span class="pd-stock-dot"></span>' +
        (outOfStock ? 'Currently Out of Stock' : 'In Stock & Available');
    }

    // Actions (wishlist only when out of stock)
    var actionsEl = document.querySelector('[data-pd-actions]');
    if (actionsEl) {
      if (outOfStock) {
        var wishlist = getWishlist();
        var isWished = wishlist.includes(product.id);
        actionsEl.innerHTML =
          '<button class="pd-wishlist-btn' + (isWished ? ' active' : '') + '" data-wishlist-id="' + product.id + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>' +
            '<span>' + (isWished ? 'Wishlisted' : 'Add to Wishlist') + '</span>' +
          '</button>';
        actionsEl.hidden = false;

        // Bind wishlist click
        var wishBtn = actionsEl.querySelector('.pd-wishlist-btn');
        if (wishBtn) {
          wishBtn.addEventListener('click', function () {
            var id = this.getAttribute('data-wishlist-id');
            var wl = getWishlist();
            var i = wl.indexOf(id);
            if (i > -1) {
              wl.splice(i, 1);
              this.classList.remove('active');
              this.querySelector('span').textContent = 'Add to Wishlist';
              syncWishlist(id, 'remove');
            } else {
              wl.push(id);
              this.classList.add('active');
              this.querySelector('span').textContent = 'Wishlisted';
              syncWishlist(id, 'add');
            }
            saveWishlist(wl);
          });
        }
      } else {
        actionsEl.hidden = true;
      }
    }

    // Disclaimer
    var disclaimerEl = document.querySelector('[data-pd-disclaimer]');
    if (disclaimerEl) {
      if (product.disclaimer) {
        disclaimerEl.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>' +
          '<span>' + product.disclaimer + '</span>';
        disclaimerEl.hidden = false;
      } else {
        disclaimerEl.hidden = true;
      }
    }

    // Details grid
    var detailsEl = document.querySelector('[data-pd-details]');
    if (detailsEl) {
      detailsEl.innerHTML =
        '<div class="pd-detail-item">' +
          '<span class="pd-detail-label">Category</span>' +
          '<span class="pd-detail-value">' + (product.category || '—') + '</span>' +
        '</div>' +
        '<div class="pd-detail-item">' +
          '<span class="pd-detail-label">Rating</span>' +
          '<span class="pd-detail-value">' + renderStars(product.rating) + ' ' + (product.rating || 0) + '/5</span>' +
        '</div>' +
        '<div class="pd-detail-item">' +
          '<span class="pd-detail-label">Availability</span>' +
          '<span class="pd-detail-value">' + (outOfStock ? 'Out of Stock' : 'In Stock') + '</span>' +
        '</div>' +
        (onSale ? '<div class="pd-detail-item"><span class="pd-detail-label">Status</span><span class="pd-detail-value pd-detail-value--sale">On Sale</span></div>' : '');
    }
  }

  function showError() {
    var loading = document.querySelector('[data-pd-loading]');
    var errorEl = document.querySelector('[data-pd-error]');
    if (loading) loading.style.display = 'none';
    if (errorEl) { errorEl.style.display = 'block'; errorEl.hidden = false; }
  }

  /* ── Init ── */
  async function init() {
    initNavbar();
    initFooter();

    var productId = getProductId();
    if (!productId) { showError(); return; }

    try {
      var products = typeof fetchProducts === 'function' ? await fetchProducts() : [];
      var product = products.find(function (p) { return p.id === productId; });

      if (!product) { showError(); return; }

      renderProduct(product);
    } catch (err) {
      console.error('Failed to load product:', err);
      showError();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
