/**
 * 현재 DT(YYYYMMDD)와 TM(HHMMSS)
 */
function getDate() {
    const today = new Date();
    const DT = today.toISOString().slice(0, 10).replace(/-/g, "");
    const TM = today.toTimeString().slice(0, 8).replace(/:/g, "");
    return { DT, TM }
}

module.exports = {
    getDate
};