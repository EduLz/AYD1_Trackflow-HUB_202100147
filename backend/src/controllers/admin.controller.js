const solicitudService = require("../services/request.services");
const adminService = require("../services/admin.services");
const authService = require("../services/auth.services");
const { encryptPassword } = require("../utils/password");

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
const registerAdmin = async (req, res) => {
    try {
        const { nombre, apellido, correo, contrasena_temporal } = req.body;

        if (!nombre || !apellido || !correo || !contrasena_temporal) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }

        const existingUser = await authService.findUserByEmail(correo);
        if (existingUser) {
            return res.status(409).json({
                message: "El correo ya está registrado"
            });
        }

        const passwordHash = await encryptPassword(contrasena_temporal);

        await adminService.createAdmin({ nombre, apellido, correo, passwordHash });

        return res.status(201).json({
            message: "Administrador creado correctamente"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};
module.exports = {
    getSolicitudes,
    approveSolicitud,
    rejectSolicitud,
    registerAdmin
};