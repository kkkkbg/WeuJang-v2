## 외우장(WeuJang)
### < 프로젝트 실행 방법 >
1. 터미널에서 프로젝트 폴더로 이동 
  - cd ..\WeuJang\
2. 모듈 설치 
  - npm install
  - npm uninstall helmet
3. 실행 
  * 개발환경 : npm run dev (nodemon으로 실행)
  * 운영환경 : npm run start 
4. http://localhost:5001/ 동작 확인 

### < 기본 정보 >
node.js 버전 : v20.16.0<br>
npm 버전 : 10.8.1<br>
5001번 포트 사용(http://localhost:5001/)<br>

* 기본설치패키지 : npm install dotenv express express-session body-parser express-rate-limit mssql path express-ejs-layouts bcrypt csrf sanitize-html multer xlsx

### < 프로젝트 구조 >
```js
 WeuJang/
 ├── controllers/ # 컨트롤러 (비즈니스 로직)
 ├── models/      # DB 모델 (ORM 또는 Query)
 ├── public/      # CSS, JS, 이미지 파일
 ├── routes/      # API 라우트 관리
 ├── views/       # ejs 파일
 ├── .env         # 환경 변수 파일
 ├── .gitignore
 ├── app.js       # Express 앱 설정
 ├── dbconfig.js  # DB 설정
 ├── package-lock.json
 ├── package.json # Node.js 패키지 정보
 └── README.md
```

### < 이메일 설정 >
1. `nodemailer` 라이브러리 다운 **npm i nodemailer**
2. 네이버 메일 환경 설정 변경 (notion 참고) https://www.notion.so/2203c3393b15803b83c0d8102ceae34c?source=copy_link
2. `.env` 파일에서 `EMAIL_ID, EMAIL_PW` 항목 수정하기

### < 기타 >
1. public 폴더에 upload 폴더 추가하기
