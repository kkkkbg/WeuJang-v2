const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
    getNoteLists,
    createNote,
    addCard,
    importCardsFromExcel,
    setWrongCnt,
    getNoteInfo,
    getCardBookMarkList,
    setCardBookMarkUpd,
    delCard,
    updCard,
    updNote,
    delNote,
    getExamCards,
    setExamResult,
} = require("../controllers/noteController");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// 메모리 저장 설정
const upload = multer({ storage: multer.memoryStorage() });

// 회원가입
router.post("/register", async (req, res) => {
    if (await registerUser(req.body)) res.send("회원가입이 완료되었습니다.");
    else
        res
            .status(500)
            .send("회원가입 중 오류가 발생했습니다.\r\n다시 시도해주세요.");
});

// 노트 생성
router.post("/add", async (req, res) => {
    try {
        req.body.user_id = req.session.user.id;
        if (await createNote(req.body)) {
            res.send("수첩이 생성되었습니다.");
        }
        else {
            res.status(500).send("수첩 등록 중 오류가 발생했습니다.\r\n다시 시도해주세요.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("서버 오류");
    }
});

// 카드 등록
router.post('/add_card', async (req, res) => {
    try {
        if (await addCard(req.body)) {
            res.send("카드가 등록되었습니다.");
        }
        else {
            res.status(500).send("카드 등록 중 오류가 발생했습니다.\r\n다시 시도해주세요.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');
    }
});

// 카드 일괄 등록
router.post('/upload', upload.single('excelFile'), async (req, res) => {
    try {
        if (await importCardsFromExcel(req)) {
            res.send("카드가 등록되었습니다.");
        }
        else {
            res.status(500).send("카드 등록 중 오류가 발생했습니다.\r\n다시 시도해주세요.");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send('엑셀 처리 중 오류 발생');
    }
});

// 엑셀 샘플 파일 다운로드 
router.get('/download_sample', async (req, res) => {
    const filePath = path.join(__dirname, '..', 'resources', 'sample.xlsx');

    // 1. 파일 존재 확인
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('샘플 파일이 존재하지 않음:', err);
            return res.status(404).send('샘플 파일을 찾을 수 없습니다.');
        }

        // 2. 다운로드 처리
        res.download(filePath, '샘플파일.xlsx', (downloadErr) => {
            if (downloadErr) {
                console.error('다운로드 중 오류:', downloadErr);
                return res.status(500).send('파일 다운로드 중 오류가 발생했습니다.');
            }
        });
    });
});

// 틀린갯수 처리
router.post('/wrongCnt', async (req, res) => {
    try {
        const result = await setWrongCnt(req.body)
        res.send(result.toString());
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');
    }
});

// 노트 조회
router.post('/get_note', async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) return res.redirect("/");
        req.body.user_id = userId;
        const result = await getNoteInfo(req.body)
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');
    }
});

// 노트 북마크 내역 조회
router.post('/get_cardBookmark', async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) return res.redirect("/");
        req.body.user_id = userId;
        const result = await getCardBookMarkList(req.body)
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');
    }
});

// 노트 북마크 변경
router.post('/set_cardBookmark', async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) return res.redirect("/");
        //req.body.user_id = userId;
        const result = await setCardBookMarkUpd(req.body)
        res.send(result.toString());
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');
    }
});

// 카드 삭제
router.post('/del_card', async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) return res.redirect("/");

        const result = await delCard(req.body)
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');
    }
});

// 카드 수정
router.post('/upd_card', async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) return res.redirect("/");

        const result = await updCard(req.body)
        res.send([result]);
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');
    }
});

// 수첩 수정
router.post('/upd_note', async (req, res) => {
    try {
        req.body.user_id = req.session.user?.id;
        if (await updNote(req.body)) {
            res.json({ message: '제목이 저장되었습니다.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');
    }
});

// 수첩 삭제
router.post('/del_note', async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) return res.redirect("/");
        req.body.user_id = userId;

        const result = await delNote(req.body)
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');
    }
});

// 모의고사 문제 조회
router.post('/getExamCards', async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) return res.redirect("/");

        const result = await getExamCards(req.body);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');
    }
});

// 모의고사 결과 저장
router.post('/setExamResult', async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) return res.redirect("/");
        req.body.user_id = userId;

        const result = await setExamResult(req.body);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');
    }
});

module.exports = router;