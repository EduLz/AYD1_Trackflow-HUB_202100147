const { connectDB } = require("../config/database");

const createSolicitudOperador = async (id_usuario) => {

    const pool = await connectDB();

    await pool.request()
        .input("id_usuario", id_usuario)
        .input("id_estado", 1) // PENDIENTE
        .input("tipo", "OPERADOR")
        .query(`
            INSERT INTO SolicitudRegistro
            (
                id_usuario,
                id_estado,
                tipo,
                fecha_solicitud
            )
            VALUES
            (
                @id_usuario,
                @id_estado,
                @tipo,
                GETDATE()
            )
        `);
};
const createSolicitudEmpresa = async (id_usuario) => {

    const pool = await connectDB();

    await pool.request()
        .input("id_usuario", id_usuario)
        .input("id_estado", 1) // PENDIENTE
        .input("tipo", "EMPRESA")
        .query(`
            INSERT INTO SolicitudRegistro
            (
                id_usuario,
                id_estado,
                tipo,
                fecha_solicitud
            )
            VALUES
            (
                @id_usuario,
                @id_estado,
                @tipo,
                GETDATE()
            )
        `);
};
const getPendingSolicitudes = async () => {

    const pool = await connectDB();

    const result = await pool.request()
        .query(`
            SELECT
                sr.id_solicitud,
                sr.tipo,
                sr.fecha_solicitud,
                op.nombre,
                op.apellido,
                op.dpi_cui AS identificador,
                u.correo
            FROM SolicitudRegistro sr
            INNER JOIN Usuario u
                ON u.id_usuario = sr.id_usuario
            INNER JOIN OperadorLogistico op
                ON op.id_usuario = u.id_usuario
            WHERE sr.id_estado = 1
              AND sr.tipo = 'OPERADOR'

            UNION ALL

            SELECT
                sr.id_solicitud,
                sr.tipo,
                sr.fecha_solicitud,
                e.nombre_empresa AS nombre,
                '' AS apellido,
                e.nit AS identificador,
                u.correo
            FROM SolicitudRegistro sr
            INNER JOIN Usuario u
                ON u.id_usuario = sr.id_usuario
            INNER JOIN EmpresaTransporte e
                ON e.id_usuario = u.id_usuario
            WHERE sr.id_estado = 1
              AND sr.tipo = 'EMPRESA'
        `);

    return result.recordset;
};

const createProfileChangeRequest = async (id_usuario, datos) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_usuario", id_usuario)
        .input("id_estado", 1)
        .input(
            "datos_nuevos_json",
            JSON.stringify(datos)
        )
        .query(`
            INSERT INTO SolicitudCambioPerfil
            (
                id_usuario,
                id_estado,
                datos_nuevos_json
            )
            OUTPUT INSERTED.id_solicitud
            VALUES
            (
                @id_usuario,
                @id_estado,
                @datos_nuevos_json
            )
        `);

    const solicitudId = result.recordset[0].id_solicitud;

    const solicitud = await pool.request()
        .input("id_solicitud", solicitudId)
        .query(`
            SELECT
                scp.id_solicitud,
                scp.id_usuario,
                es.nombre AS estado,
                scp.datos_nuevos_json,
                scp.fecha_solicitud
            FROM SolicitudCambioPerfil scp
            INNER JOIN EstadoSolicitud es
                ON es.id_estado = scp.id_estado
            WHERE scp.id_solicitud = @id_solicitud
        `);
    return solicitud.recordset[0];
};

const getProfileRequestsByUser = async (id_usuario) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("id_usuario", id_usuario)
        .query(`
            SELECT
                scp.id_solicitud,
                es.nombre AS estado,
                scp.datos_nuevos_json,
                scp.notas_admin,
                scp.fecha_solicitud,
                scp.fecha_resolucion
            FROM SolicitudCambioPerfil scp
            INNER JOIN EstadoSolicitud es
                ON es.id_estado = scp.id_estado
            WHERE scp.id_usuario = @id_usuario
            ORDER BY scp.fecha_solicitud DESC
        `);
    return result.recordset;
};

const getPendingProfileRequests = async () => {

    const pool = await connectDB();

    const result = await pool.request()
        .query(`
            SELECT
                scp.id_solicitud,
                u.correo,
                es.nombre AS estado,
                scp.datos_nuevos_json,
                scp.fecha_solicitud
            FROM SolicitudCambioPerfil scp
            INNER JOIN Usuario u
                ON u.id_usuario = scp.id_usuario
            INNER JOIN EstadoSolicitud es
                ON es.id_estado = scp.id_estado
            WHERE scp.id_estado = 1
              AND u.id_rol = 3
            ORDER BY scp.fecha_solicitud DESC
        `);
    return result.recordset;
};

const getPendingCompanyProfileRequests = async () => {

    const pool = await connectDB();

    const result = await pool.request()
        .query(`
            SELECT
                scp.id_solicitud,
                u.correo,
                es.nombre AS estado,
                scp.datos_nuevos_json,
                scp.fecha_solicitud
            FROM SolicitudCambioPerfil scp
            INNER JOIN Usuario u
                ON u.id_usuario = scp.id_usuario
            INNER JOIN EstadoSolicitud es
                ON es.id_estado = scp.id_estado
            WHERE scp.id_estado = 1
              AND u.id_rol = 4
            ORDER BY scp.fecha_solicitud DESC
        `);
    return result.recordset;
};

const getProfileRequestById = async (id_solicitud) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("id_solicitud", id_solicitud)
        .query(`
            SELECT *
            FROM SolicitudCambioPerfil
            WHERE id_solicitud = @id_solicitud
        `);

    return result.recordset[0];
};

const resolveProfileRequest = async (id_solicitud, id_estado, id_admin, notas_admin) => {

    const pool = await connectDB();
    await pool.request()
        .input("id_solicitud", id_solicitud)
        .input("id_estado", id_estado)
        .input("id_admin", id_admin)
        .input("notas_admin", notas_admin)
        .query(`
            UPDATE SolicitudCambioPerfil
            SET
                id_estado = @id_estado,
                id_admin_gestor = @id_admin,
                notas_admin = @notas_admin,
                fecha_resolucion = GETDATE()
            WHERE id_solicitud = @id_solicitud
        `);
};

module.exports = {
    createSolicitudOperador,
    createSolicitudEmpresa,
    getPendingSolicitudes,
    createProfileChangeRequest,
    getProfileRequestsByUser,
    getPendingProfileRequests,
    getPendingCompanyProfileRequests,
    getProfileRequestById,
    resolveProfileRequest
};