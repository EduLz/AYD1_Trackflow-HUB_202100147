const express = require("express");

const router = express.Router();

const upload = require("../middlewares/upload.middleware");
const { registerOperador, updateServiceStatus, createService, getMyServices, updateService, deleteService,
        createCoupon, getMyCoupons, assignCouponToClient, requestProfileChange,
        getMyProfile, getMyProfileRequests,
        getMyCalificaciones, responderCalificacion, getCalendarioEnvios, getReportes, getReservaciones, 
        startReservation, finishReservation } = require("../controllers/operator.controller");
const {verifyToken, requireRole} = require("../middlewares/auth.middleware");

router.post("/register", upload.single("fotografia"), registerOperador);
router.post("/services", verifyToken, requireRole(3), upload.array("fotos", 5), createService);
router.get("/services", verifyToken, requireRole(3), getMyServices);
router.put("/services/:id", verifyToken, requireRole(3), updateService);
router.delete("/services/:id", verifyToken, requireRole(3), deleteService);
router.patch("/services/:id/status", verifyToken, requireRole(3), updateServiceStatus);
router.post("/coupons", verifyToken, requireRole(3), createCoupon);
router.get("/coupons", verifyToken, requireRole(3), getMyCoupons);
router.post("/coupons/:id/clients", verifyToken, requireRole(3), assignCouponToClient);
router.post("/profile-change-request", verifyToken, requireRole(3), requestProfileChange);
router.get("/profile", verifyToken, requireRole(3), getMyProfile);
router.get("/calificaciones", verifyToken, requireRole(3), getMyCalificaciones);
router.post("/calificaciones/:id/respuesta", verifyToken, requireRole(3), responderCalificacion);
router.get("/calendario", verifyToken, requireRole(3), getCalendarioEnvios);
router.get("/reportes", verifyToken, requireRole(3), getReportes);
router.get("/profile-change-requests", verifyToken, requireRole(3), getMyProfileRequests);
router.get("/reservaciones", verifyToken, requireRole(3), getReservaciones);
router.patch("/reservaciones/:id/iniciar", verifyToken, requireRole(3), startReservation);
router.patch("/reservaciones/:id/finalizar", verifyToken, requireRole(3), finishReservation);

module.exports = router;