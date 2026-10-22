import mysql from "mysql2";

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "szallasok",
    port: 3307
});

export default pool.promise();
