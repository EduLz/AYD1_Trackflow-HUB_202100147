const { connectDB } = require("../config/database");

const createEmpresa = async (data) => {

    const {
        id_usuario,
        nombre_empresa,
        telefono,
        telefono_respaldo,
        nit,
        licencia_operativa
    } = data;

    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id_usuario", id_usuario)
        .input("nombre_empresa", nombre_empresa)
        .input("telefono", telefono)
        .input("telefono_respaldo", telefono_respaldo)
        .input("nit", nit)
        .input("licencia_operativa", licencia_operativa)
        .query(`
            INSERT INTO EmpresaTransporte
            (
                id_usuario,
                nombre_empresa,
                telefono,
                telefono_respaldo,
                nit,
                licencia_operativa
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_usuario,
                @nombre_empresa,
                @telefono,
                @telefono_respaldo,
                @nit,
                @licencia_operativa
            )
        `);

    return result.recordset[0];
};

// Registrar rutas manualmente
const createRoute = async (data) => {
    const {
        id_empresa,
        origen,
        destino,
        tipo_servicio,
        hora_inicio,
        tiempo_estimado_hrs,
        precio
    } = data;

    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id_empresa", id_empresa)
        .input("origen", origen)
        .input("destino", destino)
        .input("tipo_servicio", tipo_servicio)
        .input("hora_inicio", hora_inicio)
        .input("tiempo_estimado_hrs", tiempo_estimado_hrs)
        .input("precio", precio)
        .query(`
            INSERT INTO Ruta
            (
                id_empresa,
                id_estado,
                origen,
                destino,
                tipo_servicio,
                hora_inicio,
                tiempo_estimado_hrs,
                precio
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_empresa,
                1,
                @origen,
                @destino,
                @tipo_servicio,
                @hora_inicio,
                @tiempo_estimado_hrs,
                @precio
            )
        `);

    return result.recordset[0];
};

// Editar ruta
const updateRoute = async (idRuta, data) => {

    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id_ruta", idRuta)
        .input("origen", data.origen)
        .input("destino", data.destino)
        .input("tipo_servicio", data.tipo_servicio)
        .input("hora_inicio", data.hora_inicio)
        .input("tiempo_estimado_hrs", data.tiempo_estimado_hrs)
        .input("precio", data.precio)
        .query(`
            UPDATE Ruta
            SET
                origen = @origen,
                destino = @destino,
                tipo_servicio = @tipo_servicio,
                hora_inicio = @hora_inicio,
                tiempo_estimado_hrs = @tiempo_estimado_hrs,
                precio = @precio,
                fecha_actualizacion = GETDATE()
            OUTPUT INSERTED.*
            WHERE id_ruta = @id_ruta
        `);

    return result.recordset[0];
};

// Suspender ruta
const suspendRoute = async (idRuta) => {

    const pool = await connectDB();

    await pool.request()
        .input("id_ruta", idRuta)
        .query(`
            UPDATE Ruta
            SET id_estado =
            (
                SELECT id_estado
                FROM EstadoServicio
                WHERE nombre = 'SUSPENDIDO'
            )
            WHERE id_ruta = @id_ruta
        `);
};

// Cancelar ruta
const cancelRoute = async (idRuta) => {

    const pool = await connectDB();

    await pool.request()
        .input("id_ruta", idRuta)
        .query(`
            UPDATE Ruta
            SET id_estado =
            (
                SELECT id_estado
                FROM EstadoServicio
                WHERE nombre = 'ELIMINADO'
            )
            WHERE id_ruta = @id_ruta
        `);
};

// Crear cupones
const createCoupon = async (data) => {

    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id_tipo", data.id_tipo)
        .input("id_empresa", data.id_empresa)
        .input("codigo", data.codigo)
        .input("descripcion", data.descripcion)
        .input("valor", data.valor)
        .input("fecha_inicio", data.fecha_inicio)
        .input("fecha_fin", data.fecha_fin)
        .query(`
            INSERT INTO Cupon
            (
                id_tipo,
                id_empresa,
                codigo,
                descripcion,
                valor,
                fecha_inicio,
                fecha_fin
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_tipo,
                @id_empresa,
                @codigo,
                @descripcion,
                @valor,
                @fecha_inicio,
                @fecha_fin
            )
        `);

    return result.recordset[0];
};

// Solicitar cambios de perfil
const createProfileChangeRequest = async (
    id_usuario,
    nuevosDatos
) => {

    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id_usuario", id_usuario)
        .input(
            "datos_nuevos_json",
            JSON.stringify(nuevosDatos)
        )
        .query(`
            INSERT INTO SolicitudCambioPerfil
            (
                id_usuario,
                id_estado,
                datos_nuevos_json
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_usuario,
                1,
                @datos_nuevos_json
            )
        `);

    return result.recordset[0];
};

// Crear Vehiculos
const createVehicle = async (data) => {

    const {
        id_empresa,
        placa,
        tipo,
        capacidad_kg,
        modelo,
        anio
    } = data;

    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id_empresa", id_empresa)
        .input("placa", placa)
        .input("tipo", tipo)
        .input("capacidad_kg", capacidad_kg)
        .input("modelo", modelo)
        .input("anio", anio)
        .query(`
            INSERT INTO Vehiculo
            (
                id_empresa,
                placa,
                tipo,
                capacidad_kg,
                modelo,
                anio
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_empresa,
                @placa,
                @tipo,
                @capacidad_kg,
                @modelo,
                @anio
            )
        `);

    return result.recordset[0];
};

// Carga masiva vehiculos (flotas)
const createVehiclesBulk = async (vehicles) => {

    const pool = await connectDB();

    for (const vehicle of vehicles) {

        await pool.request()
            .input("id_empresa", vehicle.id_empresa)
            .input("placa", vehicle.placa)
            .input("tipo", vehicle.tipo)
            .input("capacidad_kg", vehicle.capacidad_kg)
            .input("modelo", vehicle.modelo)
            .input("anio", vehicle.anio)
            .query(`
                INSERT INTO Vehiculo
                (
                    id_empresa,
                    placa,
                    tipo,
                    capacidad_kg,
                    modelo,
                    anio
                )
                VALUES
                (
                    @id_empresa,
                    @placa,
                    @tipo,
                    @capacidad_kg,
                    @modelo,
                    @anio
                )
            `);
    }

    return true;
};

// Carga masiva rutas
const createRoutesBulk = async (routes) => {

    const pool = await connectDB();

    for (const route of routes) {

        const routeResult =
            await pool.request()
                .input("id_empresa", route.id_empresa)
                .input("origen", route.origen)
                .input("destino", route.destino)
                .input("tipo_servicio", route.tipo_servicio)
                .input("hora_inicio", route.hora_inicio)
                .input(
                    "tiempo_estimado_hrs",
                    route.tiempo_estimado_hrs
                )
                .input("precio", route.precio)
                .query(`
                    INSERT INTO Ruta
                    (
                        id_empresa,
                        id_estado,
                        origen,
                        destino,
                        tipo_servicio,
                        hora_inicio,
                        tiempo_estimado_hrs,
                        precio
                    )
                    OUTPUT INSERTED.id_ruta
                    VALUES
                    (
                        @id_empresa,
                        1,
                        @origen,
                        @destino,
                        @tipo_servicio,
                        @hora_inicio,
                        @tiempo_estimado_hrs,
                        @precio
                    )
                `);

        const idRuta =
            routeResult.recordset[0].id_ruta;

        if (route.id_vehiculo) {

            await pool.request()
                .input("id_ruta", idRuta)
                .input("id_vehiculo", route.id_vehiculo)
                .query(`
            INSERT INTO RutaVehiculo
            (
                id_ruta,
                id_vehiculo
            )
            VALUES
            (
                @id_ruta,
                @id_vehiculo
            )
        `);
        }
    }

    return true;
};

// Asignar Vehiculo
const assignVehicleToRoute = async (
    id_ruta,
    id_vehiculo
) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("id_ruta", id_ruta)
        .input("id_vehiculo", id_vehiculo)
        .query(`
            INSERT INTO RutaVehiculo
            (
                id_ruta,
                id_vehiculo
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_ruta,
                @id_vehiculo
            )
        `);

    return result.recordset[0];
};

const updateVehicleRoute = async (idRuta, idVehiculo) => {
    const pool = await connectDB();

    const exists = await pool.request()
        .input("id_ruta", idRuta)
        .query(`
            SELECT id_ruta_vehiculo
            FROM RutaVehiculo
            WHERE id_ruta = @id_ruta
        `);

    if (exists.recordset.length > 0) {
        const result = await pool.request()
            .input("id_ruta", idRuta)
            .input("id_vehiculo", idVehiculo)
            .query(`
                UPDATE RutaVehiculo
                SET id_vehiculo = @id_vehiculo
                OUTPUT INSERTED.*
                WHERE id_ruta = @id_ruta
            `);

        return result.recordset[0];
    }

    const result = await pool.request()
        .input("id_ruta", idRuta)
        .input("id_vehiculo", idVehiculo)
        .query(`
            INSERT INTO RutaVehiculo
            (
                id_ruta,
                id_vehiculo
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_ruta,
                @id_vehiculo
            )
        `);

    return result.recordset[0];
};

const getEmpresaByUsuario = async (id_usuario) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id_usuario", id_usuario)
        .query(`
            SELECT *
            FROM EmpresaTransporte
            WHERE id_usuario = @id_usuario
        `);

    return result.recordset[0];
};

const getRoutesByCompany = async (id_empresa) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id_empresa", id_empresa)
        .query(`
            SELECT
                r.id_ruta,
                r.origen,
                r.destino,
                r.tipo_servicio,
                r.hora_inicio,
                r.tiempo_estimado_hrs,
                r.precio,
                es.nombre AS estado,
                v.id_vehiculo,
                v.placa,
                v.tipo AS tipo_vehiculo,
                v.modelo
            FROM Ruta r
            INNER JOIN EstadoServicio es
                ON r.id_estado = es.id_estado
            LEFT JOIN RutaVehiculo rv
                ON r.id_ruta = rv.id_ruta
            LEFT JOIN Vehiculo v
                ON rv.id_vehiculo = v.id_vehiculo
            WHERE r.id_empresa = @id_empresa
            ORDER BY r.id_ruta DESC
        `);

    return result.recordset;
};

const getCouponsByCompany = async (id_empresa) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id_empresa", id_empresa)
        .query(`
            SELECT
                c.id_cupon,
                c.codigo,
                c.valor,
                c.fecha_fin,
                u.correo AS enviado_a,
                CASE
                    WHEN cc.usado = 1
                        THEN 'UTILIZADO'
                    ELSE 'PENDIENTE'
                END AS estado
            FROM Cupon c
            INNER JOIN CuponCliente cc
                ON c.id_cupon = cc.id_cupon
            INNER JOIN Cliente cl
                ON cc.id_cliente = cl.id_cliente
            INNER JOIN Usuario u
                ON cl.id_usuario = u.id_usuario
            WHERE c.id_empresa = @id_empresa
            ORDER BY c.id_cupon DESC
        `);

    return result.recordset;
};

const findClienteByEmail = async (correo) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("correo", correo)
        .query(`
            SELECT
                c.id_cliente,
                u.id_usuario,
                u.correo
            FROM Cliente c
            INNER JOIN Usuario u
                ON c.id_usuario = u.id_usuario
            WHERE u.correo = @correo
        `);

    return result.recordset[0];
};

const assignCouponToClient = async (id_cupon, id_cliente) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id_cupon", id_cupon)
        .input("id_cliente", id_cliente)
        .query(`
            INSERT INTO CuponCliente
            (
                id_cupon,
                id_cliente,
                usado
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_cupon,
                @id_cliente,
                0
            )
        `);

    return result.recordset[0];
};

const getVehiclesByCompany = async (id_empresa) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id_empresa", id_empresa)
        .query(`
            SELECT
                id_vehiculo,
                placa,
                tipo,
                modelo,
                anio,
                capacidad_kg
            FROM Vehiculo
            WHERE id_empresa = @id_empresa
              AND activo = 1
            ORDER BY id_vehiculo ASC
        `);

    return result.recordset;
};
const getResumenEmpresa = async (id_empresa) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_empresa", id_empresa)
        .query(`
            SELECT
                COUNT(*) AS servicios_contratados,
                ISNULL(SUM(CASE WHEN r.id_estado = 4 THEN r.monto_proveedor ELSE 0 END), 0) AS total_ganado
            FROM Reservacion r
            INNER JOIN Ruta rt ON rt.id_ruta = r.id_ruta
            WHERE rt.id_empresa = @id_empresa
        `);
    return result.recordset[0];
};

const getReporteCalificacionesEmpresa = async (id_empresa) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_empresa", id_empresa)
        .query(`
            SELECT
                COUNT(*) AS total_calificaciones,
                ISNULL(AVG(CAST(c.puntuacion AS DECIMAL(3,2))), 0) AS promedio
            FROM Calificacion c
            INNER JOIN Reservacion r ON r.id_reservacion = c.id_reservacion
            INNER JOIN Ruta rt       ON rt.id_ruta       = r.id_ruta
            WHERE rt.id_empresa = @id_empresa
        `);
    return result.recordset[0];
};

const getReporteEstadoRutas = async (id_empresa) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_empresa", id_empresa)
        .query(`
            SELECT
                es.nombre AS estado,
                COUNT(*) AS total
            FROM Ruta rt
            INNER JOIN EstadoServicio es ON es.id_estado = rt.id_estado
            WHERE rt.id_empresa = @id_empresa
            GROUP BY es.nombre
        `);
    return result.recordset;
};

const vehicleHasScheduleConflict = async (
    id_vehiculo,
    hora_inicio,
    tiempo_estimado_hrs,
    id_ruta_excluir = null
) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id_vehiculo", id_vehiculo)
        .input("hora_inicio", hora_inicio)
        .input("tiempo_estimado_hrs", tiempo_estimado_hrs)
        .input("id_ruta_excluir", id_ruta_excluir)
        .query(`
            DECLARE @nuevo_inicio TIME = @hora_inicio;
            DECLARE @nuevo_fin TIME = DATEADD(
                MINUTE,
                CAST(@tiempo_estimado_hrs * 60 AS INT),
                CAST(@hora_inicio AS DATETIME)
            );

            SELECT
                r.id_ruta,
                r.origen,
                r.destino,
                r.hora_inicio,
                r.tiempo_estimado_hrs
            FROM RutaVehiculo rv
            INNER JOIN Ruta r
                ON rv.id_ruta = r.id_ruta
            INNER JOIN EstadoServicio es
                ON r.id_estado = es.id_estado
            WHERE rv.id_vehiculo = @id_vehiculo
              AND es.nombre = 'ACTIVO'
              AND (@id_ruta_excluir IS NULL OR r.id_ruta <> @id_ruta_excluir)
              AND CAST(@nuevo_inicio AS TIME) < CAST(DATEADD(
                    MINUTE,
                    CAST(r.tiempo_estimado_hrs * 60 AS INT),
                    CAST(r.hora_inicio AS DATETIME)
                  ) AS TIME)
              AND CAST(@nuevo_fin AS TIME) > r.hora_inicio
        `);

    return result.recordset[0];
};

const vehiclePlateExists = async (placa) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("placa", placa)
        .query(`
            SELECT id_vehiculo
            FROM Vehiculo
            WHERE placa = @placa
        `);

    return result.recordset[0];
};
const getDashboardResumen = async (id_empresa) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_empresa", id_empresa)
        .query(`
            SELECT
                ISNULL((SELECT SUM(r.monto_proveedor)
                        FROM Reservacion r INNER JOIN Ruta rt ON rt.id_ruta = r.id_ruta
                        WHERE rt.id_empresa = @id_empresa AND r.id_estado = 4), 0) AS ganancias_totales,
                ISNULL((SELECT COUNT(*)
                        FROM Reservacion r INNER JOIN Ruta rt ON rt.id_ruta = r.id_ruta
                        WHERE rt.id_empresa = @id_empresa), 0) AS servicios_contratados,
                ISNULL((SELECT AVG(CAST(c.puntuacion AS DECIMAL(3,2)))
                        FROM Calificacion c
                        INNER JOIN Reservacion r ON r.id_reservacion = c.id_reservacion
                        INNER JOIN Ruta rt ON rt.id_ruta = r.id_ruta
                        WHERE rt.id_empresa = @id_empresa), 0) AS calificacion_global,
                ISNULL((SELECT COUNT(*)
                        FROM Ruta rt INNER JOIN EstadoServicio es ON es.id_estado = rt.id_estado
                        WHERE rt.id_empresa = @id_empresa AND es.nombre = 'ACTIVO'), 0) AS rutas_activas,
                ISNULL((SELECT COUNT(*)
                        FROM Ruta rt INNER JOIN EstadoServicio es ON es.id_estado = rt.id_estado
                        WHERE rt.id_empresa = @id_empresa AND es.nombre = 'SUSPENDIDO'), 0) AS rutas_suspendidas
        `);
    return result.recordset[0];
};

const getDashboardServicios = async (id_empresa) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_empresa", id_empresa)
        .query(`
            SELECT
                r.id_reservacion AS id_servicio,
                (cl.nombre + ' ' + cl.apellido) AS cliente_nombre,
                rt.origen,
                rt.destino,
                r.precio_total AS precio,
                er.nombre AS estado
            FROM Reservacion r
            INNER JOIN Ruta rt              ON rt.id_ruta   = r.id_ruta
            INNER JOIN Cliente cl           ON cl.id_cliente = r.id_cliente
            INNER JOIN EstadoReservacion er ON er.id_estado  = r.id_estado
            WHERE rt.id_empresa = @id_empresa
            ORDER BY r.id_reservacion DESC
        `);
    return result.recordset;
};

const getProfileChangeRequestsByUser = async (id_usuario) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id_usuario", id_usuario)
        .query(`
            SELECT
                scp.id_solicitud,
                scp.id_usuario,
                es.nombre AS estado,
                scp.datos_nuevos_json,
                scp.fecha_solicitud
            FROM SolicitudCambioPerfil scp
            INNER JOIN EstadoSolicitud es
                ON scp.id_estado = es.id_estado
            WHERE scp.id_usuario = @id_usuario
            ORDER BY scp.id_solicitud DESC
        `);

    return result.recordset;
};

const activateRoute = async (id_ruta) => {
    const pool = await connectDB();

    await pool.request()
        .input("id_ruta", id_ruta)
        .query(`
            UPDATE Ruta
            SET id_estado = 1
            WHERE id_ruta = @id_ruta
        `);
};

const getRouteById = async (id_ruta) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id_ruta", id_ruta)
        .query(`
            SELECT
                r.id_ruta,
                es.nombre AS estado
            FROM Ruta r
            INNER JOIN EstadoServicio es
                ON r.id_estado = es.id_estado
            WHERE r.id_ruta = @id_ruta
        `);

    return result.recordset[0];
};

const updateCompanyProfile = async (id_usuario, datos) => {
    const pool = await connectDB();
    await pool.request()
        .input("id_usuario", id_usuario)
        .input("nombre_empresa", datos.nombre_empresa)
        .input("telefono", datos.telefono)
        .input("telefono_respaldo", datos.telefono_respaldo)
        .input("nit", datos.nit)
        .input("licencia_operativa", datos.licencia_operativa)
        .query(`
            UPDATE EmpresaTransporte
            SET 
                nombre_empresa = @nombre_empresa,
                telefono = @telefono,
                telefono_respaldo = @telefono_respaldo,
                nit = @nit,
                licencia_operativa = @licencia_operativa
            WHERE id_usuario = @id_usuario
        `);
};

module.exports = {
    createEmpresa,
    createRoute,
    updateRoute,
    suspendRoute,
    cancelRoute,
    createCoupon,
    createProfileChangeRequest,
    createVehicle,
    createVehiclesBulk,
    createRoutesBulk,
    assignVehicleToRoute,
    updateVehicleRoute,
    getEmpresaByUsuario,
    getRoutesByCompany,
    getCouponsByCompany,
    findClienteByEmail,
    assignCouponToClient,
    getVehiclesByCompany,
    getResumenEmpresa,
    getReporteCalificacionesEmpresa,
    getReporteEstadoRutas,
    vehicleHasScheduleConflict,
    vehiclePlateExists,
    getDashboardResumen,
    getDashboardServicios,
    getProfileChangeRequestsByUser,
    activateRoute,
    getRouteById,
    updateCompanyProfile
};