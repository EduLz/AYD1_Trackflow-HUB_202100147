const express = require("express");

const router = express.Router();

const upload = require("../middlewares/upload.middleware");
const { registerOperador, createService, getMyServices, updateService, deleteService ,
        createCoupon, getMyCoupons } = require("../controllers/operator.controller");
const {verifyToken, requireRole} = require("../middlewares/auth.middleware");

router.post("/register", upload.single("fotografia"), registerOperador);
router.post("/services", verifyToken, requireRole(3), upload.array("fotos", 5), createService);
router.get("/services", verifyToken, requireRole(3), getMyServices);
router.put("/services/:id", verifyToken, requireRole(3), updateService);
router.delete("/services/:id", verifyToken, requireRole(3), deleteService);
router.post("/coupons", verifyToken, requireRole(3), createCoupon);
router.get("/coupons", verifyToken, requireRole(3), getMyCoupons);

module.exports = router;