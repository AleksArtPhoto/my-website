// ===== CONFIG =====
const API_BASE = window.BOOKING_API_BASE || '';
const stripe = Stripe(window.STRIPE_PUBLIC_KEY);

let elements;
let cardElement;

let selectedCategory = ''; // 'individual' | 'business'
let selectedServiceId = '';
let selectedServiceName = '';
let currentPrice = 0;
let selectedTimeStart = null;
let selectedDate = null;
let blockedTimesForDate = []; // filled from backend
let currentPaymentIntentId = null;

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 20;

// ===== SAFE GET =====
const $ = (id) => document.getElementById(id);

// ===== SERVICES (mutually exclusive selects) =====
const indSelect = $('individual-select');
const bizSelect = $('business-select');

function handleServiceChange(select, otherSelect, category) {
  if (!select) return;

  select.addEventListener('change', () => {
    if (select.value !== '') {
      // lock the other dropdown so only one service can be picked per booking
      if (otherSelect) {
        otherSelect.value = '';
        otherSelect.disabled = true;
      }

      const option = select.options[select.selectedIndex];
      currentPrice = parseInt(option.dataset.price || 0, 10);

      selectedCategory = category;
      selectedServiceId = select.value;
      selectedServiceName = option.text;
    } else {
      if (otherSelect) otherSelect.disabled = false;

      currentPrice = 0;
      selectedCategory = '';
      selectedServiceId = '';
      selectedServiceName = '';
    }

    updatePriceDisplay();
    updatePayButtonState();
  });
}

handleServiceChange(indSelect, bizSelect, 'individual');
handleServiceChange(bizSelect, indSelect, 'business');

// ===== PRICE =====
function updatePriceDisplay() {
  const el = $('live-price-display');
  if (el) el.textContent = `Current Price: ${currentPrice} DKK`;
}

// ===== DATE =====
function showDateWarningIfNeeded() {
  const dateField = $('datepicker');
  const warning = $('date-warning');

  if (!dateField || !dateField.value.trim()) {
    if (dateField) dateField.classList.add('border-red-500');
    if (warning) warning.classList.remove('hidden');
    return true;
  } else {
    if (dateField) dateField.classList.remove('border-red-500');
    if (warning) warning.classList.add('hidden');
    return false;
  }
}

// ===== CALENDAR =====
const picker = new Litepicker({
  element: $('datepicker'),
  format: 'YYYY-MM-DD',
  minDate: new Date(),
  setup: (picker) => {
    picker.on('selected', (date1) => {
      selectedDate = $('datepicker').value;
      selectedTimeStart = null;
      showDateWarningIfNeeded();
      loadAvailabilityAndRenderSlots();
      updatePayButtonState();
    });
  }
});

// ===== AVAILABILITY (fetched from backend) =====
async function loadAvailabilityAndRenderSlots() {
  const loading = $('slots-loading');
  blockedTimesForDate = [];

  if (!selectedDate) {
    renderTimeSlots();
    return;
  }

  if (loading) loading.classList.remove('hidden');

  try {
    const res = await fetch(`${API_BASE}/api/availability?date=${encodeURIComponent(selectedDate)}`);
    if (res.ok) {
      const data = await res.json();
      blockedTimesForDate = data.blocked || [];
    }
  } catch (err) {
    console.error('Could not load availability, showing all slots as open', err);
  } finally {
    if (loading) loading.classList.add('hidden');
    renderTimeSlots();
  }
}

// ===== TIME =====
function renderTimeSlots() {
  const container = $('time-slots');
  const display = $('selected-time-display');

  if (!container) return;

  container.innerHTML = '';
  const date = $('datepicker')?.value;

  if (!date) return;

  const now = new Date();
  const isToday = date === formatDate(now);

  for (let h = WORK_START_HOUR; h <= WORK_END_HOUR; h++) {
    const time = `${h.toString().padStart(2, '0')}:00`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'slot-btn';
    btn.textContent = time;

    const isPast = isToday && h <= now.getHours();
    const isBlocked = blockedTimesForDate.includes(time);

    if (isPast || isBlocked) {
      btn.disabled = true;
    }

    if (selectedTimeStart === time) {
      btn.classList.add('slot-btn-selected');
    }

    btn.onclick = () => {
      selectedTimeStart = time;
      if (display) display.textContent = `Selected: ${time}`;
      renderTimeSlots();
      updatePayButtonState();
    };

    container.appendChild(btn);
  }
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ===== CONTACT FORM VALIDATION =====
function getContactData() {
  const form = $('booking-form');
  const data = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    location: form.location.value.trim(),
    comment: form.comment.value.trim(),
  };
  return data;
}

function contactFormIsValid(data) {
  return data.name && data.email && data.phone && data.location;
}

// ===== PAY BUTTON =====
const payBtn = $('pay-button');

if (payBtn) {
  payBtn.addEventListener('click', async () => {
    const formError = $('form-error');
    if (formError) formError.classList.add('hidden');

    if (!selectedServiceId) {
      alert('Please select a service.');
      return;
    }

    if (showDateWarningIfNeeded()) return;

    if (!selectedTimeStart) {
      alert('Please select a time.');
      return;
    }

    if (currentPrice <= 0) {
      alert('Price error.');
      return;
    }

    const contact = getContactData();
    if (!contactFormIsValid(contact)) {
      if (formError) {
        formError.textContent = 'Please fill in name, email, phone and location before paying.';
        formError.classList.remove('hidden');
      }
      return;
    }

    payBtn.disabled = true;
    payBtn.textContent = 'Preparing payment...';

    try {
      const isGift = $('gift-certificate')?.checked || false;

      const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          serviceId: selectedServiceId,
          serviceName: selectedServiceName,
          price: currentPrice,
          isGift,
          date: selectedDate,
          time: selectedTimeStart,
          customer: contact,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'This time slot is no longer available. Please pick another.');
      }

      const { clientSecret, paymentIntentId } = await res.json();
      currentPaymentIntentId = paymentIntentId;

      $('total-price').textContent = `Total: ${currentPrice} DKK`;

      openModal();
      await initStripePayment(clientSecret);
    } catch (err) {
      if (formError) {
        formError.textContent = err.message;
        formError.classList.remove('hidden');
      }
    } finally {
      payBtn.disabled = false;
      payBtn.textContent = 'Pay and Book';
    }
  });
}

// ===== MODAL =====
function openModal() {
  $('payment-modal')?.classList.remove('hidden');
}

function closeModal() {
  $('payment-modal')?.classList.add('hidden');
}

window.addEventListener('DOMContentLoaded', () => {
  const modal = $('payment-modal');
  const closeBtn = $('close-modal');

  if (closeBtn) closeBtn.onclick = closeModal;

  // clicking the dark backdrop closes the modal; clicks inside
  // .modal-box are stopped from bubbling via onclick in the HTML
  if (modal) modal.addEventListener('click', closeModal);

  updatePayButtonState();
});

// ===== STRIPE =====
async function initStripePayment(clientSecret) {
  elements = stripe.elements();

  if (cardElement) {
    cardElement.unmount();
  }

  cardElement = elements.create('card');
  cardElement.mount('#card-element');

  const form = $('payment-form');

  form.onsubmit = async (e) => {
    e.preventDefault();

    const btn = $('submit-stripe');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      const err = $('card-errors');
      err.textContent = error.message;
      err.classList.remove('hidden');

      btn.disabled = false;
      btn.textContent = 'Pay Now';
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        // Ask the backend to finalize: it re-verifies the payment with
        // Stripe, locks the slot + next 2 hours, and sends the emails.
        await fetch(`${API_BASE}/api/finalize-booking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: currentPaymentIntentId }),
        });
      } catch (err) {
        console.error('Finalize call failed (webhook will still confirm it):', err);
      }

      alert('✅ Payment successful! A confirmation email is on its way to you.');
      location.reload();
    }
  };
}

// ===== STATE =====
function updatePayButtonState() {
  if (!payBtn) return;

  if (selectedServiceId && selectedTimeStart && currentPrice > 0) {
    payBtn.disabled = false;
  } else {
    payBtn.disabled = true;
  }
}
