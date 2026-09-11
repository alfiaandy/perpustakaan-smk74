const mysql = require("mysql2");
require("dotenv").config();

// Membuat connection pool untuk MySQL Laragon
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "db_perpustakaan_smk",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Tes Koneksi saat Server Dijalankan
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ DB Connection Failed:", err.message);
  } else {
    console.log("✅ Terhubung ke Database MySQL (Laragon/phpMyAdmin)");
    connection.release();
  }
});

module.exports = pool.promise();
