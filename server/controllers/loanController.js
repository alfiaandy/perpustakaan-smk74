const db = require("../config/db");

// Helper untuk generate Kode Pinjam Unik
const generateLoanCode = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LNK-${dateStr}-${randomStr}`;
};

// 1. Ambil Semua Transaksi (Admin/Petugas)
exports.getLoans = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        l.id,
        l.loan_code,
        l.booking_date,
        l.max_take_date,
        l.loan_date,
        l.due_date,
        l.return_date,
        l.status,
        l.late_days,
        l.fine_amount,
        l.fine_status,
        l.notes,
        m.full_name AS student_name,
        m.identity_number AS student_nisn,
        b.title AS book_title,
        b.isbn AS book_isbn,
        b.cover_image
      FROM loans l
      JOIN members m ON l.member_id = m.id
      JOIN books b ON l.book_id = b.id
      ORDER BY l.id DESC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Pengajuan Pinjam oleh Siswa (Via Web OPAC) - LOGIKA H+7
exports.requestLoan = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const userId = req.user.id;
    const { book_id, max_take_date } = req.body;

    if (!book_id) {
      return res
        .status(400)
        .json({ success: false, message: "Buku wajib dipilih!" });
    }

    await connection.beginTransaction();

    // STEP A: Ambil data user dari tabel users
    const [userRows] = await connection.query(
      "SELECT username, full_name, role FROM users WHERE id = ?",
      [userId],
    );

    if (userRows.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Data pengguna tidak ditemukan!" });
    }

    const currentUser = userRows[0];

    // STEP B: Cari atau Buat Otomatis record di tabel members
    let memberId = null;
    const [memberRows] = await connection.query(
      "SELECT id FROM members WHERE identity_number = ?",
      [currentUser.username],
    );

    if (memberRows.length > 0) {
      memberId = memberRows[0].id;
    } else {
      const [insertMember] = await connection.query(
        "INSERT INTO members (identity_number, full_name, role, status) VALUES (?, ?, ?, 'active')",
        [
          currentUser.username,
          currentUser.full_name,
          currentUser.role || "siswa",
        ],
      );
      memberId = insertMember.insertId;
    }

    // STEP C: Cek Stok Buku
    const [books] = await connection.query(
      "SELECT available_stock FROM books WHERE id = ?",
      [book_id],
    );
    if (books.length === 0 || books[0].available_stock <= 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Stok buku sedang kosong!" });
    }

    // STEP D: Cek Limit Pinjaman (Maksimal 3 buku aktif/booking)
    const [activeLoans] = await connection.query(
      "SELECT COUNT(*) AS total FROM loans WHERE member_id = ? AND status IN ('menunggu_konfirmasi', 'borrowed', 'dipinjam')",
      [memberId],
    );
    if (activeLoans[0].total >= 3) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Akses ditolak! Anda sudah mencapai batas maksimal peminjaman (3 buku).",
      });
    }

    // STEP E: Cek Denda Tertunggak
    const [unpaidFines] = await connection.query(
      "SELECT COUNT(*) AS total FROM loans WHERE member_id = ? AND fine_status = 'unpaid'",
      [memberId],
    );
    if (unpaidFines[0].total > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Gagal mengajukan! Anda masih memiliki denda yang belum dilunasi.",
      });
    }

    // STEP F: Insert Transaksi ke Tabel loans (Status: menunggu_konfirmasi, Kalkulasi H+7)
    const loanCode = generateLoanCode();
    const bookingDate = new Date();

    // Default maxTakeDate H+7 (7 hari dari tanggal booking) jika tidak dikirim dari frontend
    const defaultH7 = new Date();
    defaultH7.setDate(bookingDate.getDate() + 7);
    const finalMaxTakeDate =
      max_take_date || defaultH7.toISOString().slice(0, 10);

    await connection.query(
      `INSERT INTO loans 
        (loan_code, member_id, book_id, booking_date, max_take_date, status, fine_amount, fine_status, notes) 
       VALUES (?, ?, ?, ?, ?, 'menunggu_konfirmasi', 0.00, 'none', 'Pengajuan Online Siswa')`,
      [loanCode, memberId, book_id, bookingDate, finalMaxTakeDate],
    );

    // Kunci Stok Sementara (-1)
    await connection.query(
      "UPDATE books SET available_stock = available_stock - 1 WHERE id = ?",
      [book_id],
    );

    await connection.commit();
    res.status(201).json({
      success: true,
      message:
        "Pengajuan pinjam berhasil! Silakan ambil buku fisik di perpustakaan sebelum tanggal batas ambil (H+7).",
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

// 3. Persetujuan Peminjaman oleh Admin
exports.approveLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const loanDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(loanDate.getDate() + 7);

    await db.query(
      "UPDATE loans SET status = 'borrowed', loan_date = ?, due_date = ? WHERE id = ?",
      [loanDate, dueDate, id],
    );

    res.json({
      success: true,
      message: "Peminjaman disetujui, buku berhasil diserahkan ke siswa!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Penolakan Pengajuan / Pembatalan
exports.rejectLoan = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    await connection.beginTransaction();

    const [loans] = await connection.query(
      "SELECT book_id, status FROM loans WHERE id = ?",
      [id],
    );
    if (loans.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Transaksi tidak ditemukan" });
    }

    // Kembalikan stok jika batal
    if (
      loans[0].status === "borrowed" ||
      loans[0].status === "menunggu_konfirmasi"
    ) {
      await connection.query(
        "UPDATE books SET available_stock = available_stock + 1 WHERE id = ?",
        [loans[0].book_id],
      );
    }

    await connection.query("UPDATE loans SET status = 'ditolak' WHERE id = ?", [
      id,
    ]);

    await connection.commit();
    res.json({
      success: true,
      message: "Pengajuan peminjaman berhasil dibatalkan.",
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

// 5. Transaksi Langsung di Meja Petugas
exports.createDirectLoan = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { user_id, book_id, loan_days = 7 } = req.body;

    if (!user_id || !book_id) {
      return res
        .status(400)
        .json({ success: false, message: "Siswa dan Buku wajib dipilih!" });
    }

    await connection.beginTransaction();

    const [userRows] = await connection.query(
      "SELECT username, full_name, role FROM users WHERE id = ?",
      [user_id],
    );

    if (userRows.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Data siswa tidak ditemukan!" });
    }

    const currentUser = userRows[0];

    let memberId = null;
    const [memberRows] = await connection.query(
      "SELECT id FROM members WHERE identity_number = ?",
      [currentUser.username],
    );

    if (memberRows.length > 0) {
      memberId = memberRows[0].id;
    } else {
      const [insertMember] = await connection.query(
        "INSERT INTO members (identity_number, full_name, role, status) VALUES (?, ?, ?, 'active')",
        [
          currentUser.username,
          currentUser.full_name,
          currentUser.role || "siswa",
        ],
      );
      memberId = insertMember.insertId;
    }

    const [books] = await connection.query(
      "SELECT available_stock FROM books WHERE id = ?",
      [book_id],
    );
    if (books.length === 0 || books[0].available_stock <= 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Stok buku habis!" });
    }

    const loanCode = generateLoanCode();
    const loanDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(loanDate.getDate() + parseInt(loan_days));

    await connection.query(
      `INSERT INTO loans 
        (loan_code, member_id, book_id, booking_date, max_take_date, loan_date, due_date, status, fine_amount, fine_status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'borrowed', 0.00, 'none', 'Peminjaman Langsung Petugas')`,
      [loanCode, memberId, book_id, loanDate, loanDate, loanDate, dueDate],
    );

    await connection.query(
      "UPDATE books SET available_stock = available_stock - 1 WHERE id = ?",
      [book_id],
    );

    await connection.commit();
    res.status(201).json({
      success: true,
      message: "Peminjaman langsung berhasil dicatat!",
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

// 6. Proses Pengembalian Buku
exports.returnBook = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    await connection.beginTransaction();

    const [loans] = await connection.query("SELECT * FROM loans WHERE id = ?", [
      id,
    ]);
    if (loans.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Transaksi tidak ditemukan!" });
    }

    const loan = loans[0];
    if (loan.status === "returned" || loan.status === "dikembalikan") {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Buku sudah dikembalikan sebelumnya.",
      });
    }

    const returnDate = new Date();
    const dueDate = new Date(loan.due_date);
    let lateDays = 0;
    let fineAmount = 0;
    let fineStatus = "none";

    if (returnDate > dueDate) {
      const diffTime = Math.abs(returnDate - dueDate);
      lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = lateDays * 1000;
      fineStatus = "unpaid";
    }

    await connection.query(
      `UPDATE loans SET 
        return_date = ?, 
        status = 'returned', 
        late_days = ?, 
        fine_amount = ?, 
        fine_status = ? 
       WHERE id = ?`,
      [returnDate, lateDays, fineAmount, fineStatus, id],
    );

    await connection.query(
      "UPDATE books SET available_stock = available_stock + 1 WHERE id = ?",
      [loan.book_id],
    );

    await connection.commit();
    res.json({
      success: true,
      message: "Buku berhasil dikembalikan!",
      fine_amount: fineAmount,
      late_days: lateDays,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

// 7. Ambil Riwayat Peminjaman Milik Siswa yang Sedang Login
exports.getMyLoans = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ambil NISN dari user
    const [userRows] = await db.query(
      "SELECT username FROM users WHERE id = ?",
      [userId],
    );

    if (userRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    const nisn = userRows[0].username;

    // Ambil data peminjaman beserta booking_date & max_take_date
    const [rows] = await db.query(
      `
      SELECT 
        l.id,
        l.loan_code,
        l.booking_date,
        l.max_take_date,
        l.loan_date AS borrow_date,
        l.due_date,
        l.return_date,
        l.status,
        b.title AS book_title,
        b.author,
        b.cover_image
      FROM loans l
      JOIN members m ON l.member_id = m.id
      JOIN books b ON l.book_id = b.id
      WHERE m.identity_number = ?
      ORDER BY l.id DESC
    `,
      [nisn],
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data peminjaman Anda: " + error.message,
    });
  }
};
