// ==========================
// БАЗА УСЛУГ (ОБЯЗАТЕЛЬНО)
// ==========================
const servicesData = {
  b2c: [
    { id: "mini", name: "Mini Session", price: 2500 },
    { id: "standard", name: "Standard Session", price: 4500 },
    { id: "signature", name: "Signature Session", price: 6500 }
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
const modal = document.getElementById("paymentModal");
const openBtn = document.getElementById("openPayment");
const closeBtn = document.getElementById("closeModal");
const payBtn = document.getElementById("payBtn");

// ==========================
// ВЫБОР УСЛУГИ (select)
// ==========================
const serviceSelect = document.getElementById("service");

serviceSelect.addEventListener("change", () => {
  selectedServiceId = serviceSelect.value;
});

// ==========================
// ПОЛЗУНОК B2C / B2B
// ==========================
const toggleBtns = document.querySelectorAll(".toggle-btn");
const slider = document.querySelector(".toggle-selection-bg");

toggleBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {

    toggleBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // двигаем ползунок
    slider.style.transform = `translateX(${index * 100}%)`;

    currentType = index === 0 ? "b2c" : "b2b";

    // сбрасываем выбор
    selectedServiceId = null;
    serviceSelect.value = "";
  });
});

// ==========================
// МОДАЛКА
// ==========================
openBtn.addEventListener("click", () => {

  const service = getSelectedService();

  if (!service) {
    alert("Выбери услугу");
    return;
  }

  modal.classList.add("active");
});

closeBtn.addEventListener("click", () => {
  modal.classList.remove("active");
});

// ==========================
// ПОЛУЧЕНИЕ УСЛУГИ
// ==========================
function getSelectedService() {
  return servicesData[currentType].find(s => s.id === selectedServiceId);
}

// ==========================
// ОПЛАТА (заглушка)
// ==========================
payBtn.addEventListener("click", () => {

  const service = getSelectedService();

  if (!service) {
    alert("Ошибка: услуга не найдена");
    return;
  }

  console.log("Оплата:", service.name, service.price);

  alert(`Оплата: ${service.name} — ${service.price} DKK`);

  modal.classList.remove("active");
});
