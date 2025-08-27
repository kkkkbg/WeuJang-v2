document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.note-title').forEach(span => {
        addTitleEditListeners(span);
    });

    function addTitleEditListeners(span) {
        let timer;
        const LONG_PRESS_DURATION = 500;

        // span 복제 후 새 요소로 교체
        const newSpan = span.cloneNode(true);
        span.replaceWith(newSpan);

        // 더블클릭
        newSpan.addEventListener('dblclick', () => enterEditMode(newSpan));

        // 긴 누르기 (PC)
        newSpan.addEventListener('mousedown', () => {
            timer = setTimeout(() => enterEditMode(newSpan), LONG_PRESS_DURATION);
        });
        newSpan.addEventListener('mouseup', () => clearTimeout(timer));
        newSpan.addEventListener('mouseleave', () => clearTimeout(timer));

        // 긴 누르기 (Mobile)
        newSpan.addEventListener('touchstart', () => {
            timer = setTimeout(() => enterEditMode(newSpan), LONG_PRESS_DURATION);
        });
        newSpan.addEventListener('touchend', () => clearTimeout(timer));
        newSpan.addEventListener('touchcancel', () => clearTimeout(timer));
    }

    function enterEditMode(span) {
        const noteId = span.dataset.id;
        const noteTitle = span.dataset.title;
        const currentTitle = span.childNodes[0]?.textContent.trim() || '';

        // 로딩 인디케이터 & 수정 아이콘 제거
        const loader = document.createElement('span');
        loader.textContent = '저장 중...';
        loader.className = 'loading-indicator';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = noteTitle;
        input.maxLength = 15;
        input.placeholder = '제목을 입력하세요';
        input.className = 'note-title-input';
        // 슬래시(/) 입력 방지(구분자 사용 방지)
        input.addEventListener('input', () => {
            if (input.value.includes('/')) {
                input.value = input.value.replace(/\//g, '');
            }
        });
        span.replaceWith(input);
        input.focus();

        const restoreSpan = (title) => {
            const newSpan = document.createElement('span');
            newSpan.textContent = `${title.length > 8 ? title.substring(0, 8) + '...' : title}`;
            newSpan.className = 'note-title';
            newSpan.dataset.id = noteId;
            newSpan.dataset.title = title;

            const target = document.querySelector('.loading-indicator') || input;
            target.replaceWith(newSpan);
            addTitleEditListeners(newSpan);
        };

        input.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') input.blur();
            if (e.key === 'Escape') restoreSpan(currentTitle);
        });

        input.addEventListener('blur', async () => {
            const newTitle = input.value.trim();
            if (!newTitle || newTitle === currentTitle) {
                restoreSpan(currentTitle);
                return;
            }
            input.replaceWith(loader);
            try {
                const response = await fetch('/note/upd_note', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ note_id: noteId, title: newTitle })
                });

                const data = await response.json();
                if (response.ok) {
                    restoreSpan(newTitle);
                } else {
                    alert(data.message || "저장에 실패했습니다.");
                    restoreSpan(currentTitle);
                }
            } catch (error) {
                console.error('에러 발생:', error);
                alert("저장 중 오류 발생");
                restoreSpan(currentTitle);
            }
            finally {
                // window.location.href = "/main";
            }
        });
    }

    //검색
    const searchInput = document.getElementById('folder-search');

    searchInput.addEventListener('input', function () {
        const keyword = this.value.toLowerCase().trim();
        const items = document.querySelectorAll('.folder-item');

        items.forEach(item => {
            const titleEl = item.querySelector('.note-title');
            const title = titleEl.dataset.title.toLowerCase();

            if (title.includes(keyword)) {
                item.style.display = 'block'; // 보이기
            } else {
                item.style.display = 'none'; // 숨기기
            }
        });
    });

    //정렬
    document.getElementById('sort-select').addEventListener('change', function () {
        const sortBy = this.value;
        const grid = document.querySelector('.folder-grid');
        const items = Array.from(grid.querySelectorAll('.folder-item'));

        items.sort((a, b) => {
            const aTitle = a.querySelector('.note-title').dataset.title;
            const bTitle = b.querySelector('.note-title').dataset.title;

            if (sortBy === 'title') { // 제목순 
                return aTitle.localeCompare(bTitle);
            } else if (sortBy === 'latest') { // 최신순 
                const aId = parseInt(a.id);
                const bId = parseInt(b.id);
                return bId - aId; // 최신순 (ID 큰 게 최신이라 가정)
            } else if (sortBy === 'oldest') { // 오래된 순 
                const aId = parseInt(a.id);
                const bId = parseInt(b.id);
                return aId - bId;
            }
        });

        // 기존 내용 제거 후 정렬된 항목 다시 추가
        grid.innerHTML = '';
        items.forEach(item => grid.appendChild(item));
    });
    
    //수첩 삭제
  document.querySelectorAll('.delete-icon').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      const note_id = btn.dataset.id;
      const noteTitle = btn.dataset.title;
      const jsonData = { note_id };

      const confirmDelete = confirm(`"${noteTitle}" 수첩을 삭제하시겠습니까?\n삭제된 수첩은 복구할 수 없습니다.`);
      
      if (confirmDelete) {
        try {
          const res = await fetch(`/note/del_note`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
          });

          if (res.ok) {
            // 삭제 성공 → DOM에서 제거
            btn.closest('.folder-item').remove();
            alert(`"${noteTitle}" 수첩이 삭제되었습니다.`);
          } else {
            alert('삭제에 실패했습니다.');
          }
        } catch (err) {
          console.error('삭제 중 오류:', err);
          alert('삭제 중 오류가 발생했습니다.');
        }
      }
    });
  });
});

// 편집 모드
let editMode = false;

document.querySelector('.icon-set').addEventListener('click', function () {
    editMode = !editMode;

    document.querySelectorAll('.folder-link').forEach(item => {
        item.classList.toggle('editing', editMode);
    });

    const checkboxes = document.querySelectorAll('.delete-icon');
    checkboxes.forEach(cb => {
        cb.classList.toggle('hidden', !editMode);
    });
});
