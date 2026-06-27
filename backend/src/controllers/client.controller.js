const crypto = require("crypto");

const authService = require("../services/auth.services");
const clienteService = require("../services/client.services");
const emailService = require("../services/email.services");

const { encryptPassword } = require("../utils/password");

const registerCliente = async (req, res) => {
    try {
        const {
            nombre,
            apellido,
            telefono,
            correo,
            contrasena,
            confirmarContrasena,
            direccion_origen
        } = req.body;

        if (
            !nombre ||
            !apellido ||
            !telefono ||
            !correo ||
            !contrasena ||
            !confirmarContrasena ||
            !direccion_origen
        ) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }

        if (contrasena !== confirmarContrasena) {
            return res.status(400).json({
                message: "Las contraseñas no coinciden"
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
        const user = await authService.createClienteUser({
                correo,
                passwordHash,
                token: verificationToken
            });

        await clienteService.createCliente({
            id_usuario: user.id_usuario,
            nombre,
            apellido,
            telefono,
            direccion_origen
        });

        await emailService.sendVerificationEmail(
            correo,
            nombre,
            verificationToken
        );
        console.log(`http://localhost:3000/api/auth/verify-email/${verificationToken}`);

        return res.status(201).json({
            message: "Cliente registrado correctamente. Revise su correo para verificar la cuenta."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

const getShippingServices = async (req, res) => {

    try {
        const servicios = await clienteService.getShippingServices(req.query);
        return res.status(200).json(servicios);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    registerCliente,
    getShippingServices
};