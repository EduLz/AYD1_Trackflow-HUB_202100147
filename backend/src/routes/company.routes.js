const express = require("express");

const router = express.Router();

const { registerEmpresa } = require("../controllers/company.controller");

router.post("/register", registerEmpresa);

module.exports = router;