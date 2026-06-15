const express = require("express");

const router = express.Router();

const upload = require("../middlewares/upload.middleware");
const { registerOperador } = require("../controllers/operator.controller");

router.post("/register", upload.single("fotografia"), registerOperador);

module.exports = router;