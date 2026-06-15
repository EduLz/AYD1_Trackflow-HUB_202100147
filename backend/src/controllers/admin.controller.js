const solicitudService = require("../services/request.services");
const adminService = require("../services/admin.services");

const getSolicitudes = async (req, res) => {

    try {
        const solicitudes =await solicitudService.getPendingSolicitudes();
        res.json(solicitudes);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const approveSolicitud = async (req, res) => {

    try {
        const { id } = req.params;
        await adminService.approveOperador(id);
        res.json({
            message:
                "Solicitud aprobada"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const rejectSolicitud = async (req, res) => {
    
    try {
        const { id } = req.params;
        await adminService.rejectOperador(id);
        res.json({
            message: "Solicitud rechazada"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getSolicitudes,
    approveSolicitud,
    rejectSolicitud
};