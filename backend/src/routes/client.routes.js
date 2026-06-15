const express = require("express");

const router = express.Router();
const { registerCliente} = require("../controllers/client.controller");

router.post("/register", registerCliente);

module.exports = router;