/**
 * Product Utilities — Wishlist & card navigation
 * Used by homepage (products.controller.js) and /products page (products-page.controller.js)
 */

(function () {
  'use strict';

  /* ── Wishlist (localStorage) ── */
  function getWishlist() {
    try { return JSON.parse(localStorage.getItem('curavet_wishlist') || '[]'); } catch (e) { return []; }
  }

  function saveWishlist(list) {
    localStorage.setItem('curavet_wishlist', JSON.stringify(list));
  }

  function syncWishlistToServer(productId, action) {
    fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: productId, action: action }),
    }).catch(function (err) {
      console.warn('Wishlist sync failed:', err.message);
    });
  }

  window.toggleWishlist = function (productId, btn) {
    var list = getWishlist();
    var idx = list.indexOf(productId);
    if (idx > -1) {
      list.splice(idx, 1);
      if (btn) btn.classList.remove('active');
      syncWishlistToServer(productId, 'remove');
    } else {
      list.push(productId);
      if (btn) btn.classList.add('active');
      syncWishlistToServer(productId, 'add');
    }
    saveWishlist(list);
  };

  window.applyWishlistState = function () {
    var list = getWishlist();
    document.querySelectorAll('.product-card__wishlist-btn').forEach(function (btn) {
      if (list.includes(btn.getAttribute('data-wishlist-id'))) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  /* ── Navigate to product detail page ── */
  window.attachProductCardListeners = function () {
    document.querySelectorAll('.product-card[data-product-id]').forEach(function (card) {
      if (card._navBound) return;
      card._navBound = true;

      card.addEventListener('click', function (e) {
        if (e.target.closest('.product-card__wishlist-btn')) return;
        var id = this.getAttribute('data-product-id');
        window.location.href = '/product/' + encodeURIComponent(id);
      });

      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var id = this.getAttribute('data-product-id');
          window.location.href = '/product/' + encodeURIComponent(id);
        }
      });
    });
  };
})();
