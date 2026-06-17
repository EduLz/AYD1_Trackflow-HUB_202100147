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

module.exports = {
    createEmpresa
};