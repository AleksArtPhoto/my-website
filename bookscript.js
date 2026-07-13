// 1. Инициализация Stripe фронтенд SDK. (Замените pk_test_... на ваш ключ из ЛК Stripe)
const stripe = Stripe('pk_test_51TsjW52OiI7C4UiJ2CvPzcnwl1b6a3URDnthT3j81ZQS57TZTvFsVhn9qlYSz4vCdPuNSDCsL98mNWaGw7D1fPYP002hNzDntt'); 
let elements;
let cardElement;

// Base данных ваших услуг и тарифов DKK
const servicesData = {
  b2c: [
    { id: "mini", name: "Mini Session", price: 2500 },
    { id: "standard", name: "Standard Session", price: 4500 },
    { id: "signature", name: "Signature Session", price: 6500 },
    { id: "private", name: "Private Event", price: 5500 },
    { id: "wedding", name: "Wedding Essentials", price: 12500 },
    { id: "fullday", name: "Full Day Story", price: 22000 },
    { id: "reels", name: "Lifestyle Reels", price: 3500 },
    { id: "cinematic", name: "Cinematic Love Story", price: 6000 },
    { id: "family", name: "Family Documentary", price: 8500 },
    { id: "filmlook", name: "Digital Film Look", price: 3500 },
    { id: "proedit", name: "Pro Edit (Your Photos)", price: 1500 },
    { id: "fineart", name: "Fine Art Retouch", price: 450 },
    { id: "restoration", name: "Photo Restoration", price: 600 },
    { id: "workshop", name: "Camera Photo Workshop", price: 2500 },
    { id: "review", name: "Portfolio Review", price: 1200 }
  ],
  b2b: [
    { id: "ecom_mini", name: "E-commerce Pack Mini", price: 3000 },
    { id: "comm_signature", name: "Commercial Signature Session", price: 6500 },
    { id: "premium_exp", name: "Premium Experience (Starts from)", price: 9500 },
    { id: "prod_basic", name: "Product Basic", price: 2800 },
    { id: "prod_brand", name: "Product Branding", price: 5500 },
    { id: "prod_camp", name: "Product Campaign (Starts from)", price: 9500 },
    { id: "interior_ess", name: "Interior Essential", price: 3500 },
    { id: "interior_std", name: "Interior Standard", price: 5500 },
    { id: "interior_prem", name: "Interior Premium (Starts from)", price: 8500 },
    { id: "social_clip", name: "Social Clip", price: 3500 },
    { id: "social_plus", name: "Social Plus", price: 5500 },
    { id: "brand_intro", name: "Brand Intro Video", price: 7500 },
    { id: "biz_promo", name: "Business Promo", price: 9500 },
    { id: "comm_pkg", name: "Commercial Package (Starts from)", price: 15000 },
    { id: "property_vid", name: "Property Video", price: 4500 },
    { id: "logo_anim", name: "Logo Animation (Starts from)", price: 1500 },
    { id: "motion_basic", name: "Motion Graphics Basic", price: 1800 },
    { id: "motion_ctx", name: "Context Motion Graphics (Starts from)", price: 2500 },
    { id: "motion_upgrade", name: "Social Motion Upgrade", price: 3500 }
  ]
};

let currentTab = 'b2c';
let selectedTimeStart = null;
const bookedSlots = {}; 

function updateServicesDropdown() {
  const select = document.getElementById('services-select');
  select.innerHTML = '';
  servicesData[currentTab].forEach(service => {
    const option = document.createElement('option');
    option.value = service.id;
    option.dataset.price = service.price;
    option.textContent = `${service.name} — ${service.price} DKK`;
    select.appendChild(option);
  });
  calculateTotalPrice();
}

function calculateTotalPrice() {
  const select = document.getElementById('services-select');
  if(!select.selectedOptions || select.selectedOptions.length === 0) return 0;
  const basePrice = parseInt(select.selectedOptions[0].dataset.price || 0);
  document.getElementById('live-price-display').textContent = `Current Price: ${basePrice} DKK`;
  return basePrice;
}

document.getElementById('toggle-container').addEventListener('click', () => {
  const bg = document.getElementById('toggle-bg');
  const txtB2C = document.getElementById('text-b2c');
  const txtB2B = document.getElementById('text-b2b');

  if (currentTab === 'b2c') {
    currentTab = 'b2b';
    bg.style.left = '134px';
    txtB2C.className = 'relative z-10 flex-1 text-center text-sm font-bold transition-colors duration-300 text-gray-500';
    txtB2B.className = 'relative z-10 flex-1 text-center text-sm font-bold transition-colors duration-300 text-white';
  } else {
    currentTab = 'b2c';
    bg.style.left = '4px';
    txtB2C.className = 'relative z-10 flex-1 text-center text-sm font-bold transition-colors duration-300 text-white';
    txtB2B.className = 'relative z-10 flex-1 text-center text-sm font-bold transition-colors duration-300 text-gray-500';
  }
  updateServicesDropdown();
  renderTimeSlots();
});

function showDateWarningIfNeeded() {
  const dateField = document.getElementById('datepicker');
  const warning = document.getElementById('date-warning');
  if (!dateField.value.trim()) {
    dateField.classList.add('border-red-500');
    warning.classList.remove('hidden');
    return true;
  } else {
    dateField.classList.remove('border-red-500');
    warning.classList.add('hidden');
    return false;
  }
}

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

document.getElementById('services-select').addEventListener('change', calculateTotalPrice);

document.getElementById('pay-button').addEventListener('click', async () => {
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

  const total = calculateTotalPrice();
  document.getElementById('total-price').textContent = `Total: ${total} DKK`;
  document.getElementById('payment-modal').classList.remove('modal-hidden');

  await initStripePayment(total, form);
});

async function initStripePayment(amount, formElement) {
  const formData = new FormData(formElement);
  const date = document.getElementById('datepicker').value;
  const selectEl = document.getElementById('services-select');
  
  const bookingData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    location: formData.get('location'),
    comment: formData.get('comment'),
    serviceId: selectEl.value,
    serviceName: selectEl.selectedOptions[0].textContent.split('—')[0].trim(),
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
    
    const { clientSecret } = await response.json();
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
    console.error('Stripe initialization failed:', err);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  updateServicesDropdown();

  document.getElementById('payment-modal').classList.add('hidden');
  
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('status') === 'success') {
    alert('🎉 Success! Your payment has been received and your session is successfully booked. Check your email!');
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('payment-modal').classList.add('hidden');
});

document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');

  if (btn && menu) {
    btn.addEventListener('click', function () {
      menu.classList.toggle('hidden');
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
    const toggleContainer = document.getElementById('toggle-container');
    const toggleBg = document.getElementById('toggle-bg');
    const textB2C = document.getElementById('text-b2c');
    const textB2B = document.getElementById('text-b2b');
    
    const b2cContent = document.getElementById('b2c-content');
    const b2bContent = document.getElementById('b2b-content');

    if (!toggleContainer || !toggleBg || !textB2C || !textB2B) return;

    let isBusinessMode = false;

    // стартовое состояние
    toggleBg.style.left = '4px';
    toggleBg.style.background = '#e2e8f0';
    textB2C.style.color = '#1e293b';
    textB2B.style.color = '#94a3b8';

    toggleContainer.addEventListener('click', () => {
        isBusinessMode = !isBusinessMode;

        if (isBusinessMode) {
            // 👉 вправо
            toggleBg.style.left = '164px';
            toggleBg.style.background = '#2c3e50';

            textB2B.style.color = '#ffffff';
            textB2C.style.color = '#94a3b8';

            if (b2cContent && b2bContent) {
                b2cContent.classList.add('hidden');
                b2bContent.classList.remove('hidden');
            }

        } else {
            // 👉 влево
            toggleBg.style.left = '4px';
            toggleBg.style.background = '#d8e0e9';

            textB2C.style.color = '#1e293b';
            textB2B.style.color = '#94a3b8';

            if (b2cContent && b2bContent) {
                b2bContent.classList.add('hidden');
                b2cContent.classList.remove('hidden');
            }
        }
    });
});
