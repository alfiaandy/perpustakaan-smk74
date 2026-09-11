const db = require("../config/db");

// Ambil Semua Data Anggota Siswa
exports.getStudents = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, username, full_name, role, created_at FROM users WHERE role = 'siswa' ORDER BY id DESC",
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Hapus Anggota Siswa
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM users WHERE id = ? AND role = 'siswa'", [id]);
    res.json({ success: true, message: "Data siswa berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
