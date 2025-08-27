const noteList = document.querySelector('.note-list');
const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get('note_id'); // 원하는 노트 ID
let page = parseInt(urlParams.get('page')) || 1;    // 원하는 페이지 번호
let loading = false;
let done = false; // 데이터 끝났는지 여부
let html = "";
let sort = "";

document.addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('.note-container');
  container.addEventListener("scroll", handleScroll); // note-container에 스크롤 이벤트 등록

  getCard();  // DOM이 로드된 후 자동 실행
  getNoteInfo();  //제목 정보 가져오기
});

async function getNoteInfo() {
  try {
    const jsonData = { note_id: noteId };

    const response = await fetch('/note/get_note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData)
    });

    const data = await response.json();
    // //const result = await response.text();

    if (!response.ok) {
      // 오류 
    } else {
      // var data = '';
      // data = JSON.parse(result);
      document.querySelector('.note-title-detail').textContent = data[0].title;
    }

  } catch (error) { console.error('수첩정보 요청 실패:', error); }
}

//카드 목록 가져오기
async function getCard() {
  if (loading || done) return;
  loading = true; // 로딩 상태 설정
  try {
    fetch(`/api/cards?note_id=${noteId}&page=${page}&sort=${sort}`)
      .then(res => res.json())
      .then(data => {
        const cards = data.cards;
        if (!cards || cards.length === 0) {
          if (page == 1) {
            document.querySelector('.note-container').innerHTML
              = `<a class="no-data" href="/add_card?note_id=${noteId}">등록된 문제가 없습니다.</>`;
          }
          done = true; // 더 이상 데이터 없음 표시
          return;
        }
        for (let i = 0; i < cards.length; i++) {
          var heart_fivefg = false;

          // 북마크
          if (cards[i].bookmark == '1') {
            html += `<li class="note-row yellow-border" data-index="${cards[i].card_id}" >`
          } else {
            html += `<li class="note-row" data-index="${cards[i].card_id}" >`
          }
          html += `     <input type="hidden" value="${cards[i].wrongCnt}" id="wrongCnt_${cards[i].card_id}"></input>
                        <input type="hidden" value="${cards[i].bookmark}" id="txtBookmark_${cards[i].card_id}"></input>
                        <input type="hidden" value="${cards[i].num}" id="cardNum_${cards[i].card_id}"></input>
                    <div class="left"> 
                    <span id="spanBookmark_${cards[i].card_id}">`

          html += `   </span>
                      <div class="meta">
                        <span class="spanHeart" id="heart_${cards[i].card_id}" onclick="setWrongCnt(${cards[i].card_id})" >`;
          // 하트(틀린갯수)표시
          for (let j = 0; j < cards[i].wrongCnt; j++) {
            html += `       <img src="/images/heart.png" alt="틀림" class="img-heart"/>`
            if (j >= 4) { heart_fivefg = true; break; }
          }
          if (!heart_fivefg) {
            html += `       <img src="/images/heart-empty.png" alt="틀림" class="img-heart"/>`;
          }
          html += `     </span>`
          // 힌트 표시
          if (cards[i].hint) {
            html += `  <span class="hint-btn" id="spanHint_${cards[i].card_id}" data-hint="${cards[i].hint}">❓</span>`
          } else {
            html += `  <span class="hint-btn hidden" id="spanHint_${cards[i].card_id}" data-hint="">❓</span>`
          }
          html += `    </div>
                    ${cards[i].num}. <span id='spanTextLeft_${cards[i].card_id}' class='spanTextLefts'>${cards[i].question}</span>
                    </div>
                    <div class="right">
                      <div class="settings-icon">
                        <img id="dots-button_${cards[i].card_id}" src="/images/dots.png" alt="설정" />
                          <!-- 팝업 메뉴 -->
                          <div class="dots-menu" id="dots-menu_${cards[i].card_id}">
                            <p onclick="editCard(${cards[i].card_id})">문제 편집</p>
                            <p onclick="delCard(${cards[i].card_id})">문제 삭제</p>`
          // 북마크 설정 문구
          if (cards[i].bookmark == '1') {
            html += `         <p id='pBookmarkSet_${cards[i].card_id}' onclick="setBookmark(${cards[i].card_id})">북마크 해제</p>`
          } else {
            html += `         <p id='pBookmarkSet_${cards[i].card_id}' onclick="setBookmark(${cards[i].card_id})">북마크 적용</p>`
          }
          html += `      </div>
                      </div>
                      <span id='spanTextRigth_${cards[i].card_id}' class='spanTextRigths'>${cards[i].answer}</span>
                      <div id="answer-actions_${cards[i].card_id}" class="answer-actions">
                        <button class="edit-save-btn hidden" onclick="cardEditSave(${cards[i].card_id})">저장</button>
                        <button class="edit-cancel-btn hidden" onclick="cardEditCancel(${cards[i].card_id})">취소</button>
                      </div>
                    </div>
                   </li>`;
        }
        noteList.innerHTML = html;

        getNoteBookmarkList(noteId); //북마크 목록

        setQnAColor(); // 문제,답 색상 설정 적용
      })
      .catch(err => {
        console.error("카드 불러오기 실패:", err);
      });
  } catch (error) { console.error('카드 요청 실패:', error); }
  finally {
    loading = false;
  }
}

// 스크롤 이벤트(페이징)
function handleScroll() {
  try {
    const container = document.querySelector('.note-container');

    const scrollTop = container.scrollTop;
    const windowHeight = container.clientHeight;
    const bodyHeight = container.scrollHeight;

    // 스크롤이 거의 바닥에 닿았을 때
    if (scrollTop + windowHeight >= bodyHeight - 100) {
      ++page; // 다음 목록 생성 
      getCard();
    }
  } catch (error) {
    console.error('스크롤 이벤트 처리 실패:', error);
  }
}

document.addEventListener('click', function (e) {
  // 힌트 팝업
  const popup = document.getElementById('hint-popup');
  const popupContent = popup.querySelector('.hint-content');

  if (e.target.classList.contains('hint-btn')) {
    const hintText = e.target.getAttribute('data-hint');
    const leftBox = e.target.closest('.note-row').querySelector('.left');

    // 팝업 내용 설정
    popupContent.textContent = hintText;

    // 위치 및 크기 설정
    const rect = leftBox.getBoundingClientRect();
    popup.style.top = `${window.scrollY + rect.top - 33}px`;
    popup.style.left = `${rect.left - 35}px`;
    popup.style.width = `${rect.width - 30}px`;

    popup.style.display = popup.style.display == 'block' ? 'none' : 'block';
  } else {
    // 팝업 닫기
    if (!popup.contains(e.target)) {
      popup.style.display = 'none';
    }
  }

  // 메뉴 설정 팝업
  const popupMenus = document.querySelectorAll(".dots-menu");

  // 클릭한 요소가 dots-button일 경우
  if (e.target.matches("img[id^='dots-button_']")) {
    const id = e.target.id.split("_")[1];
    const targetMenu = document.getElementById(`dots-menu_${id}`);

    // 모든 메뉴 닫기
    popupMenus.forEach(menu => {
      if (menu !== targetMenu) menu.style.display = "none";
    });

    // 해당 메뉴만 토글
    targetMenu.style.display = (targetMenu.style.display === "block") ? "none" : "block";
  }
  // 클릭한 곳이 메뉴 내부일 경우는 유지, 그 외엔 닫기
  else {
    popupMenus.forEach(menu => {
      menu.style.display = "none";
    });
  }
});

// 하트표시 클릭 이벤트
async function setWrongCnt(card_id) {
  try {
    var wrongCnt = document.getElementById("wrongCnt_" + card_id).value;
    if (wrongCnt >= 5) { wrongCnt = 0; } else { wrongCnt = ++wrongCnt; }
    const jsonData = { card_id, wrongCnt };

    const response = await fetch('/note/wrongCnt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData)
    });

    const result = await response.text();

    if (!response.ok) {
      alert(result); // 오류 메시지
    } else {
      var html = "";
      var heart_fivefg = false;
      //처리 성공 후 갯수 업데이트
      document.getElementById("wrongCnt_" + card_id).value = result;
      for (let j = 0; j < result; j++) {
        html += `<img src="/images/heart.png" alt="틀림" class="img-heart"/>`
        if (j >= 4) { heart_fivefg = true; break; }
      }
      if (!heart_fivefg) {
        html += `<img src="/images/heart-empty.png" alt="틀림" class="img-heart"/>`
      }
      document.getElementById("heart_" + card_id).innerHTML = html;
    }
  } catch (error) { console.error('하트표시 처리 실패:', error); }
  finally {
    loading = false;
  }
}

//노트 북마크 목록
async function getNoteBookmarkList(noteId, cardId) {
  try {
    const note_id = noteId;
    const jsonData = { note_id, sort };

    const response = await fetch('/note/get_cardBookmark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData)
    });

    const data = await response.json();
    // const result = await response.text();
console.log(data);
    // var data = '';
    // if (result) {
    //   data = JSON.parse(result)
    // }

    if (!response.ok) {
      //alert(result); // 오류 메시지
    } else {
      var html = "";

      for (let i = 0; i < data.length; i++) {
        html += `<div class="index-sticker${i === 0 ? ' active' : ''}" id="index-sticker_${data[i].card_id}" onclick="scrollToSticker(${data[i].card_id})" >`
        if (document.getElementById('cardNum_' + data[i].card_id)) {
          html += document.getElementById('cardNum_' + data[i].card_id).value
        } else {
          html += `...` // 아직 로드되지 않은 문제인 경우
        }
        html += `</div>`;
      }
      document.getElementById("index-sticker-list").innerHTML = html;

      // 💡 요소 삽입 후, top 값 자동 설정
      const stickers = document.querySelectorAll('#index-sticker-list .index-sticker');
      const baseTop = 22;
      const gap = 35;

      stickers.forEach((sticker, index) => {
        sticker.style.left = `18px`;
        sticker.style.top = `${baseTop + index * gap}px`;
      });

      // 북마크 추가한 경우
      if (cardId) {
        scrollToSticker(cardId); // 북마크 바로가기 클릭 이벤트 호출
      }
    }
  } catch (error) { console.error('북마크 목록 세팅 실패:', error); }
  finally {
    loading = false;
  }
}

// 북마크 바로가기 클릭 이벤트
async function scrollToSticker(cardId) {
  let targetNote = document.querySelector(`.note-row[data-index="${cardId}"]`);
  let maxTries = 10;
  let tries = 0;

  // 이동할 카드가 화면에 없으면 계속 로딩 시도
  while (!targetNote && tries < maxTries) {
    tries++;
    page++;
    await getCard(); // 다음 페이지 로드
    await new Promise(resolve => setTimeout(resolve, 100));
    targetNote = document.querySelector(`.note-row[data-index="${cardId}"]`);
  }

  // 1. 모든 .index-sticker 요소에서 active 클래스 제거
  document.querySelectorAll('.index-sticker').forEach(el => {
    el.classList.remove('active');
  });

  // 2. 클릭한 스티커에 active 클래스 추가
  const clickedSticker = document.getElementById(`index-sticker_${cardId}`);
  if (clickedSticker) {
    clickedSticker.classList.add('active');
  }

  // 3. 전달받은 index에 해당하는 .note-row를 찾아 스크롤
  if (targetNote) {
    targetNote.scrollIntoView({
      behavior: 'smooth', // 부드럽게 스크롤
      block: 'center'     // 중앙에 위치하도록 스크롤
    });
    targetNote.classList.add('highlight'); // 강조 효과 추가
    setTimeout(() => targetNote.classList.remove('highlight'), 2000); // 2초 후 강조 효과 제거
  }
}

//(설정 팝업)북마크 적용
async function setBookmark(card_id) {
  try {
    var bookmark = document.getElementById("txtBookmark_" + card_id).value;
    if (bookmark == '1') { bookmark = '0'; } else { bookmark = '1'; }
    const jsonData = { note_id: noteId, card_id, bookmark };

    const response = await fetch('/note/set_cardBookmark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData)
    });

    const result = await response.text();
    var html = "";
    if (result == '0' || result == '1') {
      document.getElementById("txtBookmark_" + card_id).value = result;
      // 북마크 해제하는 경우 css 제거
      if (bookmark == '0') {
        document.querySelector(`[data-index="${card_id}"]`).classList.remove("yellow-border");
        document.getElementById(`pBookmarkSet_${card_id}`).innerText = "북마크 등록";
        card_id = '';
      } else {
        document.querySelector(`[data-index="${card_id}"]`).classList.add("yellow-border");
        document.getElementById(`pBookmarkSet_${card_id}`).innerText = "북마크 해제";
      }
      getNoteBookmarkList(noteId, card_id); //북마크 목록 재조회
    } else {
      alert(result); // 오류 메시지
    }
  } catch (error) { console.error('북마크 적용 실패:', error); }
}

//문제 삭제
async function delCard(card_id) {
  try {
    const confirmDelete = confirm("문제를 삭제하시겠습니까?");
    if (!confirmDelete) return; // 취소 시 함수 종료

    const jsonData = { card_id };

    const response = await fetch('/note/del_card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData)
    });

    const result = await response.text();

    if (!response.ok) {
      alert(result); // 오류 메시지
    } else {
      document.querySelector(`[data-index="${card_id}"]`).remove(); // 카드 삭제
      getNoteBookmarkList(noteId); //북마크 목록 재조회

      alert("문제가 삭제되었습니다.");
    }
  } catch (error) { console.error('문제 삭제 실패:', error); }
}

//문제 편집
function editCard(cardId) {
  try {
    var leftQuestion = document.getElementById("spanTextLeft_" + cardId);
    var rigthAnswer = document.getElementById("spanTextRigth_" + cardId);
    var hint = document.getElementById("spanHint_" + cardId);
    const hintText = hint.dataset.hint;

    const row = document.querySelector(`[data-index="${cardId}"]`);
    if (!row) return;
    // 원본 question/answer를 row에 임시 저장
    row.dataset.originalQuestion = leftQuestion.textContent;
    row.dataset.originalAnswer = rigthAnswer.textContent;
    row.dataset.originalHint = hintText;

    // 문제 편집 textarea 생성
    leftQuestion.innerHTML = `<textarea class="edit-textarea2 full-width">${leftQuestion.textContent}</textarea>
                            <div class="edit-wrapper">
                            <span>❓</span><input type="text" class="edit-textarea2 textHint" value='${hintText}'/>
                            </div>`;
    rigthAnswer.innerHTML = `<textarea class="edit-textarea full-width">${rigthAnswer.textContent}</textarea>`;

    // 버튼 보이기
    document.querySelector(`#answer-actions_${cardId} .edit-save-btn`).classList.remove("hidden");
    document.querySelector(`#answer-actions_${cardId} .edit-cancel-btn`).classList.remove("hidden");

    // 힌트 표기
    if (hintText != '') {
      hint.classList.remove("hidden");
    } else {
      hint.classList.add("hidden");
    }

    // 설정 버튼(점세개) 숨김
    const dotsButton = document.getElementById(`dots-button_${cardId}`);
    dotsButton.classList.add("hidden");

    return;

  } catch (error) { console.error('문제 편집 실패:', error); }
}

//문제 편집 저장
async function cardEditSave(cardId) {
  try {
    const newQuestion = document.querySelector(`#spanTextLeft_${cardId} textarea`).value;
    const newAnswer = document.querySelector(`#spanTextRigth_${cardId} textarea`).value;
    const newHint = document.querySelector(`#spanTextLeft_${cardId} .edit-wrapper input`).value;
    var hint = document.getElementById("spanHint_" + cardId);

    const confirmDelete = confirm("변경된 내용을 저장하시겠습니까?");
    if (!confirmDelete) return; // 취소 시 함수 종료

    if (!cardId || !newQuestion || !newAnswer) {
      alert("문제와 답변을 입력하세요.");
      return;
    }
    const bodyData = {
      card_id: cardId,
      question: newQuestion,
      answer: newAnswer,
      hint: newHint,
    };

    const response = await fetch("/note/upd_card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json();
    //const result = await response.text();

    //if (!response.ok) return alert(result);

    // var data = '';
    // if (result) {
    //   data = JSON.parse(result);
    // }

    document.getElementById("spanTextLeft_" + cardId).innerHTML = data[0].question;
    document.getElementById("spanTextRigth_" + cardId).innerHTML = data[0].answer;
    document.getElementById("spanHint_" + cardId).dataset.hint = data[0].hint;
    if (data[0].hint != '') {
      document.getElementById("spanHint_" + cardId).classList.remove("hidden");
    }
    else {
      document.getElementById("spanHint_" + cardId).classList.add("hidden");
    }

    document.querySelector(`#answer-actions_${cardId} .edit-save-btn`).classList.add("hidden");
    document.querySelector(`#answer-actions_${cardId} .edit-cancel-btn`).classList.add("hidden");
    hint.classList.remove("hidden");
    const dotsButton = document.getElementById(`dots-button_${cardId}`);
    dotsButton.classList.remove("hidden");

    alert("문제가 수정되었습니다.");
  } catch (err) {
    console.error("수정 실패", err);
    alert("수정 중 오류 발생");
  }
}

//문제 편집 취소
function cardEditCancel(cardId) {
  const row = document.querySelector(`[data-index="${cardId}"]`);
  if (!row) return;
  const confirmDelete = confirm("편집을 취소하시겠습니까?\n편집 내용은 저장되지 않습니다.");
  if (!confirmDelete) return; // 취소 시 함수 종료

  const originalQuestion = row.dataset.originalQuestion || '';
  const originalAnswer = row.dataset.originalAnswer || '';

  // 다시 복원
  document.getElementById("spanTextLeft_" + cardId).innerHTML = originalQuestion;
  document.getElementById("spanTextRigth_" + cardId).innerHTML = originalAnswer;

  document.querySelector(`#answer-actions_${cardId} .edit-save-btn`).classList.add("hidden");
  document.querySelector(`#answer-actions_${cardId} .edit-cancel-btn`).classList.add("hidden");

  const dotsButton = document.getElementById(`dots-button_${cardId}`);
  dotsButton.classList.remove("hidden");
}

// 화면에 문제, 답 색상 설정 적용
function setQnAColor() {
  const userColorSetting = JSON.parse(localStorage.getItem("coverSettings"));
  if (userColorSetting) {
    const questions = document.querySelectorAll('.spanTextLefts');
    const answers = document.querySelectorAll('.spanTextRigths');

    questions.forEach(qusetion => {
      qusetion.style.color = userColorSetting.question_color;
    });
    answers.forEach(answer => {
      answer.style.color = userColorSetting.answer_color;
      answer.style.opacity = userColorSetting.answer_opacity;
    });
  }
}



    //정렬
    document.getElementById('sort-select').addEventListener('change', function () {
      //초기화
        sort = this.value;
        done = false;
        html = '';
        page = 1;
        noteList.innerHTML = html; // 기존 내용 초기화

        if (sort == 'wrongCnt') { // 하트순 
          getCard();
        }else{ // 등록순
          getCard();
        }
    });
    