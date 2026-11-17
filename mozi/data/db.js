import mysql from 'mysql2/promise'

const pool = mysql.createPool({
    host: `localhost`,
    user: `root`,
    password: ``,
    database: `mozi`,
    port: 3306,
    dateString: true
})

export default pool;