const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bookController = require("../controllers/bookController");
const authMiddleware = require("../middlewares/authMiddleware");
const db = require("../config/db"); // Import koneksi database

// Konfigurasi Penyimpanan Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Memberi nama file unik berdasarkan timestamp + ekstensi asli
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter jenis file (hanya gambar)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar yang diperbolehkan!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Batas ukuran file 2MB
});

// Route Khusus Kategori untuk Dropdown
router.get("/categories", async (req, res) => {
  try {
    const [categories] = await db.query(
      "SELECT * FROM categories ORDER BY name ASC",
    );
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Routes Buku
router.get("/", bookController.getBooks);

// Pasang middleware 'upload.single("cover_image")' pada route POST dan PUT
router.post(
  "/",
  authMiddleware,
  upload.single("cover_image"),
  bookController.createBook,
);

router.put(
  "/:id",
  authMiddleware,
  upload.single("cover_image"),
  bookController.updateBook,
);

router.delete("/:id", authMiddleware, bookController.deleteBook);

module.exports = router;
