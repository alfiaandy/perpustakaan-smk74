const express = require("express");
const router = express.Router();
const visitorLogController = require("../controllers/visitorLogController");

// Endpoint mencatat absensi baru (POST /api/visitor-logs)
router.post("/", visitorLogController.createLog);

// Endpoint mengambil rekap data log pengunjung & statistik (GET /api/visitor-logs)
router.get("/", visitorLogController.getLogs);

module.exports = router;
