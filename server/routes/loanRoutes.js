const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loanController");
const authMiddleware = require("../middlewares/authMiddleware");

// Akses Admin / Petugas
router.get("/", authMiddleware, loanController.getLoans);
router.post("/direct", authMiddleware, loanController.createDirectLoan);
router.put("/:id/approve", authMiddleware, loanController.approveLoan);
router.put("/:id/return", authMiddleware, loanController.returnBook);

// Akses Siswa Mandiri (Via Web OPAC)
router.post("/request", authMiddleware, loanController.requestLoan);

module.exports = router;
