// ===== INIT =====
const stripe = Stripe('pk_test_51TsjW52OiI7C4UiJ2CvPzcnwl1b6a3URDnthT3j81ZQS57TZTvFsVhn9qlYSz4vCdPuNSDCsL98mNWaGw7D1fPYP002hNzDntt');

let elements;
let cardElement;

let selectedServiceId = '';
let selectedServiceName = '';
let currentPrice = 0;
let selectedTimeStart = null;

// ===== SAFE GET =====
const $ = (id) => document.getElementById(id);

// ===== SERVICES =====
const indSelect = $('individual-select');
const bizSelect = $('business-select');

function handleServiceChange(select, otherSelect) {
  if (!select) return;

  select.addEventListener('change', () => {
    if (select.value !== "") {

      if (otherSelect) otherSelect.value = "";

      const option = select.options[select.selectedIndex];
      currentPrice = parseInt(option.dataset.price || 0);

      selectedServiceId = select.value;
      selectedServiceName = option.text;

    } else {
      currentPrice = 0;
      selectedServiceId = '';
      selectedServiceName = '';
    }

    updatePriceDisplay();
    updatePayButtonState();
  });
}

handleServiceChange(indSelect, bizSelect);
handleServiceChange(bizSelect, indSelect);

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
    picker.on('selected', () => {
      selectedTimeStart = null;
      renderTimeSlots();
      updatePayButtonState();
    });
  }
});

// ===== TIME =====
function renderTimeSlots() {
  const container = $('time-slots');
  const display = $('selected-time-display');

  if (!container) return;

  container.innerHTML = '';
  const date = $('datepicker')?.value;

  if (!date) return;

  for (let h = 9; h <= 20; h++) {
    const time = `${h.toString().padStart(2, '0')}:00`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = time;

    btn.onclick = () => {
      selectedTimeStart = time;

      if (display) display.textContent = `Selected: ${time}`;

      renderTimeSlots();
      updatePayButtonState();
    };

    container.appendChild(btn);
  }
}

// ===== PAY BUTTON =====
const payBtn = $('pay-button');

if (payBtn) {
  payBtn.addEventListener('click', async () => {

    if (!selectedServiceId) {
      alert('Select service');
      return;
    }

    if (showDateWarningIfNeeded()) return;

    if (!selectedTimeStart) {
      alert('Select time');
      return;
    }

    if (currentPrice <= 0) {
      alert('Price error');
      return;
    }

    $('total-price').textContent = `Total: ${currentPrice} DKK`;

    openModal();
    await initStripePayment(currentPrice);
  });
}

// ===== MODAL =====
function openModal() {
  $('payment-modal')?.classList.remove('hidden');
}

function closeModal() {
  $('payment-modal')?.classList.add('hidden');
}

// закрытие
window.addEventListener('DOMContentLoaded', () => {

  const modal = $('payment-modal');
  const closeBtn = $('close-modal');

  if (closeBtn) {
    closeBtn.onclick = closeModal;
  }

  if (modal) {
    modal.addEventListener('click', closeModal);
  }

  const box = document.querySelector('.modal-box');
  if (box) {
    box.addEventListener('click', (e) => e.stopPropagation());
  }
});

// ===== STRIPE =====
async function initStripePayment(amount) {

  if (!amount || amount <= 0) return;

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

    const { error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      const err = $('card-errors');
      err.textContent = error.message;
      err.classList.remove('hidden');

      btn.disabled = false;
      btn.textContent = 'Pay Now';
    } else {
      alert('✅ Payment success (test)');
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
