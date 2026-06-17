const express = require("express");
const router = express.Router();
const {scheduleMeeting,getReuniones,getReunionSolicitud} = require("../controllers/meeting.controller");
const {verifyToken, requireRole} = require("../middlewares/auth.middleware");

router.post("/",verifyToken, requireRole(1), scheduleMeeting);
router.get("/", verifyToken, requireRole(1), getReuniones);
router.get("/solicitud/:id",verifyToken, requireRole(1), getReunionSolicitud);

module.exports = router;