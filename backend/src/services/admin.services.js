const { connectDB } = require("../config/database");

const approveOperador = async (id_solicitud) => {

    const pool = await connectDB();

    // 1. Marcar la solicitud como APROBADA
    await pool.request()
        .input("id_solicitud", id_solicitud)
        .query(`
            UPDATE SolicitudRegistro
            SET id_estado = 2
            WHERE id_solicitud = @id_solicitud
        `);

    // 2. Activar el Usuario asociado a esa solicitud (operador o empresa)
    await pool.request()
        .input("id_solicitud", id_solicitud)
        .query(`
            UPDATE Usuario
            SET id_estado = 2
            WHERE id_usuario = (
                SELECT id_usuario
                FROM SolicitudRegistro
                WHERE id_solicitud = @id_solicitud
            )
        `);

    // 3. Marcar la reunion virtual como APROBADA (si existe)
    await pool.request()
        .input("id_solicitud", id_solicitud)
        .query(`
            UPDATE ReunionVirtual
            SET estado = 'APROBADA'
            WHERE id_solicitud = @id_solicitud
        `);
};

const rejectOperador = async (id_solicitud) => {

    const pool = await connectDB();

    // 1. Marcar la solicitud como RECHAZADA
    await pool.request()
        .input("id_solicitud", id_solicitud)
        .query(`
            UPDATE SolicitudRegistro
            SET id_estado = 3
            WHERE id_solicitud = @id_solicitud
        `);

    // 2. Marcar el usuario como SUSPENDIDO/RECHAZADO
    await pool.request()
        .input("id_solicitud", id_solicitud)
        .query(`
            UPDATE Usuario
            SET id_estado = 3
            WHERE id_usuario = (
                SELECT id_usuario
                FROM SolicitudRegistro
                WHERE id_solicitud = @id_solicitud
            )
        `);

    // 3. Marcar la reunion virtual como RECHAZADA (si existe)
    await pool.request()
        .input("id_solicitud", id_solicitud)
        .query(`
            UPDATE ReunionVirtual
            SET estado = 'RECHAZADA'
            WHERE id_solicitud = @id_solicitud
        `);
};

const createAdmin = async ({ id_usuario, nombre, apellido }) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_usuario", id_usuario)
        .input("nombre", nombre)
        .input("apellido", apellido)
        .query(`
            INSERT INTO Administrador
            (
                id_usuario,
                nombre,
                apellido
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_usuario,
                @nombre,
                @apellido
            )
        `);
    return result.recordset[0];
};

const saveOTP = async (id_usuario, codigo) => {

    const pool = await connectDB();
    await pool.request()
        .input("id_usuario", id_usuario)
        .input("codigo", codigo)
        .query(`
            UPDATE Administrador
            SET
                token_2fa = @codigo,
                token_expiracion = DATEADD(MINUTE,5,GETDATE())
            WHERE id_usuario = @id_usuario
        `);
};

const verifyOTP = async (id_usuario, codigo) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_usuario", id_usuario)
        .input("codigo", codigo)
        .query(`
            SELECT *
            FROM Administrador
            WHERE id_usuario = @id_usuario
              AND token_2fa = @codigo
              AND token_expiracion > GETDATE()
        `);

    return result.recordset[0];
};

const findAdminByUserId = async (id_usuario) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_usuario", id_usuario)
        .query(`
            SELECT *
            FROM Administrador
            WHERE id_usuario = @id_usuario
        `);

    return result.recordset[0];
};
const getAllReportes = async () => {
    const pool = await connectDB();
    const result = await pool.request()
        .query(`
            SELECT
                rep.id_reporte,
                rep.tipo_reporte,
                rep.motivo,
                rep.descripcion,
                rep.fecha_reporte,
                rep.fecha_resolucion,
                er.nombre AS estado,
                ur.correo AS reportante_correo,
                ud.correo AS reportado_correo
            FROM Reporte rep
            INNER JOIN EstadoReporte er ON er.id_estado    = rep.id_estado
            INNER JOIN Usuario ur       ON ur.id_usuario   = rep.id_reportante
            INNER JOIN Usuario ud       ON ud.id_usuario   = rep.id_reportado
            ORDER BY rep.fecha_reporte DESC
        `);
    return result.recordset;
};

const updateReporteEstado = async (id_reporte, id_estado) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_reporte", id_reporte)
        .input("id_estado", id_estado)
        .query(`
            UPDATE Reporte
            SET id_estado = @id_estado,
                fecha_resolucion = CASE WHEN @id_estado IN (3,4) THEN GETDATE() ELSE fecha_resolucion END
            OUTPUT INSERTED.*
            WHERE id_reporte = @id_reporte
        `);
    return result.recordset[0];
};
const getEstadisticasGenerales = async () => {
    const pool = await connectDB();

    // 1. Clientes: completados (verificados) vs no completados
    const clientes = (await pool.request().query(`
        SELECT
            SUM(CASE WHEN correo_verificado = 1 THEN 1 ELSE 0 END) AS completados,
            SUM(CASE WHEN correo_verificado = 0 THEN 1 ELSE 0 END) AS no_completados
        FROM Usuario WHERE id_rol = 2
    `)).recordset[0];

    // 2. Solicitudes operador/empresa por estado
    const solicitudes = (await pool.request().query(`
        SELECT sr.tipo, es.nombre AS estado, COUNT(*) AS total
        FROM SolicitudRegistro sr
        INNER JOIN EstadoSolicitud es ON es.id_estado = sr.id_estado
        GROUP BY sr.tipo, es.nombre
    `)).recordset;

    // 3. Total de vetos
    const totalVetos = (await pool.request().query(`
        SELECT COUNT(*) AS total FROM VetoUsuario
    `)).recordset[0].total;

    // 4. Reportes por estado
    const reportes = (await pool.request().query(`
        SELECT er.nombre AS estado, COUNT(*) AS total
        FROM Reporte rep INNER JOIN EstadoReporte er ON er.id_estado = rep.id_estado
        GROUP BY er.nombre
    `)).recordset;

    // 5. Zonas con mayor volumen de envios
    const zonas = (await pool.request().query(`
        SELECT s.zona_cobertura AS zona, COUNT(*) AS total_envios
        FROM Reservacion r INNER JOIN ServicioEnvio s ON s.id_servicio = r.id_servicio_env
        WHERE r.id_servicio_env IS NOT NULL
        GROUP BY s.zona_cobertura
        ORDER BY total_envios DESC
    `)).recordset;

    // 6. Servicios de transporte (rutas) mas utilizados
    const transporteMasUsado = (await pool.request().query(`
        SELECT TOP 10 (rt.origen + ' - ' + rt.destino) AS ruta, COUNT(*) AS total_usos
        FROM Reservacion r INNER JOIN Ruta rt ON rt.id_ruta = r.id_ruta
        WHERE r.id_ruta IS NOT NULL
        GROUP BY rt.origen, rt.destino
        ORDER BY total_usos DESC
    `)).recordset;

    // 7. Ingresos por tipo de servicio
    const ingresosPorTipo = (await pool.request().query(`
        SELECT tipo_servicio,
               ISNULL(SUM(precio_total), 0) AS ingresos,
               ISNULL(SUM(comision_plataforma), 0) AS comision_plataforma
        FROM Reservacion
        GROUP BY tipo_servicio
    `)).recordset;

    // 8. Usuarios con mayor gasto
    const mayorGasto = (await pool.request().query(`
        SELECT TOP 10 (cl.nombre + ' ' + cl.apellido) AS cliente,
               ISNULL(SUM(r.precio_total), 0) AS total_gastado
        FROM Reservacion r INNER JOIN Cliente cl ON cl.id_cliente = r.id_cliente
        GROUP BY cl.nombre, cl.apellido
        ORDER BY total_gastado DESC
    `)).recordset;

    // 9. Historial de envios
    const historialEnvios = (await pool.request().query(`
        SELECT TOP 50
            r.id_reservacion,
            CONVERT(varchar(10), r.fecha_inicio, 23) AS fecha,
            (cl.nombre + ' ' + cl.apellido) AS cliente,
            s.nombre AS servicio,
            r.precio_total,
            er.nombre AS estado
        FROM Reservacion r
        INNER JOIN Cliente cl ON cl.id_cliente = r.id_cliente
        INNER JOIN ServicioEnvio s ON s.id_servicio = r.id_servicio_env
        INNER JOIN EstadoReservacion er ON er.id_estado = r.id_estado
        WHERE r.id_servicio_env IS NOT NULL
        ORDER BY r.fecha_reservacion DESC
    `)).recordset;

    // 10. Historial de servicios de transporte
    const historialTransporte = (await pool.request().query(`
        SELECT TOP 50
            r.id_reservacion,
            CONVERT(varchar(10), r.fecha_inicio, 23) AS fecha,
            (cl.nombre + ' ' + cl.apellido) AS cliente,
            (rt.origen + ' - ' + rt.destino) AS ruta,
            r.precio_total,
            er.nombre AS estado
        FROM Reservacion r
        INNER JOIN Cliente cl ON cl.id_cliente = r.id_cliente
        INNER JOIN Ruta rt ON rt.id_ruta = r.id_ruta
        INNER JOIN EstadoReservacion er ON er.id_estado = r.id_estado
        WHERE r.id_ruta IS NOT NULL
        ORDER BY r.fecha_reservacion DESC
    `)).recordset;

    // 11. Destinos mas frecuentes
    const destinos = (await pool.request().query(`
        SELECT TOP 10 rt.destino, COUNT(*) AS total
        FROM Reservacion r INNER JOIN Ruta rt ON rt.id_ruta = r.id_ruta
        WHERE r.id_ruta IS NOT NULL
        GROUP BY rt.destino
        ORDER BY total DESC
    `)).recordset;

    // 12. Uso de clientes: solo envios / solo transporte / ambos
    const usoClientes = (await pool.request().query(`
        SELECT
            SUM(CASE WHEN tiene_envio = 1 AND tiene_ruta = 0 THEN 1 ELSE 0 END) AS solo_envios,
            SUM(CASE WHEN tiene_envio = 0 AND tiene_ruta = 1 THEN 1 ELSE 0 END) AS solo_transporte,
            SUM(CASE WHEN tiene_envio = 1 AND tiene_ruta = 1 THEN 1 ELSE 0 END) AS ambos
        FROM (
            SELECT id_cliente,
                MAX(CASE WHEN id_servicio_env IS NOT NULL THEN 1 ELSE 0 END) AS tiene_envio,
                MAX(CASE WHEN id_ruta IS NOT NULL THEN 1 ELSE 0 END) AS tiene_ruta
            FROM Reservacion
            GROUP BY id_cliente
        ) t
    `)).recordset[0];

    return {
        clientes,
        solicitudes_por_tipo_estado: solicitudes,
        total_vetos: totalVetos,
        reportes_por_estado: reportes,
        zonas_mayor_volumen: zonas,
        transporte_mas_usado: transporteMasUsado,
        ingresos_por_tipo: ingresosPorTipo,
        usuarios_mayor_gasto: mayorGasto,
        historial_envios: historialEnvios,
        historial_transporte: historialTransporte,
        destinos_frecuentes: destinos,
        uso_clientes: usoClientes
    };
};
module.exports = {
    approveOperador,
    rejectOperador,
    createAdmin,
    saveOTP,
    verifyOTP,
    findAdminByUserId,
    getAllReportes,
    updateReporteEstado,
    getEstadisticasGenerales
};