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

const createService = async (req, res) => {
    try {

        const {
            nombre,
            zona_cobertura,
            capacidad_carga_kg,
            precio_envio,
            descripcion
        } = req.body;

        if (
            !nombre ||
            !zona_cobertura ||
            !capacidad_carga_kg ||
            !precio_envio
        ) {
            return res.status(400).json({
                message: "Todos los campos obligatorios son requeridos"
            });
        }

        if (!req.files || req.files.length < 3) {
            return res.status(400).json({
                message: "Debe cargar mínimo 3 fotografías"
            });
        }

        const operador =
            await operadorService.getOperatorByUserId(
                req.user.id_usuario
            );

        if (!operador) {
            return res.status(404).json({
                message: "Operador no encontrado"
            });
        }

        const servicio =
            await operadorService.createService({
                id_operador: operador.id_operador,
                id_estado: 1,
                nombre,
                zona_cobertura,
                capacidad_carga_kg,
                precio_envio,
                descripcion
            });

        for (let i = 0; i < req.files.length; i++) {

            await operadorService.saveServicePhoto(
                servicio.id_servicio,
                req.files[i].filename,
                i + 1
            );
        }

        return res.status(201).json({
            message: "Servicio creado correctamente",
            servicio
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: error.message
        });
    }
};

const getMyServices = async (req, res) => {

    try {
        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);
        if (!operador) {
            return res.status(404).json({
                message: "Operador no encontrado"
            });
        }

        const servicios = await operadorService.getServicesByOperator(operador.id_operador);
        return res.status(200).json({
            servicios
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    registerOperador,
    createService,
    getMyServices
};