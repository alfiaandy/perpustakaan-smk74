const db = require("../config/db");

// 1. Ambil Semua Berita
exports.getAllNews = async (req, res) => {
  try {
    const query = "SELECT * FROM news ORDER BY created_at DESC";
    const [results] = await db.query(query);

    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Error getAllNews:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Tambah Berita Baru
exports.createNews = async (req, res) => {
  try {
    const { title, category, excerpt, content } = req.body;
    // Jika ada file yang diunggah, ambil nama filenya
    const image = req.file ? req.file.filename : null;

    const query =
      "INSERT INTO news (title, category, excerpt, content, image) VALUES (?, ?, ?, ?, ?)";

    await db.query(query, [title, category, excerpt, content || "", image]);

    res.json({ success: true, message: "Berita berhasil ditambahkan!" });
  } catch (err) {
    console.error("Error createNews:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Hapus Berita
exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM news WHERE id = ?";

    await db.query(query, [id]);

    res.json({ success: true, message: "Berita berhasil dihapus!" });
  } catch (err) {
    console.error("Error deleteNews:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
