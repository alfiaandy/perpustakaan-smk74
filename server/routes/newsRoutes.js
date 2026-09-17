const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const newsController = require("../controllers/newsController");

// Konfigurasi Penyimpanan Gambar Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
router.get("/", newsController.getAllNews);
router.post("/", upload.single("image"), newsController.createNews); // Middleware upload file
router.delete("/:id", newsController.deleteNews);

module.exports = router;
