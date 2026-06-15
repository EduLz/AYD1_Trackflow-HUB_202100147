const express = require("express");

const router = express.Router();

const { login } = require("../controllers/auth.controller");
const { verifyEmail } = require("../controllers/auth.controller");
const { profile } = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/login", login);
router.get("/verify-email/:token",verifyEmail);
router.get("/profile",verifyToken,profile);

module.exports = router;