/**
 * Hero Slider - Loads images from JSON, auto-slides every 3s, prev/next buttons
 */

(function () {
  'use strict';

  const SLIDE_INTERVAL = 3000;

  async function loadImages() {
    try {
      const res = await fetch('models/hero-images.json');
      const data = await res.json();
      return data.images && data.images.length ? data.images : ['assets/images/shop.jpeg'];
    } catch {
      return ['assets/images/shop.jpeg'];
    }
  }

  function initSlider(images) {
    const container = document.querySelector('.hero__slider');
    if (!container) return;

    const slidesContainer = container.querySelector('.hero__slider-track');
    const prevBtn = container.querySelector('.hero__slider-prev');
    const nextBtn = container.querySelector('.hero__slider-next');

    if (!slidesContainer || images.length === 0) return;

    slidesContainer.innerHTML = images
      .map(
        (src, i) =>
          `<div class="hero__slide ${i === 0 ? 'active' : ''}">
            <img src="${src}" alt="Curavet Pet Clinic - ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}">
          </div>`
      )
      .join('');

    const slides = slidesContainer.querySelectorAll('.hero__slide');
    let currentIndex = 0;

    function goTo(index) {
      slides[currentIndex].classList.remove('active');
      currentIndex = (index + slides.length) % slides.length;
      slides[currentIndex].classList.add('active');
    }

    function next() {
      goTo(currentIndex + 1);
      resetTimer();
    }

    function prev() {
      goTo(currentIndex - 1);
      resetTimer();
    }

    let timer;
    function startTimer() {
      timer = setInterval(next, SLIDE_INTERVAL);
    }

    function resetTimer() {
      clearInterval(timer);
      startTimer();
    }

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    if (slides.length > 1) {
      startTimer();
      container.addEventListener('mouseenter', () => clearInterval(timer));
      container.addEventListener('mouseleave', startTimer);
    } else {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }
  }

  async function init() {
    const images = await loadImages();
    initSlider(images);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
