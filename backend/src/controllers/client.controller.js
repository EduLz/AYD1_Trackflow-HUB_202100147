const crypto = require("crypto");

const authService = require("../services/auth.services");
const clienteService = require("../services/client.services");
const emailService = require("../services/email.services");

const { validarLuhn } = require("../utils/luhn");
const { hashValue, fingerprintCard } = require("../utils/payment");
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

const registerCard = async (req, res) => {
    try {

        const {
            numero_tarjeta,
            nombre_titular,
            fecha_vencimiento,
            cvv
        } = req.body;

        if (
            !numero_tarjeta ||
            !nombre_titular ||
            !fecha_vencimiento ||
            !cvv
        ) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }

        const numero = numero_tarjeta.replace(/\s/g, "");

        const fingerprint = fingerprintCard(numero);
        const existe = await clienteService.findCardByFingerprint(fingerprint);
        if (existe) {
            return res.status(400).json({
                message: "La tarjeta ya está registrada"
            });
        }

        if (!validarLuhn(numero)) {
            return res.status(400).json({
                message: "Número de tarjeta inválido"
            });
        }
        if (!/^\d{3,4}$/.test(cvv)) {
            return res.status(400).json({
                message: "CVV inválido"
            });
        }
        if (!/^\d{2}\/\d{4}$/.test(fecha_vencimiento)) {
            return res.status(400).json({
                message: "Formato de fecha inválido. Use MM/YYYY"
            });
        }
        const cliente = await clienteService.getClienteByUserId(req.user.id_usuario);
        if (!cliente) {
            return res.status(404).json({
                message: "Cliente no encontrado"
            });
        }
        const metodo = await clienteService.createMetodoPago(cliente.id_cliente, 1); // 1 = Tarjeta

        await clienteService.createTarjeta({

            id_metodo: metodo.id_metodo,
            numero_hash: await hashValue(numero),
            numero_ultimos4: numero.slice(-4),
            nombre_titular,
            fecha_vencimiento,
            cvv_hash: await hashValue(cvv),
            fingerprint
        });

        return res.status(201).json({
            message: "Tarjeta registrada correctamente"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

const getPaymentMethods = async (req, res) => {

    try {
        const cliente = await clienteService.getClienteByUserId(req.user.id_usuario);
        if (!cliente) {
            return res.status(404).json({
                message: "Cliente no encontrado"
            });
        }
        const metodos =await clienteService.getPaymentMethods(cliente.id_cliente);
        return res.status(200).json(metodos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    registerCliente,
    getShippingServices,
    registerCard,
    getPaymentMethods
};