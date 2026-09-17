const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/moduleController");

// Endpoint Modul Digital & Repositori Kejuruan
router.get("/", moduleController.getAllModules);
router.post("/", moduleController.createModule);
router.delete("/:id", moduleController.deleteModule);

module.exports = router;
