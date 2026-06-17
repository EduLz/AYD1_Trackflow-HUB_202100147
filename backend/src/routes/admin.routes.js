const express = require("express");

const router = express.Router();

const {getSolicitudes, approveSolicitud, rejectSolicitud, registerAdmin, verifyAdminOTP} = require("../controllers/admin.controller");
const {verifyToken, requireRole } = require("../middlewares/auth.middleware");

router.get("/solicitudes",verifyToken, requireRole(1), getSolicitudes);
router.put("/solicitudes/:id/aprobar", verifyToken, requireRole(1), approveSolicitud);
router.put("/solicitudes/:id/rechazar",verifyToken,requireRole(1), rejectSolicitud);
router.post("/register",registerAdmin);
router.post("/verify-otp", verifyAdminOTP );

module.exports = router;