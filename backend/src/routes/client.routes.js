const express = require("express");

const router = express.Router();
const { registerCliente, getShippingServices, registerCard, getPaymentMethods} = require("../controllers/client.controller");
const { verifyToken, requireRole } = require("../middlewares/auth.middleware");

router.post("/register", registerCliente);
router.get("/shipping-services", getShippingServices);
router.post("/payment/card", verifyToken, requireRole(2), registerCard);
router.get("/payment", verifyToken, requireRole(2), getPaymentMethods);

module.exports = router;