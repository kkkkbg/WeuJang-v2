const express = require("express");
const router = express.Router();
const {
  getNoticeList, getNotice,
} = require("../controllers/noticeController");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// 공지사항 목록 페이지
router.get("/notice", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect("/");

    const noticeList = await getNoticeList();
    res.render("notice/notice", {
      page: "main",
      layout: "main",
      title: "외우장",
      notices: noticeList || [],
      cssFile: "/css/notice/notice.css",
      jsFile: `/js/notice/notice.js`,
    });
  } catch (err) {
    console.error("공지사항 페이지 렌더링 오류:", err);
    res.status(500).send("Internal Server Error");
  }
});

// 공지사항 상세 페이지
router.get("/detail", async (req, res) => {
  try {
    const notice_id = req.query.id;
    if (!notice_id) return res.redirect("/notice/notice");

    const notice = await getNotice(notice_id);
    res.render("notice/detail", {
      page: "main",
      layout: "main",
      title: "외우장",
      notice: notice || {},
      cssFile: "/css/notice/detail.css",
      jsFile: `/js/notice/detail.js`,
    });
  } catch (err) {
    console.error("공지사항 상세 페이지 렌더링 오류:", err);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = router;
