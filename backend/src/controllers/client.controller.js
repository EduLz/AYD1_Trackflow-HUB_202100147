const crypto = require("crypto");
const sql = require("mssql");

const authService = require("../services/auth.services");
const clienteService = require("../services/client.services");
const emailService = require("../services/email.services");

const { validarLuhn } = require("../utils/luhn");
const { hashValue, fingerprintCard } = require("../utils/payment");
const { encryptPassword } = require("../utils/password");
const { connectDB } = require("../config/database");

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

const deactivatePaymentMethod = async (req, res) => {

    try {
        const { id } = req.params;
        const cliente = await clienteService.getClienteByUserId(req.user.id_usuario);
        if (!cliente) {
            return res.status(404).json({
                message: "Cliente no encontrado"
            });
        }
        const metodo = await clienteService.getPaymentMethodById(id);
        if (!metodo) {
            return res.status(404).json({
                message: "Método de pago no encontrado"
            });
        }
        if (metodo.id_cliente !== cliente.id_cliente) {
            return res.status(403).json({
                message: "No tiene permisos sobre este método de pago"
            });
        }
        if (!metodo.activo) {
            return res.status(400).json({
                message: "El método ya está desactivado"
            });
        }
        await clienteService.deactivatePaymentMethod(id);
        return res.status(200).json({
            message: "Método de pago desactivado correctamente"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

const createReservation = async (req, res) => {

    const transaction = new sql.Transaction(await connectDB());
    try {
        const {
            id_servicio,
            id_metodo_pago,
            fecha_inicio
        } = req.body;
        if (
            !id_servicio ||
            !id_metodo_pago ||
            !fecha_inicio
        ) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }
        const cliente = await clienteService.getClienteByUserId(req.user.id_usuario);
        if (!cliente) {
            return res.status(404).json({
                message: "Cliente no encontrado"
            });
        }
        const servicio = await clienteService.getShippingServiceById(id_servicio);
        if (!servicio) {
            return res.status(404).json({
                message: "Servicio no encontrado"
            });
        }
        const metodo = await clienteService.getCardByMethod(id_metodo_pago);
        if (!metodo) {
            return res.status(404).json({
                message: "Método de pago no encontrado"
            });
        }
        if (metodo.id_cliente !== cliente.id_cliente) {
            return res.status(403).json({
                message: "El método de pago no pertenece al cliente"
            });
        }
        if (!metodo.activo) {
            return res.status(400).json({
                message: "El método de pago está desactivado"
            });
        }
        const hoy = new Date();
        const fechaReserva = new Date(fecha_inicio);
        const diferencia = fechaReserva.getTime() - hoy.getTime();
        if (diferencia < 24 * 60 * 60 * 1000) {
            return res.status(400).json({
                message: "Debe reservar con al menos 24 horas de anticipación"
            });
        }

        const conflicto = await clienteService.hasReservationConflict(cliente.id_cliente, fecha_inicio);
        if (conflicto) {
            return res.status(409).json({
                message: "Ya existe una reservación para esa fecha"
            });
        }
        if (metodo.saldo < servicio.precio_envio) {
            return res.status(400).json({
                message: "Saldo insuficiente"
            });
        }
        const precio = Number(servicio.precio_envio);
        const comision = Number((precio * 0.10).toFixed(2));
        const proveedor = Number((precio - comision).toFixed(2));
        await transaction.begin();
        const request = new sql.Request(transaction);
        await clienteService.discountBalanceTransaction(transaction, id_metodo_pago, precio);

        const reservacion = await clienteService.createReservationTransaction(
        transaction,
        {
            id_cliente: cliente.id_cliente,
            id_metodo_pago,
            id_servicio_env: id_servicio,
            fecha_inicio,
            precio_total: precio,
            comision,
            proveedor
        }
    );
        await transaction.commit();

        return res.status(201).json({
            message: "Reservación creada correctamente",
            reservacion
        });
    } catch (error) {
        if (transaction._aborted === false) {
            await transaction.rollback();
        }
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

const rateShippingService = async (req, res) => {

    try {
        const {
            id_reservacion,
            puntuacion,
            comentario
        } = req.body;

        if (!id_reservacion || !puntuacion) {
            return res.status(400).json({
                message: "Datos incompletos"
            });
        }
        if (puntuacion < 1 || puntuacion > 5) {
            return res.status(400).json({
                message: "La puntuación debe estar entre 1 y 5"
            });
        }

        const cliente = await clienteService.getClienteByUserId(req.user.id_usuario);
        const reservacion = await clienteService.getReservationForRating(
                id_reservacion,
                cliente.id_cliente
            );
        if (!reservacion) {
            return res.status(404).json({
                message: "Reservación no encontrada"
            });
        }
        if (reservacion.estado !== "ENTREGADO") {
            return res.status(400).json({
                message: "Solo puede calificar servicios entregados"
            });
        }
        const existe = await clienteService.hasRating(id_reservacion);
        if (existe) {
            return res.status(400).json({
                message: "Esta reservación ya fue calificada"
            });
        }
        const rating = await clienteService.createRating({
                id_reservacion,
                id_cliente: cliente.id_cliente,
                puntuacion,
                comentario

            });
        await clienteService.updateServiceRating(reservacion.id_servicio_env);
        return res.status(201).json({
            message: "Calificación registrada correctamente",
            rating
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const cancelReservation = async (req, res) => {

    const transaction = new sql.Transaction(await connectDB());
    try {
        const cliente = await clienteService.getClienteByUserId(req.user.id_usuario);
        const reservacion = await clienteService.getReservationById(req.params.id, cliente.id_cliente);
        if (!reservacion) {
            return res.status(404).json({
                message: "Reservación no encontrada"
            });
        }
        if (reservacion.estado !== "PENDIENTE") {
            return res.status(400).json({
                message: "Solo puede cancelar reservaciones pendientes"
            });
        }
        const inicio = new Date(reservacion.fecha_inicio);
        const ahora = new Date();
        const horas = (inicio - ahora) / (1000 * 60 * 60);
        if (horas < 24) {
            return res.status(400).json({
                message: "Solo puede cancelar con al menos 24 horas de anticipación"
            });
        }
        await transaction.begin();
        await clienteService.refundBalance(
            transaction,
            reservacion.id_metodo_pago,
            reservacion.precio_total
        );
        await clienteService.cancelReservation(
            transaction,
            reservacion.id_reservacion,
            req.body.motivo || null
        );
        await transaction.commit();
        return res.json({
            message: "Reservación cancelada correctamente"
        });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({
            message: error.message
        });
    }
};

const createReport = async (req, res) => {

    try {
        const {
            id_reservacion,
            motivo,
            descripcion

        } = req.body;

        const cliente = await clienteService.getClienteByUserId(
                req.user.id_usuario
            );

        const reservacion = await clienteService.getReservationReportData(
                id_reservacion,
                cliente.id_cliente
            );
        if (!reservacion) {
            return res.status(404).json({
                message: "Reservación no encontrada"
            });
        }
        const reporte =
            await clienteService.createReport({
                id_reportante: req.user.id_usuario,
                id_reportado: reservacion.reportado,
                id_reservacion,
                tipo_reporte: "SERVICIO_ENVIO",
                motivo,
                descripcion
            });
        if (req.files) {
            for (const file of req.files) {
                await clienteService.createEvidence(
                    reporte.id_reporte,
                    `/uploads/${file.filename}`
                );
            }
        }
        return res.status(201).json({
            message: "Reporte creado correctamente",
            id_reporte: reporte.id_reporte
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    registerCliente,
    getShippingServices,
    registerCard,
    getPaymentMethods,
    deactivatePaymentMethod,
    createReservation,
    rateShippingService,
    cancelReservation,
    createReport
};