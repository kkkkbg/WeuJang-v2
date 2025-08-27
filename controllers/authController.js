const { getUserInfo, searchSameUserId, insertUserInfo, getUserId, updatePassword, updateUserInfo, insertAttendance } = require("../models/authMapper");
const { getCoverOption } = require("./coverController");
const { getDate } = require('../utils/date');
const { transporter } = require('../utils/email');
require('dotenv').config();

const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * 사용가능 아이디 확인
 */
async function chkUserId(user_id) {
    return await searchSameUserId(user_id);
};

/**
 * 회원가입
 */
async function registerUser(req) {
    try {
        const { user_id, password, name, email, birth } = req;
        const { DT: ENTDT, TM: ENTTM } = getDate();
        const creatDTM = `${ENTDT}${ENTTM}`;

        // 비밀번호 암호화
        const hashedPw = await bcrypt.hash(password, saltRounds);

        const param = { user_id, hashedPw, name, email, birth, creatDTM, ENTDT, ENTTM };
        console.log("param :", param);
        return insertUserInfo(param);

    } catch (error) {
        console.log("error : ", error);
    }
    return false;
}

/**
 * 로그인
 */
async function handleLogin(req, res, username, password) {

    // 가림판 default option 
    var coverSettings = { title: "", opacity: 0.87, color: "#ff0000", text: "", text_size: 16, text_color: "#000000", Img: "" };

    // 테스트용 계정
    if (username === 'admin' && password === '1234') {
        req.session.user = {
            id: "admin",
            name: "관리자",
            email: "admin@mail.com",
            birth: "19990101",
            status: 1,
            coverId: -1,
        };
        return res.status(200).json({ message: "로그인 성공!", redirect: "/main", cover: coverSettings });
    }

    try {
        // 1. DB에서 사용자 정보 조회
        const user = await getUserInfo(username);
        if (user == null)
            return res.status(401).json({ message: "존재하지 않는 계정입니다." });

        // 2. 비밀번호 비교
        if (await chkPw(password, user.password)) {

            // session에 사용자 정보 저장
            req.session.user = {
                id: user.user_id,
                name: user.name,
                email: user.email,
                birth: user.birth,
                status: user.status,
                coverId: user.cover_id,
            };
            // 가림판 상세 조회
            if (user.cover_id > -1) {
                coverSettings = await getCoverOption(user.user_id, user.cover_id);
            }
            // 출석체크
            const { DT: ENTDT, TM: ENTTM } = getDate();
            var userAtt = insertAttendance(user.user_id, ENTDT);

            if (!coverSettings || !userAtt) {
                return res.status(500).json({ message: "서버오류발생 다시 한번 시도해 주세요." });
            }

            return res.status(200).json({ message: "로그인 성공!", redirect: "/main", cover: coverSettings });
        }
        return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "서버오류발생 다시 한번 시도해 주세요." });
    }
}

/**
 * 비밀번호 비교
 */
async function chkPw(plainPassword, storedHashedPassword) {
    return await bcrypt.compare(plainPassword, storedHashedPassword);
}

/**
 * 아이디 찾기
 */
async function findUserId(req, res) {
    try {
        // console.log(req);
        const user = await getUserId(req);
        // console.log("user", user);
        if (user == null)
            return res.status(200).json({ message: "계정 정보가 존재하지 않습니다." });
        return res.status(200).json({ message: "고객님의 정보와 일치하는 아이디입니다.", user: user });
    } catch (error) {
        console.error("sql error:", err);
        return res.status(500).json({ message: "서버오류발생 다시 한번 시도해 주세요." });
    }
}

/**
 * 비밀번호 재설정 
 */
async function setUserPw(req, res) {
    try {
        const { userId, password } = req;
        const { DT: UPDDT, TM: UPDTM } = getDate();

        // 비밀번호 암호화
        const pw = await bcrypt.hash(password, saltRounds);

        const param = { userId, pw, UPDDT, UPDTM };
        if (updatePassword(param)) {
            return res.status(200).json({ message: "비밀번호 변경 성공" });
        } else {
            return res.status(500).json({ message: "비밀번호 변경 실패" });
        }
    } catch (error) {
        console.error("sql error:", err);
        return res.status(500).json({ message: "서버오류발생 다시 한번 시도해 주세요." });
    }
}

/**
 * 회원정보 수정
 */
async function updateUser(req, res) {
    try {
        const { user_id, name, email, birth } = req;
        const { DT: UPDDT, TM: UPDTM } = getDate();
        const formattedBirth = birth.replace(/-/g, "");
        const param = { user_id, name, email, birth: formattedBirth, UPDDT, UPDTM };

        if (updateUserInfo(param)) {
            return res.status(200).json({ message: "회원정보 변경 성공" });
        } else {
            return res.status(500).json({ message: "회원정보 변경 실패" });
        }
    } catch (error) {
        console.error("sql error:", error);
        return res.status(500).json({ message: "서버오류발생 다시 한번 시도해 주세요." });
    }
};

/**
 * 비밀번호 일치여부 조회
 */
async function isCorrectPw(body) {
    const { userId, currentPw } = body;
    try {
        // 사용자 정보 조회
        const user = await getUserInfo(userId);
        if (user == null) return false;

        // 비밀번호 비교
        return await chkPw(currentPw, user.password);
    }
    catch (error) {
        console.error("pw check err", error);
    }
}

/**
 * 인증번호 생성
 */
const createAuthCode = function (min, max) {
    var randumNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return randumNum;
}

/**
 * 이메일 발송
 */
async function sendAuthCode(req, res) {
    const code = createAuthCode(111111, 999999);
    const { email } = req;
    const content = `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
    <h2 style="color: #333;">인증번호 확인</h2>
    <p style="font-size: 16px; color: #555;">
      안녕하세요.<br>
      요청하신 인증번호는 아래와 같습니다. 해당 번호를 정확히 입력해주세요.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <span style="display: inline-block; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #2c3e50;">
        ${code}
      </span>
    </div>

    <p style="font-size: 14px; color: #999;">
      본 이메일은 자동 발송된 메시지입니다. 답변하지 마세요.<br>
      인증번호는 10분간 유효합니다.
    </p>

    <hr style="margin-top: 40px;">
    <p style="font-size: 12px; color: #aaa;">
      © 2025 외우장. All rights reserved.
    </p>
  </div>
  `
    console.log("전송 주소 :", email)
    console.log("content : ", content);

    await transporter.verify();

    const mailOption = mailOpt(email, process.env.EMAIL_TITLE, content);

    (async () => {
        try {
            const info = await sendMail(mailOption);
            console.log("메일 전송 성공:", info.response);
            return res.status(200).json({ message: "메일 전송에 성공했습니다.", authCode: code });
        } catch (err) {
            console.error("메일 전송 실패:", err);
            return res.status(500).json({ message: "메일 전송에 실패했습니다." });
        }
    })();
}

// 메일을 받을 유저 설정
const mailOpt = (email, title, contents) => {
    const mailOptions = {
        from: process.env.EMAIL_ID,
        to: email,
        subject: title,
        html: contents
    };
    return mailOptions;
}

// 메일 전송
const sendMail = (mailOption) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOption, (error, info) => {
            if (error) {
                console.log('에러:', error);
                reject(error);  // 실패 시 reject
            } else {
                console.log('전송 완료:', info.response);
                resolve(info);  // 성공 시 resolve
            }
            transporter.close(); // 연결 종료는 콜백 안에서 실행해야 함
        });
    });
};



module.exports = { chkUserId, registerUser, handleLogin, sendAuthCode, findUserId, setUserPw, updateUser, isCorrectPw };