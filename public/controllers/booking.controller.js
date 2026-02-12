/**
 * Booking Controller - Handles the "Book a Visit" modal form
 * Posts booking data to /api/bookings which saves to Firestore
 * Shows toast notifications for success/failure (non-blocking)
 */
(function () {
  'use strict';

  const BOOKING_API = '/api/bookings';

  /* ─── Toast Notification System ─── */
  function ensureToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, type) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast toast--' + type;

    var icon = type === 'success'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><path d="M20 6L9 17l-5-5"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>';

    toast.innerHTML = '<span class="toast__icon">' + icon + '</span><span class="toast__text">' + message + '</span>';
    container.appendChild(toast);

    // Trigger entrance animation
    requestAnimationFrame(function () {
      toast.classList.add('toast--visible');
    });

    // Auto-remove after 5 seconds
    setTimeout(function () {
      toast.classList.remove('toast--visible');
      toast.classList.add('toast--exit');
      setTimeout(function () { toast.remove(); }, 400);
    }, 5000);
  }

  /* ─── Modal Controls ─── */
  function openModal() {
    var modal = document.getElementById('bookingModal');
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var firstInput = modal.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus();
    }, 100);
  }

  function closeModal() {
    var modal = document.getElementById('bookingModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    resetForm();
  }

  function resetForm() {
    var form = document.getElementById('bookingForm');
    if (form) form.reset();
    hideMessage();
  }

  /* ─── In-modal validation messages ─── */
  function showMessage(text, type) {
    var msgEl = document.getElementById('bookingMessage');
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className = 'booking-modal__message booking-modal__message--' + type;
    msgEl.hidden = false;
  }

  function hideMessage() {
    var msgEl = document.getElementById('bookingMessage');
    if (msgEl) msgEl.hidden = true;
  }

  /* ─── Form Submit (background) ─── */
  function handleSubmit(e) {
    e.preventDefault();
    hideMessage();

    var form = e.target;

    // Gather data
    var data = {
      name: (form.querySelector('[name="bk_name"]')?.value || '').trim(),
      phone: (form.querySelector('[name="bk_phone"]')?.value || '').trim(),
      email: (form.querySelector('[name="bk_email"]')?.value || '').trim(),
      purpose: (form.querySelector('[name="bk_purpose"]')?.value || '').trim(),
      preferredDate: form.querySelector('[name="bk_date"]')?.value || '',
      preferredTime: form.querySelector('[name="bk_time"]')?.value || '',
      visitType: form.querySelector('[name="bk_visit_type"]')?.value || '',
      isEmergency: form.querySelector('[name="bk_emergency"]')?.checked || false,
    };

    // Client-side validation (keep modal open if invalid)
    if (!data.name) { showMessage('Please enter your name.', 'error'); return; }
    if (!data.phone) { showMessage('Please enter your phone number.', 'error'); return; }
    if (!data.purpose) { showMessage('Please describe the purpose of your visit.', 'error'); return; }

    // Validation passed — close modal immediately
    closeModal();

    // Submit in background & show toast when done
    fetch(BOOKING_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (err) {
            throw new Error(err.error || 'Booking failed');
          });
        }
        showToast('Booking submitted successfully! We will contact you shortly.', 'success');
      })
      .catch(function (err) {
        console.error('Booking error:', err);
        showToast(err.message || 'Failed to submit booking. Please try again.', 'error');
      });
  }

  /* ─── Init ─── */
  function init() {
    // Intercept "Book a Visit" buttons
    var bookBtns = document.querySelectorAll('[data-hero-cta-primary], [data-services-cta]');
    bookBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    });

    // Close button
    var closeBtn = document.querySelector('[data-booking-close]');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Backdrop close
    var backdrop = document.querySelector('[data-booking-backdrop]');
    if (backdrop) backdrop.addEventListener('click', closeModal);

    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    // Form submit
    var form = document.getElementById('bookingForm');
    if (form) form.addEventListener('submit', handleSubmit);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
