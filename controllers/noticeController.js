const { get } = require("mongoose");
const { getNoticeInfo, getNoticeDetail,  } = require("../models/noticeMapper");
const { getDate } = require('../utils/date');

const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * 공지사항 조회
 */
async function getNoticeList() {
    try {
        return getNoticeInfo();

    } catch (error) {
        console.log("error : ", error);
    }
    return false;
}

/**
 * 공지사항 개별 조회
 */
async function getNotice(notice_id) {
    try {
    // 기본 입력 검증
    if (!notice_id) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const param = { notice_id };
    return getNoticeDetail(param);

    } catch (error) {
        console.log("error : ", error);
    }
    return false;
}

module.exports = { getNoticeList, getNotice, };