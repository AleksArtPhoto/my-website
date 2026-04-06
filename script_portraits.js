const images = document.querySelectorAll('.album-img');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const closeBtn = document.getElementById('closeBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

let currentIndex = 0;

// Открытие модального окна
const openModal = (index) => {
  if (!modal || !modalImg) return;
  currentIndex = index;
  
  // ИСПРАВЛЕНО: присваиваем src именно картинке (modalImg), а не контейнеру (modal)
  modalImg.src = images[currentIndex].src; 
  
  modal.classList.remove('hidden');
  modal.classList.add('flex'); // Показываем через flex для центрирования
  document.body.style.overflow = 'hidden'; 
};

// Закрытие модального окна
const closeModal = () => {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = ''; 
};

// Показать следующее фото
const showNext = (e) => {
  if (e) e.stopPropagation();
  currentIndex = (currentIndex + 1) % images.length;
  modalImg.src = images[currentIndex].src;
};

// Показать предыдущее фото
const showPrev = (e) => {
  if (e) e.stopPropagation();
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  modalImg.src = images[currentIndex].src;
};

// Навешиваем клик на каждое изображение в галерее
images.forEach((img, index) => {
  img.addEventListener('click', () => openModal(index));
  img.addEventListener('contextmenu', (e) => e.preventDefault());
  img.setAttribute('draggable', 'false');
});

// Кнопки управления
if (closeBtn) closeBtn.addEventListener('click', closeModal);
if (nextBtn) nextBtn.addEventListener('click', showNext);
if (prevBtn) prevBtn.addEventListener('click', showPrev);

// Закрытие при клике на фон
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

// Управление клавиатурой
document.addEventListener('keydown', (e) => {
  if (modal.classList.contains('hidden')) return;
  
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === 'Escape') closeModal();
});

// Защита изображения
if (modalImg) {
  modalImg.addEventListener('contextmenu', (e) => e.preventDefault());
  modalImg.setAttribute('draggable', 'false');
}

