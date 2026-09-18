const db = require("../config/db");

// 1. Ambil Semua Buku (Public OPAC dengan Search & Filter Kategori)
exports.getBooks = async (req, res) => {
  try {
    const { search, category_id, category, sortBy } = req.query;

    let query = `
      SELECT b.*, c.name as category_name 
      FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim() !== "") {
      query += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)`;
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (category_id) {
      query += ` AND b.category_id = ?`;
      params.push(category_id);
    } else if (category && category !== "all") {
      query += ` AND c.name = ?`;
      params.push(category);
    }

    if (sortBy === "title-asc") {
      query += ` ORDER BY b.title ASC`;
    } else {
      query += ` ORDER BY b.id DESC`;
    }

    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Ambil Detail 1 Buku Berdasarkan ID
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT b.*, c.name as category_name 
      FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id 
      WHERE b.id = ?
    `;
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Buku tidak ditemukan" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Ambil Semua Kategori Buku (Untuk Filter & Form Tambah Buku)
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY name ASC");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Tambah Buku Baru (Create)
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
      description,
    } = req.body;

    if (!title || !author || !total_stock) {
      return res.status(400).json({
        success: false,
        message: "Judul, Penulis, dan Total Stok wajib diisi!",
      });
    }

    const cover_image = req.file ? req.file.filename : null;
    const available_stock = Number(total_stock);

    await db.query(
      `INSERT INTO books 
      (isbn, title, author, publisher, year_published, total_stock, available_stock, rack_location, category_id, description, cover_image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        description || null,
        cover_image,
      ],
    );

    res
      .status(201)
      .json({ success: true, message: "Buku berhasil ditambahkan!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Update Data Buku (Update)
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
      description,
    } = req.body;

    let updateCoverQuery = "";
    const params = [
      isbn || null,
      title,
      author,
      publisher || null,
      year_published || null,
      total_stock,
      available_stock ?? total_stock,
      rack_location || null,
      category_id || null,
      description || null,
    ];

    if (req.file) {
      updateCoverQuery = ", cover_image = ? ";
      params.push(req.file.filename);
    }

    params.push(id);

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
        category_id = ?,
        description = ?
        ${updateCoverQuery}
      WHERE id = ?`,
      params,
    );

    res.json({ success: true, message: "Data buku berhasil diperbarui!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Hapus Data Buku (Delete)
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM books WHERE id = ?", [id]);
    res.json({ success: true, message: "Buku berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
