// const mysql = require("mysql2/promise");
// require('dotenv').config();  // .env 파일을 불러옵니다.

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   multipleStatements: true,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   charset: process.env.DB_CHARSET,
// });

// module.exports = pool;

require('dotenv').config();
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);

let db;

async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db(process.env.MONGODB_DBNAME);
  console.log('MongoDB Connected');
  return db;
}

module.exports = connectDB;