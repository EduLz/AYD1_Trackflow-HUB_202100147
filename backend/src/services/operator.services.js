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

const getOperatorByUserId = async (id_usuario) => {

    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id_usuario", id_usuario)
        .query(`
            SELECT *
            FROM OperadorLogistico
            WHERE id_usuario = @id_usuario
        `);
    return result.recordset[0];
};

const createService = async (data) => {
    const {
        id_operador,
        id_estado,
        nombre,
        zona_cobertura,
        capacidad_carga_kg,
        precio_envio,
        descripcion
    } = data;

    const pool = await connectDB();

    const result = await pool.request()
        .input("id_operador", id_operador)
        .input("id_estado", id_estado)
        .input("nombre", nombre)
        .input("zona_cobertura", zona_cobertura)
        .input("capacidad_carga_kg", capacidad_carga_kg)
        .input("precio_envio", precio_envio)
        .input("descripcion", descripcion)
        .query(`
            INSERT INTO ServicioEnvio
            (
                id_operador,
                id_estado,
                nombre,
                zona_cobertura,
                capacidad_carga_kg,
                precio_envio,
                descripcion
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_operador,
                @id_estado,
                @nombre,
                @zona_cobertura,
                @capacidad_carga_kg,
                @precio_envio,
                @descripcion
            )
        `);
    return result.recordset[0];
};

const saveServicePhoto = async (id_servicio, url_foto, orden) => {

    const pool = await connectDB();

    await pool
        .request()
        .input("id_servicio", id_servicio)
        .input("url_foto", url_foto)
        .input("orden", orden)
        .query(`
            INSERT INTO FotoServicioEnvio
            (
                id_servicio,
                url_foto,
                orden
            )
            VALUES
            (
                @id_servicio,
                @url_foto,
                @orden
            )
        `);
};

module.exports = {
    createOperator,
    getOperatorByUserId,
    createService,
    saveServicePhoto
};