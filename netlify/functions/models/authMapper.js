const connectDB = require("../dbconfig.js");

/**
 * 사용자 기본정보 조회
 */
async function getUserInfo(user_id) {
  try {
    const db = await connectDB();
    const user = await db.collection("USER").findOne({ user_id });
    return user || null;
  } catch (err) {
    console.error("비밀번호 조회 중 오류:", err);
    return null;
  }
}

/**
 * 아이디 중복여부 확인
 */
async function searchSameUserId(user_id) {
  try {
    const db = await connectDB();
    const count = await db.collection("USER").countDocuments({ user_id });
    return count;
  } catch (err) {
    console.error("아이디 중복여부 확인 중 오류:", err);
    return -1;
  }
}

/**
 * 유저 정보 등록
 */
async function insertUserInfo(param) {
  try {
    const db = await connectDB();
    const result = await db.collection("USER").insertOne({
      user_id: param.user_id,
      password: param.hashedPw,
      name: param.name,
      email: param.email,
      birth: param.birth,
      creatDTM: param.creatDTM,
      STATUS: "1",
      LASTLOGINDT: null,
      LOGINCNT: 0,
      coverSet: 0,
      cover_id: -1,
      ENTDT: param.ENTDT,
      ENTTM: param.ENTTM,
    });

    return result.acknowledged && result.insertedId;
  } catch (err) {
    console.error("유저 정보 등록 중 오류:", err);
    return false;
  }
}

/**
 * 유저 정보 수정
 */
async function updateUserInfo(param) {
  try {
    const db = await connectDB();
    const result = await db.collection("USER").updateOne(
      { user_id: param.user_id },
      {
        $set: {
          name: param.name,
          email: param.email,
          birth: param.birth,
          UPDDT: param.UPDDT,
          UPDTM: param.UPDTM,
        },
      }
    );

    return result.acknowledged;
  } catch (err) {
    console.error("유저 정보 수정 중 오류:", err);
    return false;
  }
}

/**
 * 아이디 조회
 */
async function getUserId(param) {
  try {
    const db = await connectDB();
    const filter = {};

    if (param.email) filter.email = param.email;
    if (param.name && param.name.trim() !== "") filter.name = param.name;
    if (param.userId && param.userId.trim() !== "") filter.user_id = param.userId;

    const user = await db.collection("USER").findOne(filter);
    return user || null;
  } catch (err) {
    console.error("아이디 조회 중 오류:", err);
    return -1;
  }
}

/**
 * 비밀번호 재설정
 */
async function updatePassword(param) {
  try {
    if (!param.pw || !param.userId) return false;

    const db = await connectDB();
    const result = await db.collection("USER").updateOne(
      { user_id: param.userId },
      { $set: { password: param.pw, UPDDT: param.UPDDT, UPDTM: param.UPDTM } }
    );

    return result.acknowledged;
  } catch (err) {
    console.error("비밀번호 재설정 중 오류:", err);
    throw err;
  }
}

/**
 * 출석체크
 */
async function insertAttendance(userId, ENTDT) {
  try {
    const db = await connectDB();

    const existing = await db.collection("user_att").findOne({ user_id: userId, loginDt: ENTDT });
    if (existing) return false;

    const result = await db.collection("user_att").insertOne({ user_id: userId, loginDt: ENTDT });

    return result.acknowledged && result.insertedId;
  } catch (err) {
    console.error("출석체크 중 오류:", err);
    throw err;
  }
}

module.exports = {
  getUserInfo,
  searchSameUserId,
  insertUserInfo,
  getUserId,
  updatePassword,
  insertAttendance,
  updateUserInfo,
};
