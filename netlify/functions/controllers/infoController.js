// mapper 호출 참고용 예시

const { getUsers, createUser } = require("../models/infoMapper");

/**
 * mapper를 호출하는 메소드
 * @returns {Promise<Array>} recordset 반환
 */
async function testMethod(req, res) {
  const users = await getUsers();
  return users;
}

/**
 * mapper를 호출하는 메소드
 * @returns {string} userId반환
 */
async function testMethod2(req) {
  const { name, email } = req.body;
  const userId = await createUser(name, email);
  return userId;
}

module.exports = { testMethod , testMethod2};
