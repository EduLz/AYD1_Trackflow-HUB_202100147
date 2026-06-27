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

const getShippingServices = async (filters) => {

    const {
        zona,
        nombre,
        operador,
        orden
    } = filters;

    const pool = await connectDB();

    let query = `
        SELECT
            s.id_servicio,
            s.nombre,
            s.zona_cobertura,
            s.capacidad_carga_kg,
            s.precio_envio,
            s.descripcion,
            es.nombre AS estado,
            s.calificacion_prom,
            s.total_calificaciones,

            CONCAT(o.nombre,' ',o.apellido) AS operador,

            (
                SELECT TOP 1 url_foto
                FROM FotoServicioEnvio f
                WHERE f.id_servicio = s.id_servicio
                ORDER BY f.orden
            ) AS foto

        FROM ServicioEnvio s
        INNER JOIN OperadorLogistico o
            ON o.id_operador = s.id_operador
        INNER JOIN EstadoServicio es
            ON es.id_estado = s.id_estado

        WHERE es.nombre = 'ACTIVO'
    `;

    const request = pool.request();

    if (zona) {
        query += `
            AND s.zona_cobertura LIKE '%' + @zona + '%'
        `;
        request.input("zona", zona);
    }

    if (nombre) {
        query += `
            AND s.nombre LIKE '%' + @nombre + '%'
        `;
        request.input("nombre", nombre);
    }

    if (operador) {
        query += `
            AND (
                o.nombre + ' ' + o.apellido
            ) LIKE '%' + @operador + '%'
        `;
        request.input("operador", operador);
    }

    switch (orden) {

        case "alfabetico_asc":
            query += " ORDER BY s.nombre ASC";
            break;

        case "alfabetico_desc":
            query += " ORDER BY s.nombre DESC";
            break;

        case "precio_asc":
            query += " ORDER BY s.precio_envio ASC";
            break;

        case "precio_desc":
            query += " ORDER BY s.precio_envio DESC";
            break;

        case "capacidad_asc":
            query += " ORDER BY s.capacidad_carga_kg ASC";
            break;

        case "capacidad_desc":
            query += " ORDER BY s.capacidad_carga_kg DESC";
            break;

        case "calificacion_asc":
            query += " ORDER BY s.calificacion_prom ASC";
            break;

        case "calificacion_desc":
            query += " ORDER BY s.calificacion_prom DESC";
            break;

        default:
            query += " ORDER BY s.fecha_creacion DESC";
    }

    const result = await request.query(query);

    return result.recordset;

};

const getClienteByUserId = async (id_usuario) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_usuario", id_usuario)
        .query(`
            SELECT *
            FROM Cliente
            WHERE id_usuario = @id_usuario
        `);
    return result.recordset[0];
};

const createMetodoPago = async (id_cliente, id_tipo) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_cliente", id_cliente)
        .input("id_tipo", id_tipo)
        .query(`
            INSERT INTO MetodoPago
            (
                id_cliente,
                id_tipo
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_cliente,
                @id_tipo
            )
        `);
    return result.recordset[0];
};

const createTarjeta = async (data) => {

    const pool = await connectDB();
        const result = await pool.request()
        .input("id_metodo", data.id_metodo)
        .input("numero_hash", data.numero_hash)
        .input("numero_ultimos4", data.numero_ultimos4)
        .input("nombre_titular", data.nombre_titular)
        .input("fecha_vencimiento", data.fecha_vencimiento)
        .input("cvv_hash", data.cvv_hash)
        .input("fingerprint", data.fingerprint)
        .query(`
            INSERT INTO TarjetaSimulada
            (
                id_metodo,
                numero_hash,
                numero_ultimos4,
                nombre_titular,
                fecha_vencimiento,
                cvv_hash,
                fingerprint
            )

            VALUES
            (
                @id_metodo,
                @numero_hash,
                @numero_ultimos4,
                @nombre_titular,
                @fecha_vencimiento,
                @cvv_hash,
                @fingerprint
            )
        `);
};

const findCardByFingerprint = async (fingerprint) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("fingerprint", fingerprint)
        .query(`
            SELECT *
            FROM TarjetaSimulada
            WHERE fingerprint = @fingerprint
        `);
    return result.recordset[0];
};

const getPaymentMethods = async (id_cliente) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("id_cliente", id_cliente)
        .query(`
            SELECT
                mp.id_metodo,
                tmp.nombre AS tipo,
                mp.activo,
                mp.fecha_registro,

                ts.nombre_titular,
                ts.numero_ultimos4,
                ts.fecha_vencimiento,
                ts.saldo

            FROM MetodoPago mp

            INNER JOIN TipoMetodoPago tmp
                ON tmp.id_tipo = mp.id_tipo

            LEFT JOIN TarjetaSimulada ts
                ON ts.id_metodo = mp.id_metodo

            WHERE mp.id_cliente = @id_cliente

            ORDER BY mp.fecha_registro DESC
        `);

    return result.recordset;
};

const getPaymentMethodById = async (id_metodo) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("id_metodo", id_metodo)
        .query(`
            SELECT *
            FROM MetodoPago
            WHERE id_metodo = @id_metodo
        `);

    return result.recordset[0];
};

const deactivatePaymentMethod = async (id_metodo) => {

    const pool = await connectDB();
    await pool.request()
        .input("id_metodo", id_metodo)
        .query(`
            UPDATE MetodoPago
            SET activo = 0
            WHERE id_metodo = @id_metodo
        `);
};

module.exports = {
    createCliente,
    getShippingServices,
    getClienteByUserId,
    createMetodoPago,
    createTarjeta,
    findCardByFingerprint,
    getPaymentMethods,
    getPaymentMethodById,
    deactivatePaymentMethod
};

        
