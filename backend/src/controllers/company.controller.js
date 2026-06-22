const crypto = require("crypto");

const authService = require("../services/auth.services");
const companyService = require("../services/company.services");
const solicitudService = require("../services/request.services");
const emailService = require("../services/email.services");
const { encryptPassword } = require("../utils/password");
const csv = require("csv-parser");
const { Readable } = require("stream");

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

const createRoute = async (req, res) => {
    try {
        const {
            id_empresa,
            id_vehiculo,
            origen,
            destino,
            tipo_servicio,
            hora_inicio,
            tiempo_estimado_hrs,
            precio
        } = req.body;

        if (
            !id_empresa ||
            !id_vehiculo ||
            !origen ||
            !destino ||
            !tipo_servicio ||
            !hora_inicio ||
            !tiempo_estimado_hrs ||
            !precio
        ) {
            return res.status(400).json({
                message: "Todos los campos obligatorios deben completarse"
            });
        }

        const conflict = await companyService.vehicleHasScheduleConflict(
            id_vehiculo,
            hora_inicio,
            tiempo_estimado_hrs
        );

        if (conflict) {
            return res.status(409).json({
                message: `El vehículo ya está asignado a una ruta activa en ese horario: ${conflict.origen} - ${conflict.destino}`
            });
        }

        const route = await companyService.createRoute({
            id_empresa,
            origen,
            destino,
            tipo_servicio,
            hora_inicio,
            tiempo_estimado_hrs,
            precio
        });

        await companyService.assignVehicleToRoute(
            route.id_ruta,
            id_vehiculo
        );

        return res.status(201).json({
            message: "Ruta creada correctamente",
            route
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: error.message
        });
    }
};

const updateRoute = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            id_vehiculo,
            origen,
            destino,
            tipo_servicio,
            hora_inicio,
            tiempo_estimado_hrs,
            precio
        } = req.body;

        if (
            !id_vehiculo ||
            !origen ||
            !destino ||
            !tipo_servicio ||
            !hora_inicio ||
            !tiempo_estimado_hrs ||
            !precio
        ) {
            return res.status(400).json({
                message: "Todos los campos obligatorios deben completarse"
            });
        }

        const conflict = await companyService.vehicleHasScheduleConflict(
            id_vehiculo,
            hora_inicio,
            tiempo_estimado_hrs,
            id
        );

        if (conflict) {
            return res.status(409).json({
                message: `El vehículo ya está asignado a una ruta activa en ese horario: ${conflict.origen} - ${conflict.destino}`
            });
        }

        const route = await companyService.updateRoute(
            id,
            {
                origen,
                destino,
                tipo_servicio,
                hora_inicio,
                tiempo_estimado_hrs,
                precio
            }
        );

        if (!route) {
            return res.status(404).json({
                message: "Ruta no encontrada"
            });
        }

        await companyService.updateVehicleRoute(
            id,
            id_vehiculo
        );

        return res.status(200).json({
            message: "Ruta actualizada correctamente",
            route
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: error.message
        });
    }
};

const suspendRoute = async (req, res) => {

    try {

        await companyService.suspendRoute(
            req.params.id
        );

        return res.status(200).json({
            message: "Ruta suspendida correctamente"
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }

};

const cancelRoute = async (req, res) => {

    try {

        await companyService.cancelRoute(
            req.params.id
        );

        return res.status(200).json({
            message: "Ruta cancelada correctamente"
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

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
            clientes
        } = req.body;

        if (!id_tipo || !codigo || !descripcion || !valor || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                message: "Todos los campos obligatorios deben completarse"
            });
        }

        if (!clientes || clientes.length === 0) {
            return res.status(400).json({
                message: "Debe seleccionar al menos un cliente"
            });
        }

        const empresa = await companyService.getEmpresaByUsuario(
            req.user.id_usuario
        );

        if (!empresa) {
            return res.status(404).json({
                message: "No se encontró la empresa asociada al usuario"
            });
        }

        const clientesEncontrados = [];

        for (const correo of clientes) {
            const cliente = await companyService.findClienteByEmail(correo);

            if (!cliente) {
                return res.status(404).json({
                    message: `No existe un cliente registrado con el correo ${correo}`
                });
            }

            clientesEncontrados.push({
                correo,
                id_cliente: cliente.id_cliente
            });
        }

        const coupon = await companyService.createCoupon({
            id_tipo,
            id_empresa: empresa.id_empresa,
            codigo,
            descripcion,
            valor,
            fecha_inicio,
            fecha_fin
        });

        for (const cliente of clientesEncontrados) {
            await companyService.assignCouponToClient(
                coupon.id_cupon,
                cliente.id_cliente
            );

            emailService.sendCompanyCouponEmail(
                cliente.correo,
                "Cliente",
                empresa.nombre_empresa,
                codigo,
                descripcion,
                valor
            ).catch(error => {
                console.error("Error enviando cupón por correo:", error.message);
            });
        }

        return res.status(201).json({
            message: "Cupón creado correctamente",
            coupon,
            clientesAsignados: clientesEncontrados.map(c => c.correo)
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

        const {
            id_usuario,
            nuevos_datos
        } = req.body;

        const request =
            await companyService.createProfileChangeRequest(
                id_usuario,
                nuevos_datos
            );

        return res.status(201).json({
            message:
                "Solicitud enviada correctamente",
            request
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }

};

const createVehicle = async (req, res) => {

    try {

        const vehicle =
            await companyService.createVehicle(
                req.body
            );

        return res.status(201).json({
            message: "Vehículo registrado",
            vehicle
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }

};

const uploadFleetCSV = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                message: "Debe enviar un archivo CSV"
            });
        }

        const rows = [];

        Readable
            .from(req.file.buffer)
            .pipe(csv())
            .on("data", (data) => {
                rows.push({
                    id_empresa: data.id_empresa,
                    placa: data.placa,
                    tipo: data.tipo,
                    capacidad_kg: data.capacidad_kg,
                    modelo: data.modelo,
                    anio: data.anio
                });
            })
            .on("end", async () => {

                const placasCSV = new Set();

                for (const vehicle of rows) {

                    if (placasCSV.has(vehicle.placa)) {
                        return res.status(400).json({
                            message: `La placa ${vehicle.placa} está repetida dentro del archivo CSV`
                        });
                    }

                    placasCSV.add(vehicle.placa);

                    const exists = await companyService.vehiclePlateExists(
                        vehicle.placa
                    );

                    if (exists) {
                        return res.status(409).json({
                            message: `La placa ${vehicle.placa} ya existe en la base de datos`
                        });
                    }
                }

                await companyService.createVehiclesBulk(rows);

                return res.status(201).json({
                    message: `${rows.length} vehículos cargados`
                });

            });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }

};

const uploadRoutesCSV = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                message: "Debe enviar un archivo CSV"
            });
        }

        const rows = [];

        Readable
            .from(req.file.buffer)
            .pipe(csv())
            .on("data", (data) => {

                rows.push({
                    id_empresa: data.id_empresa,
                    id_vehiculo: data.id_vehiculo,
                    origen: data.origen,
                    destino: data.destino,
                    tipo_servicio: data.tipo_servicio,
                    hora_inicio: data.hora_inicio,
                    tiempo_estimado_hrs: data.tiempo_estimado_hrs,
                    precio: data.precio
                });

            })
            .on("end", async () => {

                for (const route of rows) {

                    if (
                        !route.id_empresa ||
                        !route.id_vehiculo ||
                        !route.origen ||
                        !route.destino ||
                        !route.tipo_servicio ||
                        !route.hora_inicio ||
                        !route.tiempo_estimado_hrs ||
                        !route.precio
                    ) {
                        return res.status(400).json({
                            message: "Todas las columnas del CSV de rutas son obligatorias"
                        });
                    }

                    const conflict = await companyService.vehicleHasScheduleConflict(
                        route.id_vehiculo,
                        route.hora_inicio,
                        route.tiempo_estimado_hrs
                    );

                    if (conflict) {
                        return res.status(409).json({
                            message: `El vehículo ${route.id_vehiculo} ya está asignado a una ruta activa en ese horario: ${conflict.origen} - ${conflict.destino}`
                        });
                    }
                }

                await companyService.createRoutesBulk(rows);

                return res.status(201).json({
                    message: `${rows.length} rutas cargadas`
                });

            });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }

};

const assignVehicle = async (req, res) => {

    try {

        const { id } = req.params;
        const { id_vehiculo } = req.body;

        const assignment =
            await companyService.assignVehicleToRoute(
                id,
                id_vehiculo
            );

        return res.status(201).json(assignment);

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });
    }
};

const getRoutes = async (req, res) => {
    try {
        const empresa = await companyService.getEmpresaByUsuario(
            req.user.id_usuario
        );

        if (!empresa) {
            return res.status(404).json({
                message: "No se encontró la empresa asociada al usuario"
            });
        }

        const routes = await companyService.getRoutesByCompany(
            empresa.id_empresa
        );

        return res.status(200).json(routes);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const getCoupons = async (req, res) => {
    try {
        const empresa = await companyService.getEmpresaByUsuario(
            req.user.id_usuario
        );

        if (!empresa) {
            return res.status(404).json({
                message: "No se encontró la empresa asociada al usuario"
            });
        }

        const coupons = await companyService.getCouponsByCompany(
            empresa.id_empresa
        );

        return res.status(200).json(coupons);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const getVehicles = async (req, res) => {
    try {
        const empresa = await companyService.getEmpresaByUsuario(
            req.user.id_usuario
        );

        if (!empresa) {
            return res.status(404).json({
                message: "No se encontró la empresa asociada al usuario"
            });
        }

        const vehicles = await companyService.getVehiclesByCompany(
            empresa.id_empresa
        );

        return res.status(200).json(vehicles);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const getReportesEmpresa = async (req, res) => {
    try {
        const empresa = await companyService.getEmpresaByUsuario(req.user.id_usuario);
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
    createRoute,
    updateRoute,
    suspendRoute,
    cancelRoute,
    createCoupon,
    requestProfileChange,
    createVehicle,
    uploadRoutesCSV,
    uploadFleetCSV,
    assignVehicle,
    getRoutes,
    getCoupons,
    getVehicles,
    getReportesEmpresa
};