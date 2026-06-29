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

const getUsuariosPanel = async (nombre_rol = null) => {
    const pool = await connectDB();
    const request = pool.request();
    
    let query = `
        SELECT 
            u.id_usuario,
            u.correo,
            u.correo_verificado,
            eu.nombre AS estado_usuario,
            r.nombre AS rol,
            u.fecha_registro
        FROM Usuario u
        INNER JOIN Rol r ON r.id_rol = u.id_rol
        INNER JOIN EstadoUsuario eu ON eu.id_estado = u.id_estado
    `;

    if (nombre_rol) {
        query += ` WHERE r.nombre = @nombre_rol`;
        request.input("nombre_rol", nombre_rol);
    }

    query += ` ORDER BY u.fecha_registro DESC`;

    const result = await request.query(query);
    return result.recordset;
};

const vetoUserTransaction = async (transaction, data) => {
    await new sql.Request(transaction)
        .input("id_usuario", data.id_usuario)
        .query(`
            UPDATE Usuario 
            SET id_estado = (SELECT id_estado FROM EstadoUsuario WHERE nombre = 'VETADO')
            WHERE id_usuario = @id_usuario
        `);

    await new sql.Request(transaction)
        .input("id_usuario", data.id_usuario)
        .input("id_admin", data.id_admin)
        .input("motivo", data.motivo)
        .query(`
            INSERT INTO VetoUsuario (id_usuario, id_admin, motivo)
            VALUES (@id_usuario, @id_admin, @motivo)
        `);
};

const updateUsuarioBase = async (id_usuario, correo, id_estado) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_usuario", id_usuario)
        .input("correo", correo)
        .input("id_estado", id_estado)
        .query(`
            UPDATE Usuario
            SET 
                correo = @correo,
                id_estado = @id_estado,
                fecha_actualizacion = GETDATE()
            OUTPUT INSERTED.*
            WHERE id_usuario = @id_usuario
        `);
    return result.recordset[0];
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
    getUsuariosPanel,
    vetoUserTransaction,
    updateUsuarioBase
};