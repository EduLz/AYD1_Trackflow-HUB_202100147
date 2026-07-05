const { connectDB } = require("../config/database");
const sql = require("mssql");

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
                token_expiracion = DATEADD(MINUTE, 5, GETDATE())
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

const getUsuariosPanel = async (nombre_rol = null) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("nombre_rol", sql.VarChar, nombre_rol)
        .query(`
            SELECT
                u.id_usuario,
                u.correo,
                u.correo_verificado,
                eu.nombre AS estado_usuario,
                r.nombre AS rol,
                u.fecha_registro
            FROM Usuario u
            INNER JOIN EstadoUsuario eu ON eu.id_estado = u.id_estado
            INNER JOIN Rol r ON r.id_rol = u.id_rol
            WHERE (@nombre_rol IS NULL OR r.nombre = @nombre_rol)
            ORDER BY u.id_usuario DESC
        `);

    return result.recordset;
};

const getEstadisticasGenerales = async () => {
    const pool = await connectDB();

    const [resUsuarios, resZonas, resTransporte, resIngresos, resReportes, resDestinos, resUso, resAceptados, resGastos, resHistEnvios, resTiposTransporte, resLogs] = await Promise.all([
        pool.request().query(`
            SELECT
                COUNT(*) AS total_usuarios,
                SUM(CASE WHEN correo_verificado = 1 THEN 1 ELSE 0 END) AS usuarios_verificados,
                SUM(CASE WHEN correo_verificado = 0 THEN 1 ELSE 0 END) AS usuarios_no_verificados
            FROM Usuario
            WHERE id_rol = 2
        `),
        pool.request().query(`
            SELECT 
                se.zona_cobertura AS zona,
                COUNT(r.id_reservacion) AS total_envios
            FROM Reservacion r
            INNER JOIN ServicioEnvio se ON se.id_servicio = r.id_servicio_env
            WHERE r.tipo_servicio = 'ENVIO'
            GROUP BY se.zona_cobertura
            ORDER BY total_envios DESC
        `),
        pool.request().query(`
            SELECT 
                CONCAT(ru.origen, ' - ', ru.destino) AS ruta,
                COUNT(r.id_reservacion) AS total_usos
            FROM Reservacion r
            INNER JOIN Ruta ru ON ru.id_ruta = r.id_ruta
            WHERE r.tipo_servicio = 'TRANSPORTE'
            GROUP BY ru.origen, ru.destino
            ORDER BY total_usos DESC
        `),
        pool.request().query(`
            SELECT 
                tipo_servicio,
                SUM(comision_plataforma) AS ingresos
            FROM Reservacion
            GROUP BY tipo_servicio
        `),
        pool.request().query(`
            SELECT 
                er.nombre AS estado,
                COUNT(r.id_reporte) AS total
            FROM Reporte r
            INNER JOIN EstadoReporte er ON er.id_estado = r.id_estado
            GROUP BY er.nombre
        `),
        pool.request().query(`
            SELECT 
                COALESCE(ru.destino, se.zona_cobertura) AS destino,
                COUNT(r.id_reservacion) AS total
            FROM Reservacion r
            LEFT JOIN Ruta ru ON ru.id_ruta = r.id_ruta
            LEFT JOIN ServicioEnvio se ON se.id_servicio = r.id_servicio_env
            GROUP BY COALESCE(ru.destino, se.zona_cobertura)
            ORDER BY total DESC
        `),
        pool.request().query(`
            WITH UsoPorCliente AS (
                SELECT 
                    c.id_cliente,
                    MAX(CASE WHEN r.tipo_servicio = 'ENVIO' THEN 1 ELSE 0 END) AS uso_envio,
                    MAX(CASE WHEN r.tipo_servicio = 'TRANSPORTE' THEN 1 ELSE 0 END) AS uso_transporte
                FROM Cliente c
                LEFT JOIN Reservacion r ON c.id_cliente = r.id_cliente
                GROUP BY c.id_cliente
            )
            SELECT 
                CASE 
                    WHEN uso_envio = 1 AND uso_transporte = 1 THEN 'Ambos Servicios'
                    WHEN uso_envio = 1 AND uso_transporte = 0 THEN 'Solo Envíos'
                    WHEN uso_envio = 0 AND uso_transporte = 1 THEN 'Solo Transporte'
                    ELSE 'Sin Uso'
                END AS tipo_uso,
                COUNT(id_cliente) AS total
            FROM UsoPorCliente
            GROUP BY 
                CASE 
                    WHEN uso_envio = 1 AND uso_transporte = 1 THEN 'Ambos Servicios'
                    WHEN uso_envio = 1 AND uso_transporte = 0 THEN 'Solo Envíos'
                    WHEN uso_envio = 0 AND uso_transporte = 1 THEN 'Solo Transporte'
                    ELSE 'Sin Uso'
                END
        `),
        pool.request().query(`
            SELECT 
                r.nombre AS rol,
                SUM(CASE WHEN es.nombre = 'APROBADA' THEN 1 ELSE 0 END) AS aceptados,
                SUM(CASE WHEN es.nombre = 'RECHAZADA' THEN 1 ELSE 0 END) AS rechazados
            FROM SolicitudRegistro sr
            INNER JOIN Usuario u ON u.id_usuario = sr.id_usuario
            INNER JOIN Rol r ON r.id_rol = u.id_rol
            INNER JOIN EstadoSolicitud es ON es.id_estado = sr.id_estado
            WHERE es.nombre IN ('APROBADA', 'RECHAZADA')
            GROUP BY r.nombre
        `),
        pool.request().query(`
            SELECT TOP 10
                c.id_cliente AS id,
                CONCAT(c.nombre, ' ', c.apellido) AS nombre,
                u.correo AS correo,
                COUNT(r.id_reservacion) AS envios,
                SUM(r.precio_total) AS gasto
            FROM Reservacion r
            INNER JOIN Cliente c ON c.id_cliente = r.id_cliente
            INNER JOIN Usuario u ON u.id_usuario = c.id_usuario
            GROUP BY c.id_cliente, c.nombre, c.apellido, u.correo
            ORDER BY gasto DESC
        `),
        pool.request().query(`
            SELECT 
                r.id_reservacion AS id,
                CONCAT('ENV-', r.id_reservacion) AS id_codigo,
                CONVERT(VARCHAR(10), r.fecha_reservacion, 120) AS fecha,
                CONCAT(c.nombre, ' ', c.apellido) AS cliente,
                CONCAT(op.nombre, ' ', op.apellido) AS operador,
                se.zona_cobertura AS destino,
                r.precio_total AS monto,
                er.nombre AS estado
            FROM Reservacion r
            INNER JOIN Cliente c ON c.id_cliente = r.id_cliente
            INNER JOIN ServicioEnvio se ON se.id_servicio = r.id_servicio_env
            INNER JOIN OperadorLogistico op ON op.id_operador = se.id_operador
            INNER JOIN EstadoReservacion er ON er.id_estado = r.id_estado
            WHERE r.tipo_servicio = 'ENVIO'
            ORDER BY r.fecha_reservacion DESC
        `),
        pool.request().query(`
            SELECT 
                ru.tipo_servicio AS tipo,
                COUNT(r.id_reservacion) AS total
            FROM Reservacion r
            INNER JOIN Ruta ru ON ru.id_ruta = r.id_ruta
            WHERE r.tipo_servicio = 'TRANSPORTE'
            GROUP BY ru.tipo_servicio
        `),
        pool.request().query(`
            WITH LogsCTE AS (
                SELECT 
                    u.fecha_registro AS fecha,
                    CAST('REGISTRO' AS VARCHAR(50)) AS tipo_evento,
                    u.correo AS usuario,
                    r.nombre AS rol,
                    CAST('Registro en el sistema' AS VARCHAR(500)) AS detalle
                FROM Usuario u
                INNER JOIN Rol r ON r.id_rol = u.id_rol
                
                UNION ALL
                
                SELECT 
                    sr.fecha_solicitud AS fecha,
                    CAST('SOLICITUD' AS VARCHAR(50)) AS tipo_evento,
                    u.correo AS usuario,
                    r.nombre AS rol,
                    CAST('Solicitud de registro enviada' AS VARCHAR(500)) AS detalle
                FROM SolicitudRegistro sr
                INNER JOIN Usuario u ON u.id_usuario = sr.id_usuario
                INNER JOIN Rol r ON r.id_rol = u.id_rol
                
                UNION ALL
                
                SELECT 
                    sr.fecha_resolucion AS fecha,
                    CAST(es.nombre AS VARCHAR(50)) AS tipo_evento,
                    u.correo AS usuario,
                    r.nombre AS rol,
                    CAST(ISNULL(sr.notas_admin, 'Resuelta por administrador') AS VARCHAR(500)) AS detalle
                FROM SolicitudRegistro sr
                INNER JOIN Usuario u ON u.id_usuario = sr.id_usuario
                INNER JOIN Rol r ON r.id_rol = u.id_rol
                INNER JOIN EstadoSolicitud es ON es.id_estado = sr.id_estado
                WHERE sr.fecha_resolucion IS NOT NULL
                
                UNION ALL
                
                SELECT 
                    u.fecha_registro AS fecha,
                    CAST('VETO' AS VARCHAR(50)) AS tipo_evento,
                    u.correo AS usuario,
                    r.nombre AS rol,
                    CAST('Usuario vetado del sistema' AS VARCHAR(500)) AS detalle
                FROM Usuario u
                INNER JOIN Rol r ON r.id_rol = u.id_rol
                INNER JOIN EstadoUsuario eu ON eu.id_estado = u.id_estado
                WHERE eu.nombre = 'VETADO'
            )
            SELECT 
                ROW_NUMBER() OVER(ORDER BY fecha DESC) AS id_log,
                CONVERT(VARCHAR(16), fecha, 120) AS fecha,
                tipo_evento,
                usuario,
                rol,
                detalle
            FROM LogsCTE
            ORDER BY fecha DESC
        `)
    ]);

    return {
        ...resUsuarios.recordset[0],
        zonas_mayor_volumen: resZonas.recordset,
        transporte_mas_usado: resTransporte.recordset,
        ingresos_por_tipo: resIngresos.recordset,
        reportes_por_estado: resReportes.recordset,
        destinos_frecuentes: resDestinos.recordset,
        uso_clientes: resUso.recordset,
        aceptados_rechazados: resAceptados.recordset,
        usuarios_mayor_gasto: resGastos.recordset,
        historial_envios: resHistEnvios.recordset,
        tipos_transporte: resTiposTransporte.recordset,
        logs_registros: resLogs.recordset
    };
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
            INNER JOIN EstadoReporte er ON er.id_estado = rep.id_estado
            INNER JOIN Usuario ur ON ur.id_usuario = rep.id_reportante
            INNER JOIN Usuario ud ON ud.id_usuario = rep.id_reportado
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
            SET 
                id_estado = @id_estado,
                fecha_resolucion = CASE 
                    WHEN @id_estado IN (3, 4) THEN GETDATE() 
                    ELSE fecha_resolucion 
                END
            OUTPUT INSERTED.*
            WHERE id_reporte = @id_reporte
        `);

    return result.recordset[0];
};

const getAllOperatorsServices = async (ordenar = null) => {
    const pool = await connectDB();
    
    let query = `
        SELECT
            se.id_servicio,
            se.nombre AS nombre_servicio,
            CONCAT(op.nombre, ' ', op.apellido) AS operador_logistico,
            se.zona_cobertura,
            se.precio_envio,
            es.nombre AS estado_servicio
        FROM ServicioEnvio se
        INNER JOIN OperadorLogistico op ON op.id_operador = se.id_operador
        INNER JOIN EstadoServicio es ON es.id_estado = se.id_estado
    `;
    
    if (ordenar) {
        if (ordenar === 'precio') {
            query += " ORDER BY se.precio_envio ASC";
        } else if (ordenar === 'estado') {
            query += " ORDER BY es.nombre ASC";
        } else if (ordenar === 'operador') {
            query += " ORDER BY operador_logistico ASC";
        } else {
            query += " ORDER BY se.id_servicio DESC";
        }
    } else {
        query += " ORDER BY se.id_servicio DESC";
    }

    const result = await pool.request().query(query);
    return result.recordset;
};

const vetoUserTransaction = async (transaction, { id_usuario, id_admin, motivo }) => {
    await transaction.request()
        .input("id_usuario", id_usuario)
        .input("id_estado", 4) // 4 es VETADO en EstadoUsuario
        .query(`
            UPDATE Usuario
            SET id_estado = @id_estado, fecha_actualizacion = GETDATE()
            WHERE id_usuario = @id_usuario
        `);

    await transaction.request()
        .input("id_admin", id_admin)
        .input("id_usuario2", id_usuario) // renombrado para que no choque si se reúsa el query param, aunque transaction.request limpia
        .input("motivo", motivo)
        .query(`
            INSERT INTO VetoUsuario (id_usuario, id_admin, motivo)
            VALUES (@id_usuario2, @id_admin, @motivo)
        `);
};

module.exports = {
    approveOperador,
    rejectOperador,
    createAdmin,
    saveOTP,
    verifyOTP,
    findAdminByUserId,
    getUsuariosPanel,
    getEstadisticasGenerales,
    getAllReportes,
    updateReporteEstado,
    getAllOperatorsServices,
    vetoUserTransaction
};