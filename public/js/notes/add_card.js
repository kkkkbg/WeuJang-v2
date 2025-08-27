const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get('note_id'); // 노트 ID 파라미터

document.addEventListener('DOMContentLoaded', function () {
    if(noteId) {
        const noteSelect = document.getElementById('note_id');
        noteSelect.value = noteId;
    }
});

// 카드 등록 버튼
document.getElementById('addCardForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    // console.log(Object.fromEntries(formData.entries()));
    const jsonData = {};
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    try {
        const response = await fetch('/note/add_card', {
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
            alert('카드 등록 성공!');
            // 수첩을 제외한 나머지 값 초기화
            document.getElementById('addCardForm').reset();
            document.getElementById('note_id').value = jsonData["note_id"];
        }
    } catch (error) {
        console.error('예외 발생:', error);
        alert('네트워크 오류가 발생했습니다.');
    }
});

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
            window.location.href = '/add_card';
        }
        
    } catch (error) {
        console.error('예외 발생:', error);
        alert('네트워크 오류가 발생했습니다.');
    }
});