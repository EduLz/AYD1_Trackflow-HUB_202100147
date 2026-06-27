const express = require("express");

const router = express.Router();
const { registerCliente, getShippingServices, registerCard } = require("../controllers/client.controller");
const { verifyToken, requireRole } = require("../middlewares/auth.middleware");

router.post("/register", registerCliente);
router.get("/shipping-services", getShippingServices);
router.post("/payment/card", verifyToken, requireRole(2), registerCard);

module.exports = router;