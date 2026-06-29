const express = require("express");

const router = express.Router();

const {getSolicitudes, approveSolicitud, rejectSolicitud, registerAdmin, verifyAdminOTP, 
       getPendingProfileRequests, resolveProfileRequest,
       getPendingCompanyProfileRequests, resolveCompanyProfileRequest, listarReportes, cambiarEstadoReporte,
       getUsers, editUser, vetoUser
} = require("../controllers/admin.controller");
const {verifyToken, requireRole } = require("../middlewares/auth.middleware");

router.get("/solicitudes",verifyToken, requireRole(1), getSolicitudes);
router.put("/solicitudes/:id/aprobar", verifyToken, requireRole(1), approveSolicitud);
router.put("/solicitudes/:id/rechazar",verifyToken,requireRole(1), rejectSolicitud);
router.post("/register",registerAdmin);
router.post("/verify-otp", verifyAdminOTP );
router.get("/profile-change-requests", verifyToken, requireRole(1), getPendingProfileRequests);
router.patch("/profile-change-requests/:id", verifyToken, requireRole(1), resolveProfileRequest);

router.get("/company-profile-change-requests", verifyToken, requireRole(1), getPendingCompanyProfileRequests);
router.patch("/company-profile-change-requests/:id", verifyToken, requireRole(1), resolveCompanyProfileRequest);
router.get("/reportes", verifyToken, requireRole(1), listarReportes);
router.patch("/reportes/:id", verifyToken, requireRole(1), cambiarEstadoReporte);

router.get("/users", verifyToken, requireRole(1), getUsers);
router.put("/users/edit/:id", verifyToken, requireRole(1), editUser);
router.post("/users/veto", verifyToken, requireRole(1), vetoUser);

module.exports = router;