const { getUserNoteLists, insertNoteInfo, getUserCardLists, insertCard, insertCards,
  updateWrongCnt, getUserNoteInfo, getCardBookMark, setCardBookMark, deleteCard, instExamResult,
  updateCard, updateNote, deleteNote, selExamCards } = require("../models/noteMapper");
const { clean } = require('../utils/sanitize');
const { getDate } = require('../utils/date');
const xlsx = require('xlsx');

/**
 * 사용자 노트 리스트 조회
 */
async function getNoteLists(user_id) {
  return await getUserNoteLists(user_id);
}

/**
 * 노트 생성
 */
async function createNote(req) {
  try {
    const { user_id, title, template } = req;
    const { DT: ENTDT, TM: ENTTM } = getDate();
    const param = { user_id, title, template, ENTDT, ENTTM };
    return insertNoteInfo(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 노트별 카드 리스트 조회
 */
async function getCardLists(note_id, page, sort) {
  return await getUserCardLists(note_id, page, 30, sort);
}

/**
 * 카드 생성
 */
async function addCard(req) {
  try {
    const { note_id, question, answer, hint } = req;

    // html 태그 제거
    const [cleanQuestion, cleanAnswer, cleanHint] =
      [question, answer, hint].map(val => clean(val));

    // 기본 입력 검증
    if (!note_id || !cleanQuestion || !cleanAnswer) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const { DT: ENTDT, TM: ENTTM } = getDate();
    const param = { note_id, cleanQuestion, cleanAnswer, cleanHint, ENTDT, ENTTM };

    return insertCard(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 카드 일괄 등록
 */
async function importCardsFromExcel(req) {
  try {

    const { note_id } = req.body;
    const { DT: ENTDT, TM: ENTTM } = getDate();

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);
    const values = [];
    let bookmarkCount = 0; // 북마크 카운트

    for (const row of rows) {
      // html 태그 제거
      const question = clean(row.question);
      const answer = clean(row.answer?.toString());
      const hint = clean(row.hint || '');
      const start = clean(row.start || '0');
      let bookmark = clean(row.bookmark || '0');
      let cnt = 0;
      cnt++;

      // 필수값 검증
      if (!note_id || !question || !answer) {
        // 전체 실패 처리
        return res.status(400).send('누락된 값이 존재합니다. 파일을 확인해주세요.');
        // console.send(`누락된 필수 값 (note_id: ${note_id}, question: ${question}, answer: ${answer})`);
        // continue;
      }

      // bookmark가 1이면 카운트 증가
      if (bookmark === '1') {
        bookmarkCount++;
        // 10개 초과 시 무조건 0으로 변경
        if (bookmarkCount > 10) {
          bookmark = '0';
        }
      }

      values.push({
        note_id: Number(note_id),
        question,
        answer,
        hint,
        star: start,
        wrongCnt: 0,
        bookmark,
        ENTDT,
        ENTTM,
      });
    }

    return insertCards(values);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 틀린갯수 카운트
 */
async function setWrongCnt(req) {
  try {
    const { card_id, wrongCnt } = req;
    // 기본 입력 검증
    if (!card_id) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const param = { card_id, wrongCnt };

    return updateWrongCnt(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 사용자 노트 개별 조회
 */
async function getNoteInfo(req) {
  try {
    const { user_id, note_id } = req;
    // 기본 입력 검증
    if (!user_id || !note_id) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const param = { user_id, note_id };

    return getUserNoteInfo(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 노트 북마크 내역 조회
 */
async function getCardBookMarkList(req) {
  try {
    const { note_id, user_id, sort } = req;
    // 기본 입력 검증
    if (!user_id || !note_id) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const param = { user_id, note_id, sort };

    return getCardBookMark(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 북마크 설정
 */
async function setCardBookMarkUpd(req) {
  try {
    const { note_id, card_id, bookmark } = req;
    // 기본 입력 검증
    if (!card_id) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const param = { note_id, card_id, bookmark };

    return setCardBookMark(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 카드 삭제
 */
async function delCard(req) {
  try {
    const { card_id, bookmark } = req;
    // 기본 입력 검증
    if (!card_id) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const param = { card_id, bookmark };

    return deleteCard(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 카드 수정
 */
async function updCard(req) {
  try {
    const { card_id, question, answer, hint } = req;
    const { DT: UPDDT, TM: UPDTM } = getDate();
    // 기본 입력 검증
    if (!card_id || !question || !answer) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const param = { card_id, question, answer, hint, UPDDT, UPDTM };

    return updateCard(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 노트 수정
 */
async function updNote(req) {
  try {
    const { user_id, note_id, title, template } = req;
    const { DT: UPDDT, TM: UPDTM } = getDate();
    // 기본 입력 검증
    if (!note_id || !user_id) {
      return res.status(400).json({ message: '필수 입력값이 누락되었습니다.' });
    }
    const param = { user_id, note_id, title, template, UPDDT, UPDTM };
    return await updateNote(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 노트 삭제
 */
async function delNote(req) {
  try {
    const { user_id, note_id } = req;
    // 기본 입력 검증
    if (!note_id || !user_id) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const param = { user_id, note_id };

    return deleteNote(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 모의고사 문제 랜덤조회
 */
async function getExamCards(req) {
  try {
    const { cardNum, notes } = req;
    // 기본 입력 검증
    if (!notes || !cardNum) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const param = {
      cardNum: Number(cardNum),
      notes: Array.isArray(notes) ? notes.map(Number) : [Number(notes)],
    };
    return selExamCards(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 모의고사 결과 저장
 */
async function setExamResult(req) {
  try {
    const { user_id, cardNum, notes, failCnt } = req;
    const { DT: ENTDT, TM: ENTTM } = getDate();
    // 기본 입력 검증
    if (!notes || !cardNum) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const param = { user_id, cardNum, notes, failCnt, ENTDT, ENTTM };
    return instExamResult(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

module.exports = {
  getNoteLists, createNote, getCardLists, addCard,
  importCardsFromExcel, setWrongCnt, getNoteInfo, getCardBookMarkList, 
  setCardBookMarkUpd, delCard, updCard, updNote, delNote, getExamCards, setExamResult,
};