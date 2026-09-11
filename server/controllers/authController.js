require("dotenv").config();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "kunci_rahasia_smkn74";

// Helper Fungsi Validasi Kompleksitas Password
const isPasswordStrong = (password) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return (
    minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
  );
};

// 1. Login User (NISN untuk Siswa, Username untuk Petugas/Admin)
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "NISN / Username dan password wajib diisi!",
      });
    }

    const cleanUsername = username.trim();

    const [users] = await db.query(
      "SELECT * FROM users WHERE LOWER(username) = LOWER(?)",
      [cleanUsername],
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "NISN / Username tidak terdaftar!" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Password yang Anda masukkan salah!",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      success: true,
      message: "Login berhasil!",
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};

// 2. Register Siswa Baru dengan NISN
exports.register = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { nisn, username, password, full_name, role } = req.body;

    // Menerima 'nisn' atau fallback ke 'username'
    const targetNisn = (nisn || username || "").trim();
    const cleanFullName = (full_name || "").trim();
    const targetRole = role ? role.trim().toLowerCase() : "siswa";

    if (!targetNisn || !password || !cleanFullName) {
      return res
        .status(400)
        .json({ success: false, message: "Semua kolom form wajib diisi!" });
    }

    // Validasi Angka Khusus NISN
    if (!/^\d+$/.test(targetNisn)) {
      return res.status(400).json({
        success: false,
        message: "NISN siswa wajib berupa angka!",
      });
    }

    // Validasi Kekuatan Password
    if (!isPasswordStrong(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password terlalu lemah! Wajib minimal 8 karakter, mengandung 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 simbol khusus.",
      });
    }

    const [existing] = await connection.query(
      "SELECT id FROM users WHERE LOWER(username) = LOWER(?)",
      [targetNisn],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "NISN tersebut sudah terdaftar!",
      });
    }

    await connection.beginTransaction();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan NISN ke kolom 'username' tabel users
    await connection.query(
      "INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)",
      [targetNisn, hashedPassword, cleanFullName, targetRole],
    );

    // Otomatis Simpan NISN ke 'identity_number' tabel members
    const [existingMember] = await connection.query(
      "SELECT id FROM members WHERE identity_number = ?",
      [targetNisn],
    );

    if (existingMember.length === 0) {
      await connection.query(
        "INSERT INTO members (identity_number, full_name, role, status) VALUES (?, ?, ?, 'active')",
        [targetNisn, cleanFullName, targetRole],
      );
    }

    await connection.commit();

    res
      .status(201)
      .json({ success: true, message: "Registrasi akun siswa berhasil!" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: "Gagal menyimpan akun: " + error.message,
    });
  } finally {
    connection.release();
  }
};

// 3. Reset Password Khusus Siswa Berdasarkan NISN
exports.forgotPassword = async (req, res) => {
  try {
    const { nisn, username, new_password } = req.body;
    const targetNisn = (nisn || username || "").trim();

    if (!targetNisn || !new_password) {
      return res.status(400).json({
        success: false,
        message: "NISN Siswa dan password baru wajib diisi!",
      });
    }

    // Validasi Kekuatan Password Baru
    if (!isPasswordStrong(new_password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password baru terlalu lemah! Wajib minimal 8 karakter, mengandung 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 simbol khusus.",
      });
    }

    const [users] = await db.query(
      "SELECT id, role FROM users WHERE LOWER(username) = LOWER(?)",
      [targetNisn],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "NISN Siswa tidak ditemukan!",
      });
    }

    const user = users[0];

    if (user.role === "admin" || user.role === "pustakawan") {
      return res.status(403).json({
        success: false,
        message:
          "Akses ditolak! Akun Petugas/Admin tidak dapat di-reset melalui halaman ini. Hubungi Administrator Utama.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      user.id,
    ]);

    res.json({
      success: true,
      message:
        "Password akun siswa berhasil diperbarui! Silakan kembali dan login dengan NISN Anda.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal memproses reset password: " + error.message,
    });
  }
};

// 4. Get Current User (Cek Sesi Active)
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
