// 1. Инициализация Stripe фронтенд SDK. 
// Замените pk_test_... на ваш личный ПУБЛИЧНЫЙ ключ из ЛК Stripe (начинается на pk_test_)
const stripe = Stripe('pk_test_YOUR_PUBLIC_KEY_HERE'); 
let elements;
let cardElement;

let selectedServiceId = '';
let selectedServiceName = '';
let currentPrice = 0;
let selectedTimeStart = null;
const bookedSlots = {}; // Сюда бэкенд будет отдавать занятые часы, например: { '2026-07-15': ['12:00'] }

const indSelect = document.getElementById('individual-select');
const bizSelect = document.getElementById('business-select');

// Логика для меню физлиц (Individuals)
if(indSelect) {
  indSelect.addEventListener('change', () => {
    if (indSelect.value !== "") {
      if(bizSelect) bizSelect.value = ""; // Мгновенно сбрасываем бизнес-селект
      const option = indSelect.options[indSelect.selectedIndex];
      currentPrice = parseInt(option.dataset.price || 0);
      selectedServiceId = indSelect.value;
      selectedServiceName = option.text.split('—')[0].trim();
    } else {
      resetSelection();
    }
    updatePriceDisplay();
  });
}

// Логика для бизнес-меню (Business)
if(bizSelect) {
  bizSelect.addEventListener('change', () => {
    if (bizSelect.value !== "") {
      if(indSelect) indSelect.value = ""; // Мгновенно сбрасываем приватный селект
      const option = bizSelect.options[bizSelect.selectedIndex];
      currentPrice = parseInt(option.dataset.price || 0);
      selectedServiceId = bizSelect.value;
      selectedServiceName = option.text.split('—')[0].trim();
    } else {
      resetSelection();
    }
    updatePriceDisplay();
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

// Календарь Litepicker
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

// Генерация кнопок времени съемки
function renderTimeSlots() {
  const timeSlotsContainer = document.getElementById('time-slots');
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
    };
    timeSlotsContainer.appendChild(btn);
  }
}

// Обработка кнопки "Pay and Book"
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

// Отправка запроса на ваш бэкенд в Render
async function initStripePayment(amount, formElement) {
  const formData = new FormData(formElement);
  const date = document.getElementById('datepicker').value;
  
  const bookingData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    location: formData.get('location'),
    comment: formData.get('comment'),
    serviceId: selectedServiceId,
    serviceName: selectedServiceName,
    isGiftCertificate: document.getElementById('gift-certificate').checked,
    date: date,
    startTime: selectedTimeStart,
    amount: amount
  };

  try {
    const response = await fetch('https://onrender.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    
    if (!response.ok) throw new Error('Backend server error');

    const { clientSecret } = await response.json();
    
    document.getElementById('payment-modal').classList.remove('hidden');
    elements = stripe.elements({ clientSecret });
    
    cardElement = elements.create('payment');
    document.getElementById('card-element').innerHTML = ''; 
    cardElement.mount('#card-element');

    const paymentForm = document.getElementById('payment-form');
    paymentForm.onsubmit = async (e) => {
      e.preventDefault();
      document.getElementById('submit-stripe').disabled = true;
      document.getElementById('submit-stripe').textContent = 'Processing...';

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href + '?status=success',
          receipt_email: bookingData.email
        }
      });

      if (error) {
        const errorDiv = document.getElementById('card-errors');
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
        document.getElementById('submit-stripe').disabled = false;
        document.getElementById('submit-stripe').textContent = 'Pay Now';
      }
    };

  } catch (err) {
    console.error('Connection error:', err);
    alert('Could not connect to the backend server. Please verify that your Render service is active.');
  } finally {
    const payBtn = document.getElementById('pay-button');
    payBtn.disabled = false;
    payBtn.textContent = 'Pay and Book';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('status') === 'success') {
    alert('🎉 Success! Your payment has been received and your session is successfully booked. Check your email!');
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('payment-modal').classList.add('hidden');
});
