const express = require("express");

const router = express.Router();
const upload = require("../middlewares/uploadCSV.middleware");

const {
    verifyToken,
    requireRole
} = require("../middlewares/auth.middleware");

const {
    registerEmpresa,
    createRoute,
    updateRoute,
    suspendRoute,
    cancelRoute,
    createCoupon,
    requestProfileChange,
    uploadRoutesCSV,
    uploadFleetCSV,
    getRoutes,
    getCoupons,
    getVehicles,
    getReportesEmpresa  
} = require("../controllers/company.controller");

// Registro (público)
router.post(
    "/register",
    registerEmpresa
);
router.get("/reportes", verifyToken, requireRole(4), getReportesEmpresa);
// Rutas
router.post(
    "/routes",
    verifyToken,
    requireRole(4),
    createRoute
);

router.put(
    "/routes/:id",
    verifyToken,
    requireRole(4),
    updateRoute
);

router.patch(
    "/routes/:id/suspend",
    verifyToken,
    requireRole(4),
    suspendRoute
);

router.patch(
    "/routes/:id/cancel",
    verifyToken,
    requireRole(4),
    cancelRoute
);


// Cupones
router.post(
    "/coupons",
    verifyToken,
    requireRole(4),
    createCoupon
);

// Solicitudes de cambio de perfil
router.post(
    "/profile-change",
    verifyToken,
    requireRole(4),
    requestProfileChange
);

// Carga masiva de flota
router.post(
    "/fleet/csv",
    verifyToken,
    requireRole(4),
    upload.single("file"),
    uploadFleetCSV
);

// Carga masiva de rutas
router.post(
    "/routes/csv",
    verifyToken,
    requireRole(4),
    upload.single("file"),
    uploadRoutesCSV
);

router.get(
    "/routes",
    verifyToken,
    requireRole(4),
    getRoutes
);

router.get(
    "/coupons",
    verifyToken,
    requireRole(4),
    getCoupons
);

router.get(
    "/vehicles",
    verifyToken,
    requireRole(4),
    getVehicles
);

module.exports = router;