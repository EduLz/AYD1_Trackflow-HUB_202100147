const crypto = require("crypto");

const authService = require("../services/auth.services");
const companyService = require("../services/company.services");
const solicitudService = require("../services/request.services");
const emailService = require("../services/email.services");
const { encryptPassword } = require("../utils/password");

const registerEmpresa = async (req, res) => {
    try {
        const {
            nombre_empresa,
            correo,
            contrasena,
            telefono,
            telefono_respaldo,
            nit,
            licencia
        } = req.body;

        if (
            !nombre_empresa ||
            !correo ||
            !contrasena ||
            !telefono ||
            !nit ||
            !licencia
        ) {
            return res.status(400).json({
                message: "Todos los campos obligatorios deben completarse"
            });
        }

        const existingUser = await authService.findUserByEmail(correo);
        if (existingUser) {
            return res.status(409).json({
                message: "El correo ya está registrado"
            });
        }

        const passwordHash = await encryptPassword(contrasena);
        const verificationToken = crypto.randomBytes(4).toString("hex").substring(0, 6);

        const user = await authService.createEmpresaUser({
            correo,
            passwordHash,
            token: verificationToken
        });

        await companyService.createEmpresa({
            id_usuario: user.id_usuario,
            nombre_empresa,
            telefono,
            telefono_respaldo,
            nit,
            licencia_operativa: licencia
        });

        await solicitudService.createSolicitudEmpresa(user.id_usuario);

        await emailService.sendVerificationEmail(
            correo,
            nombre_empresa,
            verificationToken
        );
        console.log(`http://localhost:3000/api/auth/verify-email/${verificationToken}`);

        return res.status(201).json({
            message: "Empresa registrada correctamente. Debe verificar su correo y esperar aprobación del administrador."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};
const getReportesEmpresa = async (req, res) => {
    try {
        const empresa = await companyService.getEmpresaByUserId(req.user.id_usuario);
        if (!empresa) {
            return res.status(404).json({ message: "Empresa no encontrada" });
        }

        const resumen        = await companyService.getResumenEmpresa(empresa.id_empresa);
        const calificaciones = await companyService.getReporteCalificacionesEmpresa(empresa.id_empresa);
        const estado_rutas   = await companyService.getReporteEstadoRutas(empresa.id_empresa);

        return res.status(200).json({
            reportes: {
                ganancias: { total_ganado: resumen.total_ganado },
                servicios_contratados: resumen.servicios_contratados,
                calificaciones,
                estado_rutas
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
module.exports = {
    registerEmpresa,   
    getReportesEmpresa
};