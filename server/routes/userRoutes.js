const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// Route ambil data siswa
router.get("/students", authMiddleware, userController.getStudents);

// Route update profil / kelas siswa
router.put("/profile", authMiddleware, userController.updateProfile);

// Route hapus anggota siswa
router.delete("/students/:id", authMiddleware, userController.deleteStudent);

module.exports = router;
