const { connectDB } = require("../config/database");

const approveOperador = async (id_solicitud) => {

    const pool = await connectDB();
    await pool.request()
        .input("id_solicitud", id_solicitud)
        .query(`
            UPDATE SolicitudRegistro
            SET id_estado = 2
            WHERE id_solicitud = @id_solicitud
        `);
};

const rejectOperador = async (id_solicitud) => {

    const pool = await connectDB();
    await pool.request()
        .input("id_solicitud", id_solicitud)
        .query(`
            UPDATE SolicitudRegistro
            SET id_estado = 3
            WHERE id_solicitud = @id_solicitud
        `);
};

module.exports = {
    approveOperador,
    rejectOperador
};