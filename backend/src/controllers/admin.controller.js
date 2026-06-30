const solicitudService = require("../services/request.services");
const adminService = require("../services/admin.services");
const authService = require("../services/auth.services");
const operadorService = require("../services/operator.services");
const companyService = require("../services/company.services");
const emailService = require("../services/email.services");
const { encryptPassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");
const { connectDB } = require("../config/database");
const sql = require("mssql");

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

const getUsers = async (req, res) => {
    try {
        const { rol } = req.query; 
        const usuarios = await adminService.getUsuariosPanel(rol || null);
        return res.status(200).json({ 
            total: usuarios.length,
            usuarios 
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { correo, id_estado } = req.body;

        if (!correo || !id_estado) {
            return res.status(400).json({ message: "El correo y el estado son obligatorios" });
        }

        const usuarioActualizado = await adminService.updateUsuarioBase(id, correo, id_estado);
        return res.status(200).json({ 
            message: "Usuario modificado correctamente por el administrador", 
            usuario: usuarioActualizado 
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const vetoUser = async (req, res) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    
    try {
        const { id_usuario, motivo } = req.body;

        if (!id_usuario || !motivo || motivo.trim() === "") {
            return res.status(400).json({ 
                message: "El ID del usuario y el motivo del veto son obligatorios" 
            });
        }
        const id_admin_usuario = req.user.id_usuario; 
        
        const adminRes = await pool.request()
            .input("id_user", id_admin_usuario)
            .query("SELECT id_admin FROM Administrador WHERE id_usuario = @id_user");
        
        if (adminRes.recordset.length === 0) {
            return res.status(403).json({ message: "No tienes permisos de administrador" });
        }
        const id_admin = adminRes.recordset[0].id_admin;

        const userRes = await pool.request()
            .input("id_usuario", id_usuario)
            .query("SELECT correo FROM Usuario WHERE id_usuario = @id_usuario");
        
        const correoUsuario = userRes.recordset.length > 0 ? userRes.recordset[0].correo : null;
        await transaction.begin();
        await adminService.vetoUserTransaction(transaction, {
            id_usuario,
            id_admin,
            motivo
        });
        await transaction.commit();
        if (correoUsuario) {
            emailService.sendVetoEmail(correoUsuario, motivo).catch(err => 
                console.error("Error al enviar el correo de veto:", err.message)
            );
        }

        return res.status(200).json({ 
            message: "Usuario vetado de la plataforma exitosamente y notificación enviada" 
        });

    } catch (error) {
        if (transaction && transaction._begun) {
            await transaction.rollback();
        }
        console.error("Error en vetoUser:", error);
        return res.status(500).json({ message: error.message });
    }
};

const getOperatorsServicesForAdmin = async (req, res) => {
    try {
        const { ordenar } = req.query; 

        const servicios = await adminService.getAllOperatorsServices(ordenar || null);

        return res.status(200).json({
            total: servicios.length,
            servicios
        });
    } catch (error) {
        console.error("Error en getOperatorsServicesForAdmin:", error);
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
    getUsers,
    editUser,
    vetoUser,
    getOperatorsServicesForAdmin
};