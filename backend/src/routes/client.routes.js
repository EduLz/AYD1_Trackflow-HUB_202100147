const express = require("express");

const router = express.Router();
const { registerCliente, getShippingServices } = require("../controllers/client.controller");

router.post("/register", registerCliente);
router.get("/shipping-services", getShippingServices);

module.exports = router;