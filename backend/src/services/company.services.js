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
const getEmpresaByUserId = async (id_usuario) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id_usuario", id_usuario)
        .query(`SELECT * FROM EmpresaTransporte WHERE id_usuario = @id_usuario`);
    return result.recordset[0];
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
module.exports = {
    createEmpresa,
    getEmpresaByUserId,
    getResumenEmpresa,
    getReporteCalificacionesEmpresa,
    getReporteEstadoRutas
};