const { connectDB } = require("../config/database");

const findUserByEmail = async (correo) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("correo", correo)
        .query(`
            SELECT *
            FROM Usuario
            WHERE correo = @correo
        `);
    return result.recordset[0];
};

const loginUser = async (correo) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("correo", correo)
        .query(`
            SELECT
                u.*,
                r.nombre AS rol,
                eu.nombre AS estado
            FROM Usuario u
            INNER JOIN Rol r
                ON r.id_rol = u.id_rol
            INNER JOIN EstadoUsuario eu
                ON eu.id_estado = u.id_estado
            WHERE u.correo = @correo
        `);

    return result.recordset[0];
};

const createClienteUser = async ({correo, passwordHash, token}) => {

    const pool = await connectDB();
    const result = await pool
        .request()
        .input("id_rol", 2) // CLIENTE
        .input("id_estado", 1) // PENDIENTE
        .input("correo", correo)
        .input("contrasena_hash", passwordHash)
        .input("token", token)
        .query(`
            INSERT INTO Usuario
            (
                id_rol,
                id_estado,
                correo,
                contrasena_hash,
                correo_verificado,
                token_verificacion,
                token_expiracion,
                es_temporal_pwd
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_rol,
                @id_estado,
                @correo,
                @contrasena_hash,
                0,
                @token,
                DATEADD(HOUR,24,GETDATE()),
                0
            )
        `);

    return result.recordset[0];
};

const createOperadorUser = async ({correo, passwordHash, token}) => {

    const pool = await connectDB();
    const result = await pool
        .request()
        .input("id_rol", 3) // OPERADOR
        .input("id_estado", 1) // PENDIENTE
        .input("correo", correo)
        .input("contrasena_hash", passwordHash)
        .input("token", token)
        .query(`
            INSERT INTO Usuario
            (
                id_rol,
                id_estado,
                correo,
                contrasena_hash,
                correo_verificado,
                token_verificacion,
                token_expiracion,
                es_temporal_pwd
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_rol,
                @id_estado,
                @correo,
                @contrasena_hash,
                0,
                @token,
                DATEADD(HOUR,24,GETDATE()),
                0
            )
        `);
    return result.recordset[0];
};

const verifyEmailToken = async (token) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("token", token)
        .query(`
            SELECT *
            FROM Usuario
            WHERE token_verificacion = @token
              AND correo_verificado = 0
              AND token_expiracion > GETDATE()
        `);
    return result.recordset[0];
};

const activateUser = async (id_usuario) => {

    const pool = await connectDB();
    await pool.request()
        .input("id_usuario", id_usuario)
        .query(`
            UPDATE Usuario
            SET
                correo_verificado = 1,
                token_verificacion = NULL,
                token_expiracion = NULL
            WHERE id_usuario = @id_usuario
        `);
};
const activarCuenta = async (id_usuario) => {

    const pool = await connectDB();
    await pool.request()
        .input("id_usuario", id_usuario)
        .query(`
            UPDATE Usuario
            SET id_estado = 2
            WHERE id_usuario = @id_usuario
        `);
};
module.exports = {
    findUserByEmail,
    loginUser,
    createClienteUser,
    createOperadorUser,
    verifyEmailToken,
    activateUser,
    activarCuenta
};