const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

// 1. Pastikan folder 'uploads' dan subfolder 'uploads/librarians' otomatis dibuat jika belum ada
const uploadDir = path.join(__dirname, "uploads");
const librarianUploadDir = path.join(uploadDir, "librarians");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(librarianUploadDir)) {
  fs.mkdirSync(librarianUploadDir, { recursive: true });
}

// 2. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Mendukung pembacaan form-data/URL-encoded

// 3. Menjadikan folder 'uploads' publik agar foto/gambar bisa diakses di frontend/browser
app.use("/uploads", express.static(uploadDir));

// 4. Main API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/loans", require("./routes/loanRoutes"));

// ROUTE BERITA, MODUL DIGITAL, & TIM PUSTAKAWAN
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api/modules", require("./routes/moduleRoutes"));
app.use("/api/librarians", require("./routes/librarianRoutes"));

// Route Visitor Logs
app.use("/api/visitor-logs", require("./routes/visitorLogRoutes"));

// 5. Base Route Test
app.get("/", (req, res) => {
  res.json({
    message: "API Perpustakaan SMK Berhasil Dijalankan dan Terhubung!",
  });
});

// 6. Global Error Handling Middleware (Mencegah server crash jika terjadi error tak terduga)
app.use((err, req, res, next) => {
  console.error("⚠️ Terjadi Kesalahan Server:", err.stack);
  res.status(500).json({
    error: "Terjadi kesalahan pada server internal.",
    details: err.message,
  });
});

// 7. Port Execution
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server backend perpustakaan berjalan di http://localhost:${PORT}`,
  );
});
