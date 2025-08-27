const emailCheckMsg = document.getElementById("emailCheckMsg");
const inputAuthCode = document.getElementById("authCode");
const btnSendEmail = document.getElementById("sendEmail");
var userAuthCode;

// 이메일 발송
async function sendAuthCode() {
  var userEmail = document.getElementById("email").value;
  console.log("userEmail :", userEmail);

  try {
    const response = await fetch('/user/sendAuthEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "email": userEmail })
    });

    const data = await response.json();

    // alert(data.message);
    emailCheckMsg.textContent = "* " + data.message;

    if (!response.ok) {
      emailCheckMsg.className = "invalid";
    } else {
      console.log("data.authCode", data.authCode);
      userAuthCode = data.authCode;
      emailCheckMsg.className = "valid";
      inputAuthCode.style.visibility = "visible"; // 인증번호 입력 창 활성화
      inputAuthCode.style.position = "relative"; // 인증번호 입력 창 활성화
      btnSendEmail.style.pointerEvents = "none"; // 버튼 비활성화
    }

  } catch (error) {
    console.error('인증번호 요청 실패:', error);
    emailCheckMsg.className = "invalid";
    emailCheckMsg.textContent = "* 서버 연결에 실패했습니다.";
    alert('서버 연결에 실패했습니다.');
  }
};

function checkAuthCodeMatch() {
  const input = inputAuthCode.value.trim();
  return userAuthCode == input;
}

// 확인 버튼
document.getElementById('findForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // 유효성 검사
  if (!inputAuthCode.value) {
    alert("인증 번호를 입력해주세요.");
    return;
  } else if (!checkAuthCodeMatch()) {
    alert("인증 번호가 일치하지 않습니다.");
    return;
  }

  const formData = new FormData(this);
  // console.log(Object.fromEntries(formData.entries()));
  const jsonData = {};
  formData.forEach((value, key) => {
    jsonData[key] = value;
  });

  // 계정 조회
  try {
    const response = await fetch('/user/findUserId', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    });

    const data = await response.json();
    if (!response.ok) {
      alert(result); // 오류 메시지
    } else {
      let paramObj = { opt: "pw" };
      if (data.user && data.user != null) {
        const user = data.user;
        Object.assign(paramObj, {
          user_id: user.user_id,
        });
        var queryParams = new URLSearchParams(paramObj);
        window.location.href = `/updatePw?${queryParams.toString()}`;
      } else {
        var queryParams = new URLSearchParams(paramObj);
        window.location.href = `/findResult?${queryParams.toString()}`;
      }
    }
  } catch (error) {
    console.error('예외 발생:', error);
    alert('네트워크 오류가 발생했습니다.');
  }
});