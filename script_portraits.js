const images = document.querySelectorAll('.album-img');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const closeBtn = document.getElementById('closeBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

let currentIndex = 0;

// Открытие модального окна
const openModal = (index) => {
  currentIndex = index;
  modal.classList.remove('hidden');
  modal.classList.add('flex'); // Добавляем flex для центрирования
  document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
  modalImg.src = images[currentIndex].src;
};

// Закрытие модального окна
const closeModal = () => {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = ''; // Возвращаем скролл
};

// Показать следующее фото
const showNext = (e) => {
  if (e) e.stopPropagation(); // Чтобы клик по кнопке не закрывал модалку
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
  // Запрет правого клика и перетаскивания
  img.addEventListener('contextmenu', (e) => e.preventDefault());
  img.setAttribute('draggable', 'false');
});

// Кнопки управления
closeBtn.addEventListener('click', closeModal);
nextBtn.addEventListener('click', showNext);
prevBtn.addEventListener('click', showPrev);

// Закрытие при клике на темную область (фон)
modal.addEventListener('click', (e) => {
  if (e.target === modal || e.target.classList.contains('modal-overlay')) {
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

// Защита изображения в модальном окне
modalImg.addEventListener('contextmenu', (e) => e.preventDefault());

/* Контейнер для фото в сетке */
#gallery > div {
    background-color: #f3f4f6; /* Светло-серый фон для пустых мест */
    transition: transform 0.3s ease;
}

#gallery > div:hover {
    transform: scale(1.02);
    z-index: 10;
}

/* Сами изображения */
.album-img {
    display: block;
    /* Убираем возможные зазоры */
    margin: auto; 
}

/* Настройка модального окна для центрирования любого типа фото */
#modalImg {
    max-width: 95vw;
    max-height: 90vh;
    object-contain: contain;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
}

modalImg.setAttribute('draggable', 'false');
