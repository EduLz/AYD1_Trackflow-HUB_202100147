const bcrypt = require("bcrypt");
const crypto = require("crypto");

const hashValue = async (valor) => {
    return await bcrypt.hash(valor, 10);
};

const fingerprintCard = (numero) => {
    return crypto
        .createHash("sha256")
        .update(numero)
        .digest("hex");
};

module.exports = {
    hashValue,
    fingerprintCard
};