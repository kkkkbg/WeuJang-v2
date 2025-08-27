
const checkboxes = document.querySelectorAll('.hidden-checkbox');

checkboxes.forEach(cb => {
  cb.addEventListener('change', () => {
    const checkedCount = document.querySelectorAll('.hidden-checkbox:checked').length;
    if (checkedCount > 3) {
      cb.checked = false;
      alert("최대 3개까지 선택할 수 있습니다.");
    }
  });
});

// 모의고사 생성
document.getElementById('editExamForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const selectedNotes = document.querySelectorAll('input[name="notes"]:checked');
  if (selectedNotes.length === 0) {
    alert("수첩을 하나 이상 선택해주세요.");
    return;
  }

  const formData = new FormData(e.target);

  const jsonData = {};
  formData.forEach((value, key) => {
    if (jsonData[key]) {
      if (!Array.isArray(jsonData[key])) {
        jsonData[key] = [jsonData[key]];
      }
      jsonData[key].push(value);
    } else {
      jsonData[key] = value;
    }
  });
    postRedirect('/exam', jsonData);
});

// post 페이지이동
function postRedirect(url, data) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;

  for (const key in data) {
    const value = data[key];
    if (Array.isArray(value)) {
      value.forEach(v => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = v;
        form.appendChild(input);
      });
    } else {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }
  }

  document.body.appendChild(form);
  form.submit();
}