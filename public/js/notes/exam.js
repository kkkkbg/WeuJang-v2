let totalCards = 0;
let failCnt = 0; // 오답 개수
let currentCardIndex = 0;
const cards = [];

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

const notes = document.getElementById("hidNotes").value;
const cardNum = document.getElementById("hidCardNum").value;

// DOM 요소
const questionElement = document.getElementById('question');
const answerElement = document.getElementById('answer');
const flashcard = document.getElementById('flashcard');

flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('rotate');
});

// 카드 정보 가져오기
async function getCard() {
    try {
        const jsonData = {
            notes: notes.split(',').map(Number),
            cardNum: parseInt(cardNum)
        };

        const response = await fetch('/note/getExamCards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        });

        const result = await response.json();

        if (!response.ok || !result || result.length === 0) {
            alert('문제를 불러오지 못했습니다.');
            return;
        }

        cards.push(...result);
        totalCards = cards.length;

        updateProgress();
        updateCard(currentCardIndex);

    } catch (error) {
        console.error('카드 불러오기 실패:', error);
    }
}

document.addEventListener('DOMContentLoaded', getCard);

// 카드 보여주기
function updateCard(index) {
    if (flashcard.classList.contains('rotate')) {
        flashcard.classList.remove('rotate');
        flashcard.style.transition = 'none';
        setTimeout(() => flashcard.style.transition = '', 50);
    }

    if (cards.length === 0) return;

    const card = cards[index];
    questionElement.textContent = card.question;
    answerElement.textContent = card.answer;
}

// 진행률 업데이트
function updateProgress() {
    const solved = totalCards - cards.length;
    const percent = (solved / totalCards) * 100;
    progressText.textContent = `${solved} / ${totalCards}`;
    progressFill.style.width = `${percent}%`;
}

// 정답 처리
function handleCorrect() {
    cards.splice(currentCardIndex, 1);

    if (cards.length === 0) {
        updateProgress();
        finProgress();
        return;
    }

    if (currentCardIndex >= cards.length) {
        currentCardIndex = 0;
    }

    updateProgress();
    updateCard(currentCardIndex);
}

// 오답 처리
function handleWrong() {
    failCnt++;

    currentCardIndex++;
    if (currentCardIndex >= cards.length) {
        currentCardIndex = 0;
    }

    updateProgress();
    updateCard(currentCardIndex);
}

let isFinishing = false; // 중복 호출 방지
// 시험 종료
async function finProgress() {
    if (isFinishing) return; // 이미 실행 중이면 무시
    isFinishing = true;
    try {
        const jsonData = {
            notes: notes,
            cardNum: parseInt(cardNum),
            failCnt: failCnt
        };

        const response = await fetch('/note/setExamResult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        });

        const result = await response.json();
        if (!response.ok) {
            alert(result);
        } else {
            alert("시험이 종료되었습니다.");
            window.location.href = `/main`;
        }
    } catch (error) {
        console.error('시험 종료 처리 실패:', error);
    } finally {
        isFinishing = false; // 재시도 허용
    }
}

// 버튼 이벤트
document.querySelector(".correct-btn").addEventListener("click", handleCorrect);
document.querySelector(".wrong-btn").addEventListener("click", handleWrong);
