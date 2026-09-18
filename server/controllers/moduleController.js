const db = require("../config/db");

// Get semua modul digital
exports.getAllModules = async (req, res) => {
  try {
    const query = "SELECT * FROM digital_modules ORDER BY created_at DESC";
    const [results] = await db.query(query);

    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Error getAllModules:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Tambah modul digital baru
exports.createModule = async (req, res) => {
  try {
    const { title, author, year, category, file_path } = req.body;
    const query =
      "INSERT INTO digital_modules (title, author, year, category, file_path) VALUES (?, ?, ?, ?, ?)";

    await db.query(query, [title, author, year, category, file_path]);

    res.json({ success: true, message: "Modul digital berhasil ditambahkan!" });
  } catch (err) {
    console.error("Error createModule:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Hapus modul digital
exports.deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM digital_modules WHERE id = ?";

    await db.query(query, [id]);

    res.json({ success: true, message: "Modul digital berhasil dihapus!" });
  } catch (err) {
    console.error("Error deleteModule:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
