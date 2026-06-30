const { connectDB } = require("../config/database");

const createOperator = async (data) => {

    const {
        id_usuario,
        nombre,
        apellido,
        dpi_cui,
        telefono,
        telefono_respaldo,
        fotografia_url,
        zona_operacion,
        genero
    } = data

    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id_usuario", id_usuario)
        .input("nombre", nombre)
        .input("apellido", apellido)
        .input("dpi_cui", dpi_cui)
        .input("telefono", telefono)
        .input("telefono_respaldo", telefono_respaldo)
        .input("fotografia_url", fotografia_url)
        .input("zona_operacion", zona_operacion)
        .input("genero", genero)
        .query(`
            INSERT INTO OperadorLogistico
            (
                id_usuario,
                nombre,
                apellido,
                dpi_cui,
                telefono,
                telefono_respaldo,
                fotografia_url,
                zona_operacion,
                genero
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_usuario,
                @nombre,
                @apellido,
                @dpi_cui,
                @telefono,
                @telefono_respaldo,
                @fotografia_url,
                @zona_operacion,
                @genero
            )
        `);

    return result.recordset[0];
};

const getOperatorByUserId = async (id_usuario) => {

    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id_usuario", id_usuario)
        .query(`
            SELECT *
            FROM OperadorLogistico
            WHERE id_usuario = @id_usuario
        `);
    return result.recordset[0];
};

const createService = async (data) => {
    const {
        id_operador,
        id_estado,
        nombre,
        zona_cobertura,
        capacidad_carga_kg,
        precio_envio,
        descripcion
    } = data;

    const pool = await connectDB();

    const result = await pool.request()
        .input("id_operador", id_operador)
        .input("id_estado", id_estado)
        .input("nombre", nombre)
        .input("zona_cobertura", zona_cobertura)
        .input("capacidad_carga_kg", capacidad_carga_kg)
        .input("precio_envio", precio_envio)
        .input("descripcion", descripcion)
        .query(`
            INSERT INTO ServicioEnvio
            (
                id_operador,
                id_estado,
                nombre,
                zona_cobertura,
                capacidad_carga_kg,
                precio_envio,
                descripcion
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_operador,
                @id_estado,
                @nombre,
                @zona_cobertura,
                @capacidad_carga_kg,
                @precio_envio,
                @descripcion
            )
        `);
    return result.recordset[0];
};

const saveServicePhoto = async (id_servicio, url_foto, orden) => {

    const pool = await connectDB();

    await pool
        .request()
        .input("id_servicio", id_servicio)
        .input("url_foto", url_foto)
        .input("orden", orden)
        .query(`
            INSERT INTO FotoServicioEnvio
            (
                id_servicio,
                url_foto,
                orden
            )
            VALUES
            (
                @id_servicio,
                @url_foto,
                @orden
            )
        `);
};

const getServicesByOperator = async (id_operador) => {

    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id_operador", id_operador)
        .query(`
            SELECT
                s.*,
                es.nombre AS estado
            FROM ServicioEnvio s
            INNER JOIN EstadoServicio es
                ON es.id_estado = s.id_estado
            WHERE s.id_operador = @id_operador
            ORDER BY s.fecha_creacion DESC
        `);

    return result.recordset;
};

const updateService = async (id_servicio, id_operador, data) => {

    const {
        nombre,
        zona_cobertura,
        capacidad_carga_kg,
        precio_envio,
        descripcion
    } = data;

    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id_servicio", id_servicio)
        .input("id_operador", id_operador)
        .input("nombre", nombre)
        .input("zona_cobertura", zona_cobertura)
        .input("capacidad_carga_kg", capacidad_carga_kg)
        .input("precio_envio", precio_envio)
        .input("descripcion", descripcion)
        .query(`
            UPDATE ServicioEnvio
            SET
                nombre = @nombre,
                zona_cobertura = @zona_cobertura,
                capacidad_carga_kg = @capacidad_carga_kg,
                precio_envio = @precio_envio,
                descripcion = @descripcion,
                fecha_actualizacion = GETDATE()
            OUTPUT INSERTED.*
            WHERE id_servicio = @id_servicio
            AND id_operador = @id_operador
        `);

    return result.recordset[0];
};

const changeServiceStatus = async (id_servicio, id_operador, id_estado) => {

    const pool = await connectDB();
    const result = await pool
        .request()
        .input("id_servicio", id_servicio)
        .input("id_operador", id_operador)
        .input("id_estado", id_estado)
        .query(`
            UPDATE ServicioEnvio
            SET
                id_estado = @id_estado,
                fecha_actualizacion = GETDATE()
            OUTPUT INSERTED.*
            WHERE id_servicio = @id_servicio
            AND id_operador = @id_operador
        `);
    return result.recordset[0];
};

const createCoupon = async (data) => {

    const {
        id_tipo,
        id_operador,
        codigo,
        descripcion,
        valor,
        fecha_inicio,
        fecha_fin,
        usos_maximos
    } = data;

    const pool = await connectDB();

    const result = await pool.request()
        .input("id_tipo", id_tipo)
        .input("id_operador", id_operador)
        .input("codigo", codigo)
        .input("descripcion", descripcion)
        .input("valor", valor)
        .input("fecha_inicio", fecha_inicio)
        .input("fecha_fin", fecha_fin)
        .input("usos_maximos", usos_maximos)
        .query(`
            INSERT INTO Cupon
            (
                id_tipo,
                id_operador,
                codigo,
                descripcion,
                valor,
                fecha_inicio,
                fecha_fin,
                usos_maximos
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_tipo,
                @id_operador,
                @codigo,
                @descripcion,
                @valor,
                @fecha_inicio,
                @fecha_fin,
                @usos_maximos
            )
        `);

    return result.recordset[0];
};

const getCouponsByOperator = async (id_operador) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_operador", id_operador)
        .query(`
            SELECT
                c.*,
                tc.nombre AS tipo_cupon
            FROM Cupon c
            INNER JOIN TipoCupon tc
                ON tc.id_tipo = c.id_tipo
            WHERE c.id_operador = @id_operador
            ORDER BY c.fecha_creacion DESC
        `);
    return result.recordset;
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
                usado,
                fecha_uso
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_cupon,
                @id_cliente,
                0,
                NULL
            )
        `);

    return result.recordset[0];
};

const getCouponById = async (id_cupon, id_operador) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_cupon", id_cupon)
        .input("id_operador", id_operador)
        .query(`
            SELECT *
            FROM Cupon
            WHERE id_cupon = @id_cupon
            AND id_operador = @id_operador
        `);
    return result.recordset[0];
};

const couponAlreadyAssigned = async (id_cupon, id_cliente) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_cupon", id_cupon)
        .input("id_cliente", id_cliente)
        .query(`
            SELECT *
            FROM CuponCliente
            WHERE id_cupon = @id_cupon
            AND id_cliente = @id_cliente
        `);

    return result.recordset[0];
};
const getCalificacionesByOperator = async (id_operador) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_operador", id_operador)
        .query(`
            SELECT
                c.id_calificacion,
                c.puntuacion,
                c.comentario,
                c.fecha_calificacion,
                cl.nombre   AS cliente_nombre,
                cl.apellido AS cliente_apellido,
                s.nombre    AS servicio_nombre,
                rc.respuesta,
                rc.fecha_respuesta
            FROM Calificacion c
            INNER JOIN Reservacion r     ON r.id_reservacion = c.id_reservacion
            INNER JOIN ServicioEnvio s   ON s.id_servicio    = r.id_servicio_env
            INNER JOIN Cliente cl        ON cl.id_cliente    = c.id_cliente
            LEFT JOIN RespuestaCalificacion rc ON rc.id_calificacion = c.id_calificacion
            WHERE s.id_operador = @id_operador
            ORDER BY c.fecha_calificacion DESC
        `);
    return result.recordset;
};


const getCalificacionByIdForOperator = async (id_calificacion, id_operador) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_calificacion", id_calificacion)
        .input("id_operador", id_operador)
        .query(`
            SELECT c.id_calificacion
            FROM Calificacion c
            INNER JOIN Reservacion r   ON r.id_reservacion = c.id_reservacion
            INNER JOIN ServicioEnvio s ON s.id_servicio    = r.id_servicio_env
            WHERE c.id_calificacion = @id_calificacion
              AND s.id_operador = @id_operador
        `);
    return result.recordset[0];
};

const respuestaExists = async (id_calificacion) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_calificacion", id_calificacion)
        .query(`
            SELECT id_respuesta
            FROM RespuestaCalificacion
            WHERE id_calificacion = @id_calificacion
        `);
    return result.recordset[0];
};

const createRespuestaCalificacion = async (id_calificacion, respuesta) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_calificacion", id_calificacion)
        .input("respuesta", respuesta)
        .query(`
            INSERT INTO RespuestaCalificacion (id_calificacion, respuesta)
            OUTPUT INSERTED.*
            VALUES (@id_calificacion, @respuesta)
        `);
    return result.recordset[0];
};
const getEnviosProgramadosByOperator = async (id_operador) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_operador", id_operador)
        .query(`
            SELECT
                r.id_reservacion,
                r.fecha_inicio,
                r.fecha_fin,
                r.tipo_servicio,
                er.nombre   AS estado,
                s.nombre    AS servicio_nombre,
                cl.nombre   AS cliente_nombre,
                cl.apellido AS cliente_apellido
            FROM Reservacion r
            INNER JOIN ServicioEnvio s      ON s.id_servicio = r.id_servicio_env
            INNER JOIN EstadoReservacion er ON er.id_estado  = r.id_estado
            INNER JOIN Cliente cl           ON cl.id_cliente = r.id_cliente
            WHERE s.id_operador = @id_operador
            ORDER BY r.fecha_inicio ASC
        `);
    return result.recordset;
};
const getReporteGanancias = async (id_operador) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_operador", id_operador)
        .query(`
            SELECT
                COUNT(*) AS total_envios,
                ISNULL(SUM(r.monto_proveedor), 0) AS total_ganado
            FROM Reservacion r
            INNER JOIN ServicioEnvio s ON s.id_servicio = r.id_servicio_env
            WHERE s.id_operador = @id_operador
              AND r.id_estado = 4   -- ENTREGADO
        `);
    return result.recordset[0];
};

const getReporteClientes = async (id_operador) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_operador", id_operador)
        .query(`
            SELECT
                cl.nombre   AS cliente_nombre,
                cl.apellido AS cliente_apellido,
                COUNT(*) AS total_envios,
                ISNULL(SUM(r.precio_total), 0) AS total_gastado
            FROM Reservacion r
            INNER JOIN ServicioEnvio s ON s.id_servicio = r.id_servicio_env
            INNER JOIN Cliente cl      ON cl.id_cliente = r.id_cliente
            WHERE s.id_operador = @id_operador
            GROUP BY cl.nombre, cl.apellido
            ORDER BY total_envios DESC
        `);
    return result.recordset;
};

const getReporteCalificaciones = async (id_operador) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_operador", id_operador)
        .query(`
            SELECT
                COUNT(*) AS total_calificaciones,
                ISNULL(AVG(CAST(c.puntuacion AS DECIMAL(3,2))), 0) AS promedio
            FROM Calificacion c
            INNER JOIN Reservacion r   ON r.id_reservacion = c.id_reservacion
            INNER JOIN ServicioEnvio s ON s.id_servicio    = r.id_servicio_env
            WHERE s.id_operador = @id_operador
        `);
    return result.recordset[0];
};

const updateOperatorProfile = async (id_usuario, datos) => {

    const campos = [];
    const request = (await connectDB()).request();

    request.input("id_usuario", id_usuario);
    if (datos.nombre) {
        campos.push("nombre = @nombre");
        request.input("nombre", datos.nombre);
    }
    if (datos.apellido) {
        campos.push("apellido = @apellido");
        request.input("apellido", datos.apellido);
    }
    if (datos.telefono) {
        campos.push("telefono = @telefono");
        request.input("telefono", datos.telefono);
    }
    if (datos.telefono_respaldo) {
        campos.push(
            "telefono_respaldo = @telefono_respaldo"
        );
        request.input(
            "telefono_respaldo",
            datos.telefono_respaldo
        );
    }
    if (datos.zona_operacion) {
        campos.push(
            "zona_operacion = @zona_operacion"
        );
        request.input(
            "zona_operacion",
            datos.zona_operacion
        );
    }
    if (campos.length === 0) {
        return;
    }
    await request.query(`
        UPDATE OperadorLogistico
        SET ${campos.join(", ")}
        WHERE id_usuario = @id_usuario
    `);
};
const getReservacionesByOperator = async (id_operador) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_operador", id_operador)
        .query(`
            SELECT
                r.id_reservacion,
                CONVERT(varchar(10), r.fecha_inicio, 23) AS fecha_inicio,
                er.nombre AS estado,
                s.nombre  AS nombre_servicio,
                (cl.nombre + ' ' + cl.apellido) AS nombre_cliente,
                cl.telefono,
                cl.direccion_origen
            FROM Reservacion r
            INNER JOIN ServicioEnvio s      ON s.id_servicio = r.id_servicio_env
            INNER JOIN EstadoReservacion er ON er.id_estado  = r.id_estado
            INNER JOIN Cliente cl           ON cl.id_cliente = r.id_cliente
            WHERE s.id_operador = @id_operador
            ORDER BY r.fecha_inicio ASC
        `);
    return result.recordset;
};
const getReporteGananciasPorServicio = async (id_operador) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_operador", id_operador)
        .query(`
            SELECT
                s.nombre AS servicio_nombre,
                COUNT(r.id_reservacion) AS total_envios,
                ISNULL(SUM(r.monto_proveedor), 0) AS total_ganado
            FROM ServicioEnvio s
            LEFT JOIN Reservacion r
                ON r.id_servicio_env = s.id_servicio AND r.id_estado = 4
            WHERE s.id_operador = @id_operador
            GROUP BY s.nombre
            ORDER BY total_ganado DESC
        `);
    return result.recordset;
};

const getReservationById = async (id_reservacion, id_operador) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_reservacion", id_reservacion)
        .input("id_operador", id_operador)
        .query(`
            SELECT
                r.*,
                er.nombre AS estado
            FROM Reservacion r
            INNER JOIN ServicioEnvio s
                ON s.id_servicio = r.id_servicio_env
            INNER JOIN EstadoReservacion er
                ON er.id_estado = r.id_estado
            WHERE r.id_reservacion = @id_reservacion
            AND s.id_operador = @id_operador
        `);

    return result.recordset[0];
};

const updateReservationStatus = async (id_reservacion, id_estado, finalizar = false) => {

    const pool = await connectDB();
    const query = finalizar
        ? `
            UPDATE Reservacion
            SET
                id_estado = @id_estado,
                fecha_fin = GETDATE()
            OUTPUT INSERTED.*
            WHERE id_reservacion = @id_reservacion
        `
        : `
            UPDATE Reservacion
            SET
                id_estado = @id_estado
            OUTPUT INSERTED.*
            WHERE id_reservacion = @id_reservacion
        `;
    const result = await pool.request()
        .input("id_reservacion", id_reservacion)
        .input("id_estado", id_estado)
        .query(query);

    return result.recordset[0];
};

const createClientReport = async (data) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_estado", 1) 
        .input("id_reportante", data.id_reportante) 
        .input("id_reportado", data.id_reportado)   
        .input("id_reservacion", data.id_reservacion)
        .input("tipo_reporte", 'CLIENTE')
        .input("motivo", data.motivo)
        .input("descripcion", data.descripcion)
        .query(`
            INSERT INTO Reporte
            (id_estado, id_reportante, id_reportado, id_reservacion, tipo_reporte, motivo, descripcion)
            OUTPUT INSERTED.*
            VALUES
            (@id_estado, @id_reportante, @id_reportado, @id_reservacion, @tipo_reporte, @motivo, @descripcion)
        `);
    return result.recordset[0];
};

const createReportEvidence = async (id_reporte, url, tipo = 'FOTO') => {
    const pool = await connectDB();
    await pool.request()
        .input("id_reporte", id_reporte)
        .input("tipo", tipo)
        .input("url", url)
        .query(`
            INSERT INTO EvidenciaReporte (id_reporte, tipo, url)
            VALUES (@id_reporte, @tipo, @url)
        `);
};

const getClientComplaintsByOperator = async (id_operador) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_operador", id_operador)
        .query(`
            SELECT 
                r.id_reporte,
                er.nombre AS estado_reporte,
                r.motivo,
                r.descripcion,
                r.fecha_reporte,
                res.id_reservacion,
                s.nombre AS nombre_servicio,
                cl.nombre AS cliente_nombre,
                cl.apellido AS cliente_apellido
            FROM Reporte r
            INNER JOIN EstadoReporte r_est ON r_est.id_estado = r.id_estado -- Ajustado a EstadoReporte del DDL
            INNER JOIN EstadoReporte er ON er.id_estado = r.id_estado
            INNER JOIN Reservacion res     ON res.id_reservacion = r.id_reservacion
            INNER JOIN ServicioEnvio s     ON s.id_servicio = res.id_servicio_env
            INNER JOIN Cliente cl          ON cl.id_cliente = res.id_cliente
            WHERE s.id_operador = @id_operador AND r.tipo_reporte = 'SERVICIO_ENVIO'
            ORDER BY r.fecha_reporte DESC
        `);
    return result.recordset;
};

const getReportsMadeToClients = async (id_usuario_operador) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_reportante", id_usuario_operador)
        .query(`
            SELECT 
                r.id_reporte,
                er.nombre AS estado_reporte,
                r.motivo,
                r.descripcion,
                r.fecha_reporte,
                r.id_reservacion,
                s.nombre AS nombre_servicio,
                cl.nombre AS cliente_nombre,
                cl.apellido AS cliente_apellido
            FROM Reporte r
            INNER JOIN EstadoReporte er ON er.id_estado = r.id_estado
            LEFT JOIN Reservacion res    ON res.id_reservacion = r.id_reservacion
            LEFT JOIN ServicioEnvio s    ON s.id_servicio = res.id_servicio_env
            LEFT JOIN Usuario u_cl       ON u_cl.id_usuario = r.id_reportado
            LEFT JOIN Cliente cl         ON cl.id_usuario = u_cl.id_usuario
            WHERE r.id_reportante = @id_reportante AND r.tipo_reporte = 'CLIENTE'
            ORDER BY r.fecha_reporte DESC
        `);
    return result.recordset;
};

module.exports = {
    createOperator,
    getOperatorByUserId,
    createService,
    saveServicePhoto,
    getServicesByOperator,
    updateService,
    changeServiceStatus,
    createCoupon,
    getCouponsByOperator,
    assignCouponToClient,
    getCouponById,
    couponAlreadyAssigned,
    getCalificacionesByOperator,
    getCalificacionByIdForOperator,
    respuestaExists,
    createRespuestaCalificacion,
    getEnviosProgramadosByOperator,
    getReporteGanancias,
    getReporteClientes,
    getReporteCalificaciones,
    updateOperatorProfile,
    getReservacionesByOperator,
    getReporteGananciasPorServicio,
    getReservationById,
    updateReservationStatus,
    createClientReport,
    createReportEvidence,
    getClientComplaintsByOperator,
    getReportsMadeToClients
};