const images = document.querySelectorAll('.album-img');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const closeBtn = document.getElementById('closeBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const zoomSlider = document.getElementById('zoomSlider');

let currentIndex = 0;
let scale = 1;
let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let imgOffsetX = 0, imgOffsetY = 0;

const openModal = (index) => {
  currentIndex = index;
  modal.classList.remove('hidden');
  document.body.classList.add('grayscale-when-modal');
  resetZoom();
  modalImg.src = images[currentIndex].src;
};

const closeModal = () => {
  modal.classList.add('hidden');
  document.body.classList.remove('grayscale-when-modal');
  resetZoom();
};

const showNext = () => {
  currentIndex = (currentIndex + 1) % images.length;
  modalImg.src = images[currentIndex].src;
  resetZoom();
};

const showPrev = () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  modalImg.src = images[currentIndex].src;
  resetZoom();
};

const updateTransform = () => {
  modalImg.style.transform = `translate(${imgOffsetX}px, ${imgOffsetY}px) scale(${scale})`;
  modalImg.style.cursor = scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default';
};

const resetZoom = () => {
  scale = 1;
  zoomSlider.value = 1;
  imgOffsetX = 0;
  imgOffsetY = 0;
  updateTransform();
};

zoomSlider.addEventListener('input', () => {
  const previousScale = scale;
  scale = parseFloat(zoomSlider.value);

  // Плавное возвращение к центру
  if (scale < previousScale) {
    const progress = (scale - 1) / (previousScale - 1); // Доля уменьшения
    imgOffsetX *= progress;
    imgOffsetY *= progress;

    if (Math.abs(imgOffsetX) < 0.5) imgOffsetX = 0;
    if (Math.abs(imgOffsetY) < 0.5) imgOffsetY = 0;
  }

  updateTransform();
});

modalImg.addEventListener('mousedown', (e) => {
  if (scale <= 1) return;
  isDragging = true;
  dragStartX = e.clientX - imgOffsetX;
  dragStartY = e.clientY - imgOffsetY;
  modalImg.style.cursor = 'grabbing';
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  if (scale > 1) {
    modalImg.style.cursor = 'grab';
  } else {
    modalImg.style.cursor = 'default';
  }
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging || scale <= 1) return;
  imgOffsetX = e.clientX - dragStartX;
  imgOffsetY = e.clientY - dragStartY;
  updateTransform();
});

modalImg.addEventListener('touchstart', (e) => {
  if (scale <= 1) return;
  isDragging = true;
  const touch = e.touches[0];
  dragStartX = touch.clientX - imgOffsetX;
  dragStartY = touch.clientY - imgOffsetY;
  modalImg.style.cursor = 'grabbing';
});

modalImg.addEventListener('touchend', () => {
  isDragging = false;
  if (scale > 1) {
    modalImg.style.cursor = 'grab';
  } else {
    modalImg.style.cursor = 'default';
  }
});

modalImg.addEventListener('touchmove', (e) => {
  if (!isDragging || scale <= 1) return;
  const touch = e.touches[0];
  imgOffsetX = touch.clientX - dragStartX;
  imgOffsetY = touch.clientY - dragStartY;
  updateTransform();
});

modal.addEventListener('wheel', (e) => {
  if (modal.classList.contains('hidden')) return;
  e.preventDefault();
  const delta = e.deltaY < 0 ? 0.1 : -0.1;
  const previousScale = scale;
  scale = Math.min(3, Math.max(1, parseFloat((scale + delta).toFixed(2))));
  zoomSlider.value = scale;

  if (scale < previousScale) {
    const progress = (scale - 1) / (previousScale - 1);
    imgOffsetX *= progress;
    imgOffsetY *= progress;

    if (Math.abs(imgOffsetX) < 0.5) imgOffsetX = 0;
    if (Math.abs(imgOffsetY) < 0.5) imgOffsetY = 0;
  }

  updateTransform();
}, { passive: false });

images.forEach((img, index) => {
  img.addEventListener('click', () => openModal(index));
  img.addEventListener('contextmenu', (e) => e.preventDefault());
  img.setAttribute('draggable', 'false');
});

closeBtn.addEventListener('click', closeModal);
nextBtn.addEventListener('click', showNext);
prevBtn.addEventListener('click', showPrev);

document.addEventListener('keydown', (e) => {
  if (modal.classList.contains('hidden')) return;
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === 'Escape') closeModal();
});

modalImg.addEventListener('contextmenu', (e) => e.preventDefault());
modalImg.setAttribute('draggable', 'false');
