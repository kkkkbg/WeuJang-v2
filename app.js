require("dotenv").config(); // .env 파일을 로드

const express = require("express");
const session = require("express-session");
// const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");
const cors = require("cors");

const app = express();

const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.set("layout", "main");

// app.use(cors()); /* 운영환경에서 사용 예정 */
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; form-action 'self' https://192.168.0.52:5001");
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/*[25.05.07] 개발환경에서 helmet 사용 X
 helmet : 웹 취약성으로 부터 웹서버를 보호하는 역할의 미들웨어
 운영환경에서 helmet의 속성 설정을 변경해 사용할 예정*/
/* app.use(
  helmet({
    frameguard: false,
  })
); */

// 미들웨어 설정
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(
  session({
    secure: false, // https 환경에서만 session 정보를 주고받음
    secret: process.env.COOKIE_SECRET,
    resave: false, // 세션이 수정될 때만 다시 저장
    saveUninitialized: true, // 처음부터 세션 생성
    cookie: {
      maxAge: 1000 * 60 * 120, //세션 만료 시간 설정 - 120분
      httpOnly: true, //자바스크립트를 통한 세션 쿠키 사용 불가
    },
    rolling: true, // 새로고침 시 만료시간 갱신
  })
);

// CSP에 Nonce 방식 사용
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "style-src 'self' 'nonce-abc123'");
  next();
});

const PORT = parseInt(process.env.PORT);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// 라우터 등록 - 모든 경로는 라우터로 보내 처리
const indexRouter = require("./routes/index.js");
app.use("/", indexRouter);
