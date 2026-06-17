const reunionService = require("../services/meeting.services");
const emailService = require("../services/email.services");
const adminService = require("../services/admin.services");

const { connectDB } = require("../config/database");

const scheduleMeeting = async (req, res) => {

    try {
        const {
            id_solicitud,
            fecha_hora,
            enlace
        } = req.body;

        const pool = await connectDB();
        const empresa = await pool.request()
            .input("id_solicitud", id_solicitud)
            .query(`
                SELECT u.correo
                FROM SolicitudRegistro sr
                INNER JOIN Usuario u
                    ON u.id_usuario = sr.id_usuario
                WHERE sr.id_solicitud = @id_solicitud
            `);

        if (!empresa.recordset[0]) {
            return res.status(404).json({
                message: "Solicitud no encontrada"
            });
        }

        const admin = await adminService.findAdminByUserId(req.user.id_usuario);

        if (!admin) {
            return res.status(404).json({
                message: "Administrador no encontrado"
            });
        }

        const reunion = await reunionService.createReunion({
            id_solicitud,
            id_admin: admin.id_admin,
            fecha_hora,
            enlace
        });

        await emailService.sendMeetingEmail(
            empresa.recordset[0].correo,
            fecha_hora,
            enlace
        );

        return res.status(201).json({
            message: "Reunión programada correctamente",
            reunion
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });
    }
};

const getReuniones = async (req, res) => {

    try {
        const reuniones = await reunionService.getReuniones();
        return res.json(reuniones);
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const getReunionSolicitud = async (req, res) => {

    try {
        const reunion = await reunionService.getReunionBySolicitud(req.params.id);
        return res.json(reunion);

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    scheduleMeeting,
    getReuniones,
    getReunionSolicitud
};