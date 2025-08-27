const cover = document.getElementById("cover");
const headerHight = document.querySelector('.header').offsetHeight; // 헤더 높이
    
let isDragging = false;
let offsetX, offsetY;

// PC용
cover.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - cover.getBoundingClientRect().left;
  offsetY = e.clientY - cover.getBoundingClientRect().top;
  cover.classList.add("dragging");
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    var menuWidth = document.querySelector('.menu-header').offsetWidth;
    const x = e.clientX + window.scrollX - offsetX - menuWidth;
    const y = e.clientY + window.scrollY - offsetY - headerHight;
    cover.style.left = `${x}px`;
    cover.style.top = `${y}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  cover.classList.remove("dragging");
});

// 모바일용
cover.addEventListener("touchstart", (e) => {
  isDragging = true;
  const touch = e.touches[0];
  offsetX = touch.clientX - cover.getBoundingClientRect().left;
  offsetY = touch.clientY - cover.getBoundingClientRect().top;
  cover.classList.add("dragging");
});

document.addEventListener("touchmove", (e) => {
  if (!isDragging) return;
  var menuWidth = document.querySelector('.menu-header').offsetWidth;
  const touch = e.touches[0];
  const x = touch.clientX + window.scrollX - offsetX - menuWidth;
  const y = touch.clientY + window.scrollY - offsetY - headerHight;
  cover.style.left = `${x}px`;
  cover.style.top = `${y}px`;
  e.preventDefault();
}, { passive: false });

document.addEventListener("touchend", () => {
  isDragging = false;
  cover.classList.remove("dragging");
});

// 토글
document.getElementById('coverfg').addEventListener('click', function () {
  if (!cover.classList.contains('show')) {
    const toggleOn = `
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Bootstrap Icons by The Bootstrap Authors - https://github.com/twbs/icons/blob/main/LICENSE.md --><g fill="currentColor"><path d="M7 5H3a3 3 0 0 0 0 6h4a5 5 0 0 1-.584-1H3a2 2 0 1 1 0-4h3.416q.235-.537.584-1"/><path d="M16 8A5 5 0 1 1 6 8a5 5 0 0 1 10 0"/></g></svg>        
          `;
    document.getElementById('coverfg').innerHTML = toggleOn;

    // 사용자가 선택한 가림판 css 적용
    const coverPanel = document.getElementById("cover");
    const backImage = document.getElementById("coverImage");
    const backText = document.getElementById("coverText");

    const saved = JSON.parse(localStorage.getItem("coverSettings"));
    if (saved) {
      // console.log(saved);
      //배경 색상,투명도 
      coverPanel.style.backgroundColor = saved.color;
      coverPanel.style.opacity = saved.opacity;

      //배경문구 
      backText.textContent = saved.text;
      backText.style.color = saved.text_color;
      backText.style.fontSize = saved.text_size + "px";

      //배경이미지
      if (!saved.Img) {
        backImage.src = "";
        backImage.style.display = "none";  // 깨진 아이콘 숨기기
      }
      else {
        backImage.src = saved.Img;
      }
    }

    cover.classList.add('show'); // 일단 보여야 크기 측정 가능

    // 한 프레임 기다렸다가 위치 설정
    requestAnimationFrame(() => {
      const x = window.scrollX + window.innerWidth / 2 - cover.offsetWidth / 2;
      const y = window.scrollY + window.innerHeight / 2 - cover.offsetHeight / 2;

      cover.style.left = `${x}px`;
      cover.style.top = `${y + 50}px`;
    });
  } else {
    const toggleOff = `
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Bootstrap Icons by The Bootstrap Authors - https://github.com/twbs/icons/blob/main/LICENSE.md --><g fill="currentColor"><path d="M9 11c.628-.836 1-1.874 1-3a4.98 4.98 0 0 0-1-3h4a3 3 0 1 1 0 6z"/><path d="M5 12a4 4 0 1 1 0-8a4 4 0 0 1 0 8m0 1A5 5 0 1 0 5 3a5 5 0 0 0 0 10"/></g></svg>
        `;
    document.getElementById('coverfg').innerHTML = toggleOff;
    cover.classList.remove('show');
  }
});
