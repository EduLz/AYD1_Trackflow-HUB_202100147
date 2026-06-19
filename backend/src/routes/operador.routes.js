const express = require("express");

const router = express.Router();

const upload = require("../middlewares/upload.middleware");
const { registerOperador, createService, getMyServices } = require("../controllers/operator.controller");
const {verifyToken, requireRole} = require("../middlewares/auth.middleware");

router.post("/register", upload.single("fotografia"), registerOperador);
router.post("/services", verifyToken, requireRole(3), upload.array("fotos", 5), createService);
router.get("/services", verifyToken, requireRole(3), getMyServices);

module.exports = router;