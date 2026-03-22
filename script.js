/* ======================================
PORTFOLIO IMAGE AUTO ROTATION
====================================== */

document.addEventListener("DOMContentLoaded", () => {

  const rotators = document.querySelectorAll(".portfolio-rotator");

  rotators.forEach(rotator => {

    const images = rotator.querySelectorAll("img");

    // если картинка одна — ничего не запускаем
    if (images.length < 2) return;

    let index = 0;

    setInterval(() => {

      images[index].classList.remove("active");

      index++;
      if (index >= images.length) index = 0;

      images[index].classList.add("active");

    }, 3000); // смена каждые 3 секунды

  });

});

/* ======================================
BACK TO TOP BUTTON
   ====================================== */

document.addEventListener("DOMContentLoaded", () => {
  const backToTopBtn = document.getElementById("backToTop");

  // Если кнопки нет в HTML, выходим, чтобы не было ошибок
  if (!backToTopBtn) return;

  // Логика показа/скрытия при скролле
  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.style.display = "block";
    } else {
      backToTopBtn.style.display = "none";
    }
  });

  // Логика клика
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
    // Получаем все элементы переключателя
    const toggleContainer = document.getElementById('toggle-container');
    const toggleBg = document.getElementById('toggle-bg');
    const textB2C = document.getElementById('text-b2c');
    const textB2B = document.getElementById('text-b2b');
    
    // Получаем контейнеры с контентом
    const b2cContent = document.getElementById('b2c-content');
    const b2bContent = document.getElementById('b2b-content');

    // Проверка на наличие элементов (чтобы не было ошибок в консоли)
    if (!toggleContainer || !b2cContent || !b2bContent) return;

    let isBusinessMode = false;

    // Установка начального состояния (Individuals - Скандинавский серый)
    toggleBg.style.left = '4px';
    toggleBg.style.background = '#e2e8f0'; // Soft Slate Gray
    textB2C.style.color = '#1e293b';       // Dark Slate
    textB2B.style.color = '#94a3b8';       // Muted Gray

    // Функция переключения
    toggleContainer.addEventListener('click', () => {
        isBusinessMode = !isBusinessMode;

        if (isBusinessMode) {
            // СОСТОЯНИЕ: BUSINESS (Глубокий нордический синий)
            // Используем calc для точности на разных экранах
            toggleBg.style.left = 'calc(100% - 142px)'; 
            toggleBg.style.background = '#2c3e50'; // Deep Nordic Blue
            
            // Цвета текста
            textB2B.style.color = '#ffffff';       // Белый на синем
            textB2C.style.color = '#94a3b8';       // Приглушаем неактивный
            
            // Видимость блоков
            b2cContent.classList.add('hidden');
            b2bContent.classList.remove('hidden');
        } else {
            // СОСТОЯНИЕ: INDIVIDUALS (Светлый скандинавский камень)
            toggleBg.style.left = '4px';
            toggleBg.style.background = '#d8e0e9'; 
            
            // Цвета текста
            textB2C.style.color = '#1e293b';       // Темный на светлом
            textB2B.style.color = '#94a3b8';       // Приглушаем неактивный
            
            // Видимость блоков
            b2bContent.classList.add('hidden');
            b2cContent.classList.remove('hidden');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.onclick = function(e) {
            e.preventDefault();
            // Переключаем класс hidden
            if (mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.add('flex');
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('flex');
            }
        };

        // Закрываем при клике на ссылки
        const links = mobileMenu.querySelectorAll('a');
        links.forEach(link => {
            link.onclick = () => {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('flex');
            };
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const pToggle = document.getElementById('portfolio-toggle-container');
    const pBg = document.getElementById('portfolio-toggle-bg');
    const textPhoto = document.getElementById('text-photo');
    const textVideo = document.getElementById('text-video');
    
    const photoContent = document.getElementById('photo-portfolio');
    const videoContent = document.getElementById('video-portfolio');

    if (!pToggle) return;

    let isVideoMode = false;

    pToggle.addEventListener('click', () => {
        isVideoMode = !isVideoMode;

        if (isVideoMode) {
            // Переключаем на VIDEO (Nordic Blue)
            pBg.style.left = '138px';
            pBg.style.background = '#2c3e50';
            pBg.style.border = '1px solid #2c3e50';
            
            textVideo.style.color = '#ffffff';
            textPhoto.style.color = '#94a3b8';
            
            photoContent.classList.add('hidden');
            videoContent.classList.remove('hidden');
        } else {
            // Переключаем на PHOTO (Stone Gray)
            pBg.style.left = '4px';
            pBg.style.background = '#e2e8f0';
            pBg.style.border = '1px solid #cbd5e1';
            
            textPhoto.style.color = '#1e293b';
            textVideo.style.color = '#94a3b8';
            
            videoContent.classList.add('hidden');
            photoContent.classList.remove('hidden');
        }
    });
});
