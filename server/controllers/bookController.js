const db = require("../config/db");

// 1. Ambil Semua Buku (Public OPAC dengan Search & Filter Kategori)
exports.getBooks = async (req, res) => {
  try {
    const { search, category_id } = req.query;
    let query = `
      SELECT b.*, c.name as category_name 
      FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    // Validasi agar search hanya diproses jika benar-benar ada teksnya
    if (search && search.trim() !== "") {
      query += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)`;
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (category_id) {
      query += ` AND b.category_id = ?`;
      params.push(category_id);
    }

    query += ` ORDER BY b.id DESC`;

    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Tambah Buku Baru (Create)
exports.createBook = async (req, res) => {
  try {
    const {
      isbn,
      title,
      author,
      publisher,
      year_published,
      total_stock,
      rack_location,
      category_id,
    } = req.body;

    if (!title || !author || !total_stock) {
      return res.status(400).json({
        success: false,
        message: "Judul, Penulis, dan Total Stok wajib diisi!",
      });
    }

    const available_stock = Number(total_stock);

    await db.query(
      `INSERT INTO books 
      (isbn, title, author, publisher, year_published, total_stock, available_stock, rack_location, category_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        isbn || null,
        title,
        author,
        publisher || null,
        year_published || null,
        total_stock,
        available_stock,
        rack_location || null,
        category_id || null,
      ],
    );

    res
      .status(201)
      .json({ success: true, message: "Buku berhasil ditambahkan!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Data Buku (Update)
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      isbn,
      title,
      author,
      publisher,
      year_published,
      total_stock,
      available_stock,
      rack_location,
      category_id,
    } = req.body;

    await db.query(
      `UPDATE books SET 
        isbn = ?, 
        title = ?, 
        author = ?, 
        publisher = ?, 
        year_published = ?, 
        total_stock = ?, 
        available_stock = ?, 
        rack_location = ?, 
        category_id = ? 
      WHERE id = ?`,
      [
        isbn || null,
        title,
        author,
        publisher || null,
        year_published || null,
        total_stock,
        available_stock ?? total_stock,
        rack_location || null,
        category_id || null,
        id,
      ],
    );

    res.json({ success: true, message: "Data buku berhasil diperbarui!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Hapus Data Buku (Delete)
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM books WHERE id = ?", [id]);
    res.json({ success: true, message: "Buku berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
