const fabButton = document.getElementById("fab-button");
const fabMenu = document.getElementById("fab-menu");

fabButton.addEventListener("click", (e) => {
  e.preventDefault(); // 링크 이동 방지

  const isOpen = fabMenu.style.display === "flex";

  fabMenu.style.display = isOpen ? "none" : "flex";
  fabButton.classList.toggle("active", !isOpen);
});

// 메뉴 외 클릭 시 닫기
window.addEventListener("click", (e) => {
  const fabContainer = document.querySelector(".fab-container");
  if (!fabContainer.contains(e.target)) {
    fabMenu.style.display = "none";
    fabButton.classList.remove("active");
  }
});