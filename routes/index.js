const multer = require('multer');
const path = require('path');
const fs = require('fs');
const express = require("express");
const router = express.Router();
const { getNoteLists, getCardLists } = require("../controllers/noteController");

/* API 라우터 */
// 사용자 관련 기능
router.use("/user", require("./auth"));

// 노트 관련 기능
router.use("/note", require("./note"))

// 가림판 관련 기능
router.use("/cover", require("./cover"))

// 공지사항 관련 기능
router.use("/notice", require("./notice"))

// 학습기록 관련 기능
router.use("/history", require("./history"))
/* 페이지 라우터 */

// 로그인 화면
router.get("/", (req, res) => {
  const userId = req.query.user_id || '';

  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.error("세션 제거 중 에러:", err);
        return res.send("Error logging out.");
      }
      res.clearCookie("connect.sid");
      return res.render("login", { layout: false, userId: userId });
    });
  } else {
    res.render("login", { layout: false, userId: userId });
  }
});

// 메인 노트 페이지
router.get("/main", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect("/");

    const noteList = await getNoteLists(userId);
    res.render("notes/notes", {
      page: "main",
      layout: "main",
      title: "외우장",
      notes: noteList || [],
      cssFile: "/css/notes/notes.css",
      jsFile: `/js/notes/notes.js`,
    });
  } catch (err) {
    console.error("메인 페이지 렌더링 오류:", err);
    res.status(500).send("Internal Server Error");
  }
});

// 카드 형식 페이지들
const cardPages = [
  { path: "cards_split", css: "cards_split.css", js: "cards_split.js" },
  { path: "cards_filp", css: "cards_filp.css", js: "cards_filp.js" },
  { path: "cards_text", css: "cards_text.css", js: "cards_text.js" },
];

cardPages.forEach(({ path, css, js }) => {
  router.get(`/${path}`, async (req, res) => {

    res.render(`notes/${path}`, {
      layout: "main",
      title: "외우장",
      cssFile: `/css/notes/${css}`,
      ...(js ? { jsFile: `/js/notes/${js}` } : {}),
    });
  });
});

// 카드 리스트 API
router.get("/api/cards", async (req, res) => {
  const sort = req.query.sort;
  const noteId = req.query.note_id;
  const page = parseInt(req.query.page) || 1;
  if (!noteId) return res.status(400).json({ error: "note_id가 없습니다." });

  const cardList = await getCardLists(noteId, page, sort);
  res.json({ cards: cardList || [] });
});

/**
 * add_note와 add_card cardList를 사용하지 않으므로 임시로 분리해줌
 * 코드 리펙토링 필요
 */
router.get(`/add_note`, async (req, res) => {
  res.render(`notes/add_note`, {
    layout: "main",
    title: "외우장",
    cssFile: `/css/notes/add_note.css`,
    jsFile: `/js/notes/add_note.js`,
  });
});

router.get(`/add_card`, async (req, res) => {
  const userId = req.session.user?.id;
  const noteList = await getNoteLists(userId);

  res.render(`notes/add_card`, {
    layout: "main",
    title: "외우장",
    notes: noteList || [],
    cssFile: `/css/notes/add_card.css`,
    jsFile: `/js/notes/add_card.js`,
  });
});

router.get(`/upload_cards`, async (req, res) => {
  const userId = req.session.user.id;
  const noteList = await getNoteLists(userId);

  res.render(`notes/upload_cards`, {
    layout: "main",
    title: "외우장",
    notes: noteList || [],
    cssFile: `/css/notes/upload_cards.css`,
    jsFile: `/js/notes/upload_cards.js`,
  });
});

// 모의고사 생성 페이지
router.get("/exam_edit", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const noteList = await getNoteLists(userId);

    res.render("notes/exam_edit", {
      page: "main",
      layout: "main",
      title: "외우장",
      notes: noteList || [],
      cssFile: "/css/notes/exam_edit.css",
      jsFile: `/js/notes/exam_edit.js`,
    });
  } catch (err) {
    console.error("모의고사 생성 렌더링 오류:", err);
    res.status(500).send("Internal Server Error");
  }
});

// 모의고사 페이지
router.post("/exam", async (req, res) => {
  try {
    const notes = req.body.notes; // 예: [3, 7, 9]
    const cardNum = parseInt(req.body.cardNum) || 30;

    // noteIds를 기반으로 카드 목록 불러오기 (랜덤, 제한된 개수)
    //const cardList = await getExamCards(cardNum, notes);

    res.render("notes/exam", {
      page: "main",
      layout: "main",
      title: "외우장",
      notes: notes,
      cardNum: cardNum,
      cssFile: "/css/notes/exam.css",
      jsFile: `/js/notes/exam.js`,
    });
  } catch (err) {
    console.error("모의고사 렌더링 오류:", err);
    res.status(500).send("Internal Server Error");
  }
});

// favicon.ico 무시
router.get("/favicon.ico", (req, res) => res.sendStatus(204));

// layout 없이 렌더링되는 페이지 (ex: 회원가입, 비밀번호 찾기 등)
// 화이트리스트 방식으로 보안 유지
const staticPages = ["register", "findId", "findPw", "findResult", "updatePw"]; // 필요한 페이지 추가

router.get("/:page", (req, res) => {
  const page = req.params.page;
  if (staticPages.includes(page)) {
    console.log(`${page} 화면으로 이동`);
    res.render(page, { layout: false });
  } else {
    res.status(404).send("Page not found");
  }
});

module.exports = router;
