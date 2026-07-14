let currentTab = 'b2c';

// === ДАННЫЕ ===
const services = {
  b2c: [
    { name: 'Basic Cleaning', price: 50 },
    { name: 'Deep Cleaning', price: 100 }
  ],
  b2b: [
    { name: 'Office Cleaning', price: 200 },
    { name: 'Warehouse Cleaning', price: 500 }
  ]
};

// === SELECT ===
function updateServicesDropdown() {
  const select = document.getElementById('service-select');
  if (!select) return;

  select.innerHTML = '<option value="">Select Service</option>';

  services[currentTab].forEach(service => {
    const option = document.createElement('option');
    option.value = service.price;
    option.textContent = `${service.name} ($${service.price})`;
    select.appendChild(option);
  });
}

// === PRICE ===
function updateTotal() {
  const select = document.getElementById('service-select');
  const total = document.getElementById('total-price');

  if (!select || !total) return;

  const price = select.value || 0;
  total.textContent = `$${price}`;
}

// === TOGGLE ===
function initToggle() {
  const container = document.getElementById('toggle-container');
  const bg = document.getElementById('toggle-bg');
  const txtB2C = document.getElementById('text-b2c');
  const txtB2B = document.getElementById('text-b2b');

  if (!container) return;

  container.addEventListener('click', () => {
    if (currentTab === 'b2c') {
      currentTab = 'b2b';
      if (bg) bg.style.left = '134px';
      if (txtB2C) txtB2C.style.color = '#6b7280';
      if (txtB2B) txtB2B.style.color = '#ffffff';
    } else {
      currentTab = 'b2c';
      if (bg) bg.style.left = '4px';
      if (txtB2C) txtB2C.style.color = '#2c3e50';
      if (txtB2B) txtB2B.style.color = '#6b7280';
    }

    updateServicesDropdown();
    updateTotal();
  });
}

// === МОДАЛКА ===
function initModal() {
  const modal = document.getElementById('payment-modal');
  const btn = document.getElementById('pay-button');

  if (!modal || !btn) return;

  btn.addEventListener('click', () => {
    modal.classList.remove('modal-hidden');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('modal-hidden');
    }
  });
}

// === STRIPE ===
function initStripe() {
  if (typeof Stripe === 'undefined') return;

  const stripe = Stripe('YOUR_PUBLIC_KEY');
  const checkoutBtn = document.getElementById('checkout-button');

  if (!checkoutBtn) return;

  checkoutBtn.addEventListener('click', async () => {
    const response = await fetch('/create-checkout-session', {
      method: 'POST'
    });

    const session = await response.json();
    stripe.redirectToCheckout({ sessionId: session.id });
  });
}

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
  updateServicesDropdown();

  const select = document.getElementById('service-select');
  if (select) {
    select.addEventListener('change', updateTotal);
  }

  initToggle();
  initModal();
  initStripe();
});
