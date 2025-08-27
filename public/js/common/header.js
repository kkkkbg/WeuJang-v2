document.querySelectorAll('.note-title-detail').forEach(span => {
    addTitleEditListeners(span);
});

function addTitleEditListeners(span) {
    let timer;
    const LONG_PRESS_DURATION = 500;

    const newSpan = span.cloneNode(true);
    span.replaceWith(newSpan);

    newSpan.addEventListener('dblclick', () => enterEditMode(newSpan));
    newSpan.addEventListener('mousedown', () => {
        timer = setTimeout(() => enterEditMode(newSpan), LONG_PRESS_DURATION);
    });
    newSpan.addEventListener('mouseup', () => clearTimeout(timer));
    newSpan.addEventListener('mouseleave', () => clearTimeout(timer));
    newSpan.addEventListener('touchstart', () => {
        timer = setTimeout(() => enterEditMode(newSpan), LONG_PRESS_DURATION);
    });
    newSpan.addEventListener('touchend', () => clearTimeout(timer));
    newSpan.addEventListener('touchcancel', () => clearTimeout(timer));
}

function enterEditMode(span) {
    const currentTitle = span.textContent.trim(); // 여기서 기존 텍스트 가져오기

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentTitle; // 기존 텍스트 그대로 넣기
    input.maxLength = 15;
    input.placeholder = '제목을 입력하세요';
    input.className = 'note-title-input-detail';
        // 슬래시(/) 입력 방지(구분자 사용 방지)
        input.addEventListener('input', () => {
            if (input.value.includes('/')) {
                input.value = input.value.replace(/\//g, '');
            }
        });
    span.replaceWith(input);
    input.focus();

    const restoreSpan = (title) => {
        const newSpan = document.createElement('div');
        newSpan.textContent = title;
        newSpan.className = 'note-title-detail';
        input.replaceWith(newSpan);
        addTitleEditListeners(newSpan);
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') input.blur();
        if (e.key === 'Escape') restoreSpan(currentTitle);
    });

    input.addEventListener('blur', async () => {
        const newTitle = input.value.trim();
        if (!newTitle || newTitle === currentTitle) {
            restoreSpan(currentTitle);
            return;
        }

        // POST 전송
        try {
            const response = await fetch('/note/upd_note', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note_id: noteId, title: newTitle }) // note_id 없으면 제목만 전송
            });
            const data = await response.json();
            if (response.ok) {
                restoreSpan(newTitle);
            } else {
                alert(data.message || "저장 실패");
                restoreSpan(currentTitle);
            }
        } catch (err) {
            console.error(err);
            alert("저장 중 오류 발생");
            restoreSpan(currentTitle);
        }
    });
}