
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.notice-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.url;
        if (url) window.location.href = url;
      });
    });
  });