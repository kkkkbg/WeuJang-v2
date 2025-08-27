const nodemailer = require("nodemailer");
require('dotenv').config();

// 메일 발송 객체 생성
const transporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 1,
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, //secure: true면 포트는 465
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PW,
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = {
    transporter
};
