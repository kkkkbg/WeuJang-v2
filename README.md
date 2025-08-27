## 외우장(WeuJang)
프로젝트명 '외우장'은 효율적인 학습을 돕기 위한 암기 사이트 입니다.<br>
학습할 내용을 직접 등록하고 다양한 형태의 템플릿으로 학습할 수 있습니다.<br>
모의고사에 응시할 수 있으며 출석 및 학습 이력이 관리됩니다.<br>

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

### < 데모 화면 >
<img src = "https://github.com/user-attachments/assets/4ba6408d-82cb-4b97-9db2-7505669e1fbc" width="100%" height="40%"> | <img src = "https://github.com/user-attachments/assets/e6435836-3b18-42d2-bdda-6c7968d7cc8f" width="100%" height="40%"> | <img src = "https://github.com/user-attachments/assets/ef0a4e9e-9b67-47a4-987b-0c3a55e07fcf" width="100%" height="40%">
:---:|:---:|:---:|
**로그인** | **회원가입** | **비밀번호/아이디찾기**
![메인](https://github.com/user-attachments/assets/c565aca4-e785-405f-a569-7902f4cb6776) | ![내정보](https://github.com/user-attachments/assets/7bcd3957-df44-432b-b15b-b1ae6fab5ea7) | ![공지사항](https://github.com/user-attachments/assets/4e91270f-1b5a-4791-b3eb-1594e0f14e68) 
**메인** | **내정보** | **공지사항**
![수첩생성](https://github.com/user-attachments/assets/bf7d3f2b-b8da-4321-abd2-a41fd63b2325) | ![문제등록](https://github.com/user-attachments/assets/f6119457-c20d-4bde-acbf-9aad2ddcdc34) | ![문제엑셀등록](https://github.com/user-attachments/assets/8a4c35ce-d931-4a10-8216-bf2eb28c7f8d)
**수첩생성** | **문제등록** | **문제엑셀등록**
![템플릿1](https://github.com/user-attachments/assets/c3294dbe-cfd7-495a-9403-9b8166561f70) | ![템플릿2](https://github.com/user-attachments/assets/9af47ca6-f063-4e7d-80d2-5337293ade07) | ![템플릿3](https://github.com/user-attachments/assets/b1b1c69c-be7b-40ba-a992-7d9e32b0a05d)
**템플릿1** | **템플릿2** | **템플릿3**
![가림판생성](https://github.com/user-attachments/assets/f7974c91-c154-481d-98ea-23f0ef54f559) | ![가림판선택](https://github.com/user-attachments/assets/a0d486f5-9ff1-4f33-83ab-0ee6a1a61e62) | ![가림판사용](https://github.com/user-attachments/assets/2847a45c-bf6e-4ae0-b358-01b2b1b3c2da)
**가림판생성** | **가림판선택** | **가림판사용**
![모의고사](https://github.com/user-attachments/assets/3afc9b08-7ce0-45a5-ad05-d4ea70c9f640) | ![학습기록](https://github.com/user-attachments/assets/7272f485-5791-46da-8c62-0c16073843d6) | 
**모의고사** | **학습기록** | 

