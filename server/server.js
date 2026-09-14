const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Menjadikan folder 'uploads' publik agar foto sampul buku bisa diakses di frontend
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Main API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/loans", require("./routes/loanRoutes"));

// Base Route Test
app.get("/", (req, res) => {
  res.json({ message: "API Perpustakaan SMK Berhasil Dijalankan!" });
});

// Port Execution
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
