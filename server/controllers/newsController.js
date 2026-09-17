const db = require("../config/db");

exports.getAllNews = (req, res) => {
  const query = "SELECT * FROM news ORDER BY created_at DESC";
  db.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
};

exports.createNews = (req, res) => {
  const { title, category, excerpt, content } = req.body;
  // Jika ada file yang diunggah, ambil nama filenya
  const image = req.file ? req.file.filename : null;

  const query =
    "INSERT INTO news (title, category, excerpt, content, image) VALUES (?, ?, ?, ?, ?)";

  db.query(
    query,
    [title, category, excerpt, content || "", image],
    (err, result) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: "Berita berhasil ditambahkan!" });
    },
  );
};

exports.deleteNews = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM news WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Berita berhasil dihapus!" });
  });
};
