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


module.exports = {
    createCliente,
    getShippingServices
};

        
