const { connectDB } = require("../config/database");

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

module.exports = {
    createCliente
};

        
