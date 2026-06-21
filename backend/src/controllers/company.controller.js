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
            id_vehiculo
        } = req.body;

        const route = await companyService.createRoute(req.body);

        if (id_vehiculo) {

            await companyService.assignVehicleToRoute(
                route.id_ruta,
                id_vehiculo
            );
        }

        return res.status(201).json(route);

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
        const { id_vehiculo } = req.body;

        const route = await companyService.updateRoute(
            id,
            req.body
        );

        if (id_vehiculo) {
            await companyService.updateVehicleRoute(
                id,
                id_vehiculo
            );
        }

        return res.status(200).json({
            message: "Ruta actualizada correctamente",
            route
        });

    } catch (error) {
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

        if (
            !id_tipo ||
            !codigo ||
            !descripcion ||
            !valor ||
            !fecha_inicio ||
            !fecha_fin
        ) {
            return res.status(400).json({
                message: "Todos los campos obligatorios deben completarse"
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

        const coupon = await companyService.createCoupon({
            id_tipo,
            id_empresa: empresa.id_empresa,
            codigo,
            descripcion,
            valor,
            fecha_inicio,
            fecha_fin
        });

        const clientesAsignados = [];
        const clientesNoEncontrados = [];

        if (clientes && clientes.length > 0) {
            for (const correo of clientes) {
                const cliente = await companyService.findClienteByEmail(correo);

                if (!cliente) {
                    clientesNoEncontrados.push(correo);
                    continue;
                }

                await companyService.assignCouponToClient(
                    coupon.id_cupon,
                    cliente.id_cliente
                );

                await emailService.sendCompanyCouponEmail(
                    correo,
                    "Cliente",
                    empresa.nombre_empresa,
                    codigo,
                    descripcion,
                    valor
                );

                clientesAsignados.push(correo);
            }
        }

        return res.status(201).json({
            message: "Cupón creado correctamente",
            coupon,
            clientesAsignados,
            clientesNoEncontrados
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

                await companyService.createVehiclesBulk(
                    rows
                );

                return res.status(201).json({
                    message:
                        `${rows.length} vehículos cargados`
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

                await companyService.createRoutesBulk(
                    rows
                );

                return res.status(201).json({
                    message:
                        `${rows.length} rutas cargadas`
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
    getCoupons
};