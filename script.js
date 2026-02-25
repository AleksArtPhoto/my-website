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
