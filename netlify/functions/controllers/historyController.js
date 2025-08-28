const { selAttInfo, selAttDetail  } = require("../models/historyMapper");

/**
 * 출석 기록 조회(월별)
 */
async function getAttInfo(req) {
    try {
        const { user_id, yyyyMM } = req;

        const param = { user_id, yyyyMM };
        return selAttInfo(param);

    } catch (error) {
        console.log("error : ", error);
    }
    return false;
}

/**
 * 출석 기록 상세조회(모의고사 이력)
 */
async function getAttDetail(req) {
    try {
        const { user_id, yyyyMMdd } = req;

        const param = { user_id, yyyyMMdd };
        return selAttDetail(param);

    } catch (error) {
        console.log("error : ", error);
    }
    return false;
}

module.exports = { getAttInfo, getAttDetail };