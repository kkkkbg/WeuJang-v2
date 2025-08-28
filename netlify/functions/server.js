// netlify/functions/server.js

const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const serverless = require("serverless-http"); // serverless-http 모듈 추가
const ejs = require("ejs");

const app = express();

const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.set("layout", "main");

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; form-action 'self'");
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS 뷰 엔진 설정
app.set("view engine", "ejs");
// 파일 경로 수정: netlify/functions에서 views 폴더를 참조하도록 경로를 조정
//app.set("views", path.join(__dirname, "../..", "views"));
app.set("views", path.resolve(__dirname, "../../views"));

// 미들웨어 설정
app.use(cookieParser(process.env.COOKIE_SECRET));
// 파일 경로 수정: public 폴더를 참조하도록 경로를 조정
app.use(express.static(path.join(__dirname, "../..", "public")));
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'public/uploads')));
app.use(
  session({
    secure: false,
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 120,
      httpOnly: true,
    },
    rolling: true,
  })
);

// CSP에 Nonce 방식 사용 (이 부분은 정적 파일과 관련되어 있어 Netlify에서 CSP를 구성하는 방식에 따라 수정이 필요할 수 있습니다.)
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "style-src 'self' 'nonce-abc123'");
  next();
});

// 라우터 등록 - 모든 경로는 라우터로 보내 처리
const indexRouter = require("../../routes/index.js"); // 파일 경로 수정
app.use("/", indexRouter);

// ** 중요: 이 부분을 제거합니다. **
// Netlify Functions가 서버를 대신 실행해주므로, app.listen() 코드가 필요 없습니다.
/*
const PORT = parseInt(process.env.PORT);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
*/

// ** 핵심: serverless-http를 사용하여 앱을 내보냅니다. **
// Netlify Functions는 이 'handler'를 호출하여 Express 앱을 실행합니다.
module.exports.handler = serverless(app);