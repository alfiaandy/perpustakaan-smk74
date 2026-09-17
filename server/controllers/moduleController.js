const db = require("../config/db"); // Sesuaikan dengan koneksi db kamu

// Get semua modul digital
exports.getAllModules = (req, res) => {
  const query = "SELECT * FROM digital_modules ORDER BY created_at DESC";
  db.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
};

// Tambah modul digital baru
exports.createModule = (req, res) => {
  const { title, author, year, category, file_path } = req.body;
  const query =
    "INSERT INTO digital_modules (title, author, year, category, file_path) VALUES (?, ?, ?, ?, ?)";

  db.query(query, [title, author, year, category, file_path], (err, result) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Modul digital berhasil ditambahkan!" });
  });
};

// Hapus modul digital
exports.deleteModule = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM digital_modules WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Modul digital berhasil dihapus!" });
  });
};
