const crypto = require("crypto");

const authService = require("../services/auth.services");
const operadorService = require("../services/operator.services");
const solicitudService = require("../services/request.services");
const emailService = require("../services/email.services");
const { encryptPassword } = require("../utils/password");
const requestService = require("../services/request.services");
const { connectDB } = require("../config/database");


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

const updateService = async (req, res) => {

    try {
        const { id } = req.params;
        const {
            nombre,
            zona_cobertura,
            capacidad_carga_kg,
            precio_envio,
            descripcion
        } = req.body;

        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);
        if (!operador) {
            return res.status(404).json({
                message: "Operador no encontrado"
            });
        }

        const servicioActualizado = await operadorService.updateService(
                id, operador.id_operador,
                {
                    nombre,
                    zona_cobertura,
                    capacidad_carga_kg,
                    precio_envio,
                    descripcion
                }
            );

        if (!servicioActualizado) {
            return res.status(404).json({
                message: "Servicio no encontrado"
            });
        }
        return res.status(200).json({
            message: "Servicio actualizado correctamente",
            servicio: servicioActualizado
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

const deleteService = async (req, res) => {

    try {
        const { id } = req.params;
        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);
        const servicio = await operadorService.changeServiceStatus(id, operador.id_operador, 3);
        if (!servicio) {
            return res.status(404).json({
                message: "Servicio no encontrado"
            });
        }
        return res.status(200).json({
            message: "Servicio eliminado correctamente"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};
const updateServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const id_estado = Number(req.body.id_estado);

        // Por esta ruta solo permitimos ACTIVO (1) o SUSPENDIDO (2)
        if (id_estado !== 1 && id_estado !== 2) {
            return res.status(400).json({
                message: "Estado inválido. Use 1 (ACTIVO) o 2 (SUSPENDIDO)."
            });
        }

        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);
        if (!operador) {
            return res.status(404).json({ message: "Operador no encontrado" });
        }

        const servicio = await operadorService.changeServiceStatus(id, operador.id_operador, id_estado);
        if (!servicio) {
            return res.status(404).json({ message: "Servicio no encontrado" });
        }

        const mensaje = id_estado === 2
            ? "Servicio suspendido temporalmente"
            : "Servicio activado nuevamente";

        return res.status(200).json({ message: mensaje, servicio });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
const createCoupon = async (req, res) => {

    try {
        const {
            id_tipo,
            codigo,
            descripcion,
            valor,
            fecha_inicio,
            fecha_fin,
            usos_maximos
        } = req.body;

        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);
        if (!operador) {
            return res.status(404).json({
                message: "Operador no encontrado"
            });
        }
        const cupon = await operadorService.createCoupon({
                id_tipo,
                id_operador: operador.id_operador,
                codigo,
                descripcion,
                valor,
                fecha_inicio,
                fecha_fin,
                usos_maximos
            });

        return res.status(201).json({
            message: "Cupón creado correctamente",
            cupon
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

const getMyCoupons = async (req, res) => {

    try {
        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);
        const cupones = await operadorService.getCouponsByOperator(operador.id_operador);

        return res.status(200).json({
            cupones
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

const assignCouponToClient = async (req, res) => {

    try {
        const { id } = req.params;
        const { correo } = req.body || {};
        if (!correo) {
            return res.status(400).json({
                message: "Debe proporcionar un correo"
            });
        }
        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);
        if (!operador) {
            return res.status(404).json({
                message: "Operador no encontrado"
            });
        }
        const cupon = await operadorService.getCouponById(id, operador.id_operador);
        if (!cupon) {
            return res.status(404).json({
                message: "Cupón no encontrado"
            });
        }
        const cliente = await authService.getClientByEmail(correo);
        if (!cliente) {
            return res.status(404).json({
                message: "Cliente no encontrado"
            });
        }

        const existe = await operadorService.couponAlreadyAssigned(id, cliente.id_cliente);
        if (existe) {
            return res.status(409).json({
                message: "Este cupón ya fue asignado a este cliente"
            });
        }
        const asignacion = await operadorService.assignCouponToClient(id, cliente.id_cliente);
        await emailService.sendCouponEmail(
            correo,
            cliente.nombre,
            cupon.codigo,
            cupon.descripcion
        );

        return res.status(201).json({
            message: "Cupón asignado y enviado por correo",
            asignacion
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

const requestProfileChange = async (req, res) => {

    try {
        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);
        if (!operador) {
            return res.status(404).json({
                message: "Operador no encontrado"
            });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: "Debe enviar al menos un cambio"
            });
        }

        const {
            nombre,
            apellido,
            telefono,
            telefono_respaldo,
            zona_operacion
        } = req.body;

        const datos = {
            nombre,
            apellido,
            telefono,
            telefono_respaldo,
            zona_operacion
        };

        const solicitud = await requestService.createProfileChangeRequest(req.user.id_usuario, datos);
        return res.status(201).json({
            message: "Solicitud enviada correctamente", solicitud
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);

        if (!operador) {
            return res.status(404).json({
                message: "Operador no encontrado"
            });
        }

        return res.status(200).json({
            operador
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};
const getMyCalificaciones = async (req, res) => {
    try {
        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);
        if (!operador) {
            return res.status(404).json({ message: "Operador no encontrado" });
        }
        const calificaciones = await operadorService.getCalificacionesByOperator(operador.id_operador);
        return res.status(200).json({ calificaciones });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

const responderCalificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { respuesta } = req.body;

        if (!respuesta || respuesta.trim() === "") {
            return res.status(400).json({ message: "La respuesta no puede estar vacía" });
        }

        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);
        if (!operador) {
            return res.status(404).json({ message: "Operador no encontrado" });
        }

        const calificacion = await operadorService.getCalificacionByIdForOperator(id, operador.id_operador);
        if (!calificacion) {
            return res.status(404).json({ message: "Calificación no encontrada" });
        }

        const yaRespondida = await operadorService.respuestaExists(id);
        if (yaRespondida) {
            return res.status(409).json({ message: "Esta calificación ya tiene respuesta" });
        }

        const respuestaCreada = await operadorService.createRespuestaCalificacion(id, respuesta);
        return res.status(201).json({ message: "Respuesta enviada correctamente", respuesta: respuestaCreada });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
const getCalendarioEnvios = async (req, res) => {
    try {
        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);
        if (!operador) {
            return res.status(404).json({ message: "Operador no encontrado" });
        }
        const envios = await operadorService.getEnviosProgramadosByOperator(operador.id_operador);
        return res.status(200).json({ envios });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
const getReportes = async (req, res) => {
    try {
        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);
        if (!operador) {
            return res.status(404).json({ message: "Operador no encontrado" });
        }

        const ganancias      = await operadorService.getReporteGanancias(operador.id_operador);
        const clientes       = await operadorService.getReporteClientes(operador.id_operador);
        const calificaciones = await operadorService.getReporteCalificaciones(operador.id_operador);
        const gananciasPorServicio = await operadorService.getReporteGananciasPorServicio(operador.id_operador);

        return res.status(200).json({
            reportes: {
                ganancias,
                gananciasPorServicio,
                historial_clientes: clientes,
                calificaciones
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
const getMyProfileRequests = async (req, res) => {
    
    try {
        const solicitudes = await requestService.getProfileRequestsByUser(req.user.id_usuario);
        return res.status(200).json(solicitudes);
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
const getReservaciones = async (req, res) => {
    try {
        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);
        if (!operador) {
            return res.status(404).json({ message: "Operador no encontrado" });
        }
        const reservaciones = await operadorService.getReservacionesByOperator(operador.id_operador);
        return res.status(200).json({ reservaciones });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

const startReservation = async (req, res) => {

    try {
        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);
        const reservacion = await operadorService.getReservationById(req.params.id, operador.id_operador);
        if (!reservacion) {
            return res.status(404).json({
                message: "Reservación no encontrada"
            });
        }
        if (reservacion.estado !== "PENDIENTE") {
            return res.status(400).json({
                message: "Solo puede iniciar reservaciones pendientes"
            });
        }
        const updated = await operadorService.updateReservationStatus(
                req.params.id,
                3 // EN_TRANSITO
            );
        return res.json({
            message: "Envío iniciado",
            reservacion: updated
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const finishReservation = async (req, res) => {

    try {
        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);
        const reservacion = await operadorService.getReservationById(req.params.id, operador.id_operador);
        if (!reservacion) {
            return res.status(404).json({
                message: "Reservación no encontrada"
            });
        }
        if (reservacion.estado !== "EN_TRANSITO") {
            return res.status(400).json({
                message: "La reservación no está en tránsito"
            });
        }
        const updated = await operadorService.updateReservationStatus(
                req.params.id,
                4, // ENTREGADO
                true
            );

        return res.json({
            message: "Envío finalizado",
            reservacion: updated
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const reportClient = async (req, res) => {
    try {
        const { id_reservacion, motivo, descripcion } = req.body;

        if (!id_reservacion || !motivo || !descripcion) {
            return res.status(400).json({ message: "La reservación, motivo y descripción son obligatorios" });
        }

        const pool = await connectDB();
        
        const resQuery = await pool.request()
            .input("id_res", id_reservacion)
            .query(`
                SELECT r.id_cliente, cl.id_usuario AS id_usuario_cliente
                FROM Reservacion r
                INNER JOIN Cliente cl ON cl.id_cliente = r.id_cliente
                WHERE r.id_reservacion = @id_res
            `);

        if (resQuery.recordset.length === 0) {
            return res.status(404).json({ message: "Reservación no encontrada" });
        }

        const id_reportado = resQuery.recordset[0].id_usuario_cliente;

        const reporte = await operadorService.createClientReport({
            id_reportante: req.user.id_usuario, 
            id_reportado,
            id_reservacion,
            motivo,
            descripcion
        });

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const tipo = file.mimetype.startsWith('video/') ? 'VIDEO' : 'FOTO';
                await operadorService.createReportEvidence(
                    reporte.id_reporte,
                    `/uploads/${file.filename}`,
                    tipo
                );
            }
        }

        return res.status(201).json({
            message: "Reporte contra el cliente creado exitosamente y enviado a revisión.",
            id_reporte: reporte.id_reporte
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

const getIncomingComplaints = async (req, res) => {
    try {
        const operador = await operadorService.getOperatorByUserId(req.user.id_usuario);
        if (!operador) {
            return res.status(404).json({ message: "Operador no encontrado" });
        }
        const quejas = await operadorService.getClientComplaintsByOperator(operador.id_operador);
        return res.status(200).json({ quejas });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getMySubmittedReports = async (req, res) => {
    try {
        const reportes = await operadorService.getReportsMadeToClients(req.user.id_usuario);
        return res.status(200).json({ reportes_enviados: reportes });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerOperador,
    createService,
    getMyServices,
    updateService,
    deleteService,
    createCoupon,
    getMyCoupons,
    assignCouponToClient,
    requestProfileChange,
    getMyProfile,
    updateServiceStatus,
    getMyCalificaciones,
    responderCalificacion,
    getCalendarioEnvios,
    getReportes,
    getMyProfileRequests,
    getReservaciones,
    startReservation,
    finishReservation,
    reportClient,
    getIncomingComplaints,
    getMySubmittedReports
};