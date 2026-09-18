const db = require("../config/db");

// 1. Simpan Absensi Pengunjung (Kunjungan Baru dari QR)
exports.createLog = async (req, res) => {
  try {
    const { userId, nisn } = req.body;

    if (!userId && !nisn) {
      return res.status(400).json({
        success: false,
        message: "Data QR Code tidak valid (ID / NISN Kosong).",
      });
    }

    let queryUser = "SELECT id, full_name, class, username FROM users WHERE ";
    let paramsUser = [];

    if (userId) {
      queryUser += "id = ?";
      paramsUser.push(userId);
    } else {
      queryUser += "username = ?";
      paramsUser.push(nisn);
    }

    const [users] = await db.query(queryUser, paramsUser);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Siswa tidak ditemukan di database.",
      });
    }

    const student = users[0];

    const now = new Date();
    const visitDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const visitTime = now.toTimeString().split(" ")[0]; // HH:MM:SS

    await db.query(
      "INSERT INTO visitor_logs (user_id, visit_date, visit_time) VALUES (?, ?, ?)",
      [student.id, visitDate, visitTime],
    );

    res.status(201).json({
      success: true,
      message: `Absensi Berhasil! Selamat Datang, ${student.full_name}`,
      student: {
        name: student.full_name,
        class: student.class || "-",
        nisn: student.username,
        time: visitTime,
      },
    });
  } catch (error) {
    console.error("Error createLog:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mencatat absensi.",
    });
  }
};

// 2. Ambil Rekap Data Log Pengunjung (Filter SQL 100% Presisi)
exports.getLogs = async (req, res) => {
  try {
    const { period, search, month, year } = req.query;
    let conditions = [];
    let params = [];

    // Filter Berdasarkan Periode
    if (period === "today") {
      conditions.push("vl.visit_date = CURDATE()");
    } else if (period === "weekly") {
      conditions.push(
        "WEEK(vl.visit_date, 1) = WEEK(CURDATE(), 1) AND YEAR(vl.visit_date) = YEAR(CURDATE())",
      );
      conditions.push("WEEKDAY(vl.visit_date) BETWEEN 0 AND 4");
    } else if (period === "monthly") {
      // PAKSA FILTER BULAN & TAHUN SESUAI INPUT DROPDOWN
      const reqMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;
      const reqYear = year ? parseInt(year, 10) : new Date().getFullYear();

      conditions.push("MONTH(vl.visit_date) = ?");
      params.push(reqMonth);

      conditions.push("YEAR(vl.visit_date) = ?");
      params.push(reqYear);
    } else if (period === "yearly") {
      const reqYear = year ? parseInt(year, 10) : new Date().getFullYear();
      conditions.push("YEAR(vl.visit_date) = ?");
      params.push(reqYear);
    }

    // Filter Pencarian Nama / NISN
    if (search && search.trim() !== "") {
      conditions.push("(u.full_name LIKE ? OR u.username LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT vl.id, vl.visit_date, vl.visit_time, u.full_name, u.username as nisn, u.class
      FROM visitor_logs vl
      JOIN users u ON vl.user_id = u.id
      ${whereClause}
      ORDER BY vl.id DESC
      LIMIT 300
    `;

    const [rows] = await db.query(query, params);

    // Hitung Ringkasan Statistik
    const [stats] = await db.query(`
      SELECT 
        COUNT(CASE WHEN visit_date = CURDATE() THEN 1 END) AS total_today,
        COUNT(CASE WHEN MONTH(visit_date) = MONTH(CURDATE()) AND YEAR(visit_date) = YEAR(CURDATE()) THEN 1 END) AS total_month,
        COUNT(*) AS total_all
      FROM visitor_logs
    `);

    res.json({
      success: true,
      stats: stats[0],
      data: rows,
    });
  } catch (error) {
    console.error("Error getLogs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
