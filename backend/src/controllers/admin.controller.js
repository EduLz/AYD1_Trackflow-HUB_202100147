const solicitudService = require("../services/request.services");
const adminService = require("../services/admin.services");
const authService = require("../services/auth.services");
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

module.exports = {
    getSolicitudes,
    approveSolicitud,
    rejectSolicitud,
    registerAdmin,
    verifyAdminOTP
};