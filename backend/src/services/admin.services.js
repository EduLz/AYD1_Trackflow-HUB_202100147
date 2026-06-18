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

    // 1. Marcar la solicitud como RECHAZADA
    await pool.request()
        .input("id_solicitud", id_solicitud)
        .query(`
            UPDATE SolicitudRegistro
            SET id_estado = 3
            WHERE id_solicitud = @id_solicitud
        `);

    // 2. Marcar el usuario como SUSPENDIDO/RECHAZADO
    await pool.request()
        .input("id_solicitud", id_solicitud)
        .query(`
            UPDATE Usuario
            SET id_estado = 3
            WHERE id_usuario = (
                SELECT id_usuario
                FROM SolicitudRegistro
                WHERE id_solicitud = @id_solicitud
            )
        `);
};

const createAdmin = async ({ id_usuario, nombre, apellido }) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_usuario", id_usuario)
        .input("nombre", nombre)
        .input("apellido", apellido)
        .query(`
            INSERT INTO Administrador
            (
                id_usuario,
                nombre,
                apellido
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @id_usuario,
                @nombre,
                @apellido
            )
        `);
    return result.recordset[0];
};

const saveOTP = async (id_usuario, codigo) => {

    const pool = await connectDB();
    await pool.request()
        .input("id_usuario", id_usuario)
        .input("codigo", codigo)
        .query(`
            UPDATE Administrador
            SET
                token_2fa = @codigo,
                token_expiracion = DATEADD(MINUTE,5,GETDATE())
            WHERE id_usuario = @id_usuario
        `);
};

const verifyOTP = async (id_usuario, codigo) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_usuario", id_usuario)
        .input("codigo", codigo)
        .query(`
            SELECT *
            FROM Administrador
            WHERE id_usuario = @id_usuario
              AND token_2fa = @codigo
              AND token_expiracion > GETDATE()
        `);

    return result.recordset[0];
};

const findAdminByUserId = async (id_usuario) => {

    const pool = await connectDB();
    const result = await pool.request()
        .input("id_usuario", id_usuario)
        .query(`
            SELECT *
            FROM Administrador
            WHERE id_usuario = @id_usuario
        `);

    return result.recordset[0];
};

module.exports = {
    approveOperador,
    rejectOperador,
    createAdmin,
    saveOTP,
    verifyOTP,
    findAdminByUserId
};