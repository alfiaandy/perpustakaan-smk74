const db = require("../config/db");

// Daftar Resmi Kelas & Jurusan Seni SMKN 74 Jakarta
const VALID_CLASSES = [
  "X Seni Tari",
  "X Seni Karawitan",
  "X Seni Musik",
  "X Seni Teater",
  "XI Seni Tari",
  "XI Seni Karawitan",
  "XI Seni Musik",
  "XI Seni Teater",
  "XII Seni Tari",
  "XII Seni Karawitan",
  "XII Seni Musik",
  "XII Seni Teater",
];

// 1. Ambil Semua Data Anggota Siswa (Termasuk Kolom Class)
exports.getStudents = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, username, full_name, class, role, created_at FROM users WHERE role = 'siswa' ORDER BY id DESC",
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Hapus Anggota Siswa
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM users WHERE id = ? AND role = 'siswa'", [id]);
    res.json({ success: true, message: "Data siswa berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Profil / Lengkapi Data Kartu Digital Siswa (Kelas & Jurusan)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    const rawClass =
      req.body.class_name || req.body.class_major || req.body.class;

    // Validasi 1: Kelengkapan Parameter
    if (!userId || !rawClass) {
      return res.status(400).json({
        success: false,
        message: "ID User dan Kelas/Jurusan wajib diisi.",
      });
    }

    const formattedClassName = rawClass.trim();

    // Validasi 2: Memastikan Kelas & Jurusan Sesuai Daftar Resmi
    if (!VALID_CLASSES.includes(formattedClassName)) {
      return res.status(400).json({
        success: false,
        message: "Kelas & Jurusan yang dipilih tidak valid.",
      });
    }

    // Update kolom class di tabel users
    const query = "UPDATE users SET class = ? WHERE id = ?";
    await db.query(query, [formattedClassName, userId]);

    // Ambil data user terbaru untuk dikembalikan ke frontend
    const [updatedUsers] = await db.query(
      "SELECT id, username, full_name, role, class FROM users WHERE id = ?",
      [userId],
    );

    const updatedUser = updatedUsers[0];

    res.json({
      success: true,
      message: "Data kartu anggota berhasil diperbarui!",
      user: {
        ...updatedUser,
        class: updatedUser.class,
        class_major: updatedUser.class, // Alias untuk sinkronisasi antarmuka
        kelas: updatedUser.class,
      },
    });
  } catch (error) {
    console.error("Error updateProfile:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui data profil.",
    });
  }
};
