// 참고용 예시
const pool = require("../dbconfig.js");

/**
 * DB에 접근해 CRUD 기능을 수행하는 메소드
 * @returns {Promise<Array>}
 */
async function getUsers() {
  const [rows] = await pool.query('SELECT * FROM sys.test');
  return rows;
};

/**
 * DB에 접근해 CRUD 기능을 수행하는 메소드
 * @param {string} name 파라미터1
 * @param {string} email 파라미터2
 * @returns {boolean} 성공여부 반환
 */
async function createUser(name, email){
  const [result] = await pool.query(`
    INSERT INTO sys.test (name, email) 
    VALUES (?, ?)`, 
    [name, email]);

  if(result.affectedRows < 0) return false;
   
  return true;
};

module.exports = {
  getUsers,
  createUser,
};
