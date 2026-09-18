const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// Route ambil data siswa
router.get("/students", userController.getStudents);

// Route update profil / kelas siswa
router.put("/profile", userController.updateProfile);

// Route untuk update data kelas/jurusan siswa
router.put("/profile", userController.updateProfile);
router.get("/students", authMiddleware, userController.getStudents);
router.delete("/students/:id", authMiddleware, userController.deleteStudent);

module.exports = router;
