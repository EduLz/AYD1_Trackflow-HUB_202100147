const authService = require("../services/auth.services");

const { comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

const login = async (req, res) => {
    try {
        const {
            correo,
            contrasena
        } = req.body;
        if (!correo || !contrasena) {
            return res.status(400).json({
                message: "Correo y contraseña son obligatorios"
            });
        }
        const user =
            await authService.loginUser(correo);
        if (!user) {
            return res.status(401).json({
                message: "Credenciales inválidas"
            });
        }
        const validPassword = await comparePassword(contrasena, user.contrasena_hash);
        if (!validPassword) {
            return res.status(401).json({
                message: "Credenciales inválidas"
            });
        }
        if (!user.correo_verificado) {
            return res.status(403).json({
                message:
                    "Debe verificar su correo antes de iniciar sesión"
            });
        }

        if (user.estado === "PENDIENTE") {
            return res.status(403).json({
                message: "Su cuenta aún no está activa"
            });
        }

        if (user.estado === "SUSPENDIDO") {
            return res.status(403).json({
                message: "Su cuenta se encuentra suspendida"
            });
        }

        if (user.estado === "VETADO") {
            return res.status(403).json({
                message: "Su cuenta ha sido vetada"
            });
        }

        const token = generateToken(user);
        return res.status(200).json({
            message: "Login exitoso",
            token,
            user: {
                id_usuario: user.id_usuario,
                correo: user.correo,
                rol: user.rol,
                estado: user.estado
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user =
            await authService.verifyEmailToken(token);
        if (!user) {
            return res.status(400).json({
                message:
                    "Token inválido o expirado"
            });
        }
        await authService.activateUser(user.id_usuario);
        // CLIENTE (rol 2): se activa al verificar el correo (no requiere aprobacion del admin)
         if (user.id_rol === 2) {
            await authService.activarCuenta(user.id_usuario);
        }
        return res.status(200).json({
            message:
                "Correo verificado correctamente"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

const profile = async (req, res) => {
    try {
        const user =
            await authService.findUserById(req.user.id_usuario);
        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        delete user.contrasena_hash;
        delete user.token_verificacion;

        return res.status(200).json({
            user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    login,
    verifyEmail,
    profile
};