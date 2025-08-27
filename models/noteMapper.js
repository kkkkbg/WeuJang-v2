const connectDB = require("../dbconfig.js");

/**
 * 사용자 노트 정보 조회
 */
async function getUserNoteLists(user_id) {
  try {
    const db = await connectDB();
    const notes = await db.collection("note").find({ user_id }).sort({ sort: -1 }).toArray();

    // 카드 개수 포함
    const notesWithCount = await Promise.all(notes.map(async (n) => {
      const cardCount = await db.collection("card").countDocuments({ note_id: n.note_id });
      return { ...n, card_count: cardCount };
    }));

    return notesWithCount.length > 0 ? notesWithCount : null;
  } catch (err) {
    console.error("사용자 노트 정보 조회 중 오류:", err);
    throw err;
  }
}

/**
 * 노트 생성
 */
async function insertNoteInfo(param) {
  try {
    const { user_id, title, template, ENTDT, ENTTM } = param;
    const db = await connectDB();

    // 현재 최대 sort 값 가져오기
    const maxNote = await db.collection("note").find().sort({ sort: -1 }).limit(1).toArray();
    const nextSort = (maxNote[0]?.sort || 0) + 1;

    // 현재 최대 note_id 값 가져오기
    const maxNote_id = await db.collection("note").find().sort({ note_id: -1 }).limit(1).toArray();
    const nextNote_id = (maxNote_id[0]?.note_id || 0) + 1;

    const result = await db.collection("note").insertOne({
      note_id: Number(nextNote_id), user_id, title, template, bookmark: 0, sort: nextSort, wrongCnt: 0, ENTDT, ENTTM
    });

    return result.acknowledged && result.insertedId;
  } catch (err) {
    console.error("노트 생성 중 오류:", err);
    throw err;
  }
}

/**
 * 노트별 문제 정보 조회 (페이징 + 정렬)
 */
async function getUserCardLists(note_id, page = 1, limit = 30, sort) {
  try {
    const db = await connectDB();
    const allowedSort = ['wrongCnt'];
    const sortField = allowedSort.includes(sort) ? { [sort]: -1, card_id: 1 } : { card_id: 1 };
    const skip = (page - 1) * limit;
    let noteId = Number(note_id);

    const cards = await db.collection("card")
      .find({ note_id: noteId })
      .sort(sortField)
      .skip(skip)
      .limit(limit)
      .toArray();

    // rownum 같은 번호 붙이기
    return cards.map((c, idx) => ({ num: skip + idx + 1, ...c }));
  } catch (err) {
    console.error("문제 정보 조회 중 오류:", err);
    throw err;
  }
}

/**
 * 카드 등록
 */
async function insertCard(param) {
  try {

    const { note_id, cleanQuestion, cleanAnswer, cleanHint, ENTDT, ENTTM } = param;
    const db = await connectDB();

    // 현재 최대 card_id 값 가져오기
    const maxCard_id = await db.collection("card").find().sort({ card_id: -1 }).limit(1).toArray();
    const nextCard_id = (maxCard_id[0]?.card_id || 0) + 1;
    
    const result = await db.collection("card").insertOne({
        card_id: Number(nextCard_id), note_id: Number(note_id), question: cleanQuestion, answer: cleanAnswer, hint: cleanHint, wrongCnt: 0, bookmark:"0", star:"0", ENTDT, ENTTM
    });

    return result.acknowledged && result.insertedId;
  } catch (err) {
    console.error("문제 등록 중 오류:", err);
    throw err;
  }
}

/**
 * 카드 일괄 등록
 */
async function insertCards(cardsArray) {
  try {
    const db = await connectDB();

    // 현재 최대 card_id 구하기
    const maxDoc = await db.collection("card")
      .find()
      .sort({ card_id: -1 }) // card_id 기준 내림차순
      .limit(1)
      .toArray();

    let nextId = (maxDoc[0]?.card_id || 0); // 없으면 0에서 시작

    // 새 card들에 ID 부여
    const newCards = cardsArray.map(card => {
      nextId += 1;
      return { ...card, card_id: Number(nextId) };
    });

    const result = await db.collection("card").insertMany(newCards);

    return result.acknowledged && Object.keys(result.insertedIds).length === newCards.length;
  } catch (err) {
    console.error("문제 일괄 등록 중 오류:", err);
    throw err;
  }
}

/**
 * 틀린 횟수 업데이트
 */
async function updateWrongCnt({ card_id, wrongCnt }) {
  try {
    const db = await connectDB();
    await db.collection("card").updateOne({ card_id }, { $set: { wrongCnt } });
    const card = await db.collection("card").findOne({ card_id });
    return card?.wrongCnt;
  } catch (err) {
    console.error("틀린 횟수 업데이트 중 오류:", err);
    throw err;
  }
}''
/**
 * 사용자 노트 정보 조회
 * @param {string} user_id 사용자 id
 * @param {string} note_id 노트 id
 * @returns {Promise<Array>} recordset 반환
 */
async function getUserNoteInfo(param) {
  try {
    const { user_id, note_id } = param;
    const db = await connectDB();
    const collection = db.collection("note"); // 노트 컬렉션

    const noteId = Number(note_id);
    const result = await collection
      .find({ user_id: user_id, note_id: noteId })
      .sort({ sort: 1 }) // MySQL의 ORDER BY sort
      .toArray();

    if (result.length > 0) {
      return result;
    } else {
      return null; // 해당 ID 없음
    }
  } catch (err) {
    console.error("사용자 노트 정보 조회 중 오류:", err);
    throw err;
  }
}

/**
 * 카드 북마크 조회
 */
async function getCardBookMark({ user_id, note_id, sort }) {
  try {
    const db = await connectDB();
    // 정렬 필드 제한
    const allowedSort = ["wrongCnt"];
    const sortField = allowedSort.includes(sort) ? { [sort]: -1, card_id: 1 } : { card_id: 1 };

    const cards = await db.collection("card")
    .find({ note_id: Number(note_id), bookmark: "1" })
    .sort(sortField) // 정렬 추가
    .toArray();
    return cards.length > 0 ? cards : null;
  } catch (err) {
    console.error("노트 북마크 조회 중 오류:", err);
    throw err;
  }
}

/**
 * 카드 북마크 설정
 */
async function setCardBookMark({ note_id, card_id, bookmark }) {
  try {
    const db = await connectDB();

    const noteId = Number(note_id);
    if (bookmark === '1') {
      const count = await db.collection("card").countDocuments({ note_id: noteId, bookmark: "1" });
      if (count >= 10) return "북마크의 최대 갯수를 초과하였습니다.";
    }

    await db.collection("card").updateOne({ card_id }, { $set: { bookmark } });
    const card = await db.collection("card").findOne({ card_id });
    return card?.bookmark;
  } catch (err) {
    console.error("북마크 업데이트 중 오류:", err);
    throw err;
  }
}

/**
 * 카드 삭제
 */
async function deleteCard({ card_id }) {
  try {
    const db = await connectDB();
    const result = await db.collection("card").deleteOne({ card_id });
    return result.acknowledged;
  } catch (err) {
    console.error("카드 삭제 중 오류:", err);
    throw err;
  }
}

/**
 * 카드 수정
 */
async function updateCard({ card_id, question, answer, hint, UPDDT, UPDTM }) {
  try {
    const cardId = Number(card_id);
    const db = await connectDB();
    await db.collection("card").updateOne({ card_id :cardId }, { $set: { question, answer, hint, UPDDT, UPDTM } });
    const card = await db.collection("card").findOne({ card_id :cardId });
    return card;
  } catch (err) {
    console.error("카드 수정 중 오류:", err);
    throw err;
  }
}

/**
 * 노트 수정
 */
async function updateNote({ user_id, note_id, title, template, UPDDT, UPDTM }) {
  try {
    const db = await connectDB();
    const setData = { UPDDT, UPDTM };
    if (title !== undefined) setData.title = title;
    if (template !== undefined) setData.template = template;

    const noteId = Number(note_id);
    const result = await db.collection("note").updateOne({ user_id, note_id:noteId }, { $set: setData });
    return result.acknowledged;
  } catch (err) {
    console.error("노트 수정 중 오류:", err);
    throw err;
  }
}

/**
 * 노트 삭제
 */
async function deleteNote({ user_id, note_id }) {
  try {
    const db = await connectDB();
    const noteId = Number(note_id);
    
    await db.collection("note").deleteOne({ user_id, note_id: noteId });
    await db.collection("card").deleteMany({ note_id: noteId });
    return true;
  } catch (err) {
    console.error("노트 삭제 중 오류:", err);
    throw err;
  }
}

/**
 * 모의고사 문제 랜덤 조회
 */
async function selExamCards({ cardNum, notes }) {
  try {
    if (!Array.isArray(notes) || notes.length === 0) throw new Error("note_id는 필수값 입니다.");
    const db = await connectDB();

    const cards = await db.collection("card").aggregate([
      { $match: { note_id: { $in: notes } } },
      { $sample: { size: Number(cardNum) } }
    ]).toArray();

    return cards.length > 0 ? cards : null;
  } catch (err) {
    console.error("모의고사 문제 랜덤 조회 중 오류:", err);
    throw err;
  }
}

/**
 * 모의고사 결과 저장
 */
async function instExamResult({ user_id, cardNum, notes, failCnt, ENTDT, ENTTM }) {
  try {
    const db = await connectDB();

    // 문자열을 ',' 기준으로 나눈 다음 숫자로 변환
    const noteArr = notes.split(",").map(Number);
    const noteDocs = await db.collection("note").find({ note_id: { $in: noteArr } }).toArray();
    const noteTitles = noteDocs.map(n => n.title).join("/");

    // 현재 최대 study_id 값 가져오기
    const maxStudy_id = await db.collection("studylog").find().sort({ study_id: -1 }).limit(1).toArray();
    const nextStudy_id = (maxStudy_id[0]?.study_id || 0) + 1;

    const result = await db.collection("studylog").insertOne({
      study_id: Number(nextStudy_id),user_id, note_id: noteTitles, try_count: failCnt, total_count: cardNum, ENTDT, ENTTM
    });

    await db.collection("user_att").updateOne(
      { user_id, loginDt: ENTDT },
      { $set: { studyFg: 1 } }
    );

    return result.acknowledged && result.insertedId;
  } catch (err) {
    console.error("모의고사 결과저장 중 오류:", err);
    throw err;
  }
}

module.exports = {
  getUserNoteLists,
  insertNoteInfo,
  getUserCardLists,
  insertCard,
  insertCards,
  updateWrongCnt,
  getUserNoteInfo,
  getCardBookMark,
  setCardBookMark,
  deleteCard,
  updateCard,
  updateNote,
  deleteNote,
  selExamCards,
  instExamResult,
};
