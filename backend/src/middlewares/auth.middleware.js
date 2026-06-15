const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                message: "Token requerido"
            });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Token inválido o expirado"
        });
    }
};

const requireRole = (...rolesPermitidos) => {
    
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: "Usuario no autenticado"
                });
            }

            if (!rolesPermitidos.includes(req.user.id_rol)) {
                return res.status(403).json({
                    message: "No tiene permisos para acceder a este recurso"
                });
            }
            next();
        } catch (error) {
            return res.status(500).json({
                message: error.message
            });
        }
    };
};

module.exports = {
    verifyToken,
    requireRole
};