const { connectDB } = require("../config/database");
const sql = require("mssql");

const createCliente = async (data) => {
    const {
        id_usuario,
        nombre,
        apellido,
        telefono,
        direccion_origen
    } = data;

    const pool = await connectDB();

    const result = await pool.request()
        .input('id_usuario', id_usuario)
        .input('nombre', nombre)
        .input('apellido', apellido)
        .input('telefono', telefono)
        .input('direccion_origen', direccion_origen)
        .query(`
            INSERT INTO Cliente
            (
                id_usuario,
                nombre,
                apellido,
                telefono,
                direccion_origen
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_usuario,
                @nombre,
                @apellido,
                @telefono,
                @direccion_origen
            )
        `);
        
    return result.recordset[0];
};

const getShippingServices = async (filters) => {

    const {
        zona,
        nombre,
        operador,
        orden
    } = filters;

    const pool = await connectDB();

    let query = `
        SELECT
            s.id_servicio,
            s.nombre,
            s.zona_cobertura,
            s.capacidad_carga_kg,
            s.precio_envio,
            s.descripcion,
            s.fecha_creacion,
            es.nombre AS estado,
            s.calificacion_prom,
            s.total_calificaciones,

            CONCAT(o.nombre,' ',o.apellido) AS operador,

            (
                SELECT TOP 1 url_foto
                FROM FotoServicioEnvio f
                WHERE f.id_servicio = s.id_servicio
                ORDER BY f.orden
            ) AS foto

        FROM ServicioEnvio s
        INNER JOIN OperadorLogistico o
            ON o.id_operador = s.id_operador
        INNER JOIN EstadoServicio es
            ON es.id_estado = s.id_estado

        WHERE es.nombre = 'ACTIVO'
    `;

    const request = pool.request();

    if (zona) {
        query += `
            AND s.zona_cobertura LIKE '%' + @zona + '%'
        `;
        request.input("zona", zona);
    }

    if (nombre) {
        query += `
            AND s.nombre LIKE '%' + @nombre + '%'
        `;
        request.input("nombre", nombre);
    }

    if (operador) {
        query += `
            AND (
                o.nombre + ' ' + o.apellido
            ) LIKE '%' + @operador + '%'
        `;
        request.input("operador", operador);
    }

    switch (orden) {

        case "alfabetico_asc":
            query += " ORDER BY s.nombre ASC";
            break;

        case "alfabetico_desc":
            query += " ORDER BY s.nombre DESC";
            break;

        case "precio_asc":
            query += " ORDER BY s.precio_envio ASC";
            break;

        case "precio_desc":
            query += " ORDER BY s.precio_envio DESC";
            break;

        case "capacidad_asc":
            query += " ORDER BY s.capacidad_carga_kg ASC";
            break;

        case "capacidad_desc":
            query += " ORDER BY s.capacidad_carga_kg DESC";
            break;

        case "calificacion_asc":
            query += " ORDER BY s.calificacion_prom ASC";
            break;

        case "calificacion_desc":
            query += " ORDER BY s.calificacion_prom DESC";
            break;

        default:
            query += " ORDER BY s.fecha_creacion DESC";
    }

    const result = await request.query(query);

    return result.recordset;

};

const getClienteByUserId = async (id_usuario) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_usuario", id_usuario)
        .query(`
            SELECT *
            FROM Cliente
            WHERE id_usuario = @id_usuario
        `);
    return result.recordset[0];
};

const createMetodoPago = async (id_cliente, id_tipo) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_cliente", id_cliente)
        .input("id_tipo", id_tipo)
        .query(`
            INSERT INTO MetodoPago
            (
                id_cliente,
                id_tipo
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_cliente,
                @id_tipo
            )
        `);
    return result.recordset[0];
};

const createTarjeta = async (data) => {

    const pool = await connectDB();
        const result = await pool.request()
        .input("id_metodo", data.id_metodo)
        .input("numero_hash", data.numero_hash)
        .input("numero_ultimos4", data.numero_ultimos4)
        .input("nombre_titular", data.nombre_titular)
        .input("fecha_vencimiento", data.fecha_vencimiento)
        .input("cvv_hash", data.cvv_hash)
        .input("fingerprint", data.fingerprint)
        .query(`
            INSERT INTO TarjetaSimulada
            (
                id_metodo,
                numero_hash,
                numero_ultimos4,
                nombre_titular,
                fecha_vencimiento,
                cvv_hash,
                fingerprint
            )

            VALUES
            (
                @id_metodo,
                @numero_hash,
                @numero_ultimos4,
                @nombre_titular,
                @fecha_vencimiento,
                @cvv_hash,
                @fingerprint
            )
        `);
};

const findCardByFingerprint = async (fingerprint) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("fingerprint", fingerprint)
        .query(`
            SELECT *
            FROM TarjetaSimulada
            WHERE fingerprint = @fingerprint
        `);
    return result.recordset[0];
};

const getPaymentMethods = async (id_cliente) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("id_cliente", id_cliente)
        .query(`
            SELECT
                mp.id_metodo,
                tmp.nombre AS tipo,
                mp.activo,
                mp.fecha_registro,

                ts.nombre_titular,
                ts.numero_ultimos4,
                ts.fecha_vencimiento,
                ts.saldo

            FROM MetodoPago mp

            INNER JOIN TipoMetodoPago tmp
                ON tmp.id_tipo = mp.id_tipo

            LEFT JOIN TarjetaSimulada ts
                ON ts.id_metodo = mp.id_metodo

            WHERE mp.id_cliente = @id_cliente

            ORDER BY mp.fecha_registro DESC
        `);

    return result.recordset;
};

const getPaymentMethodById = async (id_metodo) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("id_metodo", id_metodo)
        .query(`
            SELECT *
            FROM MetodoPago
            WHERE id_metodo = @id_metodo
        `);

    return result.recordset[0];
};

const deactivatePaymentMethod = async (id_metodo) => {

    const pool = await connectDB();
    await pool.request()
        .input("id_metodo", id_metodo)
        .query(`
            UPDATE MetodoPago
            SET activo = 0
            WHERE id_metodo = @id_metodo
        `);
};

const getShippingServiceById = async (id_servicio) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_servicio", id_servicio)
        .query(`
            SELECT *
            FROM ServicioEnvio
            WHERE id_servicio = @id_servicio
              AND id_estado = 1
        `);
    return result.recordset[0];
};

const getCardByMethod = async (id_metodo) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_metodo", id_metodo)
        .query(`
            SELECT
                mp.*,
                ts.saldo
            FROM MetodoPago mp

            INNER JOIN TarjetaSimulada ts
                ON ts.id_metodo = mp.id_metodo

            WHERE mp.id_metodo = @id_metodo
        `);
    return result.recordset[0];
};

const hasReservationConflict = async (id_cliente, fecha) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_cliente", id_cliente)
        .input("fecha", fecha)
        .query(`
            SELECT *
            FROM Reservacion
            WHERE id_cliente = @id_cliente
            AND fecha_inicio = @fecha
            AND id_estado IN (1,2,3)
        `);
    return result.recordset.length > 0;
};

const discountBalance = async (id_metodo, monto) => {

    const pool = await connectDB();
    await pool.request()
        .input("id_metodo", id_metodo)
        .input("monto", monto)
        .query(`
            UPDATE TarjetaSimulada
            SET saldo = saldo - @monto
            WHERE id_metodo = @id_metodo
        `);
};

const createReservation = async (data) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("id_cliente", data.id_cliente)
        .input("id_estado", 1)
        .input("id_metodo_pago", data.id_metodo_pago)
        .input("id_servicio_env", data.id_servicio_env)
        .input("tipo_servicio", "ENVIO")
        .input("fecha_inicio", data.fecha_inicio)
        .input("precio_total", data.precio_total)
        .input("comision", data.comision)
        .input("proveedor", data.proveedor)
        .query(`
            INSERT INTO Reservacion
            (
                id_cliente,
                id_estado,
                id_metodo_pago,
                id_servicio_env,
                tipo_servicio,
                fecha_inicio,
                precio_total,
                comision_plataforma,
                monto_proveedor
            )

            OUTPUT INSERTED.*

            VALUES
            (
                @id_cliente,
                @id_estado,
                @id_metodo_pago,
                @id_servicio_env,
                @tipo_servicio,
                @fecha_inicio,
                @precio_total,
                @comision,
                @proveedor
            )
        `);
    return result.recordset[0];
};

const discountBalanceTransaction = async (transaction, id_metodo, monto) => {

    await new sql.Request(transaction)
        .input("id_metodo", id_metodo)
        .input("monto", monto)
        .query(`
            UPDATE TarjetaSimulada
            SET saldo = saldo - @monto
            WHERE id_metodo = @id_metodo
        `);
};

const createReservationTransaction = async (transaction, data) => {

    const result = await new sql.Request(transaction)
        .input("id_cliente", data.id_cliente)
        .input("id_estado", 1)
        .input("id_metodo", data.id_metodo_pago)
        .input("id_servicio", data.id_servicio_env)
        .input("fecha", data.fecha_inicio)
        .input("precio", data.precio_total)
        .input("comision", data.comision)
        .input("proveedor", data.proveedor)
        .input("id_cupon", data.id_cupon || null)
        .input("descuento", data.descuento_aplicado || 0)
        .query(`
            INSERT INTO Reservacion
            (
                id_cliente,
                id_estado,
                id_metodo_pago,
                id_servicio_env,
                id_cupon_aplicado,
                tipo_servicio,
                fecha_inicio,
                precio_total,
                comision_plataforma,
                monto_proveedor,
                descuento_aplicado
            )

            OUTPUT INSERTED.*

            VALUES
            (
                @id_cliente,
                @id_estado,
                @id_metodo,
                @id_servicio,
                @id_cupon,
                'ENVIO',
                @fecha,
                @precio,
                @comision,
                @proveedor,
                @descuento
            )
        `);
    return result.recordset[0];
};

const getReservationForRating = async (id_reservacion, id_cliente) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_reservacion", id_reservacion)
        .input("id_cliente", id_cliente)
        .query(`
            SELECT
                r.*,
                er.nombre AS estado
            FROM Reservacion r
            INNER JOIN EstadoReservacion er
                ON er.id_estado = r.id_estado
            WHERE r.id_reservacion = @id_reservacion
            AND r.id_cliente = @id_cliente
        `);

    return result.recordset[0];
};

const hasRating = async (id_reservacion) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_reservacion", id_reservacion)
        .query(`
            SELECT *
            FROM Calificacion
            WHERE id_reservacion = @id_reservacion
        `);
    return result.recordset[0];
};

const createRating = async (data) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_reservacion", data.id_reservacion)
        .input("id_cliente", data.id_cliente)
        .input("puntuacion", data.puntuacion)
        .input("comentario", data.comentario)
        .query(`
            INSERT INTO Calificacion
            (
                id_reservacion,
                id_cliente,
                puntuacion,
                comentario
            )

            OUTPUT INSERTED.*

            VALUES
            (
                @id_reservacion,
                @id_cliente,
                @puntuacion,
                @comentario
            )
        `);

    return result.recordset[0];
};

const updateServiceRating = async (id_servicio) => {

    const pool = await connectDB();
    await pool.request()
        .input("id_servicio", id_servicio)
        .query(`
            UPDATE ServicioEnvio
            SET
                calificacion_prom = stats.promedio,
                total_calificaciones = stats.total
            FROM ServicioEnvio s
            CROSS APPLY(
                SELECT
                    AVG(CAST(c.puntuacion AS DECIMAL(5,2))) AS promedio,
                    COUNT(*) AS total
                FROM Calificacion c
                INNER JOIN Reservacion r
                    ON r.id_reservacion = c.id_reservacion
                WHERE r.id_servicio_env = s.id_servicio
            ) stats
            WHERE s.id_servicio = @id_servicio
        `);
};

const getReservationById = async (id_reservacion, id_cliente) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_reservacion", id_reservacion)
        .input("id_cliente", id_cliente)
        .query(`
            SELECT
                r.*,
                er.nombre AS estado
            FROM Reservacion r
            INNER JOIN EstadoReservacion er
                ON er.id_estado = r.id_estado
            WHERE r.id_reservacion = @id_reservacion
            AND r.id_cliente = @id_cliente
        `);
    return result.recordset[0];
};

const refundBalance = async (transaction, id_metodo, monto) => {

    await new sql.Request(transaction)
        .input("id_metodo", id_metodo)
        .input("monto", monto)
        .query(`
            UPDATE TarjetaSimulada
            SET saldo = saldo + @monto
            WHERE id_metodo = @id_metodo
        `);
};

const cancelReservation = async (transaction, id_reservacion, motivo) => {

    await new sql.Request(transaction)
        .input("id_reservacion", id_reservacion)
        .input("motivo", motivo)
        .query(`
            UPDATE Reservacion
            SET
                id_estado = 5,
                fecha_cancelacion = GETDATE(),
                motivo_cancelacion = @motivo
            WHERE id_reservacion = @id_reservacion
        `);
};

const createReport = async (data) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_estado", 1) // PENDIENTE
        .input("id_reportante", data.id_reportante)
        .input("id_reportado", data.id_reportado)
        .input("id_reservacion", data.id_reservacion)
        .input("tipo_reporte", data.tipo_reporte)
        .input("motivo", data.motivo)
        .input("descripcion", data.descripcion)
        .query(`
            INSERT INTO Reporte
            (
                id_estado,
                id_reportante,
                id_reportado,
                id_reservacion,
                tipo_reporte,
                motivo,
                descripcion
            )

            OUTPUT INSERTED.*

            VALUES
            (
                @id_estado,
                @id_reportante,
                @id_reportado,
                @id_reservacion,
                @tipo_reporte,
                @motivo,
                @descripcion
            )
        `);
    return result.recordset[0];
};

const createEvidence = async (id_reporte, url) => {

    const pool = await connectDB();
    await pool.request()
        .input("id_reporte", id_reporte)
        .input("url", url)
        .query(`
            INSERT INTO EvidenciaReporte
            (
                id_reporte,
                url
            )
            VALUES
            (
                @id_reporte,
                @url
            )
        `);
};

const getReservationReportData = async (id_reservacion, id_cliente) => {

    const pool = await connectDB();

    const result = await pool.request()

        .input("id_reservacion", id_reservacion)
        .input("id_cliente", id_cliente)
        .query(`
            SELECT
                r.id_reservacion,
                u.id_usuario AS reportado,
                c.id_usuario AS cliente
            FROM Reservacion r
            INNER JOIN ServicioEnvio s
                ON s.id_servicio = r.id_servicio_env
            INNER JOIN OperadorLogistico o
                ON o.id_operador = s.id_operador
            INNER JOIN Usuario u
                ON u.id_usuario = o.id_usuario
            INNER JOIN Cliente c
                ON c.id_cliente = r.id_cliente
            WHERE
                r.id_reservacion = @id_reservacion
            AND r.id_cliente = @id_cliente
        `);
    return result.recordset[0];
};

const getMyReports = async (id_usuario) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_usuario", id_usuario)
        .query(`
            SELECT
                r.id_reporte,
                er.nombre AS estado,
                r.tipo_reporte,
                r.motivo,
                r.descripcion,
                r.accion_tomada,
                r.fecha_reporte,
                r.fecha_resolucion,
                r.id_reservacion
            FROM Reporte r
            INNER JOIN EstadoReporte er
                ON er.id_estado = r.id_estado
            WHERE r.id_reportante = @id_usuario
            ORDER BY r.fecha_reporte DESC
        `);

    return result.recordset;
};

const getReportEvidence = async (id_reporte) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_reporte", id_reporte)
        .query(`
            SELECT
                id_evidencia,
                tipo,
                url,
                fecha_carga
            FROM EvidenciaReporte
            WHERE id_reporte = @id_reporte
        `);
    return result.recordset;
};

const getAvailableCoupons = async (id_cliente) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_cliente", id_cliente)
        .query(`
            SELECT
                cc.id_cupon_cliente,
                c.id_cupon,
                c.codigo,
                tc.nombre AS tipo,
                c.descripcion,
                c.valor,
                c.fecha_inicio,
                c.fecha_fin,
                c.usos_maximos,
                c.usos_actuales,
                CASE
                    WHEN c.activo = 0 THEN 'INACTIVO'
                    WHEN cc.usado = 1 THEN 'USADO'
                    WHEN CAST(GETDATE() AS DATE) < c.fecha_inicio THEN 'PENDIENTE'
                    WHEN CAST(GETDATE() AS DATE) > c.fecha_fin THEN 'VENCIDO'
                    ELSE 'DISPONIBLE'
                END AS estado
            FROM CuponCliente cc
            INNER JOIN Cupon c
                ON c.id_cupon = cc.id_cupon
            INNER JOIN TipoCupon tc
                ON tc.id_tipo = c.id_tipo
            WHERE cc.id_cliente = @id_cliente;
        `);

    return result.recordset;
};

const getClientCoupon = async (id_cliente, id_cupon) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_cliente", id_cliente)
        .input("id_cupon", id_cupon)
        .query(`
            SELECT
                cc.id_cupon_cliente,
                c.*
            FROM CuponCliente cc
            INNER JOIN Cupon c
                ON c.id_cupon = cc.id_cupon
            WHERE
                cc.id_cliente = @id_cliente
                AND cc.id_cupon = @id_cupon
                AND cc.usado = 0
                AND c.activo = 1
                AND GETDATE()
                    BETWEEN c.fecha_inicio
                    AND c.fecha_fin
        `);
    return result.recordset[0];
};

const useCouponTransaction = async (transaction, id_cupon_cliente) => {

    await new sql.Request(transaction)
        .input("id", id_cupon_cliente)
        .query(`
            UPDATE CuponCliente
            SET
                usado = 1,
                fecha_uso = GETDATE()
            WHERE id_cupon_cliente = @id
        `);
};

const increaseCouponUsesTransaction = async (transaction, id_cupon) => {

    await new sql.Request(transaction)
        .input("id", id_cupon)
        .query(`
            UPDATE Cupon
            SET usos_actuales = usos_actuales + 1
            WHERE id_cupon = @id
        `);
};

const getReservationsByClient = async (id_cliente) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_cliente", id_cliente)
        .query(`
            SELECT
                r.id_reservacion,
                es.nombre AS estado,
                r.tipo_servicio,
                r.fecha_inicio,
                r.fecha_fin,
                r.precio_total,
                r.descuento_aplicado,
                r.fecha_reservacion,
                s.id_servicio,
                s.nombre AS servicio,
                s.zona_cobertura,
                s.precio_envio,
                op.id_operador,
                op.nombre AS operador_nombre,
                op.apellido AS operador_apellido,
                c.codigo AS cupon,
                cal.puntuacion,
                cal.comentario
            FROM Reservacion r
            INNER JOIN EstadoReservacion es
                ON es.id_estado = r.id_estado
            INNER JOIN ServicioEnvio s
                ON s.id_servicio = r.id_servicio_env
            INNER JOIN OperadorLogistico op
                ON op.id_operador = s.id_operador
            LEFT JOIN Cupon c
                ON c.id_cupon = r.id_cupon_aplicado
            LEFT JOIN Calificacion cal
                ON cal.id_reservacion = r.id_reservacion
            WHERE r.id_cliente = @id_cliente
            ORDER BY r.fecha_reservacion DESC
        `);
    return result.recordset;
};

const getCartItems = async (id_cliente) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_cliente", id_cliente)
        .query(`
            SELECT 
                ci.id_item,
                ci.tipo_servicio,
                ci.fecha_inicio,
                ci.fecha_fin,
                ci.id_servicio_env,
                ci.id_ruta,
                s.nombre AS nombre_envio,
                s.precio_envio,
                r.origen,
                r.destino,
                r.precio AS precio_transporte
            FROM CarritoItem ci
            LEFT JOIN ServicioEnvio s ON s.id_servicio = ci.id_servicio_env
            LEFT JOIN Ruta r         ON r.id_ruta = ci.id_ruta
            WHERE ci.id_cliente = @id_cliente
            ORDER BY ci.fecha_agregado DESC
        `);
    return result.recordset;
};

const addItemToCart = async (data) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_cliente", data.id_cliente)
        .input("id_servicio_env", data.id_servicio_env || null)
        .input("id_ruta", data.id_ruta || null)
        .input("tipo_servicio", data.tipo_servicio)
        .input("fecha_inicio", data.fecha_inicio)
        .input("fecha_fin", data.fecha_fin || null)
        .query(`
            INSERT INTO CarritoItem 
            (id_cliente, id_servicio_env, id_ruta, tipo_servicio, fecha_inicio, fecha_fin)
            OUTPUT INSERTED.*
            VALUES 
            (@id_cliente, @id_servicio_env, @id_ruta, @tipo_servicio, @fecha_inicio, @fecha_fin)
        `);
    return result.recordset[0];
};

const removeItemFromCart = async (id_item, id_cliente) => {
    const pool = await connectDB();
    await pool.request()
        .input("id_item", id_item)
        .input("id_cliente", id_cliente)
        .query(`
            DELETE FROM CarritoItem 
            WHERE id_item = @id_item AND id_cliente = @id_cliente
        `);
};

const clearCartTransaction = async (transaction, id_cliente) => {
    await new sql.Request(transaction)
        .input("id_cliente", id_cliente)
        .query(`
            DELETE FROM CarritoItem 
            WHERE id_cliente = @id_cliente
        `);
};

const searchTransportServices = async ({ search, fecha }) => {

    const pool = await connectDB();
    console.log("Buscando rutas:", { search, fecha });

    const result = await pool.request()
        .input("search", search || null)
        .input("fecha", fecha || null)
        .query(`
            SELECT
                r.id_ruta,
                e.nombre_empresa,
                r.origen,
                r.destino,
                r.tipo_servicio,
                r.hora_inicio,
                r.tiempo_estimado_hrs,
                r.precio,
                v.placa,
                v.tipo AS tipo_vehiculo,
                CAST(r.fecha_creacion AS DATE) AS fecha,
                es.nombre AS estado
            FROM Ruta r
            INNER JOIN EmpresaTransporte e
                ON r.id_empresa = e.id_empresa
            INNER JOIN EstadoServicio es
                ON r.id_estado = es.id_estado
            LEFT JOIN RutaVehiculo rv
                ON r.id_ruta = rv.id_ruta
            LEFT JOIN Vehiculo v
                ON rv.id_vehiculo = v.id_vehiculo
            WHERE es.nombre = 'ACTIVO'
              AND (
                    @search IS NULL
                    OR r.destino LIKE '%' + @search + '%'
                    OR e.nombre_empresa LIKE '%' + @search + '%'
                  )
              AND (
                    @fecha IS NULL
                    OR CAST(r.fecha_creacion AS DATE) = @fecha
                  )
            ORDER BY r.fecha_creacion DESC
        `);

    return result.recordset;
};

const getReportsReceivedAsClient = async (id_usuario_cliente) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_reportado", id_usuario_cliente)
        .query(`
            SELECT 
                r.id_reporte,
                er.nombre AS estado_reporte,
                r.motivo,
                r.descripcion,
                r.fecha_reporte,
                r.id_reservacion,
                s.nombre AS nombre_servicio,
                CONCAT(op.nombre, ' ', op.apellido) AS operador_reportante
            FROM Reporte r
            INNER JOIN EstadoReporte er ON er.id_estado = r.id_estado
            LEFT JOIN Reservacion res    ON res.id_reservacion = r.id_reservacion
            LEFT JOIN ServicioEnvio s    ON s.id_servicio = res.id_servicio_env
            LEFT JOIN Usuario u_op       ON u_op.id_usuario = r.id_reportante
            LEFT JOIN OperadorLogistico op ON op.id_usuario = u_op.id_usuario
            WHERE r.id_reportado = @id_reportado AND r.tipo_reporte = 'CLIENTE'
            ORDER BY r.fecha_reporte DESC
        `);
    return result.recordset;
};

module.exports = {
    createCliente,
    getShippingServices,
    getClienteByUserId,
    createMetodoPago,
    createTarjeta,
    findCardByFingerprint,
    getPaymentMethods,
    getPaymentMethodById,
    deactivatePaymentMethod,
    getShippingServiceById,
    getCardByMethod,
    hasReservationConflict,
    discountBalance,
    createReservation,
    discountBalanceTransaction,
    createReservationTransaction,
    getReservationForRating,
    hasRating,
    createRating,
    updateServiceRating,
    getReservationById,
    refundBalance,
    cancelReservation,
    createReport,
    createEvidence,
    getReservationReportData,
    getMyReports,
    getReportEvidence,
    getAvailableCoupons,
    getClientCoupon,
    useCouponTransaction,
    increaseCouponUsesTransaction,
    getReservationsByClient,
    getCartItems,
    addItemToCart,
    removeItemFromCart,
    clearCartTransaction,
    searchTransportServices,
    getReportsReceivedAsClient
};
