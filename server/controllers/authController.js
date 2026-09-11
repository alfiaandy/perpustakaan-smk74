require("dotenv").config();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Secret Key Fallback disamakan penuh dengan authMiddleware
const JWT_SECRET = process.env.JWT_SECRET || "kunci_rahasia_smkn74";

// 1. Login User (Admin, Pustakawan, atau Siswa)
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username dan password wajib diisi!",
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
        .json({ success: false, message: "Username tidak terdaftar!" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Password yang Anda masukkan salah!",
      });
    }

    // Generate Token JWT
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

// 2. Register User Baru
exports.register = async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;

    if (!username || !password || !full_name) {
      return res
        .status(400)
        .json({ success: false, message: "Semua kolom form wajib diisi!" });
    }

    const cleanUsername = username.trim();
    const targetRole = role ? role.trim().toLowerCase() : "siswa";

    const [existing] = await db.query(
      "SELECT id FROM users WHERE LOWER(username) = LOWER(?)",
      [cleanUsername],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username / NISN tersebut sudah terdaftar!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      "INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)",
      [cleanUsername, hashedPassword, full_name.trim(), targetRole],
    );

    res
      .status(201)
      .json({ success: true, message: "Registrasi akun berhasil!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menyimpan akun: " + error.message,
    });
  }
};

// 3. Reset Password Khusus Siswa
exports.forgotPassword = async (req, res) => {
  try {
    const { username, new_password } = req.body;

    if (!username || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Username/NISN dan password baru wajib diisi!",
      });
    }

    const cleanUsername = username.trim();

    // 1. Cari user berdasarkan username
    const [users] = await db.query(
      "SELECT id, role FROM users WHERE LOWER(username) = LOWER(?)",
      [cleanUsername],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Username / NISN Siswa tidak ditemukan!",
      });
    }

    const user = users[0];

    // 2. Proteksi Role: Tolak jika akun bertipe admin atau pustakawan
    if (user.role === "admin" || user.role === "pustakawan") {
      return res.status(403).json({
        success: false,
        message:
          "Akses ditolak! Akun Petugas/Admin tidak dapat di-reset melalui halaman ini. Hubungi Administrator Utama.",
      });
    }

    // 3. Hash password baru dan simpan
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      user.id,
    ]);

    res.json({
      success: true,
      message:
        "Password akun siswa berhasil diperbarui! Silakan kembali dan login.",
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
