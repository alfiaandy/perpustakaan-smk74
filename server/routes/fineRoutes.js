const express = require("express");
const router = express.Router();
const fineController = require("../controllers/fineController");
const authMiddleware = require("../middlewares/authMiddleware");

// Route mencatat pembayaran denda
router.post("/pay", authMiddleware, fineController.createPayment);

// Route mengambil laporan keuangan denda
router.get("/report", authMiddleware, fineController.getFinancialReport);

module.exports = router;
