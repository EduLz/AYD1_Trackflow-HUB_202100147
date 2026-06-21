const express = require("express");

const router = express.Router();

const { registerEmpresa, getReportesEmpresa } = require("../controllers/company.controller");
const { verifyToken, requireRole } = require("../middlewares/auth.middleware");

router.post("/register", registerEmpresa);
router.get("/reportes", verifyToken, requireRole(4), getReportesEmpresa);

module.exports = router;