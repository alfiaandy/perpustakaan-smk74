const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const librarianController = require("../controllers/librarianController");

// Konfigurasi Multer untuk Upload Foto Profil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/librarians/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "librarian-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(
      new Error("Hanya file gambar (jpg, jpeg, png, webp) yang diperbolehkan!"),
    );
  },
});

// Endpoint Tim Pustakawan
router.get("/", librarianController.getAllLibrarians);
router.post("/", upload.single("photo"), librarianController.createLibrarian);
router.put("/:id", upload.single("photo"), librarianController.updateLibrarian);
router.delete("/:id", librarianController.deleteLibrarian);

module.exports = router;
