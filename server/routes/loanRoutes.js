const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loanController");
const authMiddleware = require("../middlewares/authMiddleware");

// ==========================================
// 1. AKSES ADMIN / PETUGAS PERPUSTAKAAN
// ==========================================

// Ambil seluruh daftar transaksi sirkulasi
router.get("/", authMiddleware, loanController.getLoans);

// Catat transaksi peminjaman langsung di tempat/meja petugas
router.post("/direct", authMiddleware, loanController.createDirectLoan);

// Setujui pengajuan peminjaman (penyerahan buku)
router.put("/:id/approve", authMiddleware, loanController.approveLoan);

// Tolak/Batalkan pengajuan peminjaman oleh admin
router.put("/:id/reject", authMiddleware, loanController.rejectLoan);

// Proses pengembalian buku + kalkulasi denda
router.put("/:id/return", authMiddleware, loanController.returnBook);

// Admin Override: Perpanjang masa pinjam manual (+N Hari)
router.put(
  "/:id/admin-extend",
  authMiddleware,
  loanController.adminOverrideExtend,
);

// ==========================================
// 2. AKSES SISWA MANDIRI (VIA WEB OPAC)
// ==========================================

// Ambil riwayat peminjaman siswa yang sedang login
router.get("/my-loans", authMiddleware, loanController.getMyLoans);

// Ajukan peminjaman/booking buku online (H+7)
router.post("/request", authMiddleware, loanController.requestLoan);

// Siswa membatalkan booking buku milik sendiri
router.put("/:id/cancel", authMiddleware, loanController.cancelMyBooking);

// Siswa mengajukan perpanjangan peminjaman mandiri (+7 Hari)
router.put("/:id/extend", authMiddleware, loanController.extendMyLoan);

module.exports = router;
