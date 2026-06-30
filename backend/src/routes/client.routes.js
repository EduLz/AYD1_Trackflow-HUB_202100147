const express = require("express");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();
const { registerCliente, getShippingServices, registerCard, getPaymentMethods,
        deactivatePaymentMethod, createReservation, rateShippingService, cancelReservation,
        createReport, getMyReports, getMyCoupons, getMyReservations, getCart, addToCart, removeFromCart, searchTransportServices, registerWallet } = require("../controllers/client.controller");
const { verifyToken, requireRole } = require("../middlewares/auth.middleware");

router.post("/register", registerCliente);
router.get("/shipping-services", getShippingServices);
router.post("/payment/card", verifyToken, requireRole(2), registerCard);
router.get("/payment", verifyToken, requireRole(2), getPaymentMethods);
router.patch("/payment/:id/deactivate", verifyToken, requireRole(2), deactivatePaymentMethod);
router.post("/reservations", verifyToken, requireRole(2), createReservation);
router.post("/calificaciones", verifyToken, requireRole(2), rateShippingService);
router.patch("/reservations/:id/cancelar", verifyToken, requireRole(2), cancelReservation);
router.post("/reportes", verifyToken, requireRole(2), upload.array("evidencias", 5), createReport);
router.get("/reportes", verifyToken, requireRole(2), getMyReports);
router.get("/cupones", verifyToken, requireRole(2), getMyCoupons);
router.get("/reservaciones", verifyToken, requireRole(2), getMyReservations);
router.get("/cart", verifyToken, requireRole(2), getCart);
router.post("/cart", verifyToken, requireRole(2), addToCart);
router.delete("/cart/:id", verifyToken, requireRole(2), removeFromCart);
router.post("/reservations", verifyToken, requireRole(2), createReservation);
router.get("/transport-services", verifyToken, requireRole(2), searchTransportServices)
router.post("/payment/wallet", verifyToken, requireRole(2), registerWallet);

module.exports = router;