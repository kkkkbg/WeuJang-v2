function disableReadonly() {
  document.getElementById("name").readOnly = false;
  document.getElementById("email").readOnly = false;
  document.getElementById("birth").readOnly = false;
  document.getElementById("save").style.display = "block";
  document.getElementById("createDt").style.display = "none";
  document.getElementById("password").style.display = "none";
}

async function saveUserInfo() {
  const formData = new FormData(document.getElementById('profileForm'));
  const jsonData = {};
  formData.forEach((value, key) => {
    jsonData[key] = value;
  });

  try {
    const response = await fetch('/user/setting/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    });

    const result = await response.json();
    alert(result.message); // 오류 메시지 출력
    window.location.href = `/user/setting`;

  } catch (error) {
    console.error('예외 발생:', error);
    alert('네트워크 오류가 발생했습니다.');
  }
}

function goChangePw() {
  let paramObj = { user_id: document.getElementById("user_id").value };
  var queryParams = new URLSearchParams(paramObj);
  window.location.href = `/user/setting/pw?${queryParams}`;
}