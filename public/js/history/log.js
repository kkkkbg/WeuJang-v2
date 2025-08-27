document.addEventListener("DOMContentLoaded", () => {
  const calendar = document.getElementById("calendar");
  const calendarTitle = document.getElementById("calendar-title");
  const recordDetail = document.getElementById("record-detail");
  const selectedDateTitle = document.getElementById("selected-date-title");
  const recordDetailContent = document.getElementById("record-detail-content");

  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  // const attendances = {
  //   "2025-07-01": "attended",
  //   "2025-07-02": "studied",
  //   "2025-07-03": "studied"
  // };

  // 여러 응시 기록이 들어간 예시 데이터
  // const studyRecords = {
  //   "2025-07-02": [
  //     { count: 20, title: "영어/한국사", time: "18:00" },
  //     { count: 10, title: "한국사", time: "21:00" }
  //   ]
  // };

  function updateCalendarTitle() {
    calendarTitle.textContent = `${currentYear}년 ${currentMonth + 1}월`;
  }

  async function createCalendar(year, month) {
    // 출석/학습 데이터
    let attendances = await getAttLog(year, month);
    calendar.innerHTML = "";
    updateCalendarTitle();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      fragment.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${pad(month + 1)}-${pad(day)}`;
      const div = document.createElement("div");
      div.className = "calendar-day";
      div.textContent = day;
      div.dataset.date = date;

      if (attendances[date]) {
        div.classList.add("stamp-" + attendances[date]);

        div.addEventListener("click", () => showDetail(date));
      }

      fragment.appendChild(div);
    }

    calendar.innerHTML = "";
    calendar.appendChild(fragment);

    // 오늘 날짜 선택 상태 표시
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const days = calendar.querySelectorAll(".calendar-day");
    days.forEach(day => {
      const dayNum = day.textContent.padStart(2, "0");
      const dateStr = `${year}-${pad(month + 1)}-${dayNum}`;
      if (dateStr === todayStr) {
        day.classList.add("selected");
        showDetail(todayStr);
      }
    });
  }

  async function showDetail(date) {
    selectedDateTitle.textContent = `${date}`;

    // 모든 날짜에서 'selected' 클래스 제거
    document.querySelectorAll('.calendar-day').forEach(day => {
      day.classList.remove('selected');
    });

    // 현재 클릭한 날짜에 'selected' 클래스 추가
    const clickedDay = [...document.querySelectorAll('.calendar-day')]
      .find(el => el.dataset.date === date);
    if (clickedDay) clickedDay.classList.add('selected');

    // 기록 렌더링 (이전 응답 내용 참고)
    let studyRecords = await getStudyLog(date.replace(/-/g, ''));
    const records = studyRecords;
    if (!records || records.length === 0) {
      recordDetailContent.innerHTML = `<p>✅ 출석 완료!</p>`;
    } else {
      recordDetailContent.innerHTML = `<p>✅ 출석 완료!</p>` + records.map(record => `
      <div class="record-box">
        <div class="record-line">📘 [문제 수] ${record.count}개</div>
        <div class="record-line">📒 [수첩] ${record.title}</div>
        <div class="record-line">🕓 [제출 시간] ${record.time}</div>
      </div>
    `).join('');
    }

    recordDetail.style.display = "block";
  }

  // 초기 렌더링도 async/await 고려
  (async () => {
    await createCalendar(currentYear, currentMonth);
  })();

  // 월 이동 이벤트도 async 함수로 처리
  document.getElementById("prev-month").addEventListener("click", async () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    await createCalendar(currentYear, currentMonth);
  });

  document.getElementById("next-month").addEventListener("click", async () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    await createCalendar(currentYear, currentMonth);
  });
});



async function getAttLog(year, month) {
  const attendances = {};
  try {
    const yyyyMM = `${year}${pad(month + 1)}`;
    const jsonData = { yyyyMM };
    const response = await fetch(`/history/att`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    });

    const result = await response.json();
    if (!response.ok) {
      // 오류 처리
      console.error('출석 조회 실패:', result);
      return {};
    } else {
    const rows = result;
      rows.forEach(row => {
        const dateStr = row.loginDt; // '20250702' 형식
        const formatted = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
        attendances[formatted] = row.studyFg == '1' ? 'studied' : 'attended';
      });
      return attendances;
    }
  } catch (err) {
    console.error('출석 조회 중 오류:', err);
  }
}


async function getStudyLog(yyyyMMdd) {
  try {
    const jsonData = { yyyyMMdd };
    const response = await fetch(`/history/studyLog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('출석 상세조회 실패:', result);
      return {};
    } else {
      // ✅ studyRecords 객체 생성
      const studyRecords = result.map(row => ({
          count: row.total_count,
          title: row.note_id,
          time: row.ENTTM.slice(0, 2) + ':' + row.ENTTM.slice(2, 4)
        }));

      return studyRecords;
    }
  } catch (err) {
    console.error('출석 상세조회 중 오류:', err);
  }
}

  function pad(n) {
    return n < 10 ? "0" + n : n;
  }