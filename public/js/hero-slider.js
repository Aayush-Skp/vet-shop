/**
 * Hero Slider - Dynamic featured images from Firestore via API
 * Falls back to local hero-images.json if API returns empty or fails.
 * Starts with fallback images immediately, then swaps in dynamic images
 * once they're fetched + preloaded (same crossfade animation).
 */
(function () {
  'use strict';

  var SLIDE_INTERVAL = 4000;
  var API_URL = '/api/featured-images';
  var FALLBACK_URL = '/models/hero-images.json';

  // ── Load fallback images from local JSON ──
  function loadFallbackImages() {
    return fetch(FALLBACK_URL)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        return data.images && data.images.length ? data.images : [];
      })
      .catch(function () {
        return [];
      });
  }

  // ── Load dynamic images from API ──
  function loadDynamicImages() {
    return fetch(API_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(function (data) {
        if (!data.images || data.images.length === 0) return [];
        return data.images.map(function (img) {
          return {
            url: img.url,
            alt: img.alt || 'Curavet Pet Clinic',
          };
        });
      })
      .catch(function () {
        return [];
      });
  }

  // ── Preload images so they display instantly ──
  function preloadImages(urls) {
    return Promise.all(
      urls.map(function (url) {
        return new Promise(function (resolve) {
          var img = new Image();
          img.onload = function () { resolve(url); };
          img.onerror = function () { resolve(null); };
          img.src = url;
        });
      })
    ).then(function (results) {
      return results.filter(Boolean);
    });
  }

  // ── Build slides HTML ──
  function buildSlidesHTML(images) {
    return images
      .map(function (item, i) {
        var src = typeof item === 'string' ? item : item.url;
        var alt = typeof item === 'string' ? ('Curavet Pet Clinic - ' + (i + 1)) : (item.alt || 'Curavet Pet Clinic');
        // Prefix relative paths
        if (src && !src.startsWith('http') && !src.startsWith('/')) {
          src = '/' + src;
        }
        return '<div class="hero__slide' + (i === 0 ? ' active' : '') + '">' +
          '<img src="' + src + '" alt="' + alt + '" loading="' + (i === 0 ? 'eager' : 'lazy') + '">' +
          '</div>';
      })
      .join('');
  }

  // ── Initialize or re-initialize the slider ──
  var currentTimer = null;
  var currentIndex = 0;

  function initSlider(images, container) {
    if (!container || images.length === 0) return;

    var slidesContainer = container.querySelector('.hero__slider-track');
    var prevBtn = container.querySelector('.hero__slider-prev');
    var nextBtn = container.querySelector('.hero__slider-next');

    if (!slidesContainer) return;

    // Clear any existing timer
    if (currentTimer) {
      clearInterval(currentTimer);
      currentTimer = null;
    }

    // Build slides
    slidesContainer.innerHTML = buildSlidesHTML(images);

    var slides = slidesContainer.querySelectorAll('.hero__slide');
    currentIndex = 0;

    function goTo(index) {
      if (slides[currentIndex]) slides[currentIndex].classList.remove('active');
      currentIndex = (index + slides.length) % slides.length;
      if (slides[currentIndex]) slides[currentIndex].classList.add('active');
    }

    function next() {
      goTo(currentIndex + 1);
    }

    function prev() {
      goTo(currentIndex - 1);
    }

    function startTimer() {
      currentTimer = setInterval(next, SLIDE_INTERVAL);
    }

    function resetTimer() {
      if (currentTimer) clearInterval(currentTimer);
      startTimer();
    }

    // Remove old listeners by cloning buttons
    if (prevBtn) {
      var newPrev = prevBtn.cloneNode(true);
      prevBtn.parentNode.replaceChild(newPrev, prevBtn);
      newPrev.addEventListener('click', function () { prev(); resetTimer(); });
      prevBtn = newPrev;
    }
    if (nextBtn) {
      var newNext = nextBtn.cloneNode(true);
      nextBtn.parentNode.replaceChild(newNext, nextBtn);
      newNext.addEventListener('click', function () { next(); resetTimer(); });
      nextBtn = newNext;
    }

    if (slides.length > 1) {
      startTimer();
      container.addEventListener('mouseenter', function () {
        if (currentTimer) clearInterval(currentTimer);
      });
      container.addEventListener('mouseleave', startTimer);
      if (prevBtn) prevBtn.style.display = '';
      if (nextBtn) nextBtn.style.display = '';
    } else {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
    }
  }

  // ── Main init ──
  async function init() {
    var container = document.querySelector('.hero__slider');
    if (!container) return;

    // 1. Start immediately with fallback images
    var fallbackImages = await loadFallbackImages();
    if (fallbackImages.length > 0) {
      initSlider(fallbackImages, container);
    }

    // 2. Fetch dynamic images in background
    var dynamicImages = await loadDynamicImages();
    if (dynamicImages.length > 0) {
      // 3. Preload all dynamic images
      var urls = dynamicImages.map(function (img) { return img.url; });
      var loaded = await preloadImages(urls);

      if (loaded.length > 0) {
        // Filter to only successfully loaded images
        var validImages = dynamicImages.filter(function (img) {
          return loaded.indexOf(img.url) !== -1;
        });

        if (validImages.length > 0) {
          // 4. Swap in dynamic images with same animation
          initSlider(validImages, container);
        }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
