const { connectDB } = require("../config/database");

const approveOperador = async (id_solicitud) => {

    const pool = await connectDB();

    // 1. Marcar la solicitud como APROBADA
    await pool.request()
        .input("id_solicitud", id_solicitud)
        .query(`
            UPDATE SolicitudRegistro
            SET id_estado = 2
            WHERE id_solicitud = @id_solicitud
        `);

    // 2. Activar el Usuario asociado a esa solicitud (operador o empresa)
    await pool.request()
        .input("id_solicitud", id_solicitud)
        .query(`
            UPDATE Usuario
            SET id_estado = 2
            WHERE id_usuario = (
                SELECT id_usuario
                FROM SolicitudRegistro
                WHERE id_solicitud = @id_solicitud
            )
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
const createAdmin = async ({ nombre, apellido, correo, passwordHash }) => {

    const pool = await connectDB();

    // 1. Crear el Usuario (rol ADMIN, ya activo y verificado, contrasena temporal)
    const userResult = await pool.request()
        .input("id_rol", 1)      // ADMIN
        .input("id_estado", 2)   // ACTIVO
        .input("correo", correo)
        .input("contrasena_hash", passwordHash)
        .query(`
            INSERT INTO Usuario
            (
                id_rol,
                id_estado,
                correo,
                contrasena_hash,
                correo_verificado,
                es_temporal_pwd
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_rol,
                @id_estado,
                @correo,
                @contrasena_hash,
                1,
                1
            )
        `);

    const newUser = userResult.recordset[0];

    // 2. Crear el registro en Administrador
    await pool.request()
        .input("id_usuario", newUser.id_usuario)
        .input("nombre", nombre)
        .input("apellido", apellido)
        .query(`
            INSERT INTO Administrador
            (
                id_usuario,
                nombre,
                apellido
            )
            VALUES
            (
                @id_usuario,
                @nombre,
                @apellido
            )
        `);

    return newUser;
};
module.exports = {
    approveOperador,
    rejectOperador,
    createAdmin
};