const db = require("../config/db");

// 1. Catat Transaksi Pembayaran Denda / Penggantian Buku
exports.createPayment = async (req, res) => {
  try {
    const { loan_id, member_id, payment_type, amount, notes } = req.body;
    const created_by = req.user?.id || null;

    if (!member_id || !amount) {
      return res.status(400).json({
        success: false,
        message: "Member ID dan Jumlah Pembayaran wajib diisi.",
      });
    }

    // Insert ke tabel fine_payments
    const queryPayment = `
      INSERT INTO fine_payments (loan_id, member_id, payment_type, amount, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.query(queryPayment, [
      loan_id || null,
      member_id,
      payment_type || "late_fee",
      amount,
      notes || "",
      created_by,
    ]);

    // Jika pembayaran terkait peminjaman (loan_id), update fine_status di tabel loans
    if (loan_id) {
      await db.query("UPDATE loans SET fine_status = 'paid' WHERE id = ?", [
        loan_id,
      ]);
    }

    res.json({
      success: true,
      message: "Pembayaran denda berhasil dicatat!",
    });
  } catch (error) {
    console.error("Error createPayment:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mencatat pembayaran denda: " + error.message,
    });
  }
};

// 2. Ambil Rekap Laporan Keuangan & Riwayat Pembayaran Denda
exports.getFinancialReport = async (req, res) => {
  try {
    const { start_date, end_date, payment_type } = req.query;

    let whereClause = "WHERE 1=1";
    const queryParams = [];

    if (start_date && end_date) {
      whereClause += " AND DATE(fp.payment_date) BETWEEN ? AND ?";
      queryParams.push(start_date, end_date);
    }

    if (payment_type) {
      whereClause += " AND fp.payment_type = ?";
      queryParams.push(payment_type);
    }

    // Query daftar transaksi detail
    const queryList = `
      SELECT 
        fp.id,
        fp.loan_id,
        fp.payment_type,
        fp.amount,
        fp.payment_date,
        fp.notes,
        m.identity_number,
        m.full_name AS member_name,
        u.full_name AS officer_name
      FROM fine_payments fp
      LEFT JOIN members m ON fp.member_id = m.id
      LEFT JOIN users u ON fp.created_by = u.id
      ${whereClause}
      ORDER BY fp.payment_date DESC
    `;

    const [payments] = await db.query(queryList, queryParams);

    // Query Total Ringkasan Pemasukan
    const querySummary = `
      SELECT 
        COALESCE(SUM(amount), 0) AS total_income,
        COALESCE(SUM(CASE WHEN payment_type = 'late_fee' THEN amount ELSE 0 END), 0) AS total_late_fee,
        COALESCE(SUM(CASE WHEN payment_type = 'lost_book' THEN amount ELSE 0 END), 0) AS total_lost_book,
        COALESCE(SUM(CASE WHEN payment_type = 'damaged_book' THEN amount ELSE 0 END), 0) AS total_damaged_book
      FROM fine_payments fp
      ${whereClause}
    `;

    const [summary] = await db.query(querySummary, queryParams);

    res.json({
      success: true,
      data: payments,
      summary: summary[0] || {
        total_income: 0,
        total_late_fee: 0,
        total_lost_book: 0,
        total_damaged_book: 0,
      },
    });
  } catch (error) {
    console.error("Error getFinancialReport:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memuat laporan keuangan: " + error.message,
    });
  }
};
