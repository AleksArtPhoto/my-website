// ==========================
// БАЗА УСЛУГ
// ==========================
const servicesData = {
  b2c: [
    { id: "mini", name: "Mini Session", price: 2500 },
    { id: "standard", name: "Standard Session", price: 4500 }
  ],
  b2b: [
    { id: "ecom_mini", name: "E-commerce Pack Mini", price: 3000 },
    { id: "comm_signature", name: "Commercial Signature Session", price: 6500 }
  ]
};

// ==========================
// СОСТОЯНИЕ
// ==========================
let currentType = "b2c";
let selectedServiceId = null;

// ==========================
// DOM
// ==========================
const select = document.getElementById("services-select");
const payButton = document.getElementById("pay-button");

const modal = document.getElementById("payment-modal");
const closeModal = document.getElementById("close-modal");

// toggle
const toggle = document.getElementById("toggle-container");
const toggleBg = document.getElementById("toggle-bg");
const textB2C = document.getElementById("text-b2c");
const textB2B = document.getElementById("text-b2b");

// ==========================
// ЗАПОЛНЕНИЕ SELECT
// ==========================
function renderServices() {
  select.innerHTML = '<option value="">Select service</option>';

  servicesData[currentType].forEach(service => {
    const option = document.createElement("option");
    option.value = service.id;
    option.textContent = `${service.name} — ${service.price} DKK`;
    select.appendChild(option);
  });
}

renderServices();

// ==========================
// ВЫБОР УСЛУГИ
// ==========================
select.addEventListener("change", () => {
  selectedServiceId = select.value;
  updatePrice();
});

// ==========================
// ОБНОВЛЕНИЕ ЦЕНЫ
// ==========================
function updatePrice() {
  const priceBox = document.getElementById("live-price-display");

  const service = servicesData[currentType].find(s => s.id === selectedServiceId);

  if (!service) {
    priceBox.textContent = "Current Price: 0 DKK";
    return;
  }

  priceBox.textContent = `Current Price: ${service.price} DKK`;
}

// ==========================
// ПЕРЕКЛЮЧАТЕЛЬ
// ==========================
let isB2C = true;

toggle.addEventListener("click", () => {
  isB2C = !isB2C;

  if (isB2C) {
    currentType = "b2c";
    toggleBg.style.left = "4px";
    textB2C.style.color = "#2c3e50";
    textB2B.style.color = "#6b7280";
  } else {
    currentType = "b2b";
    toggleBg.style.left = "134px";
    textB2B.style.color = "#2c3e50";
    textB2C.style.color = "#6b7280";
  }

  selectedServiceId = null;
  renderServices();
  updatePrice();
});

// ==========================
// ОТКРЫТИЕ МОДАЛКИ
// ==========================
payButton.addEventListener("click", () => {

  const service = servicesData[currentType].find(s => s.id === selectedServiceId);

  if (!service) {
    alert("Please select a service");
    return;
  }

  document.getElementById("total-price").textContent =
    `Total: ${service.price} DKK`;

  modal.classList.remove("modal-hidden");
});

// ==========================
// ЗАКРЫТИЕ
// ==========================
closeModal.addEventListener("click", () => {
  modal.classList.add("modal-hidden");
});
