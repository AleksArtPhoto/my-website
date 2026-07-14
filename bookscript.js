// ВНИМАНИЕ: Обязательно вставьте сюда ваш ПУБЛИЧНЫЙ ключ из ЛК Stripe (начинается на pk_test_)
const stripe = Stripe('pk_test_51TsjW52OiI7C4UiJ2CvPzcnwl1b6a3URDnthT3j81ZQS57TZTvFsVhn9qlYSz4vCdPuNSDCsL98mNWaGw7D1fPYP002hNzDntt'); 
let elements;
let cardElement;

let selectedServiceId = '';
let selectedServiceName = '';
let currentPrice = 0;
let selectedTimeStart = null;
const bookedSlots = {}; 

const indSelect = document.getElementById('individual-select');
const bizSelect = document.getElementById('business-select');

// Взаимоисключение меню физлиц
if(indSelect) {
  indSelect.addEventListener('change', () => {
    if (indSelect.value !== "") {
      if(bizSelect) bizSelect.value = ""; 
      const option = indSelect.options[indSelect.selectedIndex];
      currentPrice = parseInt(option.dataset.price || 0);
      selectedServiceId = indSelect.value;
      selectedServiceName = option.text.split('—')[0].trim();
    } else {
      resetSelection();
    }
    updatePriceDisplay();
    updatePayButtonState();
  });
}

// Взаимоисключение бизнес-меню
if(bizSelect) {
  bizSelect.addEventListener('change', () => {
    if (bizSelect.value !== "") {
      if(indSelect) indSelect.value = ""; 
      const option = bizSelect.options[bizSelect.selectedIndex];
      currentPrice = parseInt(option.dataset.price || 0);
      selectedServiceId = bizSelect.value;
      selectedServiceName = option.text.split('—')[0].trim();
    } else {
      resetSelection();
    }
    updatePriceDisplay();
    updatePayButtonState();
  });
}

function resetSelection() {
  currentPrice = 0;
  selectedServiceId = '';
  selectedServiceName = '';
}

function updatePriceDisplay() {
  const display = document.getElementById('live-price-display');
  if(display) display.textContent = `Current Price: ${currentPrice} DKK`;
}

function showDateWarningIfNeeded() {
  const dateField = document.getElementById('datepicker');
  const warning = document.getElementById('date-warning');
  if (!dateField || !dateField.value.trim()) {
    if(dateField) dateField.classList.add('border-red-500');
    if(warning) warning.classList.remove('hidden');
    return true;
  } else {
    if(dateField) dateField.classList.remove('border-red-500');
    if(warning) warning.classList.add('hidden');
    return false;
  }
}

// Инициализация календаря Litepicker
const picker = new Litepicker({
  element: document.getElementById('datepicker'),
  format: 'YYYY-MM-DD',
  minDate: new Date(),
  setup: (picker) => {
    picker.on('selected', () => {
      selectedTimeStart = null; 
      renderTimeSlots();
      showDateWarningIfNeeded();
    });
  }
});

function renderTimeSlots() {
  const timeSlotsContainer = document.getElementById('time-slots');
  const display = document.getElementById('selected-time-display');

  if(!timeSlotsContainer) return;
  timeSlotsContainer.innerHTML = '';
  
  const date = document.getElementById('datepicker').value;
  if (!date) return;

  const startHour = 9;
  const endHour = 20; 
  const bookedToday = bookedSlots[date] || [];

  for (let hour = startHour; hour <= endHour; hour++) {
    const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
    const isBooked = bookedToday.includes(timeLabel);
    const isSelected = selectedTimeStart === timeLabel;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = `Starts at ${timeLabel}`;
    btn.disabled = isBooked;
    btn.className = `slot-btn ${isSelected ? 'slot-btn-selected' : ''}`;

    btn.onclick = () => {
      selectedTimeStart = timeLabel;
      renderTimeSlots();

      // 👇 НОВОЕ: показываем выбранное время
      if(display) {
        display.textContent = `Selected time: ${timeLabel}`;
      }

      updatePayButtonState(); // 👈 активируем кнопку
    };

    timeSlotsContainer.appendChild(btn);
  }
}

document.getElementById('pay-button').addEventListener('click', async () => {
  if (selectedServiceId === "") {
    alert('Please select a service from either Individuals or Business menu.');
    return;
  }
  if (showDateWarningIfNeeded()) return;
  if (!selectedTimeStart) {
    alert('Please select a start time for your photoshoot.');
    return;
  }

  const form = document.getElementById('booking-form');
  const requiredFields = form.querySelectorAll('[required]');
  let valid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.classList.add('border-red-500');
      valid = false;
    } else {
      field.classList.remove('border-red-500');
    }
  });

  if (!valid) return;

  document.getElementById('total-price').textContent = `Total: ${currentPrice} DKK`;
  
  const payBtn = document.getElementById('pay-button');
  payBtn.disabled = true;
  payBtn.textContent = 'Connecting to server...';

  await initStripePayment(currentPrice, form);
});

async function initStripePayment(amount, formElement) {
  // ⚠️ ВРЕМЕННЫЙ ТЕСТ БЕЗ BACKEND

  document.getElementById('payment-modal').classList.remove('hidden');

  elements = stripe.elements();

  cardElement = elements.create('card');
  document.getElementById('card-element').innerHTML = '';
  cardElement.mount('#card-element');

  const paymentForm = document.getElementById('payment-form');

  paymentForm.onsubmit = async (e) => {
    e.preventDefault();

    const btn = document.getElementById('submit-stripe');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    // 🔥 тестовая карта Stripe
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      const errorDiv = document.getElementById('card-errors');
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('hidden');

      btn.disabled = false;
      btn.textContent = 'Pay Now';
    } else {
      alert('✅ Payment simulated successfully!');
      location.reload();
    }
  };
}

window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('status') === 'success') {
    alert('🎉 Success! Check your email for details.');
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

const closeBtn = document.getElementById('close-modal');

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    document.getElementById('payment-modal').classList.add('hidden');
  });
}
function updatePayButtonState() {
  const btn = document.getElementById('pay-button');
  if (!btn) return;

  if (selectedServiceId && selectedTimeStart && currentPrice > 0) {
    btn.disabled = false;
  } else {
    btn.disabled = true;
  }
}

const modal = document.getElementById('payment-modal');

if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
}

