const { getUserCoverLists, getCoverInfo, insertCoverInfo, updateCoverInfo, DeleteCoverInfo, getSelectedCoverId, updateCoverId } = require("../models/coverMapper");
const { getDate } = require('../utils/date');

/**
 * 가림판 목록 조회
 */
async function getCoverLists(user_id) {
  try {
    return getUserCoverLists(user_id);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 가림판 상세 조회
 */
async function getCoverOption(user_id, cover_id) {
  try {
    return getCoverInfo(user_id, cover_id);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 가림판 생성
 */
async function createCover(param) {
  try {
    const { DT, TM } = getDate();
    param.ENTDT = DT;
    param.ENTTM = TM;
    return insertCoverInfo(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 가림판 수정
 */
async function updateCover(param) {
  try {
    const { DT, TM } = getDate();
    param.UPDDT = DT;
    param.UPDTM = TM;
    return updateCoverInfo(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 가림판 삭제
 */
async function deleteCover(user_id, cover_id) {
  try {
    return DeleteCoverInfo(user_id, cover_id);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 사용중인 가림판 조회
 */
async function getUserCoverId(user_id) {
  try {
    return getSelectedCoverId(user_id);
  } catch (error) {
    console.log("error : ", error);
    return -1;
  }
}

/**
 * 사용자의 가림판 기본값 변경
 */
async function setUserCoverId(req) {
  try {
    const { user_id, cover_id } = req;
    const { DT: UPDDT, TM: UPDTM } = getDate();
    const param = { user_id, cover_id, UPDDT, UPDTM };
    return updateCoverId(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

module.exports = { getCoverLists, getCoverOption, createCover, updateCover, deleteCover, getUserCoverId, setUserCoverId };