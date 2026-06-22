const { updateServiceStatus, responderCalificacion } =
    require("../src/controllers/operator.controller");

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

describe("operator.controller - validaciones", () => {

    test("updateServiceStatus rechaza un id_estado invalido con 400", async () => {
        const req = { params: { id: 1 }, body: { id_estado: 99 }, user: { id_usuario: 1 } };
        const res = mockRes();
        await updateServiceStatus(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("responderCalificacion rechaza una respuesta vacia con 400", async () => {
        const req = { params: { id: 1 }, body: { respuesta: "   " }, user: { id_usuario: 1 } };
        const res = mockRes();
        await responderCalificacion(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

});