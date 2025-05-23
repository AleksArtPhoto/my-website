const slider = document.getElementById('slider');
const slides = Array.from(slider.children);
let current = 0;

let autoRotateDelay = 3000; // Интервал автопрокрутки
let pauseDuration = 4000;   // Пауза после ручного действия
let autoRotateTimer = null;
let resumeTimer = null;

function updateSlider() {
  slides.forEach((slide, index) => {
    slide.className = 'slide';
    if (index === current) {
      slide.classList.add('active');
    } else if (index === current - 1 || (current === 0 && index === slides.length - 1)) {
      slide.classList.add('left');
    } else if (index === current + 1 || (current === slides.length - 1 && index === 0)) {
      slide.classList.add('right');
    } else {
      const diff = index - current;
      const wrapDiff = Math.abs(diff) > slides.length / 2
        ? -Math.sign(diff) * (slides.length - Math.abs(diff))
        : diff;
      if (wrapDiff < 0) slide.classList.add('hidden-left');
      else slide.classList.add('hidden-right');
    }
  });
}

function rotateSlider(direction) {
  current = (current + direction + slides.length) % slides.length;
  updateSlider();
  pauseAutoRotation();
}

function startAutoRotation() {
  clearTimeout(autoRotateTimer);
  autoRotateTimer = setTimeout(() => {
    rotateSlider(1);
    startAutoRotation(); // рекурсивно продолжаем прокрутку
  }, autoRotateDelay);
}

function pauseAutoRotation() {
  clearTimeout(autoRotateTimer);
  clearTimeout(resumeTimer);

  resumeTimer = setTimeout(() => {
    startAutoRotation();
  }, pauseDuration);
}

updateSlider();
startAutoRotation();


const text = `Hi! I’m AleksArtPhoto, a professional photographer with over 14 years of experience. For me, photography is a way to tell real stories through light, composition, and feeling.

I specialize in portrait, studio, love story, wedding, family, reportage, product, and interior photography. My goal is to go beyond beautiful images — I aim to capture authentic emotions and atmosphere.

Whether working with natural light or in a studio, I always create a relaxed, creative environment. Let’s make photos you’ll want to revisit time and time again.`;

  const words = text.split(/\s+/);
  let result = "";

  for (let i = 0; i < words.length; i++) {
    result += words[i] + " ";
    if ((i + 1) % 8 === 0) result += "\n";
  }

  document.getElementById("custom-text").textContent = result.trim();