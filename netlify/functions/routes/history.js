const express = require("express");
const router = express.Router();
const {
  getAttInfo, getAttDetail,
} = require("../controllers/historyController");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// 공지사항 목록 페이지
router.get("/log", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect("/");

    res.render("history/log", {
      page: "main",
      layout: "main",
      title: "외우장",
      cssFile: "/css/history/log.css",
      jsFile: `/js/history/log.js`,
    });
  } catch (err) {
    console.error("공지사항 페이지 렌더링 오류:", err);
    res.status(500).send("Internal Server Error");
  }
});

// 출석 기록
router.post("/att", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect("/");
    
    req.body.user_id = userId;
    const result = await getAttInfo(req.body);
    res.send(result);
  } catch (err) {
    console.error("출석 기록 오류:", err);
    res.status(500).send('서버 오류');
  }
});

// 출석 기록 상세
router.post("/studyLog", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect("/");
    
    req.body.user_id = userId;
    const result = await getAttDetail(req.body);
    res.send(result);
  } catch (err) {
    console.error("출석 기록 상세 오류:", err);
    res.status(500).send('서버 오류');
  }
});

module.exports = router;
