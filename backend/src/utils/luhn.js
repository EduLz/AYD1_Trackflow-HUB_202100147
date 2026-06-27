const validarLuhn = (numero) => {

    numero = numero.replace(/\s+/g, "");
    if (!/^\d+$/.test(numero)) {
        return false;
    }
    let suma = 0;
    let duplicar = false;
    for (let i = numero.length - 1; i >= 0; i--) {
        let digito = parseInt(numero[i]);
        if (duplicar) {
            digito *= 2;
            if (digito > 9) {
                digito -= 9;
            }
        }
        suma += digito;
        duplicar = !duplicar;
    }
    return suma % 10 === 0;
};

module.exports = {
    validarLuhn
};