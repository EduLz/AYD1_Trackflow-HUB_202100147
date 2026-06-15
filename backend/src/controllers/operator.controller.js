const crypto = require("crypto");

const authService = require("../services/auth.services");
const operadorService = require("../services/operator.services");
const solicitudService = require("../services/request.services");
const emailService = require("../services/email.services");
const { encryptPassword } = require("../utils/password");

const registerOperador = async (req, res) => {
    try {
        const {
            nombre,
            apellido,
            dpi_cui,
            telefono,
            telefono_respaldo,
            correo,
            zona_operacion,
            genero,
            contrasena,
            confirmarContrasena
        } = req.body;

        if (
            !nombre ||
            !apellido ||
            !dpi_cui ||
            !telefono ||
            !correo ||
            !zona_operacion ||
            !genero ||
            !contrasena ||
            !confirmarContrasena
        ) {
            return res.status(400).json({
                message: "Todos los campos obligatorios deben completarse"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "La fotografía es obligatoria"
            });
        }

        if (contrasena !== confirmarContrasena) {
            return res.status(400).json({
                message:"Las contraseñas no coinciden"
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
        
        const user = await authService.createOperadorUser({
                correo,
                passwordHash,
                token: verificationToken
            });

        await operadorService.createOperator({
            id_usuario: user.id_usuario,
            nombre,
            apellido,
            dpi_cui,
            telefono,
            telefono_respaldo,
            fotografia_url: req.file.filename,
            zona_operacion,
            genero
        });


        await solicitudService.createSolicitudOperador(user.id_usuario);
        await emailService.sendVerificationEmail(
            correo,
            nombre,
            verificationToken
        );
        console.log(`http://localhost:3000/api/auth/verify-email/${verificationToken}`);

        return res.status(201).json({
            message: "Operador registrado correctamente. Debe verificar su correo y esperar aprobación del administrador."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    registerOperador
};