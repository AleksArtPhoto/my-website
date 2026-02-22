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
