const solicitudService = require("../services/request.services");
const adminService = require("../services/admin.services");
const authService = require("../services/auth.services");
const operadorService = require("../services/operator.services");
const companyService = require("../services/company.services");
const { encryptPassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

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
        const {
            nombre,
            apellido,
            correo,
            contrasena
        } = req.body;

        const existingUser = await authService.findUserByEmail(correo);
        if (existingUser) {
            return res.status(409).json({
                message: "El correo ya existe"
            });
        }

        const passwordHash = await encryptPassword(contrasena);
        const user = await authService.createAdminUser({correo, passwordHash});
        await adminService.createAdmin({
                id_usuario: user.id_usuario,
                nombre,
                apellido
            });
        res.status(201).json({
            message: "Administrador creado correctamente"
        });
    } catch (error) {
        res.status(500).json({
            message:
                error.message
        });
    }
};

const verifyAdminOTP = async (req, res) => {
    try {
        const {
            id_usuario,
            codigo
        } = req.body;

        const otp = await adminService.verifyOTP(id_usuario, codigo);
        if (!otp) {
            return res.status(401).json({
                message: "Código inválido o expirado"
            });
        }
        const user = await authService.findUserById(id_usuario);
        const token = generateToken(user);

        return res.status(200).json({
            message: "Acceso concedido",
            token,
            user: {
                id_usuario: user.id_usuario,
                correo: user.correo,
                rol: user.rol,
                estado: user.estado
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

const getPendingProfileRequests = async (req, res) => {

    try {
        const solicitudes = await solicitudService.getPendingProfileRequests();
        return res.status(200).json(solicitudes
        );
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const resolveProfileRequest = async (req, res) => {

    try {
        const { id } = req.params;
        const {
            accion,
            notas_admin
        } = req.body;

        const solicitud = await solicitudService.getProfileRequestById(id);
        if (!solicitud) {
            return res.status(404).json({
                message: "Solicitud no encontrada"
            });
        }
        if (solicitud.id_estado !== 1) {
            return res.status(400).json({
                message: "La solicitud ya fue procesada"
            });
        }
        if (accion === "APROBAR") {
            const datos = JSON.parse(solicitud.datos_nuevos_json);

            await operadorService.updateOperatorProfile(solicitud.id_usuario, datos);
            await solicitudService.resolveProfileRequest(id, 2, req.user.id_usuario, notas_admin);
        } else {
            await solicitudService.resolveProfileRequest(id, 3, req.user.id_usuario, notas_admin
            );
        }
        return res.status(200).json({
            message:
                `Solicitud ${accion.toLowerCase()} correctamente`
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const getPendingCompanyProfileRequests = async (req, res) => {
    try {
        const solicitudes = await solicitudService.getPendingCompanyProfileRequests();
        return res.status(200).json(solicitudes);
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const resolveCompanyProfileRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { accion, notas_admin } = req.body;

        const solicitud = await solicitudService.getProfileRequestById(id);
        if (!solicitud) {
            return res.status(404).json({ message: "Solicitud no encontrada" });
        }
        if (solicitud.id_estado !== 1) {
            return res.status(400).json({ message: "La solicitud ya fue procesada" });
        }
        if (accion === "APROBAR") {
            const datos = JSON.parse(solicitud.datos_nuevos_json);
            await companyService.updateCompanyProfile(solicitud.id_usuario, datos);
            await solicitudService.resolveProfileRequest(id, 2, req.user.id_usuario, notas_admin);
        } else {
            await solicitudService.resolveProfileRequest(id, 3, req.user.id_usuario, notas_admin);
        }
        return res.status(200).json({
            message: `Solicitud de empresa ${accion.toLowerCase()} correctamente`
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
const listarReportes = async (req, res) => {
    try {
        const reportes = await adminService.getAllReportes();
        return res.status(200).json({ reportes });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

const cambiarEstadoReporte = async (req, res) => {
    try {
        const { id } = req.params;
        const id_estado = Number(req.body.id_estado);

        // ENVIADO=1, EN_REVISION=2, ACEPTADO=3, RECHAZADO=4
        if (![1, 2, 3, 4].includes(id_estado)) {
            return res.status(400).json({ message: "Estado de reporte invalido" });
        }

        const reporte = await adminService.updateReporteEstado(id, id_estado);
        if (!reporte) {
            return res.status(404).json({ message: "Reporte no encontrado" });
        }
        return res.status(200).json({ message: "Estado del reporte actualizado", reporte });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
const getReportesGenerales = async (req, res) => {
    try {
        const estadisticas = await adminService.getEstadisticasGenerales();
        return res.status(200).json({ estadisticas });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
module.exports = {
    getSolicitudes,
    approveSolicitud,
    rejectSolicitud,
    registerAdmin,
    verifyAdminOTP,
    getPendingProfileRequests,
    resolveProfileRequest,
    getPendingCompanyProfileRequests,
    resolveCompanyProfileRequest,
    listarReportes,
    cambiarEstadoReporte,
    getReportesGenerales
};