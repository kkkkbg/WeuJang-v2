document.getElementById('addNoteBtn').addEventListener('click', () => {
    document.getElementById('noteModal').style.display = 'block';
});

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('noteModal').style.display = 'none';
});

// 수첩 생성
document.getElementById('noteForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(document.getElementById('noteForm'));
    console.log(Object.fromEntries(formData.entries()));
    const jsonData = {};
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    try {
        const response = await fetch('/note/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        });

        const result = await response.text();

        if (!response.ok) {
            alert(result); // 오류 메시지
        } else {
            alert('수첩 등록 성공!');
            window.location.href = '/upload_cards';
        }
    } catch (error) {
        console.error('예외 발생:', error);
        alert('네트워크 오류가 발생했습니다.');
    }
});

document.getElementById('uploadCardsForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // 폼의 기본 동작(페이지 이동) 막기

    const form = document.getElementById('uploadCardsForm');
    const formData = new FormData(form);
    console.log(Object.fromEntries(formData.entries()));

    try {
        const response = await fetch(form.action, {
            method: "POST",
            body: formData,
        });

        const result = await response.text();
        if (!response.ok) {
            alert(result); // 오류 메시지
        } else {
            alert('등록 성공!');
            window.location.href = '/main'; // 메인 페이지로 이동
        }
    } catch (error) {
        console.error('예외 발생:', error);
        alert('네트워크 오류가 발생했습니다.');
    }
});

document.getElementById("downloadExcelBtn").addEventListener("click", async() => {
    try {
        const response = await fetch('/note/download_sample');
  
        if (!response.ok) {
          // 실패 응답 처리 (예: 404, 500)
          const errorText = await response.text();
          alert(errorText);
          return;
        }
  
        // 성공 시: blob으로 파일 다운로드 처리
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '샘플파일.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        alert('다운로드 중 오류가 발생했습니다: ' + err.message);
      }
    });