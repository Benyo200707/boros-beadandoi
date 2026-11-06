import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3307,
  database: 'webshop',
  dateStrings: true
});

export default pool;
