let currentTab = 'b2c';

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

// === ОБНОВЛЕНИЕ SELECT ===
function updateServicesDropdown() {
  const select = document.getElementById('service-select');
  if (!select) return;

  select.innerHTML = '';

  services[currentTab].forEach(service => {
    const option = document.createElement('option');
    option.value = service.price;
    option.textContent = `${service.name} ($${service.price})`;
    select.appendChild(option);
  });

  updateTotal();
}

// === ЦЕНА ===
function updateTotal() {
  const select = document.getElementById('service-select');
  const total = document.getElementById('total-price');

  if (!select || !total) return;

  total.textContent = `$${select.value || 0}`;
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
      bg.style.left = '134px';
      txtB2C.style.color = '#6b7280';
      txtB2B.style.color = '#ffffff';
    } else {
      currentTab = 'b2c';
      bg.style.left = '4px';
      txtB2C.style.color = '#2c3e50';
      txtB2B.style.color = '#6b7280';
    }

    updateServicesDropdown();
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
  const stripe = Stripe('YOUR_PUBLIC_KEY'); // вставь ключ
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
  initToggle();
  initModal();
  initStripe();

  const select = document.getElementById('service-select');
  if (select) {
    select.addEventListener('change', updateTotal);
  }
});
