const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/students", authMiddleware, userController.getStudents);
router.delete("/students/:id", authMiddleware, userController.deleteStudent);

module.exports = router;
