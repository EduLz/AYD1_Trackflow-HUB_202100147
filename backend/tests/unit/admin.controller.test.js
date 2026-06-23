const {getPendingProfileRequests, resolveProfileRequest} = require("../../src/controllers/admin.controller");

const solicitudService = require("../../src/services/request.services");
const operadorService = require("../../src/services/operator.services");

jest.mock("../../src/services/request.services");
jest.mock("../../src/services/operator.services");

describe("Admin Controller - Solicitudes Cambio Perfil", () => {
    let req;
    let res;
    beforeEach(() => {
        req = {
            params: {},
            body: {},
            user: {
                id_usuario: 1
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    test("Debe obtener solicitudes pendientes", async () => {

        const solicitudesMock = [
            {
                id_solicitud: 1,
                correo: "usuario@test.com",
                estado: "PENDIENTE"
            }
        ];

        solicitudService.getPendingProfileRequests.mockResolvedValue(solicitudesMock);
        await getPendingProfileRequests(req, res);
        expect(solicitudService.getPendingProfileRequests).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(solicitudesMock);
    });

    test("Debe retornar 404 cuando la solicitud no existe", async () => {
        req.params.id = 1;

        solicitudService.getProfileRequestById.mockResolvedValue(null);
        await resolveProfileRequest(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
                message: "Solicitud no encontrada"
            });
    });

    test("Debe aprobar una solicitud pendiente", async () => {

        req.params.id = 1;
        req.body = {
            accion: "APROBAR",
            notas_admin: "Datos correctos"
        };

        solicitudService.getProfileRequestById
            .mockResolvedValue({
                id_solicitud: 1,
                id_estado: 1,
                id_usuario: 15,
                datos_nuevos_json:
                    JSON.stringify({
                        telefono: "55555555"
                    })
            });

        solicitudService.resolveProfileRequest.mockResolvedValue();
        operadorService.updateOperatorProfile.mockResolvedValue();
        await resolveProfileRequest(req, res);
        expect(operadorService.updateOperatorProfile).toHaveBeenCalled();
        expect(solicitudService.resolveProfileRequest).toHaveBeenCalledWith(
            1,
            2,
            1,
            "Datos correctos"
        );
        expect(res.status)
            .toHaveBeenCalledWith(200);
    });

    test("Debe rechazar una solicitud pendiente", async () => {

        req.params.id = 1;
        req.body = {
            accion: "RECHAZAR",
            notas_admin: "Información inválida"
        };

        solicitudService.getProfileRequestById
            .mockResolvedValue({
                id_solicitud: 1,
                id_estado: 1,
                id_usuario: 15,
                datos_nuevos_json: "{}"
            });

        solicitudService.resolveProfileRequest.mockResolvedValue();
        await resolveProfileRequest(req, res);
        expect(solicitudService.resolveProfileRequest).toHaveBeenCalledWith(
            1,
            3,
            1,
            "Información inválida"
        );
        expect(res.status)
            .toHaveBeenCalledWith(200);
    });

});