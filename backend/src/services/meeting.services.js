const { connectDB } = require("../config/database");

const createReunion = async ({id_solicitud, id_admin, fecha_hora, enlace}) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_solicitud", id_solicitud)
        .input("id_admin", id_admin)
        .input("fecha_hora", fecha_hora)
        .input("enlace", enlace)
        .query(`
            INSERT INTO ReunionVirtual
            (
                id_solicitud,
                id_admin,
                fecha_hora,
                enlace
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_solicitud,
                @id_admin,
                @fecha_hora,
                @enlace
            )
        `);

    return result.recordset[0];
};

const getReuniones = async () => {

    const pool = await connectDB();
    const result = await pool.request()
        .query(`
            SELECT
                rv.*,
                sr.tipo
            FROM ReunionVirtual rv
            INNER JOIN SolicitudRegistro sr
                ON sr.id_solicitud = rv.id_solicitud
            ORDER BY rv.fecha_hora ASC
        `);

    return result.recordset;
};

const getReunionBySolicitud = async (id_solicitud) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_solicitud", id_solicitud)
        .query(`
            SELECT *
            FROM ReunionVirtual
            WHERE id_solicitud = @id_solicitud
        `);
    return result.recordset[0];
};

module.exports = {
    createReunion,
    getReuniones,
    getReunionBySolicitud
};