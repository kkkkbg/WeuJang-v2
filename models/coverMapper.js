const connectDB = require("../dbconfig.js");

/**
 * 사용자별 가림판 목록 조회
 */
async function getUserCoverLists(user_id) {
  try {
    const db = await connectDB();
    const covers = await db
      .collection("cover")
      .find({ user_id })
      .sort({ cover_id: 1 })
      .toArray();

    return covers.length > 0 ? covers : null;
  } catch (err) {
    console.error("사용자 가림판 정보 조회 중 오류:", err);
    throw err;
  }
}

/**
 * 가림판 설정 정보 조회
 */
async function getCoverInfo(user_id, cover_id) {
  try {
    const db = await connectDB();
    const cover = await db
      .collection("cover")
      .findOne({ cover_id, user_id });

    return cover || null;
  } catch (err) {
    console.error("사용자 가림판 정보 조회 중 오류:", err);
    throw err;
  }
}

/**
 * 가림판 설정 저장
 */
async function insertCoverInfo(param) {
  try {
    const db = await connectDB();

    // 현재 최대 cover_id 값 가져오기
    const maxCover_id = await db.collection("cover").find().sort({ cover_id: -1 }).limit(1).toArray();
    const nextCover_id = (maxCover_id[0]?.cover_id || 0) + 1;

    const result = await db.collection("cover").insertOne({
      cover_id: Number(nextCover_id),
      user_id: param.user_id,
      title: param.title,
      Img: param.imgUrl,
      color: param.backgroundColor,
      opacity: param.backgroundOpacity,
      text: param.text,
      text_size: param.textSize,
      text_color: param.textColor,
      question_color: param.questionColor,
      answer_color: param.answerColor,
      answer_opacity: param.answerOpacity,
      ENTDT: param.ENTDT,
      ENTTM: param.ENTTM,
    });


    return result.acknowledged && result.insertedId;
  } catch (err) {
    console.error("가림판 설정 저장 중 오류:", err);
    throw err;
  }
}

/**
 * 가림판 설정 수정
 */
async function updateCoverInfo(param) {
  try {
    const db = await connectDB();
    const result = await db.collection("cover").updateOne(
      { cover_id: param.cover_id, user_id: param.user_id },
      {
        $set: {
          title: param.title,
          Img: param.imgUrl,
          color: param.backgroundColor,
          opacity: param.backgroundOpacity,
          text: param.text,
          text_size: param.textSize,
          text_color: param.textColor,
          question_color: param.questionColor,
          answer_color: param.answerColor,
          answer_opacity: param.answerOpacity,
          UPDDT: param.UPDDT,
          UPDTM: param.UPDTM,
        },
      }
    );

    return result.acknowledged;
  } catch (err) {
    console.error("가림판 설정 수정 중 오류:", err);
    throw err;
  }
}

/**
 * 가림판 설정 삭제
 */
async function DeleteCoverInfo(user_id, cover_id) {
  try {
    const db = await connectDB();
    const result = await db.collection("cover").deleteOne({ cover_id, user_id });
    return result.acknowledged;
  } catch (err) {
    console.error("가림판 설정 삭제 중 오류:", err);
    throw err;
  }
}

/**
 * 사용중인 가림판 정보 조회
 */
async function getSelectedCoverId(user_id) {
  try {
    const db = await connectDB();
    const user = await db.collection("USER").findOne({ user_id });

    return user?.cover_id ?? -1;
  } catch (err) {
    console.error("사용중인 가림판 조회 중 오류:", err);
    throw err;
  }
}

/**
 * 사용자 기본 가림판 정보 수정
 */
async function updateCoverId(param) {
  try {
    const db = await connectDB();
    const result = await db.collection("USER").updateOne(
      { user_id: param.user_id },
      {
        $set: {
          cover_id: param.cover_id,
          UPDDT: param.UPDDT,
          UPDTM: param.UPDTM,
        },
      }
    );

    return result.acknowledged;
  } catch (err) {
    console.error("사용자 기본 가림판 수정 중 오류:", err);
    throw err;
  }
}

module.exports = {
  getUserCoverLists,
  getCoverInfo,
  insertCoverInfo,
  updateCoverInfo,
  DeleteCoverInfo,
  getSelectedCoverId,
  updateCoverId,
};
