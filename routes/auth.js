const express = require("express");
const router = express.Router();
const {
  chkUserId,
  registerUser,
  handleLogin,
  sendAuthCode,
  findUserId,
  setUserPw,
  updateUser,
  isCorrectPw,
} = require("../controllers/authController");
const { getUserInfo, } = require("../models/authMapper");
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

/* 로그인, 로그아웃, 회원가입 등 사용자 인증 관련 기능 */

// 로그인
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("사용자 입력 정보 :", username, "/", password);
  await handleLogin(req, res, username, password);
});

// 로그아웃
router.get("/logout", (req, res) => {
  // console.log(req.session.user);
  req.session.destroy((err) => {
    if (err) return res.send("로그아웃 실패!");
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

// 회원가입
router.post("/register", async (req, res) => {
  if (await registerUser(req.body)) res.send("회원가입이 완료되었습니다.");
  else
    res
      .status(500)
      .send("회원가입 중 오류가 발생했습니다.\r\n다시 시도해주세요.");
});

// 사용가능 아이디 확인
router.get("/chkUserId", async (req, res) => {
  const { user_id } = req.query;
  try {
    const chk = await chkUserId(user_id);
    res.json({ available: chk === 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ available: false });
  }
});

// 인증번호 발송
router.post("/sendAuthEmail", async (req, res) => {
  try {
    await sendAuthCode(req.body, res);
  } catch (error) {
    res
      .status(500)
      .send("인증번호 발송 중 오류가 발생했습니다.\r\n다시 시도해주세요.");
  }
});

// 아이디 찾기
router.post("/findUserId", async (req, res) => {
  try {
    return await findUserId(req.body, res);
  } catch (error) {
    res
      .status(500)
      .send("아이디 조회 중 오류가 발생했습니다.\r\n다시 시도해주세요.");
  }
});

// 비밀번호 재설정
router.post("/updatePassword", async (req, res) => {
  try {
    return await setUserPw(req.body, res);
  } catch (error) {
    res
      .status(500)
      .send("비밀번호 변경 중 오류가 발생했습니다.\r\n다시 시도해주세요.");
  }
});

/* 프로필 설정 화면 이동 */
router.get('/setting', async (req, res) => {
  try {
    const user_id = req.session.user?.id || "admin";
    const Info = await getUserInfo(user_id);

    if (!Info) {
      return res.status(404).send("사용자 정보를 찾을 수 없습니다.");
    }
    res.render("user/profile", {
      layout: "main",
      title: "프로필 설정",
      userInfo: Info,
      cssFile: "/css/profile.css",
      jsFile: "/js/profile.js",
    });
  } catch (error) {
    console.error("프로필 설정 화면 오류:", error);
    res.status(500).send("서버 오류가 발생했습니다.");
  }
});

router.post('/setting/update', async (req, res) => {
  try {
    return await updateUser(req.body, res);
  } catch (error) {
    res
      .status(500)
      .send("회원정보 수정 중 오류가 발생했습니다.\r\n다시 시도해주세요.");
  }
});

/* 비밀번호 변경 화면 이동 */
router.get('/setting/pw', async (req, res) => {
  try {
    res.render("user/changePw", {
      layout: "main",
      title: "프로필 설정",
      cssFile: "/css/profile.css",
      jsFile: "/js/profile.js",
    });
  } catch (error) {
    console.error("프로필 설정 화면 오류:", error);
    res.status(500).send("서버 오류가 발생했습니다.");
  }
});

// 비밀번호 변경
router.post("/changePassword", async (req, res) => {
  try {
    // id 교차 검증
    // console.log("session :: ", req.session.user.id);
    // console.log("body :: ", req.body);
    if (await isCorrectPw(req.body))
      return await setUserPw(req.body, res);
    else
      return res.status(500).json({ message: "현재 사용 중인 비밀번호와 일치하지 않습니다." });

  } catch (error) {
    res
      .status(500)
      .send("비밀번호 변경 중 오류가 발생했습니다.\r\n다시 시도해주세요.");
  }
});

module.exports = router;
