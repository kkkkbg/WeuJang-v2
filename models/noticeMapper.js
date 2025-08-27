const connectDB = require("../dbconfig.js");

/**
 * 공지사항 목록 조회
 */
async function getNoticeInfo() {
  try {
    const db = await connectDB();
    const notices = await db.collection("notice")
      .find({ SHOWFG: '1' })
      .sort({ FIXFG: -1, notice_id: -1 })
      .toArray();

    return notices.length > 0 ? notices : null;
  } catch (err) {
    console.error('공지사항 목록 조회 중 오류:', err);
    return null;
  }
}

/**
 * 공지사항 상세 조회
 * @param {string} notice_id 공지사항 id
 */
async function getNoticeDetail({ notice_id }) {
  try {
    const db = await connectDB();
    const notice = await db.collection("notice").findOne({ notice_id, SHOWFG: '1' });
    return notice || null;
  } catch (err) {
    console.error('공지사항 상세 조회 중 오류:', err);
    return null;
  }
}

module.exports = {
  getNoticeInfo,
  getNoticeDetail,
};
