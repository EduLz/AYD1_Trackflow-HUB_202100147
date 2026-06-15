const { connectDB } = require("../config/database");

const createOperator = async (data) => {

    const {
        id_usuario,
        nombre,
        apellido,
        dpi_cui,
        telefono,
        telefono_respaldo,
        fotografia_url,
        zona_operacion,
        genero
    } = data

    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id_usuario", id_usuario)
        .input("nombre", nombre)
        .input("apellido", apellido)
        .input("dpi_cui", dpi_cui)
        .input("telefono", telefono)
        .input("telefono_respaldo", telefono_respaldo)
        .input("fotografia_url", fotografia_url)
        .input("zona_operacion", zona_operacion)
        .input("genero", genero)
        .query(`
            INSERT INTO OperadorLogistico
            (
                id_usuario,
                nombre,
                apellido,
                dpi_cui,
                telefono,
                telefono_respaldo,
                fotografia_url,
                zona_operacion,
                genero
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_usuario,
                @nombre,
                @apellido,
                @dpi_cui,
                @telefono,
                @telefono_respaldo,
                @fotografia_url,
                @zona_operacion,
                @genero
            )
        `);

    return result.recordset[0];
};

module.exports = {
    createOperator
};