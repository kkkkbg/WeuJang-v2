const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get('note_id'); // 원하는 노트 ID
let page = parseInt(urlParams.get('page')) || 1;    // 원하는 페이지 번호
let loading = false;
let done = false; // 데이터 끝났는지 여부
let html = "";
const cards = []; // 카드 정보를 저장할 배열
let editMode = false; // 편집 모드 여부
let sort = "";

document.addEventListener('DOMContentLoaded', function () {
  getCard();  // DOM이 로드된 후 자동 실행
  getNoteInfo();  //제목 정보 가져오기
});

async function getNoteInfo() {
  try {
    const jsonData = { note_id : noteId };

    const response = await fetch('/note/get_note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData)
    });

    const data = await response.json();
    //const result = await response.text();

    if (!response.ok) {
      // 오류 
    } else {
        // var data = '';
        // data = JSON.parse(result);
        document.querySelector('.note-title-detail').textContent = data[0].title;
    }

  } catch (error) { console.error('수첩정보 요청 실패:', error); }
}

async function getCard() {
  if (loading || done) return;
  loading = true; // 로딩 상태 설정
  try {
    fetch(`/api/cards?note_id=${noteId}&page=${page}&sort=${sort}`)
      .then(res => res.json())
      .then(data => {
        const newCards = data.cards;

        if (!newCards || newCards.length === 0) {
          if (page == 1) {
            document.querySelector('.note-container').innerHTML
              = `<a class="card no-data" href="/add_card?note_id=${noteId}">등록된 문제가 없습니다.</>`;
          }
          done = true; // 데이터가 없으면 더 이상 로드 안 함
          return;
        }

        // 새로 불러온 카드 데이터를 기존 cards 배열에 추가
        cards.push(...newCards);
        if (page === 1) {
          // 페이지 로드 시 첫 번째 문제 표시
          updateCard(currentCardIndex);
        }
        getNoteBookmarkList(noteId); //북마크 목록
      })
      .catch(err => {
        console.error("카드 불러오기 실패:", err);
      });
  } catch (error) { console.error('카드 요청 실패:', error); }
  finally {
    loading = false;
  }
}

let currentCardIndex = 0;

const questionElement = document.getElementById('question');
const answerElement = document.getElementById('answer');
const nextButton = document.getElementById('next-button');
const preButton = document.getElementById('pre-button');
const flashcard = document.getElementById('flashcard');
const heart = document.getElementById('spanHeart');
const hintBtn = document.getElementById('hint-btn');

// 카드 정보 업데이트 함수
function updateCard(index) {
  try {
    if (flashcard.classList.contains('rotate')) {
      flashcard.classList.remove('rotate');
      flashcard.style.transition = 'none';  // 애니메이션 일시적으로 비활성화
      setTimeout(() => {
        flashcard.style.transition = '';  // 애니메이션 재활성화
      }, 50); // 50ms 정도 대기 후 재활성화
    }
    if (index >= cards.length) {
      if (confirm("마지막 문제입니다. 처음으로 돌아가시겠습니까?")) {
        index = 0; // 마지막 문제에 도달하면 첫 번째 문제로 돌아갑니다.
      } else { return; }
    }
    // 하트(틀린갯수)표시
    var heart_fivefg = false;
    html = '';
    for (let j = 0; j < cards[index].wrongCnt; j++) {
      html += `<img src="/images/heart.png" alt="틀림" class="img-heart"/>`
      if (j >= 4) { heart_fivefg = true; break; }
    }
    if (!heart_fivefg) {
      html += `<img src="/images/heart-empty.png" alt="틀림" class="img-heart"/>`;
    }
    // 힌트 표시
    if (cards[index].hint != '') {
      document.getElementById("hint-btn").classList.remove("hidden");
    }
    else {
      document.getElementById("hint-btn").classList.add("hidden");
    }
    // 북마크 표시
    if (cards[index].bookmark == '0') {
      document.getElementById(`flashcard`).classList.remove("yellow-border");
      document.getElementById(`pBookmarkSet`).innerText = "북마크 등록";
    } else {
      document.getElementById(`flashcard`).classList.add("yellow-border");
      document.getElementById(`pBookmarkSet`).innerText = "북마크 해제";
    }
    heart.innerHTML = html;
    hintBtn.setAttribute('data-hint', cards[index].hint);
    questionElement.textContent = cards[index].num + '. ' + cards[index].question;
    answerElement.textContent = cards[index].answer;
    currentCardIndex = index;
  } catch (error) {
    console.error('카드 업데이트 실패:', error);
  }
}

// 문제 변경 함수 (다음 문제로 넘어감)
nextButton.addEventListener('click', () => {
  updateCard(currentCardIndex + 1);
  if (currentCardIndex === cards.length - 1 && !done) {
    page++; // 다음 페이지 카드 로드
    getCard(); // 마지막 카드에 도달하면 다음 페이지 카드 로드
  }
});
// 문제 변경 함수 (이전 문제로 돌아감)
preButton.addEventListener('click', () => {
  if (currentCardIndex === 0) {
    alert("첫 번째 문제입니다.");
    return;
  } else {
    updateCard(currentCardIndex - 1);
  }
});

// 슬라이드로 다음 문제로 이동 (스크롤)
// let startY;

// flashcard.addEventListener('touchstart', (e) => {
//   startY = e.touches[0].clientY;
// });

// flashcard.addEventListener('touchend', (e) => {
//   let endY = e.changedTouches[0].clientY;
//   if (startY - endY > 50) { // 위로 스와이프
//     updateCard(currentCardIndex + 1);
//   } else if (endY - startY > 50) { // 아래로 스와이프
//     updateCard(currentCardIndex - 1);
//   }
// });

 flashcard.addEventListener('click', () => {
  if(editMode){
    return;
  }
   flashcard.classList.toggle('rotate');
 });

document.addEventListener('click', function (e) {
  // 힌트 팝업
  const popup = document.getElementById('hint-popup');
  const popupContent = popup.querySelector('.hint-content');

  if (e.target.classList.contains('hint-btn')) {
    const hintText = e.target.getAttribute('data-hint');
    const flashcard = document.getElementById('flashcard');

    // 팝업 내용 설정
    popupContent.textContent = hintText;

    // 위치 및 크기 설정
    const rect = flashcard.getBoundingClientRect();
    popup.style.top = `${window.scrollY + rect.top - 75}px`;
    popup.style.left = `${rect.left - 30}px`;
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
  if (e.target.matches("img[id^='dots-button")) {
    const targetMenu = document.getElementById(`dots-menu`);

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
async function setWrongCnt() {
  try {
    var card_id = cards[currentCardIndex].card_id;
    var wrongCnt = cards[currentCardIndex].wrongCnt;
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
      cards[currentCardIndex].wrongCnt = parseInt(result); // js 배열에도 반영
      for (let j = 0; j < result; j++) {
        html += `<img src="/images/heart.png" alt="틀림" class="img-heart"/>`
        if (j >= 4) { heart_fivefg = true; break; }
      }
      if (!heart_fivefg) {
        html += `<img src="/images/heart-empty.png" alt="틀림" class="img-heart"/>`
      }
      document.getElementById("spanHeart").innerHTML = html;
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
      alert(result); // 오류 메시지
    } else {
      var html = "";

      for (let i = 0; i < data.length; i++) {

        // cards 배열에서 card_id가 일치하는 카드 인덱스 찾기
        const cardIndex = cards.findIndex(card => card.card_id === data[i].card_id);

        // 번호(num) 가져오기 (없으면 "..." 표시)
        const num = (cardIndex !== -1) ? cards[cardIndex].num : '...';
        html += `<div class="index-sticker${i === 0 ? ' active' : ''}" id="index-sticker_${data[i].card_id}" onclick="scrollToSticker(${data[i].card_id})" >`
        html += num
        html += `</div>`;
      }
      document.getElementById("index-sticker-list").innerHTML = html;

      // 💡 요소 삽입 후, top 값 자동 설정
      const stickers = document.querySelectorAll('#index-sticker-list .index-sticker');
      const baseTop = -197;
      const gap = 35;

      stickers.forEach((sticker, index) => {
        sticker.style.left = `27px`;
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
  let targetIndex = cards.findIndex(card => card.card_id === cardId); 
  let maxTries = 10;
  let tries = 0;
  // 이동할 카드가 화면에 없으면 계속 로딩 시도
  while (targetIndex === -1 && tries < maxTries) {
    tries++;
    page++;
    await getCard(); // 다음 페이지 로드
    await new Promise(resolve => setTimeout(resolve, 100));
    targetIndex = cards.findIndex(card => card.card_id === cardId);
  }

  updateCard(targetIndex);

  // 1. 모든 .index-sticker 요소에서 active 클래스 제거
  document.querySelectorAll('.index-sticker').forEach(el => {
    el.classList.remove('active');
  });

  // 2. 클릭한 스티커에 active 클래스 추가
  const clickedSticker = document.getElementById(`index-sticker_${cardId}`);
  if (clickedSticker) {
    clickedSticker.classList.add('active');
  }
}

function showCard(index) {
  const card = cards[index];
  if (!card) return;

  document.getElementById("question").textContent = `${index + 1}. ${card.question}`;
  document.getElementById("answer").textContent = card.answer;
}

//(설정 팝업)북마크 적용
async function setBookmark() {
  try {
    var card_id = cards[currentCardIndex].card_id;
    var bookmark = cards[currentCardIndex].bookmark;
    if (bookmark == '1') { bookmark = '0'; } else { bookmark = '1'; }
    const jsonData = { note_id : noteId, card_id, bookmark };

    const response = await fetch('/note/set_cardBookmark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData)
    });

    const result = await response.text();
    
    var html = "";
    if(result == '0' || result == '1') {
      cards[currentCardIndex].bookmark = result; // js 배열에도 반영
      // 북마크 해제하는 경우 css 제거
      if (bookmark == '0') {
        document.getElementById(`flashcard`).classList.remove("yellow-border");
        document.getElementById(`pBookmarkSet`).innerText = "북마크 등록";
        card_id = '';
      } else {
        document.getElementById(`flashcard`).classList.add("yellow-border");
        document.getElementById(`pBookmarkSet`).innerText = "북마크 해제";
      }
      getNoteBookmarkList(noteId, card_id); //북마크 목록 재조회
    } else {
      alert(result); // 오류 메시지
    }
  } catch (error) { console.error('북마크 적용 실패:', error); }
}


//문제 삭제
async function delCard() {
  try {
    var card_id = cards[currentCardIndex].card_id;
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
       // js에서 카드 삭제
      const index = cards.findIndex(card => card.card_id === card_id);
      if (index !== -1) {
        cards.splice(index, 1); // 해당 인덱스에서 1개 제거
      }
      nextButton.click(); // 다음 문제로 넘어감
      getNoteBookmarkList(noteId); //북마크 목록 재조회

      alert("문제가 삭제되었습니다.");
    }
  } catch (error) { console.error('문제 삭제 실패:', error); }
}

//문제 편집
function editCard() {
  try {
    editMode = true; // 편집 모드 활성화
    var leftQuestion = cards[currentCardIndex].question;
    var rigthAnswer = cards[currentCardIndex].answer;
    var hint = document.getElementById("hint-btn");
    const hintText = cards[currentCardIndex].hint;

    // 문제 편집 textarea 생성<div class="card-front">
    document.querySelector("#question").innerHTML = `<div class="edit-wrapper"><span>문제</span><textarea class="edit-textarea2 full-width" id="txtQuestion">${leftQuestion}</textarea></div>
                            <div class="edit-wrapper">
                            <span>❓</span><input type="text" class="edit-textarea2 textHint" id="txtHint" value='${hintText}' />
                            </div>
                            <div class="edit-wrapper"><span>답</span><input type='text' class="edit-textarea full-width" id="txtAnswer" value="${rigthAnswer}" /></div>
                            <div id="answer-actions" class="answer-actions">
                              <button class="edit-save-btn" onclick="cardEditSave()">저장</button>
                              <button class="edit-cancel-btn" onclick="cardEditCancel()">취소</button>
                            </div>`;

    // 힌트 표기
    if (hintText != '') {
      hint.classList.remove("hidden");
    } else {
      hint.classList.add("hidden");
    }

    // 설정 버튼(점세개) 숨김
    const dotsButton = document.getElementById(`dots-button`);
    dotsButton.classList.add("hidden");

    return;

  } catch (error) { console.error('문제 편집 실패:', error); }
}


//문제 편집 저장
async function cardEditSave() {
  try {
    var cardId = cards[currentCardIndex].card_id;
    const newQuestion = document.querySelector(`#txtQuestion`).value;
    const newAnswer = document.querySelector(`#txtAnswer`).value;
    const newHint = document.querySelector(`#txtHint`).value;

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

    // if (!response.ok) return alert(result);

    // var data = '';
    // if (result) {
    //   data = JSON.parse(result);
    // }
    document.querySelector("#question").innerHTML = data[0].question;
    document.querySelector("#answer").innerHTML = data[0].answer;
    document.querySelector("#hint-popup").innerHTML = data[0].hint;

    if (data[0].hint != '') {
      document.getElementById("hint-btn").classList.remove("hidden");
    }
    else {
      document.getElementById("hint-btn").classList.add("hidden");
    }
    const dotsButton = document.getElementById(`dots-button`);
    dotsButton.classList.remove("hidden");
    editMode = false; // 편집 모드 비활성화
    alert("문제가 수정되었습니다.");
  } catch (err) {
    console.error("수정 실패", err);
    alert("수정 중 오류 발생");
  }
}

//문제 편집 취소
function cardEditCancel() {
  const confirmDelete = confirm("편집을 취소하시겠습니까?\n편집 내용은 저장되지 않습니다.");
  if (!confirmDelete) return; // 취소 시 함수 종료

  // 다시 복원
  document.querySelector("#question").innerHTML = cards[currentCardIndex].question;

  const dotsButton = document.getElementById(`dots-button`);
  dotsButton.classList.remove("hidden");
  editMode = false; // 편집 모드 비활성화
}

    //정렬
    document.getElementById('sort-select').addEventListener('change', function () {
        sort = this.value;
        done = false;
        html = '';
        page = 1;
        cards.length = 0; // 기존 내용 초기화

        if (sort == 'wrongCnt') { // 하트순 
          getCard();
        }else{ // 등록순
          getCard();
        }
    });
    