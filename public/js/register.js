// 아이디 유효성 검사 및 중복 확인 
const userIdInput = document.getElementById('user_id');
const idChkMsg = document.getElementById('idCheckMsg');

// 영문 소문자, 숫자, 밑줄(_), 하이픈(-)만 허용
const idValidPattern = /^[a-z0-9_-]{5,20}$/;

let timeout = null;
function checkId() {
  const userId = userIdInput.value.trim();

  if (userId === "") {
    idChkMsg.textContent = "";
    return false;
  }

  if (!userId || userId.length < 5 || !idValidPattern.test(userId)) {
    idChkMsg.textContent = '* 5~20자의 영문 소문자, 숫자, 밑줄(_), 하이픈(-)만 사용 가능합니다';
    idChkMsg.className = "invalid";
    return false;
  }

  // 입력 지연 후 요청
  clearTimeout(timeout);
  timeout = setTimeout(async () => {
    try {
      const response = await fetch('/user/chkUserId?user_id=' + encodeURIComponent(userId));
      const result = await response.json();

      if (result.available) {
        idChkMsg.textContent = '* 사용 가능한 ID입니다.';
        idChkMsg.className = "valid";
        return true;
      } else {
        idChkMsg.textContent = '* 이미 사용 중인 ID입니다.';
        idChkMsg.className = "invalid";
        return false;
      }
    } catch (err) {
      console.error(err);
      idChkMsg.textContent = '* 확인 중 오류 발생';
      idChkMsg.className = "invalid";
      return false;
    }
  }, 500); // 0.5초 대기
}
userIdInput.addEventListener('input', checkId);

// 비밀번호 유효성 검사
const passwordInput = document.getElementById('password');
const pwCheckInput = document.getElementById('pwCheck');
const pwChkMsg = document.getElementById('pwCheckMsg');

// 8~20자의 영문 대/소문자, 숫자, 특수문자를 모두 사용해야함
const pwValidPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[{\]};:'",<.>/?\\|`~]).{8,20}$/;

function checkPasswordMatch() {
  const userPw = passwordInput.value.trim();

  pwChkMsg.textContent = "";
  if (userPw === "") {
    return false;
  }

  if (!userPw || userPw.length < 8 || !pwValidPattern.test(userPw)) {
    pwChkMsg.textContent = '* 8~20자의 영문 대/소문자, 숫자, 특수문자를 모두 사용해 주세요.';
    pwChkMsg.className = "invalid";
    return false;
  }

  if (passwordInput.value !== pwCheckInput.value) {
    pwChkMsg.textContent = '* 비밀번호가 일치하지 않습니다.';
    pwChkMsg.className = "invalid";
    return false;
  }

  return true;
}

passwordInput.addEventListener('input', checkPasswordMatch);
pwCheckInput.addEventListener('input', checkPasswordMatch);

// 회원가입 버튼
document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  if (idChkMsg.className != "valid") {
    alert("아이디를 확인해주세요");
    return;
  }

  if (!checkPasswordMatch()) {
    alert("비밀번호를 확인해주세요");
    return;
  }

  const formData = new FormData(this);
  // console.log(Object.fromEntries(formData.entries()));
  const jsonData = {};
  formData.forEach((value, key) => {
    jsonData[key] = value;
  });

  try {
    const response = await fetch('/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    });

    const result = await response.text();

    if (!response.ok) {
      alert(result); // 오류 메시지
      window.location.href = '/register';
    } else {
      alert('회원가입 성공');
      window.location.href = `/?user_id=${jsonData["user_id"]}`; //로그인 화면으로 이동
    }
  } catch (error) {
    console.error('예외 발생:', error);
    alert('네트워크 오류가 발생했습니다.');
  }
});