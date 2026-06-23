const { updateServiceStatus, responderCalificacion } = require("../src/controllers/operator.controller");
const { registerEmpresa } = require("../src/controllers/company.controller");

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

describe("Validaciones adicionales - operador y empresa", () => {

    test("updateServiceStatus rechaza el estado ELIMINADO (3) con 400", async () => {
        const req = { params: { id: 1 }, body: { id_estado: 3 }, user: { id_usuario: 1 } };
        const res = mockRes();
        await updateServiceStatus(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("updateServiceStatus rechaza un id_estado no numerico con 400", async () => {
        const req = { params: { id: 1 }, body: { id_estado: "abc" }, user: { id_usuario: 1 } };
        const res = mockRes();
        await updateServiceStatus(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("responderCalificacion rechaza cuando no se envia respuesta con 400", async () => {
        const req = { params: { id: 1 }, body: {}, user: { id_usuario: 1 } };
        const res = mockRes();
        await responderCalificacion(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("registerEmpresa rechaza campos obligatorios faltantes con 400", async () => {
        const req = { body: { nombre_empresa: "Transportes Test S.A." } }; // faltan correo, contrasena, etc.
        const res = mockRes();
        await registerEmpresa(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

});