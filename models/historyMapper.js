const connectDB = require("../dbconfig.js");

/**
 * 출석 기록 조회(월별)
 * @param {string} user_id 사용자 id
 * @param {string} yyyyMM 조회 연월
 */
async function selAttInfo({ user_id, yyyyMM }) {
  try {
    const db = await connectDB();
    const records = await db.collection("user_att")
      .find({ 
        user_id, 
        loginDt: { $regex: `^${yyyyMM}` } 
      })
      .sort({ loginDt: 1 })
      .toArray();

    return records.length > 0 ? records : [];
  } catch (err) {
    console.error('출석 기록 조회 중 오류:', err);
    return null;
  }
}

/**
 * 출석 기록 상세조회(모의고사 이력)
 * @param {string} user_id 사용자 id
 * @param {string} yyyyMMdd 조회 일자
 */
async function selAttDetail({ user_id, yyyyMMdd }) {
  try {
    const db = await connectDB();
    const details = await db.collection("studylog")
      .find({ user_id, ENTDT: yyyyMMdd })
      .sort({ ENTTM: 1 })
      .toArray();

    return details;
  } catch (err) {
    console.error('출석 기록 상세 조회 중 오류:', err);
    return null;
  }
}

/**
 * note_id 배열로 title 조회
 * @param {string} noteIdStr '34|29|28'
 */
async function getTitlesByNoteIds(noteIdStr) {
  try {
    const db = await connectDB();
    const noteIds = noteIdStr.split('|');
    if (noteIds.length === 0) return [];

    const notes = await db.collection("note")
      .find({ note_id: { $in: noteIds } })
      .project({ note_id: 1, title: 1, _id: 0 })
      .toArray();

    return notes; // [{note_id: '34', title: '영어'}, ...]
  } catch (err) {
    console.error('note title 조회 중 오류:', err);
    return [];
  }
}

module.exports = {
  selAttInfo,
  selAttDetail,
  getTitlesByNoteIds,
};
