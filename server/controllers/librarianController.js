const db = require("../config/db"); // Sesuaikan dengan koneksi database MySQL kamu
const fs = require("fs");
const path = require("path");

// 1. Ambil Semua Data Tim Pustakawan (Untuk Landing Page & Admin)
exports.getAllLibrarians = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM librarians ORDER BY id ASC");
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Gagal mengambil data pustakawan:", error);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};

// 2. Tambah Pustakawan Baru (Admin)
exports.createLibrarian = async (req, res) => {
  const { name, role } = req.body;
  const photo = req.file ? req.file.filename : null;

  if (!name || !role) {
    return res
      .status(400)
      .json({ success: false, message: "Nama dan jabatan wajib diisi!" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO librarians (name, role, photo) VALUES (?, ?, ?)",
      [name, role, photo],
    );

    res.status(201).json({
      success: true,
      message: "Berhasil menambahkan anggota tim pustakawan!",
      data: { id: result.insertId, name, role, photo },
    });
  } catch (error) {
    console.error("Gagal menambah pustakawan:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal menambah data pustakawan." });
  }
};

// 3. Update Data Pustakawan (Admin)
exports.updateLibrarian = async (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;

  try {
    // Cek apakah data ada
    const [existing] = await db.query("SELECT * FROM librarians WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Pustakawan tidak ditemukan." });
    }

    let photo = existing[0].photo;

    // Jika ada upload foto baru, hapus foto lama
    if (req.file) {
      photo = req.file.filename;
      if (existing[0].photo) {
        const oldPath = path.join(
          __dirname,
          "../uploads/librarians/",
          existing[0].photo,
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    await db.query(
      "UPDATE librarians SET name = ?, role = ?, photo = ? WHERE id = ?",
      [name, role, photo, id],
    );

    res.json({
      success: true,
      message: "Data tim pustakawan berhasil diperbarui!",
    });
  } catch (error) {
    console.error("Gagal memperbarui pustakawan:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal memperbarui data pustakawan." });
  }
};

// 4. Hapus Pustakawan (Admin)
exports.deleteLibrarian = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await db.query("SELECT * FROM librarians WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Pustakawan tidak ditemukan." });
    }

    // Hapus file foto jika ada
    if (existing[0].photo) {
      const oldPath = path.join(
        __dirname,
        "../uploads/librarians/",
        existing[0].photo,
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    await db.query("DELETE FROM librarians WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Anggota tim pustakawan berhasil dihapus!",
    });
  } catch (error) {
    console.error("Gagal menghapus pustakawan:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal menghapus data pustakawan." });
  }
};
