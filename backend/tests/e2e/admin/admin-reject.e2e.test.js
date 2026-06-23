const request = require("supertest");
const app = require("../../../src/app");
const adminService = require("../../../src/services/admin.services");

describe("Rechazo de solicitudes por el Administrador", () => {
    let spySaveOTP;

    beforeEach(() => {
        spySaveOTP = jest.spyOn(adminService, "saveOTP");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Admin rechaza solicitud de cambio de perfil", async () => {
        const login = await request(app)
            .post("/api/auth/login")
            .send({
                correo: "admin@gmail.com",
                contrasena: "123"
            });

        expect(login.status).toBe(200);
        expect(login.body.requiresOTP).toBe(true);

        const idUsuario = login.body.id_usuario;

        expect(spySaveOTP).toHaveBeenCalled();
        const codigoCapturado = spySaveOTP.mock.calls[0][1];

        const authenticate = await request(app)
            .post("/api/admin/verify-otp")
            .send({
                id_usuario: idUsuario,
                codigo: codigoCapturado
            });

        expect(authenticate.status).toBe(200);
        
        const token = authenticate.body.token;

        const response = await request(app)
            .patch("/api/admin/profile-change-requests/5")
            .set("Authorization", `Bearer ${token}`)
            .send({
                accion: "RECHAZAR",
                notas_admin: "Solicitud no cumple con los requisitos"
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Solicitud rechazar correctamente"); 
    });
});